from django.urls import path
from . import api_views

urlpatterns = [
    path('api/cart/', api_views.view_cart),
    path('api/cart/add/', api_views.add_to_cart),
    path('api/cart/update/<int:item_id>/', api_views.update_cart_item),
    path('api/cart/remove/<int:item_id>/', api_views.remove_from_cart),
    path('api/cart/clear/', api_views.clear_cart),
]
