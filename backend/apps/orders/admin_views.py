from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Order
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.orders.models import OrderItem
from django.db.models import Sum

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_order(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    status_value = request.data.get("status")

    if status_value not in ["completed", "cancelled"]:
        return Response(
            {"error": "Invalid status"},
            status=400
        )

    order.status = status_value
    order.save()

    return Response({"success": True})


@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_top_selling_items(request):
    items = (
        OrderItem.objects
        .filter(order__status="completed")
        .values("menu_item__name")
        .annotate(total_sold=Sum("quantity"))
        .order_by("-total_sold")[:5]
    )

    return Response(items)