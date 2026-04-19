from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    full_name = models.CharField(max_length=100)
    phone_no = models.CharField(max_length=15)

    address = models.TextField(blank=True)
    city = models.CharField(max_length=50, blank=True)
    state = models.CharField(max_length=50, blank=True)
    pincode = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return self.username

class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Contact from {self.name}"

class Feedback(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    rating = models.IntegerField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_reviewed = models.BooleanField(default=False)
    admin_reply = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Feedback from {self.name} - {self.rating} Stars"
