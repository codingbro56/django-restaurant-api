from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from apps.orders.models import Order


# ----------------------------------------
# ADMIN ORDER STATUS UPDATE
# ----------------------------------------

@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_order(request, order_id):

    order = get_object_or_404(Order, id=order_id)

    status_value = request.data.get("status")

    if status_value not in ["completed", "cancelled"]:
        return Response({"error": "Invalid status"}, status=400)

    if order.status != "pending":
        return Response({"error": "Order cannot be updated"}, status=400)

    order.status = status_value
    order.save()

    return Response({
        "success": True,
        "order_id": order.id,
        "status": order.status
    })