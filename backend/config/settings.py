"""
Django settings for Restaurant API - Production Configuration

Deployment: Render
Frontend: Vercel (https://django-restaurant-api.vercel.app)
Database: Render PostgreSQL
Media Storage: Cloudinary
Static Files: WhiteNoise
Authentication: JWT (SimpleJWT)

All sensitive data is sourced from environment variables for security.
"""

import os
from datetime import timedelta
from pathlib import Path
import cloudinary

# ============================================================================
# CORE SETTINGS
# ============================================================================

BASE_DIR = Path(__file__).resolve().parent.parent

# SECRET_KEY must be kept secret in production. Source from environment.
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-development-only"
)

# Always use DEBUG=False in production to prevent sensitive data leakage
DEBUG = False

# ============================================================================
# RENDER HOSTING CONFIGURATION
# ============================================================================
# Only include the Render backend domain to prevent access from unauthorized hosts.
# Update this if your Render domain changes.
ALLOWED_HOSTS = [
    os.environ.get("RENDER_EXTERNAL_HOSTNAME", "localhost"),
]

# ============================================================================
# INSTALLED APPLICATIONS
# ============================================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party applications
    "corsheaders",  # CORS support for Vercel frontend
    "rest_framework",  # Django REST Framework for API
    "cloudinary",  # Cloudinary SDK
    "cloudinary_storage",  # Cloudinary storage backend
    # Local apps
    "apps.cart_core",
    "apps.menu",
    "apps.orders",
    "apps.users",
]

# ============================================================================
# MIDDLEWARE STACK
# ============================================================================
# Order matters! CorsMiddleware must come before most other middleware.

MIDDLEWARE = [
    # CORS must be early in the middleware stack to properly handle
    # requests from the Vercel frontend
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise middleware for efficient static file serving on Render
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# ============================================================================
# TEMPLATES
# ============================================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ============================================================================
# PRODUCTION DATABASE - RENDER POSTGRESQL
# ============================================================================
# Uses environment variables provided by Render PostgreSQL add-on.
# These are automatically injected: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": 600,  # Connection pooling for better performance
    }
}

# ============================================================================
# AUTHENTICATION & JWT
# ============================================================================

AUTH_USER_MODEL = "users.User"  # Custom user model

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Django REST Framework configuration
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

# Simple JWT configuration for secure token-based authentication
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# ============================================================================
# CORS CONFIGURATION - VERCEL FRONTEND
# ============================================================================
# Allow requests from the Vercel-hosted frontend.
# Restrict to specific origins to prevent unauthorized cross-origin requests.
'''
CORS_ALLOWED_ORIGINS = [
    "https://django-restaurant-api.vercel.app",
]'''

# Allow all Vercel subdomains (including preview deployments)
# CORS_ALLOWED_ORIGIN_REGEXES = [
#     r"^https://.*\.vercel\.app$",
# ]

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = False

# Allow credentials (cookies, authorization headers) in cross-origin requests
# CORS_ALLOW_CREDENTIALS = True

# Explicitly define allowed HTTP methods for preflight requests
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# Explicitly define allowed headers in cross-origin requests
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]

# ============================================================================
# STATIC FILES - WHITENOISE
# ============================================================================
# WhiteNoise serves static files efficiently on Render without needing a CDN.
# This is production-optimized for performance and security.

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

# CompressedManifestStaticFilesStorage:
# - Compresses CSS/JS files for smaller downloads
# - Adds content hashes to filenames for cache busting
# - Improves performance on Render
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# WhiteNoise caching settings for optimal performance
WHITENOISE_COMPRESS = True
WHITENOISE_AUTOREFRESH = False  # Disable auto-refresh in production

# ============================================================================
# MEDIA FILES - CLOUDINARY STORAGE
# ============================================================================
# Use Cloudinary for storing user uploads (images, etc.) instead of local storage.
# Provides CDN-backed, scalable image storage and optimization.

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
)

# ============================================================================
# INTERNATIONALIZATION & LOCALIZATION
# ============================================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ============================================================================
# DEFAULT PRIMARY KEY TYPE
# ============================================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
