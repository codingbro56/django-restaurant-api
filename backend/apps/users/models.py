from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    full_name = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=15)

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    user = models.OneToOneField(
        "users.User",   # STRING REFERENCE (IMPORTANT)
        on_delete=models.CASCADE,
        related_name="profile"
    )
    address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=50, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.user.username
