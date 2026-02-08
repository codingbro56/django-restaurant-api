from rest_framework import serializers
from .models import Cart, CartItem
from apps.menu.serializers import MenuItemSerializer

class CartItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField(source="menu_item.name")
    price = serializers.DecimalField(
        source="menu_item.price",
        max_digits=8,
        decimal_places=2
    )
    quantity = serializers.IntegerField()
    subtotal = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    def get_subtotal(self, obj):
        return obj.menu_item.price * obj.quantity

    def get_image(self, obj):
        if obj.menu_item.image:
            return obj.menu_item.image.url
        return None



class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'items']
