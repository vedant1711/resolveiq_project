import requests
from typing import Optional
from django.conf import settings


def _get_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.SLACK_BOT_TOKEN}",
        "Content-Type": "application/json; charset=utf-8",
    }


def _fetch_messages(channel_id: str, limit: int = 200) -> list:
    url = "https://slack.com/api/conversations.history"
    params = {
        "channel": channel_id,
        "limit": limit,
    }
    response = requests.get(url, params=params, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    data = response.json()
    if not data.get("ok"):
        raise ValueError(data.get("error", "Slack history error"))
    return data.get("messages", [])


def _fetch_thread(channel_id: str, thread_ts: str) -> list:
    url = "https://slack.com/api/conversations.replies"
    params = {
        "channel": channel_id,
        "ts": thread_ts,
        "limit": 200,
    }
    response = requests.get(url, params=params, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    data = response.json()
    if not data.get("ok"):
        raise ValueError(data.get("error", "Slack replies error"))
    return data.get("messages", [])


def list_channels() -> list:
    if not settings.SLACK_BOT_TOKEN:
        return []

    url = "https://slack.com/api/conversations.list"
    params = {
        "limit": 200,
        "exclude_archived": True,
        "types": "public_channel,private_channel",
    }
    response = requests.get(url, params=params, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    data = response.json()
    if not data.get("ok"):
        raise ValueError(data.get("error", "Slack list channels error"))
    return data.get("channels", [])


def get_slack_thread_transcript(ticket_id: str, channel_id: Optional[str] = None) -> Optional[str]:
    channel_id = channel_id or settings.SLACK_CHANNEL_ID

    if not settings.SLACK_BOT_TOKEN or not channel_id:
        return None

    messages = _fetch_messages(channel_id)
    seed = None
    for message in messages:
        text = (message.get("text") or "").lower()
        if ticket_id.lower() in text:
            seed = message
            break

    if not seed:
        return None

    thread_ts = seed.get("thread_ts") or seed.get("ts")
    replies = _fetch_thread(channel_id, thread_ts)
    lines = [f"Channel: #{channel_id}"]
    for msg in replies:
        user = msg.get("user", "unknown")
        text = msg.get("text", "")
        ts = msg.get("ts", "")
        lines.append(f"[{ts}] {user}: {text}")
    return "\n".join(lines)