"""
Django management command to sync Confluence MSKB space to Pinecone.

Replicates the full Confluence_to_Pinecone_Daily_Sync.json n8n workflow:
1. Fetch all pages from space MSKB (status=current, limit=100)
2. Clean HTML (strips tags, Confluence macros, normalizes whitespace)
3. Filter pages < 50 chars
4. Chunk at 800 words / 100 word overlap
5. Create OpenAI text-embedding-ada-002 embeddings
6. Upsert to Pinecone: index=resolveiqdocs, namespace=confluence-docs

Usage:
    python manage.py sync_confluence
    python manage.py sync_confluence --dry-run
"""

import re
import time
import base64
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from api.services import openai_service


class Command(BaseCommand):
    help = "Sync Confluence MSKB space to Pinecone vector store"

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Fetch and chunk without writing to Pinecone")
        parser.add_argument("--limit", type=int, default=100, help="Max pages to fetch")

    def handle(self, *args, **options):
        self.stdout.write("🔄 Starting Confluence → Pinecone sync...")

        pages = self._fetch_pages(options["limit"])
        self.stdout.write(f"📄 Fetched {len(pages)} pages from MSKB")

        total_chunks = 0

        for page in pages:
            cleaned = self._clean_page(page)
            if not cleaned or len(cleaned) < 50:
                continue

            chunks = self._chunk_text(page, cleaned)

            if options["dry_run"]:
                self.stdout.write(f"  [DRY RUN] {page['title']}: {len(chunks)} chunks")
                continue

            for chunk in chunks:
                self._upsert_chunk(chunk)
                total_chunks += 1
                time.sleep(0.05)  # Rate limit safety

            self.stdout.write(f"  ✅ {page['title']}: {len(chunks)} chunks upserted")

        self.stdout.write(self.style.SUCCESS(f"\n✅ Sync complete. {total_chunks} total chunks upserted."))

    def _get_headers(self):
        creds = f"{settings.ATLASSIAN_EMAIL}:{settings.ATLASSIAN_API_TOKEN}"
        encoded = base64.b64encode(creds.encode()).decode()
        return {"Authorization": f"Basic {encoded}", "Content-Type": "application/json"}

    def _fetch_pages(self, limit: int) -> list:
        """Fetch all pages from Confluence MSKB space."""
        url = (
            f"{settings.ATLASSIAN_BASE_URL}/wiki/rest/api/content"
            f"?spaceKey={settings.CONFLUENCE_SPACE_KEY}"
            f"&type=page&status=current"
            f"&expand=body.storage,metadata.labels,version,space"
            f"&limit={limit}"
        )
        resp = requests.get(url, headers=self._get_headers(), timeout=30)
        resp.raise_for_status()
        return resp.json().get("results", [])

    def _clean_page(self, page: dict) -> str:
        """Clean HTML and Confluence macros from page content."""
        raw_html = page.get("body", {}).get("storage", {}).get("value", "")
        if not raw_html:
            return ""

        clean = raw_html
        clean = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<ac:[^>]*>', ' ', clean, flags=re.IGNORECASE)
        clean = re.sub(r'</ac:[^>]*>', ' ', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<ri:[^>]*/>', ' ', clean, flags=re.IGNORECASE)
        clean = re.sub(r'<[^>]+>', ' ', clean)
        clean = clean.replace('&nbsp;', ' ').replace('&amp;', '&')
        clean = clean.replace('&lt;', '<').replace('&gt;', '>').replace('&quot;', '"')
        clean = re.sub(r'\s+', ' ', clean).strip()
        return clean

    def _chunk_text(self, page: dict, clean_text: str) -> list:
        """Chunk text at 800 words with 100 word overlap."""
        words = clean_text.split()
        chunk_size = 800
        overlap = 100
        chunks = []
        i = 0
        chunk_index = 0
        page_url = (
            f"{settings.ATLASSIAN_BASE_URL}/wiki"
            + page.get("_links", {}).get("webui", "")
        )
        labels = [label["name"] for label in page.get("metadata", {}).get("labels", {}).get("results", [])]

        while i < len(words):
            chunk_text = " ".join(words[i:i + chunk_size])
            chunks.append({
                "pageId": page["id"],
                "title": page.get("title", ""),
                "url": page_url,
                "spaceKey": settings.CONFLUENCE_SPACE_KEY,
                "labels": labels,
                "chunkIndex": chunk_index,
                "text": chunk_text,
            })
            i += chunk_size - overlap
            chunk_index += 1

        return chunks

    def _upsert_chunk(self, chunk: dict):
        """Creates embedding and upserts to Pinecone with full metadata."""
        from pinecone import Pinecone

        embedding = openai_service.create_embedding(chunk["text"])

        pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        index = pc.Index(settings.PINECONE_INDEX_NAME)

        vector_id = f"{chunk['pageId']}-chunk-{chunk['chunkIndex']}"

        index.upsert(
            vectors=[{
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "title": chunk["title"],
                    "pageId": chunk["pageId"],
                    "spaceKey": chunk["spaceKey"],
                    "url": chunk["url"],
                    "labels": chunk["labels"],
                    "chunkIndex": chunk["chunkIndex"],
                    "text": chunk["text"],
                },
            }],
            namespace=settings.PINECONE_NAMESPACE,
        )
