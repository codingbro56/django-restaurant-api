from django.contrib import admin
from .models import MenuItem, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active")


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price", "is_available", "is_special")
    list_filter = ("category", "is_available", "is_special")
    list_editable = ("is_available", "is_special")

    def save_model(self, request, obj, form, change):
        # Let model.save() handle unsetting other specials, but ensure atomic behavior
        super().save_model(request, obj, form, change)
from django.contrib import admin

# Register your models here.
