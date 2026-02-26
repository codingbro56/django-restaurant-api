from rest_framework import serializers
from .models import Payment

class CODPaymentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()


class PaymentDetailSerializer(serializers.ModelSerializer):

    order_id = serializers.IntegerField(source="order.id")

    class Meta:
        model = Payment
        fields = [
            "id",
            "order_id",
            "method",
            "status",
            "amount",
            "created_at",
        ]