from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Payment
from .serializers import CODPaymentSerializer, PaymentDetailSerializer
from apps.orders.models import Order


class CODPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CODPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_id = serializer.validated_data["order_id"]

        # Ensure order belongs to logged-in user
        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        # Prevent duplicate payment
        if hasattr(order, "payment"):
            return Response(
                {"error": "Payment already created for this order."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure order is still pending
        if order.status != "pending":
            return Response(
                {"error": "Order cannot be processed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment = Payment.objects.create(
            order=order,
            method="COD",
            status="pending",
            amount=order.total_amount
        )

        return Response(
            {
                "message": "Cash on Delivery selected successfully.",
                "payment_id": payment.id,
                "amount": payment.amount
            },
            status=status.HTTP_201_CREATED
        )
    
class PaymentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):

        order = get_object_or_404(
            Order,
            id=order_id,
            user=request.user
        )

        if not hasattr(order, "payment"):
            return Response(
                {"error": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PaymentDetailSerializer(order.payment)
        return Response(serializer.data, status=status.HTTP_200_OK)