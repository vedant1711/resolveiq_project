from django.db import models


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("vp_ops", "VP of Operations"),
        ("developer", "Developer"),
    ]
    username = models.CharField(max_length=50, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    display_name = models.CharField(max_length=100, default="")

    def __str__(self):
        return f"{self.username} ({self.role})"


class VPMetricsMock(models.Model):
    total_hours_saved = models.IntegerField(default=342)
    dollars_saved = models.IntegerField(default=25650)
    kb_capture_rate = models.FloatField(default=88.0)
    # MTTR trend: stored as a JSON array of monthly data points
    # Format: [{"month": "Jan", "mttr_hours": 14.2}, ...]
    mttr_trend_data = models.JSONField(default=list)

    class Meta:
        verbose_name = "VP Metrics (Mock)"

    def __str__(self):
        return f"VP Metrics — ${self.dollars_saved} saved"


class KnowledgeDraft(models.Model):
    STATUS_CHOICES = [
        ("pending_review", "Pending Review"),
        ("published", "Published"),
        ("discarded", "Discarded"),
    ]
    ticket_id = models.CharField(max_length=50)          # e.g., "IT-4115"
    source = models.CharField(max_length=50, default="slack_mock")
    generated_title = models.CharField(max_length=255)
    generated_content = models.TextField()               # Markdown/HTML body
    confluence_url = models.URLField(blank=True, null=True)  # Set after publish
    confluence_page_id = models.CharField(max_length=100, blank=True, null=True)
    confluence_version = models.IntegerField(blank=True, null=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pending_review"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.ticket_id} — {self.generated_title[:50]}"
