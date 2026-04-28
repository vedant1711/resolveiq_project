from pinecone import Pinecone
from django.conf import settings


def get_pinecone_client() -> Pinecone:
    return Pinecone(api_key=settings.PINECONE_API_KEY)


def query_confluence_docs(embedding: list, top_k: int = 5) -> list:
    """
    Queries the resolveiqdocs Pinecone index in the confluence-docs namespace.
    Returns list of match dicts with .score, .metadata, and .page_content fields.
    """
    pc = get_pinecone_client()
    index = pc.Index(settings.PINECONE_INDEX_NAME)

    results = index.query(
        vector=embedding,
        top_k=top_k,
        namespace=settings.PINECONE_NAMESPACE,
        include_metadata=True,
        include_values=False,
    )

    matches = []
    for match in results.matches:
        matches.append({
            "score": match.score,
            "metadata": match.metadata,
            "page_content": match.metadata.get("text", ""),
        })
    return matches
