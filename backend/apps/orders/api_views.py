from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .serializers import OrderDetailSerializer, PaymentOrderSerializer
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer 
from apps.cart_core.models import Cart

# Place Order From Cart
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def place_order(request):
    cart = Cart.objects.filter(user=request.user).first()

    if not cart or not cart.items.exists():
        return Response({"error": "Cart is empty"}, status=400)

    with transaction.atomic():
        cart_items = cart.items.select_related("menu_item")

        # Calculate subtotal
        subtotal = sum(item.menu_item.price * item.quantity for item in cart_items)

        # Delivery + Tax
        delivery_charge = Decimal("45.00")
        tax_amount = subtotal * Decimal("0.05")

        grand_total = subtotal + delivery_charge + tax_amount

        # Ensure user has address before placing order
        if not request.user.address or not request.user.phone_no:
            return Response(
                {"error": "Please complete your profile before placing order."},
                status=400
            )

        # Create Order with delivery snapshot
        order = Order.objects.create(
            user=request.user,
            total_amount=grand_total,

            delivery_name=request.user.full_name,
            delivery_phone=request.user.phone_no,
            delivery_address=request.user.address,
            delivery_city=request.user.city,
            delivery_state=request.user.state,
            delivery_pincode=request.user.pincode,

            delivery_charge=delivery_charge,
            tax_amount=tax_amount
        )

        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                menu_item=item.menu_item,
                price=item.menu_item.price,
                quantity=item.quantity
            )

        cart.items.all().delete()

    return Response({"id": order.id}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_order_detail(request, order_id):
    order = get_object_or_404(
        Order,
        id=order_id,
        user=request.user
    )

    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)

# View User Order
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# To see Admin All Orders
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_orders_list(request):
    orders = Order.objects.all().order_by("-created_at")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

# To see Admin Order Detail
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    serializer = OrderDetailSerializer(order)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_order_detail(request, order_id):
    order = get_object_or_404(
        Order,
        id=order_id,
        user=request.user
    )

    serializer = PaymentOrderSerializer(order)
    return Response(serializer.data)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_order_address(request, order_id):

    order = get_object_or_404(Order, id=order_id, user=request.user)

    order.delivery_name = request.data.get("delivery_name", order.delivery_name)
    order.delivery_phone = request.data.get("delivery_phone", order.delivery_phone)
    order.delivery_address = request.data.get("delivery_address", order.delivery_address)
    order.delivery_city = request.data.get("delivery_city", order.delivery_city)
    order.delivery_state = request.data.get("delivery_state", order.delivery_state)
    order.delivery_pincode = request.data.get("delivery_pincode", order.delivery_pincode)

    order.save()

    return Response({"message": "Delivery address updated"})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_order(request, order_id):

    order = get_object_or_404(Order, id=order_id, user=request.user)

    if order.status != "pending":
        return Response(
            {"error": "Order cannot be cancelled."},
            status=400
        )

    order.status = "cancelled"
    order.save()

    # If payment exists, update payment status too
    if hasattr(order, "payment"):
        order.payment.status = "cancelled"
        order.payment.save()

    return Response({"message": "Order cancelled successfully"})