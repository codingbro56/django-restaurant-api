from django.urls import path
from . import api_views

urlpatterns = [
    path('api/auth/register/', api_views.register),
    path('api/auth/token-login/', api_views.token_login),
    path('api/auth/logout/', api_views.logout_view),
    path('api/auth/me/', api_views.me),
    path('api/admin/login/', api_views.admin_login), #For Admin Login 
    path("api/users/admin/", api_views.admin_users),
]
