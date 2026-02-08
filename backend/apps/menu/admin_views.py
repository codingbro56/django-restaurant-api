from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser

from django.shortcuts import get_object_or_404

from .models import Category, MenuItem


# ===============================
# CATEGORY APIS
# ===============================

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_categories(request):
    data = Category.objects.all().values("id", "name")
    return Response(list(data))


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_add_category(request):
    name = request.data.get("name")

    if not name:
        return Response({"error": "Name required"}, status=400)

    Category.objects.create(name=name)
    return Response({"message": "Category added"})


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_category(request, category_id):
    if MenuItem.objects.filter(category_id=category_id).exists():
        return Response(
            {"error": "Category has menu items. Delete them first."},
            status=400
        )

    Category.objects.filter(id=category_id).delete()
    return Response({"message": "Category deleted"})


# ===============================
# MENU ITEM APIS (ADMIN)
# ===============================

@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_menu_items(request):
    items = MenuItem.objects.select_related("category")

    return Response([
        {
            "id": i.id,
            "name": i.name,
            "price": i.price,
            "image": i.image.url if i.image else None,
            "category": i.category.name,
            "category_id": i.category.id,
            "is_available": i.is_available,
        }
        for i in items
    ])


@api_view(["POST"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_add_menu_item(request):
    name = request.data.get("name")
    price = request.data.get("price")
    category_id = request.data.get("category")
    image = request.data.get("image")

    if not name or not price or not category_id:
        return Response({"error": "All fields required"}, status=400)

    # Prevent duplicate item in same category
    if MenuItem.objects.filter(name=name, category_id=category_id).exists():
        return Response(
            {"error": "Item already exists in this category"},
            status=400
        )

    MenuItem.objects.create(
        name=name,
        price=price,
        category_id=category_id,
        image=image
    )

    return Response(
        {"message": "Menu item added"},
        status=status.HTTP_201_CREATED
    )


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
@parser_classes([MultiPartParser, FormParser])
def admin_update_menu_item(request, item_id):
    item = get_object_or_404(MenuItem, id=item_id)

    if "name" in request.data:
        item.name = request.data["name"]

    if "price" in request.data:
        item.price = request.data["price"]

    if "image" in request.data and request.data["image"]:
        item.image = request.data["image"]

    item.save()

    return Response({"message": "Item updated"})


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_menu_item(request, item_id):
    MenuItem.objects.filter(id=item_id).delete()
    return Response({"message": "Item deleted"})
