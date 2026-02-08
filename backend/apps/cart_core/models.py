from django.db import models
from django.contrib.auth import get_user_model
from apps.menu.models import MenuItem

User = get_user_model()

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Cart"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "menu_item")

    def __str__(self):
        return f"{self.menu_item.name} ({self.quantity})"

    @property
    def subtotal(self):
        """Calculate subtotal for this cart item"""
        return self.menu_item.price * self.quantity
