from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.users.urls')),
    # menu
    path('api/menu/', include('apps.menu.urls')),
    # Cart
    path('', include('apps.cart_core.urls')),
    # Orders
    path('api/orders/', include('apps.orders.urls')),
    # Admin User Management
    path("api/admin/", include("apps.users.admin_urls")),

]
