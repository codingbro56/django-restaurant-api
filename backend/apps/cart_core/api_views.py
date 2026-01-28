from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Cart, CartItem
from apps.menu.models import MenuItem
from .serializers import CartSerializer

# Helper: get or create cart
def get_user_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart

# View Cart
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_cart(request):
    cart = get_user_cart(request.user)
    serializer = CartSerializer(cart)
    return Response(serializer.data)

# Add to Cart
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    cart = get_user_cart(request.user)

    menu_item_id = request.data.get('menu_item_id')
    quantity = int(request.data.get('quantity', 1))

    menu_item = get_object_or_404(MenuItem, id=menu_item_id)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        menu_item=menu_item
    )

    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity

    cart_item.save()

    return Response({"message": "Item added to cart"})

# Remove Item
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart = get_user_cart(request.user)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    item.delete()
    return Response({"message": "Item removed"})

#Clear Cart
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_user_cart(request.user)
    cart.items.all().delete()
    return Response({"message": "Cart cleared"})
