import base64
from datetime import datetime
from typing import Optional
import requests
from django.conf import settings


def _get_headers() -> dict:
    """Basic auth header for all Jira/Confluence API calls."""
    credentials = f"{settings.ATLASSIAN_EMAIL}:{settings.ATLASSIAN_API_TOKEN}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {
        "Authorization": f"Basic {encoded}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def get_issue(ticket_id: str) -> dict:
    """Fetch a single Jira issue."""
    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/3/issue/{ticket_id}"
    response = requests.get(url, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    return response.json()


def post_comment(ticket_id: str, comment_body: str) -> dict:
    """
    Post a plain-text comment to a Jira issue.
    Uses the v2 endpoint which accepts plain wiki markup.
    """
    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/2/issue/{ticket_id}/comment"
    payload = {"body": comment_body}
    response = requests.post(url, json=payload, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    return response.json()


def add_label(ticket_id: str, label: str) -> dict:
    """Add a label to a Jira issue (e.g., 'No-KB-Docs' blocker label)."""
    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/2/issue/{ticket_id}"
    payload = {"update": {"labels": [{"add": label}]}}
    response = requests.put(url, json=payload, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    return {"status": "label_added", "label": label, "ticket_id": ticket_id}


def _parse_jira_datetime(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f%z", "%Y-%m-%dT%H:%M:%S%z"):
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    if value.endswith("Z"):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None


def _get_transition_map(ticket_id: str) -> dict:
    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/3/issue/{ticket_id}/transitions"
    response = requests.get(url, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    transitions = response.json().get("transitions", [])
    return {t.get("name", ""): t.get("id") for t in transitions if t.get("name") and t.get("id")}


def transition_issue(ticket_id: str, target_status: str) -> dict:
    transitions = _get_transition_map(ticket_id)
    transition_id = None
    for name, transition in transitions.items():
        if name.lower() == target_status.lower():
            transition_id = transition
            break

    if not transition_id:
        raise ValueError(f"Transition '{target_status}' not available")

    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/3/issue/{ticket_id}/transitions"
    payload = {"transition": {"id": transition_id}}
    response = requests.post(url, json=payload, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    return {"ticket_id": ticket_id, "status": target_status}


def get_tickets_for_user(assignee_account_id: str, project_key: str = None) -> list:
    """Fetch open tickets assigned to a user via JQL."""
    project_key = project_key or settings.JIRA_PROJECT_KEY
    jql_parts = [
        f'assignee = "{assignee_account_id}"',
        "statusCategory != Done",
    ]
    if project_key:
        jql_parts.append(f'project = "{project_key}"')
    jql = " AND ".join(jql_parts) + " ORDER BY created DESC"
    url = f"{settings.ATLASSIAN_BASE_URL}/rest/api/3/search/jql"
    params = {
        "jql": jql,
        "maxResults": 10,
        "fields": "summary,status,priority,assignee,description,reporter,created,resolutiondate",
    }
    response = requests.get(url, params=params, headers=_get_headers(), timeout=10)
    response.raise_for_status()
    data = response.json()

    tickets = []
    for issue in data.get("issues", []):
        fields = issue["fields"]
        reporter = fields.get("reporter") or {}
        assignee = fields.get("assignee") or {}
        created_at = fields.get("created")
        resolution_date = fields.get("resolutiondate")
        created_dt = _parse_jira_datetime(created_at)
        resolution_dt = _parse_jira_datetime(resolution_date)
        time_to_resolution_hours = None
        if created_dt and resolution_dt:
            time_to_resolution_hours = round((resolution_dt - created_dt).total_seconds() / 3600, 2)
        transition_map = _get_transition_map(issue["key"])
        tickets.append({
            "ticket_id": issue["key"],
            "summary": fields.get("summary", ""),
            "status": fields["status"]["name"],
            "priority": fields.get("priority", {}).get("name", "Medium"),
            "reporter_name": reporter.get("displayName", "Unassigned"),
            "assignee_name": assignee.get("displayName", "Unassigned"),
            "created_at": created_at,
            "resolution_date": resolution_date,
            "time_to_resolution_hours": time_to_resolution_hours,
            "description": fields.get("description") or "",
            "allowed_transitions": list(transition_map.keys()),
            "resolve_iq_score": None,
            "score_label": "Pending",
            "jira_url": f"{settings.ATLASSIAN_BASE_URL}/browse/{issue['key']}",
        })
    return tickets
