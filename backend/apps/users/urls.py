from django.urls import path
from . import api_views

urlpatterns = [
    # Existing auth APIs (DO NOT TOUCH)
    path('api/auth/register/', api_views.register),
    path('api/auth/token-login/', api_views.token_login),
    path('api/auth/logout/', api_views.logout_view),
    path('api/auth/me/', api_views.me),

    # Admin
    path('api/admin/login/', api_views.admin_login),
    path("api/users/admin/", api_views.admin_users),

    # 🔑 ADD forgot/reset using SAME PATTERN
    path("api/auth/verify/", api_views.verify_email),
    path("api/auth/forgot-password/", api_views.forgot_password),
    path("api/auth/reset-password/", api_views.reset_password),
]
