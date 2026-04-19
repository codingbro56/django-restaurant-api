"""
Django settings for Restaurant API - LOCAL DEVELOPMENT MODE

This configuration is for:
- Local development only
- SQLite database
- Local media storage
- DEBUG enabled

Production settings (Render, Cloudinary, PostgreSQL, WhiteNoise)
have been removed temporarily.
"""

import os
from pathlib import Path
from datetime import timedelta

# ==========================================================
# CORE SETTINGS
# ==========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = "django-insecure-local-dev-key"

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# ==========================================================
# INSTALLED APPS
# ==========================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "corsheaders",
    "rest_framework",

    # Local apps
    "apps.cart_core",
    "apps.menu",
    "apps.orders",
    "apps.payments",
    "apps.users",
]

# ==========================================================
# MIDDLEWARE
# ==========================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"


# ==========================================================
# TEMPLATES
# ==========================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ==========================================================
# DATABASE (SQLite for Local)
# ==========================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ==========================================================
# AUTH & JWT
# ==========================================================

AUTH_USER_MODEL = "users.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ==========================================================
# CORS (Allow All for Local Development)
# ==========================================================

CORS_ALLOW_ALL_ORIGINS = True

# ==========================================================
# STATIC FILES
# ==========================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ==========================================================
# MEDIA FILES (Local Storage)
# ==========================================================

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ==========================================================
# INTERNATIONALIZATION
# ==========================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"