from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Order
from rest_framework import status

from apps.orders.models import OrderItem
from django.db.models import Sum

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=404)

    status = request.data.get("status")

    if status not in ["Accepted", "Rejected"]:
        return Response({"error": "Invalid status"}, status=400)

    order.status = status
    order.save()

    return Response({"message": "Order status updated", "status": order.status})

# API to update order status
@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get("status")
    if new_status not in ["Accepted", "Rejected"]:
        return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)

    order.status = new_status
    order.save()

    return Response({"message": "Status updated", "status": order.status})


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