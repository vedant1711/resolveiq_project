from django.core.management.base import BaseCommand
from api.models import UserProfile


class Command(BaseCommand):
    help = "Seed mock users for demo login"

    def handle(self, *args, **options):
        users = [
            {"username": "harsh", "role": "vp_ops", "display_name": "Harsh"},
            {"username": "vedant", "role": "developer", "display_name": "Vedant"},
            {"username": "devika", "role": "developer", "display_name": "Devika"},
        ]

        created_count = 0
        for user_data in users:
            _, created = UserProfile.objects.get_or_create(
                username=user_data["username"],
                defaults={
                    "role": user_data["role"],
                    "display_name": user_data["display_name"],
                },
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f"Seed complete. Created {created_count} users."))