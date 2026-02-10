from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="items"
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="menu/", blank=True, null=True)

    # 🔥 MANUAL SPECIAL
    is_special = models.BooleanField(default=False)

    # 🔥 AUTO WEEKLY SPECIAL (NEW)
    # 0 = Monday ... 6 = Sunday
    special_day = models.IntegerField(
        null=True,
        blank=True,
        help_text="Auto special day (0=Mon … 6=Sun)"
    )

    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Detect if this item is becoming special
        is_becoming_special = False

        if self.pk:
            try:
                current = MenuItem.objects.get(pk=self.pk)
                is_becoming_special = (not current.is_special) and self.is_special
            except MenuItem.DoesNotExist:
                is_becoming_special = self.is_special
        else:
            is_becoming_special = self.is_special

        super().save(*args, **kwargs)

        # Ensure only ONE manual special exists
        if is_becoming_special:
            MenuItem.objects.exclude(pk=self.pk).filter(
                is_special=True
            ).update(is_special=False)
