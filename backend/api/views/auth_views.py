from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.models import UserProfile


@api_view(["POST"])
def mock_login(request):
    """
    Magic login routing — maps username to role, returns a dummy session token.
    Password field in the request body is silently ignored.
    """
    username = request.data.get("username", "").lower().strip()

    try:
        user = UserProfile.objects.get(username=username)
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "User not found. Use 'harsh', 'vedant', or 'devika'."},
            status=404,
        )

    # Determine redirect based on role
    redirect_to = "/dashboard/vp" if user.role == "vp_ops" else "/dashboard/dev"

    return Response({
        "token": "mock-jwt-token-abc123",
        "username": user.username,
        "display_name": user.display_name,
        "role": user.role,
        "redirect_to": redirect_to,
    })
