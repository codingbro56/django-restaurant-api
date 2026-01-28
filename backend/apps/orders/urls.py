from django.urls import path
from . import api_views, admin_views

urlpatterns = [
    path('place/', api_views.place_order),
    path('my/', api_views.my_orders),
    path('admin/', api_views.admin_orders_list),
    path('admin/<int:order_id>/', api_views.admin_order_detail),

    path("admin/<int:order_id>/status/", admin_views.admin_update_order_status),
    path("admin/<int:order_id>/status/", admin_views.admin_update_order_status),

    path("reports/top-items/", admin_views.admin_top_selling_items),

]
