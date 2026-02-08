from django.urls import path
from . import api_views, admin_views

urlpatterns = [
    # PUBLIC ROUTES (no authentication required)
    path('', api_views.menu_list),
    path('categories/', api_views.list_categories),

    # ADMIN ROUTES (IsAdminUser required)
    path("admin/categories/", admin_views.admin_categories),
    path("admin/categories/add/", admin_views.admin_add_category),
    path("admin/categories/<int:category_id>/delete/", admin_views.admin_delete_category),

    path("admin/items/", admin_views.admin_menu_items),
    path("admin/items/add/", admin_views.admin_add_menu_item),
    path("admin/items/<int:item_id>/", admin_views.admin_update_menu_item),
    path("admin/items/<int:item_id>/delete/", admin_views.admin_delete_menu_item),
]
