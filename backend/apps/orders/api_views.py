from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.db import transaction
from django.shortcuts import get_object_or_404
from .serializers import OrderDetailSerializer, PaymentOrderSerializer

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
        total = sum(item.menu_item.price * item.quantity for item in cart.items.all())

        order = Order.objects.create(
            user=request.user,
            total_amount=total
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