from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.services import openai_service, pinecone_service, jira_service


@api_view(["POST"])
def jira_webhook(request):
    """
    Receives Jira issue_updated webhook events.
    Runs the full scoring pipeline when a ticket transitions to "Work In Progress".
    """
    payload = request.data

    # --- Step 1: Filter for status transition to "Work In Progress" ---
    changelog_items = payload.get("changelog", {}).get("items", [])
    is_wip_transition = any(
        item.get("field") == "status" and item.get("toString") == "Work In Progress"
        for item in changelog_items
    )
    if not is_wip_transition:
        return Response({"status": "ignored", "reason": "not a WIP transition"})

    # --- Step 2: Extract ticket data ---
    issue = payload.get("issue", {})
    fields = issue.get("fields", {})
    ticket_id = issue.get("key", "")
    summary = fields.get("summary", "")
    description = fields.get("description", "") or ""

    # n8n used: "Summary: {summary} Description: {description}"
    ticket_full = f"Summary: {summary} Description: {description}"
    ticket_text = summary  # Shorter text for embedding query

    if not ticket_id or not ticket_text:
        return Response({"status": "error", "reason": "missing ticket_id or text"}, status=400)

    try:
        # --- Step 3: Embed the ticket text ---
        embedding = openai_service.create_embedding(ticket_text)

        # --- Step 4: Query Pinecone (top 5) ---
        pinecone_results = pinecone_service.query_confluence_docs(embedding, top_k=5)

        # --- Step 5: Score each document with GPT-4o-mini ---
        scored_docs = []
        for doc in pinecone_results:
            score_result = openai_service.score_single_document(ticket_full, doc)
            if score_result:
                scored_docs.append(score_result)

        # --- Step 6: Format the scorecard comment ---
        comment = openai_service.format_scorecard_comment(scored_docs)

        # --- Step 7: Post comment to Jira ---
        jira_service.post_comment(ticket_id, comment)

        # --- Step 8: Handle no-docs case (score < 4) ---
        best_score = max((d.get("score", 0) for d in scored_docs), default=0)
        if best_score < 4:
            jira_service.add_label(ticket_id, "No-KB-Docs")

        return Response({
            "status": "processed",
            "ticket_id": ticket_id,
            "best_score": best_score,
            "docs_found": len([d for d in scored_docs if d.get("score", 0) >= 4]),
        })

    except Exception as e:
        # Never let a webhook crash silently — log and return 200 to avoid Jira retries
        print(f"[Webhook Error] {ticket_id}: {e}")
        return Response({"status": "error", "message": str(e)}, status=200)
