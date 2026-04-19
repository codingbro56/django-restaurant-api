from django.core.management.base import BaseCommand
from apps.menu.models import MenuItem, Category


class Command(BaseCommand):
    help = "Seed menu items into database"

    def handle(self, *args, **kwargs):

        data = {

            "Veg": [
                ("Paneer Tikka", 320),
                ("Veg Biryani", 280),
                ("Dal Makhani", 240),
            ],

            "Chinese": [
                ("Hakka Noodles", 210),
                ("Manchurian", 230),
                ("Fried Rice", 200),
            ],

            "Italian": [
                ("Margherita Pizza", 350),
                ("White Sauce Pasta", 300),
                ("Lasagna", 420),
            ],

            "Beverages": [
                ("Cold Coffee", 120),
                ("Lemon Soda", 60),
                ("Fresh Lime Juice", 90),
            ],

            "Desserts": [
                ("Gulab Jamun", 80),
                ("Brownie with Ice Cream", 180),
                ("Chocolate Lava Cake", 210),
            ],

            "South Indian": [
                ("Masala Dosa", 140),
                ("Plain Dosa", 110),
                ("Rava Dosa", 150),
                ("Idli Sambar", 90),
                ("Medu Vada", 100),
                ("Mysore Masala Dosa", 170),
                ("Uttapam", 160),
                ("Pongal", 130),
            ],

            "Fast Food": [
                ("Veg Burger", 120),
                ("Chicken Burger", 150),
                ("French Fries", 90),
                ("Cheese Sandwich", 110),
                ("Club Sandwich", 180),
                ("Veg Wrap", 130),
                ("Chicken Wrap", 160),
                ("Peri Peri Fries", 120),
            ],

            "Starter": [
                ("Paneer Chilli", 260),
                ("Gobi Manchurian", 230),
                ("Chicken Lollipop", 320),
                ("Hara Bhara Kabab", 210),
                ("Veg Spring Roll", 200),
                ("Chicken Tikka", 340),
                ("Fish Fingers", 360),
                ("Cheese Corn Balls", 220),
            ],
        }

        created_count = 0

        for category_name, items in data.items():

            category, _ = Category.objects.get_or_create(name=category_name)

            for name, price in items:

                obj, created = MenuItem.objects.get_or_create(
                    name=name,
                    category=category,
                    defaults={
                        "price": price,
                        "description": "",
                        "is_available": True
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Added {name}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Skipped {name} (already exists)"))

        self.stdout.write(
            self.style.SUCCESS(f"\nSeed complete. {created_count} items inserted.")
        )