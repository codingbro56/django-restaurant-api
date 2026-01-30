from django.urls import path
from . import api_views, admin_views

urlpatterns = [
    # user
    path('place/', api_views.place_order),
    path('my/', api_views.my_orders),

    # admin
    path('admin/', api_views.admin_orders_list),
    path('admin/<int:order_id>/', api_views.admin_order_detail),

    # ✅ ONLY ONE status update endpoint
    path('admin/<int:order_id>/status/', admin_views.admin_update_order),

    # reports
    path("reports/top-items/", admin_views.admin_top_selling_items),
]
