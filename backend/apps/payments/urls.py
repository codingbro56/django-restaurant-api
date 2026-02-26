from django.urls import path
from .api_views import CODPaymentView, PaymentDetailView

urlpatterns = [
    path("cod/", CODPaymentView.as_view(), name="cod-payment"),
    path("<int:order_id>/", PaymentDetailView.as_view(), name="payment-detail"),
]