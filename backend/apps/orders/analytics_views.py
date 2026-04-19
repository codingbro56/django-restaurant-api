from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from django.db.models import Sum, Count, F, DecimalField, ExpressionWrapper
from django.db.models.functions import TruncDate, Coalesce

from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment


# ---------------------------------------------------------
# DATE RANGE HELPER
# ---------------------------------------------------------
def get_date_range(request):

    start_date = request.GET.get("start_date")
    end_date = request.GET.get("end_date")

    if start_date and end_date:
        return start_date, end_date

    range_type = request.GET.get("range", "monthly")
    now = timezone.now()

    if range_type == "daily":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    elif range_type == "weekly":
        start = now - timedelta(days=7)

    elif range_type == "yearly":
        start = now.replace(month=1, day=1)

    else:
        start = now - timedelta(days=30)

    return start, now


# ---------------------------------------------------------
# SUMMARY KPI
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_summary(request):

    start_date, end_date = get_date_range(request)

    payments = Payment.objects.filter(
        created_at__gte=start_date,
        created_at__lte=end_date
    )

    paid = payments.filter(status="paid")

    total_revenue = paid.aggregate(
        total=Coalesce(Sum("amount"), Decimal("0.00"))
    )["total"]

    total_orders = paid.count()

    avg_order_value = (
        float(total_revenue) / total_orders if total_orders else 0
    )

    success_rate = (
        (paid.count() / payments.count()) * 100
        if payments.count() else 0
    )

    repeat_customers = (
        paid.values("order__user")
        .annotate(order_count=Count("id"))
        .filter(order_count__gt=1)
        .count()
    )

    total_customers = (
        paid.values("order__user")
        .distinct()
        .count()
    )

    repeat_percent = (
        (repeat_customers / total_customers) * 100
        if total_customers else 0
    )

    return Response({
        "total_revenue": float(total_revenue),
        "total_orders": int(total_orders),
        "avg_order_value": round(avg_order_value, 2),
        "repeat_customer_percent": round(repeat_percent, 2),
        "payment_success_rate": round(success_rate, 2)
    })


# ---------------------------------------------------------
# REVENUE TREND
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_revenue(request):

    start_date, end_date = get_date_range(request)

    payments = Payment.objects.filter(status="paid")

    if start_date and end_date:
        payments = payments.filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )

    data = (
        payments
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(revenue=Sum("amount"))
        .order_by("day")
    )

    result = [
        {
            "date": str(row["day"]),
            "revenue": float(row["revenue"])
        }
        for row in data
    ]

    return Response(result)


# ---------------------------------------------------------
# ORDER STATUS DISTRIBUTION
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_status(request):

    start_date, end_date = get_date_range(request)

    data = (
        Order.objects
        .filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        .values("status")
        .annotate(count=Count("id"))
    )

    result = [
        {
            "status": row["status"],
            "count": int(row["count"])
        }
        for row in data
    ]

    return Response(result)


# ---------------------------------------------------------
# CATEGORY REVENUE
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_categories(request):

    start_date, end_date = get_date_range(request)

    revenue_expr = ExpressionWrapper(
        F("price") * F("quantity"),
        output_field=DecimalField(max_digits=12, decimal_places=2)
    )

    data = (
        OrderItem.objects
        .filter(
            order__payment__status="paid",
            order__created_at__gte=start_date,
            order__created_at__lte=end_date
        )
        .values("menu_item__category__name")
        .annotate(
            revenue=Coalesce(
                Sum(revenue_expr),
                Decimal("0.00")
            )
        )
        .order_by("-revenue")
    )

    result = [
        {
            "category": row["menu_item__category__name"],
            "revenue": float(row["revenue"])
        }
        for row in data
    ]

    return Response(result)


# ---------------------------------------------------------
# TOP ITEMS
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_top_items(request):

    start_date, end_date = get_date_range(request)

    revenue_expr = ExpressionWrapper(
        F("price") * F("quantity"),
        output_field=DecimalField(max_digits=12, decimal_places=2)
    )

    data = (
        OrderItem.objects
        .filter(
            order__payment__status="paid",
            order__created_at__gte=start_date,
            order__created_at__lte=end_date
        )
        .values(
            "menu_item__name",
            "menu_item__category__name"
        )
        .annotate(
            units=Coalesce(Sum("quantity"), 0),
            revenue=Coalesce(
                Sum(revenue_expr),
                Decimal("0.00")
            )
        )
        .order_by("-revenue")[:5]
    )

    result = [
        {
            "name": row["menu_item__name"],
            "category": row["menu_item__category__name"],
            "units": int(row["units"]),
            "revenue": float(row["revenue"])
        }
        for row in data
    ]

    return Response(result)


# ---------------------------------------------------------
# SPECIAL DISH REPORT
# ---------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_special(request):

    start_date, end_date = get_date_range(request)

    revenue_expr = ExpressionWrapper(
        F("price") * F("quantity"),
        output_field=DecimalField(max_digits=12, decimal_places=2)
    )

    items = OrderItem.objects.filter(
        order__payment__status="paid",
        menu_item__is_special=True,
        order__created_at__gte=start_date,
        order__created_at__lte=end_date
    )

    total_units = items.aggregate(
        total=Coalesce(Sum("quantity"), 0)
    )["total"]

    total_revenue = items.aggregate(
        revenue=Coalesce(
            Sum(revenue_expr),
            Decimal("0.00")
        )
    )["revenue"]

    return Response({
        "special_units": int(total_units),
        "special_revenue": float(total_revenue)
    })

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_analytics_weekly_orders(request):

    start_date, end_date = get_date_range(request)

    data = (
        Order.objects
        .filter(
            created_at__gte=start_date,
            created_at__lte=end_date
        )
        .annotate(day=TruncDate("created_at"))
        .values("day")
        .annotate(orders=Count("id"))
        .order_by("day")
    )

    result = [
        {
            "date": str(row["day"]),
            "orders": row["orders"]
        }
        for row in data
    ]

    return Response(result)