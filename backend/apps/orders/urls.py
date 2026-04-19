from django.urls import path
from . import api_views, admin_views, analytics_views

urlpatterns = [

    # ----------------------------
    # USER ORDER APIS
    # ----------------------------

    path("place/", api_views.place_order),
    path("my/", api_views.my_orders),
    path("<int:order_id>/", api_views.user_order_detail),
    path("<int:order_id>/payment/", api_views.payment_order_detail),
    path("<int:order_id>/update-address/", api_views.update_order_address),
    path("<int:order_id>/cancel/", api_views.cancel_order),

    # ADMIN ORDER LIST
    path("admin/", api_views.admin_orders_list),

    # ADMIN ORDER DETAIL
    path("admin/<int:order_id>/", api_views.admin_order_detail),

    # ADMIN ORDER STATUS UPDATE
    path("admin/<int:order_id>/status/", admin_views.admin_update_order),

    # ANALYTICS
    path("admin/analytics/summary/", analytics_views.admin_analytics_summary),
    path("admin/analytics/revenue/", analytics_views.admin_analytics_revenue),
    path("admin/analytics/weekly/", analytics_views.admin_analytics_weekly_orders),
    path("admin/analytics/status/", analytics_views.admin_analytics_status),
    path("admin/analytics/categories/", analytics_views.admin_analytics_categories),
    path("admin/analytics/top-items/", analytics_views.admin_analytics_top_items),
    path("admin/analytics/special/", analytics_views.admin_analytics_special),
]