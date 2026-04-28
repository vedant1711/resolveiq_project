from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.services import openai_service, pinecone_service, jira_service


@api_view(["POST"])
def analyze_ticket(request, ticket_id):
    """
    Manual analyze endpoint — triggered when developer opens a ticket modal.
    Embeds ticket description, queries Pinecone, scores each doc with GPT-4o-mini.
    Includes hardcoded fallback scores for demo safety.
    """
    ticket_description = request.data.get("ticket_description", "")
    ticket_summary = request.data.get("ticket_summary", "")

    # Build ticket_full the same way the n8n "Prepare Ticket Text" Set node did
    ticket_full = f"Summary: {ticket_summary} Description: {ticket_description}"
    ticket_text = ticket_summary or ticket_description  # Shorter text for embedding query

    if not ticket_text:
        return Response({"error": "ticket_description or ticket_summary required"}, status=400)

    try:
        embedding = openai_service.create_embedding(ticket_text)
        pinecone_results = pinecone_service.query_confluence_docs(embedding, top_k=5)

        if pinecone_results:
            print(f"[Pinecone Matches] {ticket_id}:")
            for idx, match in enumerate(pinecone_results, start=1):
                metadata = match.get("metadata", {}) or {}
                title = metadata.get("title") or metadata.get("kb_title") or "Untitled"
                url = metadata.get("url") or metadata.get("kb_url") or ""
                score = match.get("score")
                print(f"  {idx}. score={score} title={title} url={url}")
        else:
            print(f"[Pinecone Matches] {ticket_id}: none")

        if not pinecone_results:
            return Response({
                "ticket_id": ticket_id,
                "score": None,
                "status": "no_articles",
                "label": "No articles found",
                "matched_articles": [],
                "jira_comment_posted": False,
            })

        scored_docs = []
        for doc in pinecone_results:
            score_result = openai_service.score_single_document(ticket_full, doc)
            if score_result:
                scored_docs.append(score_result)

        best_score = max((d.get("score", 0) for d in scored_docs), default=0)
        if best_score <= 0:
            return Response({
                "ticket_id": ticket_id,
                "score": None,
                "status": "no_articles",
                "label": "No articles found",
                "matched_articles": [],
                "jira_comment_posted": False,
            })
        status = "sufficient" if best_score >= 7 else "insufficient"

        jira_comment_posted = False
        try:
            comment = openai_service.format_scorecard_comment(scored_docs)
            jira_service.post_comment(ticket_id, comment)
            jira_comment_posted = True
            if best_score < 4:
                jira_service.add_label(ticket_id, "No-KB-Docs")
        except Exception as e:
            print(f"[Analyze Jira Error] {ticket_id}: {e}")

        # Format matched articles for frontend display
        matched_articles = [
            {
                "title": d.get("kb_title", ""),
                "confluence_url": d.get("kb_url", ""),
                "relevance": d.get("score", 0) / 10,
            }
            for d in sorted(scored_docs, key=lambda x: x.get("score", 0), reverse=True)[:3]
            if d.get("score", 0) >= 4
        ]

        if not matched_articles:
            return Response({
                "ticket_id": ticket_id,
                "score": None,
                "status": "no_articles",
                "label": "No articles found",
                "matched_articles": [],
                "jira_comment_posted": False,
            })

        return Response({
            "ticket_id": ticket_id,
            "score": best_score,
            "status": status,
            "label": f"{best_score}/10 — {'Sufficient' if status == 'sufficient' else 'Insufficient'}",
            "matched_articles": matched_articles,
            "jira_comment_posted": jira_comment_posted,
            "blocker_label_applied": best_score < 4,
        })

    except Exception as e:
        print(f"[Analyze Error] {ticket_id}: {e}")
        return Response({"error": "Failed to analyze ticket"}, status=500)


@api_view(["POST"])
def transition_ticket(request, ticket_id):
    target_status = request.data.get("status")
    if not target_status:
        return Response({"error": "status required"}, status=400)

    try:
        result = jira_service.transition_issue(ticket_id, target_status)
        return Response(result)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
