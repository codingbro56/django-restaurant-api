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
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    # Accept either `menu_item_id`, `menu_item` or `item_id` from the client
    menu_item_id = (
        request.data.get("menu_item_id")
        or request.data.get("menu_item")
        or request.data.get("item_id")
    )

    if not menu_item_id:
        return Response({"error": "Missing required field: menu_item_id"}, status=400)

    # Validate quantity: must be positive integer
    quantity_raw = request.data.get("quantity", 1)
    try:
        qty = int(quantity_raw)
    except (TypeError, ValueError):
        return Response({"error": "Quantity must be an integer"}, status=400)

    if qty < 1:
        return Response({"error": "Quantity must be at least 1"}, status=400)

    try:
        menu_item = MenuItem.objects.get(id=menu_item_id)
    except MenuItem.DoesNotExist:
        return Response({"error": "Menu item not found"}, status=404)

    cart, _ = Cart.objects.get_or_create(user=request.user)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        menu_item=menu_item
    )

    if created:
        cart_item.quantity = qty
    else:
        cart_item.quantity += qty

    cart_item.save()

    return Response({"message": "Item added to cart", "id": cart_item.id}, status=201)

# Remove Item
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, item_id):
    cart = get_user_cart(request.user)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    item.delete()
    return Response({"message": "Item removed"})

# Update Item Quantity
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, item_id):
    cart = get_user_cart(request.user)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    
    quantity = request.data.get("quantity", 1)
    if int(quantity) < 1:
        item.delete()
    else:
        item.quantity = int(quantity)
        item.save()
    
    return Response({"message": "Quantity updated"})

#Clear Cart
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    cart = get_user_cart(request.user)
    cart.items.all().delete()
    return Response({"message": "Cart cleared"})
