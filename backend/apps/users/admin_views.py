# from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from apps.menu.models import MenuItem, Category
from apps.orders.models import Order

from django.utils.dateparse import parse_date

import csv
from django.http import HttpResponse
from django.contrib.auth import get_user_model
User = get_user_model()

from .serializers import (
    AdminListSerializer,
    AdminDetailSerializer,
    AdminCreateSerializer,
    AdminUpdateSerializer,
)

# -----------------------------
# Admin List (Only Admins)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_user_list(request):
    admins = User.objects.filter(is_staff=True).order_by("-date_joined")
    serializer = AdminListSerializer(admins, many=True)
    return Response(serializer.data)


# -----------------------------
# Admin Detail (Single Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_user_detail(request, user_id):
    try:
        admin = User.objects.get(id=user_id, is_staff=True)
    except User.DoesNotExist:
        return Response({"error": "Admin not found"}, status=404)

    serializer = AdminDetailSerializer(admin)
    return Response(serializer.data)


# -----------------------------
# Create Admin (Full Details)
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_create_user(request):
    serializer = AdminCreateSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Admin created successfully"}, status=201)

    return Response(serializer.errors, status=400)


# -----------------------------
# Update Admin
# -----------------------------
@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_user(request, user_id):
    try:
        admin = User.objects.get(id=user_id, is_staff=True)
    except User.DoesNotExist:
        return Response({"error": "Admin not found"}, status=404)

    serializer = AdminUpdateSerializer(admin, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Admin updated successfully"})

    return Response(serializer.errors, status=400)


# -----------------------------
# Deactivate Admin
# -----------------------------
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_disable_user(request, user_id):
    try:
        admin = User.objects.get(id=user_id, is_staff=True)
    except User.DoesNotExist:
        return Response({"error": "Admin not found"}, status=404)

    admin.is_active = False
    admin.save()

    return Response({"message": "Admin deactivated successfully"})

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard(request):

    orders = Order.objects.all()

    total_revenue = sum(o.total_amount for o in orders)

    data = {
        "total_users": User.objects.filter(is_active=True).count(),
        "total_orders": orders.count(),
        "total_menu_items": MenuItem.objects.count(),
        "total_categories": Category.objects.count(),
        "total_revenue": total_revenue,  # ADD THIS
        "recent_orders": [
            {
                "id": o.id,
                "user": o.user.username,
                "total": o.total_amount,
                "status": o.status
            }
            for o in orders.order_by("-id")[:5]
        ]
    }

    return Response(data)



@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_order_report(request):
    status = request.GET.get("status")
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    orders = Order.objects.all()

    # Filter by status
    if status:
        orders = orders.filter(status__iexact=status)

    # Filter by date range
    if start_date:
        orders = orders.filter(created_at__date__gte=parse_date(start_date))
    if end_date:
        orders = orders.filter(created_at__date__lte=parse_date(end_date))

    data = {
        "total_orders": orders.count(),
        "total_amount": sum(o.total_amount for o in orders),
        "orders": [
            {
                "id": o.id,
                "user": o.user.username,
                "status": o.status,
                "total": o.total_amount,
                "date": o.created_at.date()
            }
            for o in orders.order_by("-id")
        ]
    }

    return Response(data)



@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_order_report_csv(request):
    status = request.GET.get("status")
    start_date = request.GET.get("start")
    end_date = request.GET.get("end")

    orders = Order.objects.all()

    if status:
        orders = orders.filter(status__iexact=status)

    if start_date:
        orders = orders.filter(created_at__date__gte=parse_date(start_date))
    if end_date:
        orders = orders.filter(created_at__date__lte=parse_date(end_date))

    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="order_report.csv"'

    writer = csv.writer(response)
    writer.writerow(["Order ID", "User", "Status", "Total Amount", "Date"])

    for o in orders:
        writer.writerow([
            o.id,
            o.user.username,
            o.status,
            o.total_amount,
            o.created_at.date()
        ])

    return response

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_user_monthly_report(request):
    month = request.GET.get("month")

    if not month:
        return Response({"error": "Month is required"}, status=400)

    year, month = map(int, month.split("-"))

    users = User.objects.filter(
        date_joined__year=year,
        date_joined__month=month
    )

    return Response({
        "total": users.count(),
        "active": users.filter(is_active=True).count(),
        "disabled": users.filter(is_active=False).count(),
        "admins": users.filter(is_staff=True).count(),
    })