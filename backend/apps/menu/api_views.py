from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import MenuItem, Category
from .serializers import MenuItemSerializer, CategorySerializer
from apps.users.permissions import IsAdmin

# Categories
@api_view(["GET"])
def list_categories(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)

# Public Menu anyone access
@api_view(["GET"])
def menu_list(request):
    items = MenuItem.objects.select_related("category").all()
    serializer = MenuItemSerializer(items, many=True)
    return Response(serializer.data)

# Admin Create Menu Item
@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_menu_item(request):
    serializer = MenuItemSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

# Admin Update Menu Item
@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_menu_item(request, item_id):
    item = get_object_or_404(MenuItem, id=item_id)
    serializer = MenuItemSerializer(item, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)

# Admin Delete Menu Item
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_menu_item(request, item_id):
    item = get_object_or_404(MenuItem, id=item_id)
    item.delete()
    return Response({"message": "Menu item deleted"})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def category_list(request):
    categories = Category.objects.all().values("id", "name")
    return Response(categories)