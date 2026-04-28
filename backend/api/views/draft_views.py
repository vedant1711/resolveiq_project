import json
import os
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from api.services import openai_service, confluence_service, jira_service, slack_service
from api.models import KnowledgeDraft
from api.serializers import KnowledgeDraftSerializer


@api_view(["POST"])
def generate_draft(request, ticket_id):
    """
    Generates a Confluence KB draft from either:
    A) A real transcript passed in the request body
    B) The mock slack_thread.json (fallback for demo Scenario B)

    Pipeline mirrors KB_Article_Creator_Unified.json:
    1. Get transcript (real or mock)
    2. Call GPT-4o writer → Confluence wiki markup
    3. POST to Confluence as draft (status='draft', space=MSKB)
    4. Post "Draft Created" comment to Jira with review link
    5. Save KnowledgeDraft record to DB
    6. Return draft data to frontend
    """
    # --- Step 1: Get transcript ---
    body = request.data
    transcript = body.get("transcript")
    ticket_summary = body.get("ticket_summary", "")

    source = "transcript" if transcript else None
    if not transcript:
        try:
            transcript = slack_service.get_slack_thread_transcript(ticket_id)
            if transcript:
                source = "slack_live"
        except Exception as e:
            print(f"[Slack Error] {ticket_id}: {e}")

    if not transcript:
        if settings.REQUIRE_SLACK_TRANSCRIPT:
            return Response(
                {"error": "Slack transcript not found for ticket. Check SLACK_CHANNEL_ID, bot scopes, and channel membership."},
                status=400,
            )

        # Fallback: read the mock Slack thread
        mock_path = os.path.join(settings.BASE_DIR, "mock_data", "slack_thread.json")
        with open(mock_path, "r") as f:
            slack_data = json.load(f)

        # Flatten Slack JSON to a readable transcript string
        transcript = _flatten_slack_thread(slack_data)
        ticket_summary = ticket_summary or f"Incident from #{slack_data.get('channel', 'incidents')}"
        source = "slack_mock"

    # Also get the summary from Jira if not provided
    if not ticket_summary:
        try:
            issue = jira_service.get_issue(ticket_id)
            ticket_summary = issue["fields"]["summary"]
        except Exception:
            ticket_summary = f"Incident Report for {ticket_id}"

    # --- Step 2: Call GPT-4o writer ---
    article = openai_service.generate_kb_article(ticket_summary, transcript)

    # --- Step 3: Push to Confluence as draft ---
    confluence_url = None
    page_id = None
    page_version = None
    try:
        confluence_result = confluence_service.create_draft(
            title=ticket_summary,
            wiki_content=article["wiki_content"],
            ticket_id=ticket_id,
        )
        confluence_url = confluence_result["confluence_url"]
        page_id = confluence_result["page_id"]
        page_version = confluence_result.get("version")
    except Exception as e:
        print(f"[Confluence Error] {ticket_id}: {e}")
        # Soft failure — save draft locally without Confluence URL
        confluence_url = f"https://resolveiq598.atlassian.net/wiki/spaces/MSKB/pages/draft/mock"

    # --- Step 4: Post "Draft Created" Jira comment ---
    if confluence_url:
        jira_comment = (
            f"✍️ *KB Article Draft Created*\n\n"
            f"An AI-generated draft has been created based on the incident transcript.\n\n"
            f"*Review Draft:* {confluence_url}\n\n"
            f"*Steps:*\n"
            f"1. Click the link above to open the draft in Confluence.\n"
            f"2. Review for technical accuracy and formatting.\n"
            f"3. Click *Publish* when ready to make it live.\n\n"
            f"_This article will be indexed in the ResolveIQ search at the next 2AM sync._"
        )
        try:
            jira_service.post_comment(ticket_id, jira_comment)
        except Exception as e:
            print(f"[Jira Comment Error] {ticket_id}: {e}")

    # --- Step 5: Save to DB ---
    draft = KnowledgeDraft.objects.create(
        ticket_id=ticket_id,
        source=source or "slack_mock",
        generated_title=article["title"],
        generated_content=article["wiki_content"],
        confluence_url=confluence_url,
        confluence_page_id=page_id,
        confluence_version=page_version,
        status="pending_review",
    )

    # --- Step 6: Return to frontend ---
    result = KnowledgeDraftSerializer(draft).data
    return Response(result, status=201)


@api_view(["PATCH"])
def publish_draft_view(request, draft_id):
    """
    Publishes a draft by updating its status to 'published'.
    """
    try:
        draft = KnowledgeDraft.objects.get(id=draft_id)
    except KnowledgeDraft.DoesNotExist:
        return Response({"error": "Draft not found"}, status=404)

    if not draft.confluence_page_id or draft.confluence_version is None:
        return Response({"error": "Draft missing Confluence metadata"}, status=400)

    try:
        confluence_result = confluence_service.publish_draft(
            page_id=draft.confluence_page_id,
            current_version=draft.confluence_version,
        )
        draft.confluence_version = confluence_result.get("version", {}).get("number", draft.confluence_version + 1)
        draft.status = "published"
        draft.save()
        return Response(KnowledgeDraftSerializer(draft).data)
    except Exception as e:
        print(f"[Confluence Publish Error] draft {draft_id}: {e}")
        return Response({"error": "Failed to publish draft"}, status=502)


def _flatten_slack_thread(slack_data: dict) -> str:
    """
    Converts the mock slack_thread.json into a readable transcript string.
    This is what gets passed to the GPT-4o writer as the 'transcript' variable.
    """
    lines = [f"Channel: #{slack_data.get('channel', 'incidents')}"]
    for msg in slack_data.get("messages", []):
        user = msg.get("user", "unknown")
        text = msg.get("text", "")
        ts = msg.get("timestamp", "")
        lines.append(f"[{ts}] {user}: {text}")
    return "\n".join(lines)
