from django.urls import path
from api.views import auth_views, dashboard_views, ticket_views, draft_views, webhook_views

urlpatterns = [
    path("auth/mock-login/", auth_views.mock_login),
    path("dashboard/vp/", dashboard_views.vp_dashboard),
    path("dashboard/dev/", dashboard_views.dev_dashboard),
    path("tickets/<str:ticket_id>/analyze/", ticket_views.analyze_ticket),
    path("tickets/<str:ticket_id>/transition/", ticket_views.transition_ticket),
    path("tickets/<str:ticket_id>/generate-draft/", draft_views.generate_draft),

    # Live integrations
    path("webhooks/jira/", webhook_views.jira_webhook),
    path("drafts/<int:draft_id>/publish/", draft_views.publish_draft_view),
]
