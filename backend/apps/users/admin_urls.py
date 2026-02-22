from django.urls import path
from . import admin_views

urlpatterns = [
    # Admin User Management
    path("users/", admin_views.admin_user_list),
    path("users/create/", admin_views.admin_create_user),
    path("users/<int:user_id>/detail/", admin_views.admin_user_detail),
    path("users/<int:user_id>/update/", admin_views.admin_update_user),
    path("users/<int:user_id>/disable/", admin_views.admin_disable_user),

    # DASHBOARD
    path("dashboard/", admin_views.admin_dashboard),

    # Reports
    path("reports/orders/", admin_views.admin_order_report),
    path("reports/orders/csv/", admin_views.admin_order_report_csv),
    path("reports/users/", admin_views.admin_user_monthly_report),
]
