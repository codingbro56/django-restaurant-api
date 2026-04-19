from rest_framework import serializers
from .models import MenuItem, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class MenuItemSerializer(serializers.ModelSerializer):
    category_id = serializers.IntegerField(source="category.id")
    category_name = serializers.CharField(source="category.name")

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "image",
            "is_available",
            "is_special",
            "category_id",
            "category_name"
        ]
