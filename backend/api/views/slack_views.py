"""
Slack OAuth and event handlers for ResolveIQ.
Handles Slack app authentication, events, and interactions.
"""

import os
import json
import logging
from urllib.parse import urlencode, parse_qs
from urllib.request import urlopen, Request
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


@require_http_methods(["GET"])
def slack_oauth_start(request):
    """
    Initiates Slack OAuth flow.
    Redirects user to Slack for authorization.
    """
    client_id = os.getenv("SLACK_CLIENT_ID")
    redirect_uri = request.build_absolute_uri("/api/slack/oauth/callback")
    
    if not client_id:
        return JsonResponse({"error": "SLACK_CLIENT_ID not configured"}, status=400)
    
    scopes = [
        "channels:history",
        "chat:write",
        "commands",
        "groups:history",
        "users:read",
    ]
    
    params = {
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "scope": ",".join(scopes),
    }
    
    slack_oauth_url = f"https://slack.com/oauth/v2/authorize?{urlencode(params)}"
    
    return JsonResponse({
        "redirect_url": slack_oauth_url,
        "message": "Redirect to this URL to authorize ResolveIQ with Slack"
    })


@require_http_methods(["GET"])
def slack_oauth_callback(request):
    """
    Handles OAuth callback from Slack.
    Exchanges code for token.
    """
    code = request.GET.get("code")
    error = request.GET.get("error")
    
    if error:
        return JsonResponse({
            "error": f"Slack OAuth error: {error}",
            "error_description": request.GET.get("error_description", "Unknown error")
        }, status=400)
    
    if not code:
        return JsonResponse({"error": "Missing OAuth code"}, status=400)
    
    client_id = os.getenv("SLACK_CLIENT_ID")
    client_secret = os.getenv("SLACK_CLIENT_SECRET")
    redirect_uri = request.build_absolute_uri("/api/slack/oauth/callback")
    
    if not client_id or not client_secret:
        return JsonResponse({
            "error": "Slack OAuth credentials not configured"
        }, status=400)
    
    # Exchange code for token
    token_url = "https://slack.com/api/oauth.v2.access"
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
    }
    
    try:
        req = Request(
            token_url,
            data=urlencode(data).encode("utf-8"),
            method="POST"
        )
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        
        with urlopen(req) as response:
            response_data = json.loads(response.read().decode("utf-8"))
        
        if not response_data.get("ok"):
            error_msg = response_data.get("error", "Unknown error")
            logger.error(f"Slack OAuth error: {error_msg}")
            return JsonResponse({
                "error": f"Slack OAuth failed: {error_msg}"
            }, status=400)
        
        # Store token securely (in production, use encrypted storage or env var)
        bot_token = response_data.get("access_token")
        
        # Log success (in production, save to DB)
        logger.info(f"Slack OAuth successful. Bot token obtained.")
        
        # Redirect to frontend with success message
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return JsonResponse({
            "message": "OAuth successful",
            "redirect_url": f"{frontend_url}?slack_connected=true"
        })
    
    except Exception as e:
        logger.error(f"Slack OAuth error: {str(e)}")
        return JsonResponse({
            "error": f"OAuth token exchange failed: {str(e)}"
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def slack_events(request):
    """
    Handles Slack events (messages, mentions, etc.).
    Required for Slack Event Subscriptions.
    """
    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    # Slack URL verification challenge
    if data.get("type") == "url_verification":
        return JsonResponse({"challenge": data.get("challenge")})
    
    # Event handling
    if data.get("type") == "event_callback":
        event = data.get("event", {})
        event_type = event.get("type")
        
        if event_type == "message":
            logger.info(f"Slack message received: {event}")
            # Handle message logic here
        
        elif event_type == "app_mention":
            logger.info(f"ResolveIQ mentioned in Slack: {event}")
            # Handle mention logic here
        
        return JsonResponse({"ok": True})
    
    return JsonResponse({"ok": True})


@require_http_methods(["GET"])
def slack_status(request):
    """
    Check if Slack is properly configured.
    """
    bot_token = os.getenv("SLACK_BOT_TOKEN")
    client_id = os.getenv("SLACK_CLIENT_ID")
    channel_id = os.getenv("SLACK_CHANNEL_ID")
    
    return JsonResponse({
        "slack_configured": bool(bot_token and client_id and channel_id),
        "bot_token_set": bool(bot_token),
        "client_id_set": bool(client_id),
        "channel_id_set": bool(channel_id),
    })
