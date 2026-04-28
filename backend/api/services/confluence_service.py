import base64
import requests
from django.conf import settings


def _get_headers() -> dict:
    credentials = f"{settings.ATLASSIAN_EMAIL}:{settings.ATLASSIAN_API_TOKEN}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def create_draft(title: str, wiki_content: str, ticket_id: str) -> dict:
    """
    Creates a page in Confluence with status='draft'.
    Uses Confluence wiki markup (not HTML) — representation='wiki'.
    """
    url = f"{settings.ATLASSIAN_BASE_URL}/wiki/rest/api/content"
    payload = {
        "type": "page",
        "title": f"{title} - Draft",
        "status": "draft",
        "space": {"key": settings.CONFLUENCE_SPACE_KEY},
        "body": {
            "storage": {
                "value": wiki_content,
                "representation": "wiki",
            }
        },
        "metadata": {
            "labels": [
                {"prefix": "global", "name": "kb-draft"},
                {"prefix": "global", "name": "ai-generated"},
            ]
        },
    }
    response = requests.post(url, json=payload, headers=_get_headers(), timeout=15)
    response.raise_for_status()
    data = response.json()

    # Build the full review URL from the response links
    base_url = data.get("_links", {}).get("base", settings.ATLASSIAN_BASE_URL)
    web_ui = data.get("_links", {}).get("webui", "")
    confluence_url = f"{base_url}{web_ui}"

    return {
        "page_id": data["id"],
        "title": data["title"],
        "confluence_url": confluence_url,
        "status": data["status"],
        "version": data.get("version", {}).get("number"),
    }


def get_draft_review_url(page_id: str) -> str:
    """Constructs a direct Confluence review URL for a draft page."""
    return f"{settings.ATLASSIAN_BASE_URL}/wiki/spaces/{settings.CONFLUENCE_SPACE_KEY}/pages/{page_id}"


def publish_draft(page_id: str, current_version: int) -> dict:
    """
    Publishes a draft page by changing its status to 'current'.
    """
    url = f"{settings.ATLASSIAN_BASE_URL}/wiki/rest/api/content/{page_id}"
    payload = {
        "version": {"number": current_version + 1},
        "status": "current",
        "type": "page",
    }
    response = requests.put(url, json=payload, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    return response.json()
