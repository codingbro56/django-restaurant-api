import random
from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.utils import timezone

from apps.menu.models import MenuItem
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment

User = get_user_model()


# -----------------------------
# INDIAN NAMES
# -----------------------------

FIRST_NAMES = [
"Aarav","Vivaan","Aditya","Arjun","Kabir","Rohan","Karan","Rahul",
"Ananya","Diya","Isha","Kavya","Meera","Riya","Pooja","Sneha",
"Vikram","Siddharth","Neha","Priya","Nikhil","Manish","Ritika"
]

LAST_NAMES = [
"Sharma","Patel","Singh","Verma","Gupta","Joshi","Iyer","Reddy",
"Chatterjee","Kapoor","Mehta","Bansal","Agarwal","Yadav","Mishra"
]


# -----------------------------
# CREATE USERS
# -----------------------------

def create_users(count=30):

    users = []

    for i in range(count):

        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)

        username = f"{first.lower()}{i}"

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": f"{username}@mail.com",
                "first_name": first,
                "last_name": last
            }
        )

        if created:
            user.set_password("password123")
            user.save()

        users.append(user)

    return users


# -----------------------------
# CREATE ORDERS
# -----------------------------

def create_orders(users):

    menu_items = list(MenuItem.objects.all())

    if not menu_items:
        print("No menu items found.")
        return

    for _ in range(200):

        user = random.choice(users)

        days_ago = random.randint(0, 60)
        order_date = timezone.now() - timedelta(days=days_ago)

        delivery_charge = Decimal("45.00")
        tax_percent = Decimal("0.05")

        order = Order.objects.create(
            user=user,
            status=random.choice(["completed","completed","completed","cancelled"]),
            total_amount=0,
            delivery_name=f"{user.first_name} {user.last_name}",
            delivery_phone="9999999999",
            delivery_address="Ahmedabad",
            delivery_city="Ahmedabad",
            delivery_state="Gujarat",
            delivery_pincode="380001",
            delivery_charge=delivery_charge,
            tax_amount=0
        )

        total = Decimal("0")

        item_count = random.randint(1,4)
        items = random.sample(menu_items, item_count)

        for item in items:

            qty = random.randint(1,3)
            price = item.price

            OrderItem.objects.create(
                order=order,
                menu_item=item,
                price=price,
                quantity=qty
            )

            total += price * qty

        tax = total * tax_percent
        grand_total = total + tax + delivery_charge

        order.tax_amount = tax
        order.total_amount = grand_total
        order.created_at = order_date
        order.save()

        payment = Payment.objects.create(
            order=order,
            method="COD",
            status="paid" if order.status == "completed" else "failed",
            amount=grand_total
        )

        payment.created_at = order_date
        payment.save(update_fields=["created_at"])

# -----------------------------
# MAIN FUNCTION
# -----------------------------

def run():

    print("Creating users...")
    users = create_users(35)

    print("Creating orders...")
    create_orders(users)

    print("Demo data generated successfully!")