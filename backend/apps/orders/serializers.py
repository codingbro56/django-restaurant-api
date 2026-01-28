from rest_framework import serializers
from .models import Order, OrderItem


# 🔹 Used for order lists (admin list, my orders)
class OrderSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username')

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_amount', 'created_at']


# 🔹 Used for order detail
class OrderItemSerializer(serializers.ModelSerializer):
    menu_item = serializers.CharField(source='menu_item.name')

    class Meta:
        model = OrderItem
        fields = ['menu_item', 'price', 'quantity']


class OrderDetailSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = serializers.CharField(source='user.username')

    class Meta:
        model = Order
        fields = ['id', 'user', 'status', 'total_amount', 'items']
