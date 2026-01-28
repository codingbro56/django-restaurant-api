from django.urls import path
from . import api_views, admin_views

urlpatterns = [
    # public
    path('', api_views.menu_list),

    # admin
    # path('admin/', api_views.create_menu_item),
    # path('admin/<int:item_id>/', api_views.update_menu_item),
    # path('admin/<int:item_id>/delete/', api_views.delete_menu_item),
    # path('categories/', api_views.category_list),

    # 
    path("categories/", admin_views.admin_categories),
    path("categories/add/", admin_views.admin_add_category),
    path("categories/<int:category_id>/delete/", admin_views.admin_delete_category),

    path("admin/items/", admin_views.admin_menu_items),
    path("admin/items/add/", admin_views.admin_add_menu_item),
    path("admin/items/<int:item_id>/", admin_views.admin_update_menu_item),
    path("admin/<int:item_id>/delete/", admin_views.admin_delete_menu_item),
    
]
