from django.contrib.auth import authenticate, logout
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from urllib.parse import unquote
from .models import User, ContactMessage, Feedback
from django.contrib.auth import get_user_model
User = get_user_model()


@api_view(["POST"])
def register(request):
    required_fields = [
        "full_name",
        "username",
        "email",
        "phone_no",
        "password",
        "confirm_password",
    ]

    for field in required_fields:
        if not request.data.get(field):
            return Response(
                {"error": f"{field} is required"},
                status=400
            )

    if request.data["password"] != request.data["confirm_password"]:
        return Response(
            {"error": "Passwords do not match"},
            status=400
        )

    if User.objects.filter(username=request.data["username"]).exists():
        return Response(
            {"error": "Username already taken"},
            status=400
        )

    if User.objects.filter(email=request.data["email"]).exists():
        return Response(
            {"error": "Email already registered"},
            status=400
        )

    user = User.objects.create_user(
        username=request.data["username"],
        email=request.data["email"],
        password=request.data["password"],
        full_name=request.data["full_name"],
        phone_no=request.data["phone_no"],
        address=request.data.get("address", ""),
        city=request.data.get("city", ""),
        state=request.data.get("state", ""),
        pincode=request.data.get("pincode", ""),
    )

    return Response(
        {"message": "User registered successfully"},
        status=201
    )

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

@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user

    if request.method == "GET":
        return Response({
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "phone_no": user.phone_no,
            "address": user.address,
            "city": user.city,
            "state": user.state,
            "pincode": user.pincode,
        })

    # PUT (Update Profile)
    user.full_name = request.data.get("full_name", user.full_name)
    user.phone_no = request.data.get("phone_no", user.phone_no)
    user.address = request.data.get("address", user.address)
    user.city = request.data.get("city", user.city)
    user.state = request.data.get("state", user.state)
    user.pincode = request.data.get("pincode", user.pincode)

    user.save()

    return Response({"message": "Profile updated successfully"})

# ========================================
# COMMUNICATION / FEEDBACK
# ========================================

@api_view(["POST"])
def submit_contact(request):
    name = request.data.get("name")
    email = request.data.get("email")
    message = request.data.get("message")

    if not all([name, email, message]):
        return Response({"error": "All fields are required"}, status=400)

    contact = ContactMessage.objects.create(name=name, email=email, message=message)

    try:
        send_mail(
            subject="New Contact Message from BharatBites",
            message=f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else "noreply@bharatbites.xyz",
            recipient_list=[settings.ADMIN_EMAIL] if hasattr(settings, 'ADMIN_EMAIL') else ["admin@bharatbites.xyz"],
        )
    except Exception as e:
        print("Mail error:", e)

    return Response({"success": "Message received"})

@api_view(["POST"])
def submit_feedback(request):
    name = request.data.get("name")
    email = request.data.get("email")
    rating = request.data.get("rating")
    message = request.data.get("message")

    if not all([name, email, rating, message]):
        return Response({"error": "All fields are required"}, status=400)

    feedback = Feedback.objects.create(name=name, email=email, rating=rating, message=message)

    try:
        send_mail(
            subject="New Feedback received for BharatBites",
            message=f"Name: {name}\nEmail: {email}\nRating: {rating}/5\n\nFeedback:\n{message}",
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else "noreply@bharatbites.xyz",
            recipient_list=[settings.ADMIN_EMAIL] if hasattr(settings, 'ADMIN_EMAIL') else ["admin@bharatbites.xyz"],
        )
    except Exception as e:
        print("Mail error:", e)

    return Response({"success": "Feedback received"})

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_feedback_list(request):
    feedbacks = Feedback.objects.all().order_by("-created_at").values()
    return Response(list(feedbacks))

@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_feedback_reply(request, feedback_id):
    try:
        feedback = Feedback.objects.get(id=feedback_id)
    except Feedback.DoesNotExist:
        return Response({"error": "Feedback not found"}, status=404)

    reply_text = request.data.get("reply")
    if not reply_text:
        return Response({"error": "Reply text is required"}, status=400)

    feedback.admin_reply = reply_text
    feedback.is_reviewed = True
    feedback.save()

    try:
        send_mail(
            subject="Reply to your Feedback on BharatBites",
            message=f"Hello {feedback.name},\n\nThank you for your feedback:\n\"{feedback.message}\"\n\nOur Reply:\n{reply_text}\n\nBest,\nBharatBites Admin",
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else "noreply@bharatbites.xyz",
            recipient_list=[feedback.email],
        )
    except Exception as e:
        print("Mail error:", e)

    return Response({"success": "Reply sent"})