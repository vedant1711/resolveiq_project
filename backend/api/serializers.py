from rest_framework import serializers
from api.models import UserProfile, VPMetricsMock, KnowledgeDraft


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["id", "username", "role", "display_name"]


class VPMetricsMockSerializer(serializers.ModelSerializer):
    class Meta:
        model = VPMetricsMock
        fields = [
            "id",
            "total_hours_saved",
            "dollars_saved",
            "kb_capture_rate",
            "mttr_trend_data",
        ]


class KnowledgeDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeDraft
        fields = [
            "id",
            "ticket_id",
            "source",
            "generated_title",
            "generated_content",
            "confluence_url",
            "confluence_page_id",
            "confluence_version",
            "status",
            "created_at",
            "updated_at",
        ]
