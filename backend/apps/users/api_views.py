from django.contrib.auth import authenticate, logout
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator

from .serializers import RegisterSerializer
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from urllib.parse import unquote


@csrf_exempt
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.save(is_active=False)  # 🔒 inactive until verified

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        verify_url = (
            f"{settings.FRONTEND_BASE_URL}/auth/verify.html"
            f"?uid={uid}&token={token}"
        )

        send_mail(
            subject="Verify your account",
            message=f"Click to verify your account:\n{verify_url}",
            from_email="noreply@restaurant.com",
            recipient_list=[user.email],
        )

        return Response({
            "message": "Registration successful. Check your email to verify."
        })

    return Response(serializer.errors, status=400)

@api_view(["GET"])
def verify_email(request):
    uid = request.GET.get("uid")
    token = request.GET.get("token")

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({"error": "Invalid verification link"}, status=400)

    if default_token_generator.check_token(user, token):
        user.is_active = True
        user.save()
        return Response({"message": "Email verified successfully"})

    return Response({"error": "Invalid or expired token"}, status=400)

@csrf_exempt
@api_view(['POST'])
def token_login(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    # 🔒 block login if not verified
    if not user.is_active:
        return Response(
            {"error": "Email not verified"},
            status=403
        )

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username,
        "is_staff": user.is_staff
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    return Response({'message': 'Logged out'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        "username": request.user.username,
        "email": request.user.email,
        "is_staff": request.user.is_staff
    })

# Admin Login
@csrf_exempt
@api_view(['POST'])
def admin_login(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )

    if not user:
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.is_staff:
        return Response({"error": "Admin access required"}, status=403)

    if not user.is_active:
        return Response({"error": "Email not verified"}, status=403)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "username": user.username,
        "is_staff": True
    })


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_users(request):
    users = User.objects.all().values(
        "id", "username", "email", "is_active", "is_staff"
    )
    return Response(list(users))

@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        # Do not reveal user existence (security)
        return Response(
            {"message": "If the email exists, reset link sent"}
        )

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_url = (
        f"{settings.FRONTEND_BASE_URL}/auth/reset.html"
        f"?uid={uid}&token={token}"
    )

    send_mail(
        subject="Reset your password",
        message=f"Click to reset your password:\n{reset_url}",
        from_email="noreply@restaurant.com",
        recipient_list=[user.email],
    )

    return Response(
        {"message": "If the email exists, reset link sent"}
    )

# from django.contrib.auth.models import User
# from django.contrib.auth.tokens import default_token_generator
# from django.utils.http import urlsafe_base64_decode
# from django.utils.encoding import force_str
# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status


@api_view(["POST"])
def reset_password(request):
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("password")

    print("UID:", uid)
    print("TOKEN:", token)

    if not uid or not token or not new_password:
        return Response({"error": "Invalid request"}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception as e:
        print("UID DECODE ERROR:", e)
        return Response({"error": "Invalid UID"}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({"error": "Invalid or expired token"}, status=400)

    user.set_password(new_password)
    user.save()

    return Response({"message": "Password reset successful"})
