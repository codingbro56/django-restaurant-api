from rest_framework import serializers
from .models import MenuItem, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class MenuItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = ["id", "name", "price", "image", "category_id", "is_available"]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None
