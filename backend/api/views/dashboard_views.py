from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from api.models import VPMetricsMock, KnowledgeDraft
from api.serializers import KnowledgeDraftSerializer
from api.services import jira_service


@api_view(["GET"])
def vp_dashboard(request):
    """
    Returns all mocked metrics for the VP/buyer dashboard.
    Reads directly from the single VPMetricsMock row.
    """
    metrics = VPMetricsMock.objects.first()
    if not metrics:
        return Response({"error": "No metrics data found"}, status=404)

    pending_drafts = KnowledgeDraft.objects.filter(status="pending_review").order_by("-created_at")[:5]
    pending_drafts_data = KnowledgeDraftSerializer(pending_drafts, many=True).data

    return Response({
        "total_hours_saved": metrics.total_hours_saved,
        "dollars_saved": metrics.dollars_saved,
        "kb_capture_rate": metrics.kb_capture_rate,
        "team_size": 15,
        "avg_hourly_rate": 75,
        "mttr_trend": metrics.mttr_trend_data,
        "period": "YTD",
        "time_spent_searching_hours": -12,
        "articles_contributed": 14,
        "drafts_pending_review": pending_drafts_data,
    })


@api_view(["GET"])
def dev_dashboard(request):
    """
    Returns the developer's live work queue (mocked Jira tickets)
    plus pending draft articles from the DB.
    """
    # Live from DB
    pending_drafts = KnowledgeDraft.objects.filter(status="pending_review").order_by("-created_at")
    pending_drafts_data = KnowledgeDraftSerializer(pending_drafts, many=True).data

    # Jira tickets: live when enabled, otherwise fallback for demo reliability
    open_tickets = []
    if settings.USE_JIRA_TICKETS and settings.JIRA_ASSIGNEE_ACCOUNT_ID:
        try:
            open_tickets = jira_service.get_tickets_for_user(settings.JIRA_ASSIGNEE_ACCOUNT_ID)
        except Exception as e:
            print(f"[Jira Ticket Error] {e}")

    if not open_tickets:
        open_tickets = [
            {
                "ticket_id": "IT-4102",
                "summary": "Production DB failover not triggering automatic alerts",
                "status": "To Do",
                "priority": "High",
                "reporter_name": "Ava Martinez",
                "assignee_name": "Harper Suresh",
                "created_at": "2026-04-26T08:14:00Z",
                "resolution_date": None,
                "time_to_resolution_hours": None,
                "description": "Failover alerting did not trigger for a primary DB outage.",
                "allowed_transitions": ["In Progress", "Done"],
                "resolve_iq_score": None,
                "score_label": "Pending",
                "jira_url": "https://resolveiq598.atlassian.net/browse/IT-4102",
            },
            {
                "ticket_id": "IT-4115",
                "summary": "VPN client crashes on macOS 14.4 after corporate cert renewal",
                "status": "To Do",
                "priority": "Medium",
                "reporter_name": "Logan Park",
                "assignee_name": "Harper Suresh",
                "created_at": "2026-04-26T10:02:00Z",
                "resolution_date": None,
                "time_to_resolution_hours": None,
                "description": "VPN client exits immediately after login on macOS 14.4.",
                "allowed_transitions": ["In Progress", "Done"],
                "resolve_iq_score": None,
                "score_label": "Pending",
                "jira_url": "https://resolveiq598.atlassian.net/browse/IT-4115",
            },
            {
                "ticket_id": "IT-4089",
                "summary": "GitHub Actions runner pool exhausted — CI queue backing up",
                "status": "In Progress",
                "priority": "Critical",
                "reporter_name": "Sofia Nguyen",
                "assignee_name": "Harper Suresh",
                "created_at": "2026-04-25T06:40:00Z",
                "resolution_date": None,
                "time_to_resolution_hours": None,
                "description": "Runner autoscaling is stuck; CI jobs queue is growing.",
                "allowed_transitions": ["Done", "Blocked"],
                "resolve_iq_score": 9,
                "score_label": "Sufficient",
                "jira_url": "https://resolveiq598.atlassian.net/browse/IT-4089",
            },
            {
                "ticket_id": "IT-4071",
                "summary": "Okta SAML assertion fails intermittently for EU region users",
                "status": "In Progress",
                "priority": "High",
                "reporter_name": "Amir Patel",
                "assignee_name": "Harper Suresh",
                "created_at": "2026-04-24T19:12:00Z",
                "resolution_date": None,
                "time_to_resolution_hours": None,
                "description": "SAML assertions fail in EU region; suspected clock skew.",
                "allowed_transitions": ["Done", "Blocked"],
                "resolve_iq_score": 3,
                "score_label": "Insufficient",
                "jira_url": "https://resolveiq598.atlassian.net/browse/IT-4071",
            },
        ]

    return Response({
        "stats": {
            "hours_saved": 12,
            "articles_contributed": 14,
        },
        "pending_drafts": pending_drafts_data,
        "open_tickets": open_tickets,
        "ai_coverage": {
            "match_rate": 62,
            "avg_score": 6.8,
            "tickets_scored": 12,
            "no_doc_blockers": 4,
        },
        "integration_status": {
            "jira_webhook": "active",
            "confluence_sync": {
                "last_sync_at": "2026-04-27T02:05:00Z",
                "chunks_indexed": 1240,
                "status": "ok",
            },
            "pinecone": "ok",
            "openai": "ok",
        },
        "activity_feed": [
            {
                "type": "webhook",
                "message": "Jira issue IT-4071 moved to Work In Progress",
                "timestamp": "2026-04-27T09:12:00Z",
            },
            {
                "type": "comment",
                "message": "KB scorecard posted to IT-4071",
                "timestamp": "2026-04-27T09:12:10Z",
            },
            {
                "type": "draft",
                "message": "KB draft created for IT-4071",
                "timestamp": "2026-04-27T09:16:00Z",
            },
        ],
        "knowledge_gaps": [
            {"category": "Identity & SSO", "open_count": 5},
            {"category": "VPN & Network", "open_count": 3},
            {"category": "CI/CD", "open_count": 2},
        ],
    })
