from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from .models import Category, MenuItem
from rest_framework import status

# Categories
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


    Category.objects.filter(id=category_id).delete()
    return Response({"message": "Category deleted"})


# Menu Items
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_menu_items(request):
    items = MenuItem.objects.select_related("category")
    return Response([
        {
            "id": i.id,
            "name": i.name,
            "price": i.price,
            "category": i.category.name,
            "category_id": i.category.id,
            "is_available": i.is_available,
        }
        for i in items
    ])


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_add_menu_item(request):
    name = request.data.get("name")
    price = request.data.get("price")
    category_id = request.data.get("category")

    if not name or not price or not category_id:
        return Response({"error": "All fields required"}, status=400)

    # 🔒 PREVENT DUPLICATE ITEM (your requirement)
    if MenuItem.objects.filter(name=name, category_id=category_id).exists():
        return Response(
            {"error": "Item already exists in this category"},
            status=400
        )

    MenuItem.objects.create(
        name=name,
        price=price,
        category_id=category_id
    )
    return Response({"message": "Item added"})


@api_view(["PUT"])
@permission_classes([IsAdminUser])
def admin_update_menu_item(request, item_id):
    try:
        item = MenuItem.objects.get(id=item_id)
    except MenuItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=404)

    price = request.data.get("price")
    is_available = request.data.get("is_available")

    if price is not None:
        item.price = price

    if is_available is not None:
        item.is_available = is_available

    item.save()
    return Response({"message": "Item updated"})


@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def admin_delete_menu_item(request, item_id):
    MenuItem.objects.filter(id=item_id).delete()
    return Response({"message": "Item deleted"})

