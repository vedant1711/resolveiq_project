from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="knowledgedraft",
            name="confluence_page_id",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="knowledgedraft",
            name="confluence_version",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]