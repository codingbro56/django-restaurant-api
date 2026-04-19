from django.db import models
from django.conf import settings
from apps.menu.models import MenuItem

User = settings.AUTH_USER_MODEL

class Order(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Delivery Fields
    delivery_name = models.CharField(max_length=100, null=True, blank=True)
    delivery_phone = models.CharField(max_length=20, null=True, blank=True)
    delivery_address = models.TextField(null=True, blank=True)
    delivery_city = models.CharField(max_length=100, null=True, blank=True)
    delivery_state = models.CharField(max_length=100, null=True, blank=True)
    delivery_pincode = models.CharField(max_length=20, null=True, blank=True)

    delivery_charge = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - ₹{self.total_amount}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    price = models.DecimalField(max_digits=8, decimal_places=2)  # snapshot price
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.menu_item.name} x {self.quantity}"
