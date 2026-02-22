from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # users
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

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


