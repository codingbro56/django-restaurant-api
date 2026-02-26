from rest_framework import serializers
from .models import Order, OrderItem
from apps.payments.models import Payment


# 🔹 Used for order lists (admin list, my orders)
class OrderSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "username",
            "status",
            "total_amount",
            "created_at",
            "payment"
        ]

    def get_payment(self, obj):
        if hasattr(obj, "payment"):
            return {
                "method": obj.payment.method,
                "status": obj.payment.status,
                "amount": obj.payment.amount
            }
        return None


# 🔹 Used for order detail
class OrderItemSerializer(serializers.ModelSerializer):

    item_name = serializers.CharField(source='menu_item.name', read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['item_name', 'price', 'quantity', 'total']

    def get_total(self, obj):
        return float(obj.price) * obj.quantity


class OrderDetailSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "username",
            "status",
            "total_amount",
            "created_at",
            "items",
            "payment"
        ]

    def get_payment(self, obj):
        payment = getattr(obj, "payment", None)
        if payment:
            return {
                "method": payment.method,
                "status": payment.status,
                "amount": payment.amount
            }
        return None
    

class PaymentOrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source="menu_item.name")

    class Meta:
        model = OrderItem
        fields = [
            "menu_item_name",
            "price",
            "quantity"
        ]


class PaymentOrderSerializer(serializers.ModelSerializer):
    items = PaymentOrderItemSerializer(many=True, read_only=True)
    payment = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "total_amount",
            "items",
            "payment"
        ]

    def get_payment(self, obj):
        if hasattr(obj, "payment"):
            return {
                "method": obj.payment.method,
                "status": obj.payment.status,
                "amount": obj.payment.amount
            }
        return None