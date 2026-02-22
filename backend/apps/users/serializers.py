from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


# -----------------------------
# Admin List Serializer
# -----------------------------
class AdminListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "is_active",
            "date_joined",
        ]


# -----------------------------
# Admin Detail Serializer
# -----------------------------
class AdminDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "username",
            "email",
            "phone_no",
            "address",
            "city",
            "state",
            "pincode",
            "is_active",
            "date_joined",
        ]


# -----------------------------
# Admin Create Serializer
# -----------------------------
class AdminCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "full_name",
            "username",
            "email",
            "phone_no",
            "address",
            "city",
            "state",
            "pincode",
            "password",
        ]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            full_name=validated_data["full_name"],
            phone_no=validated_data["phone_no"],
            address=validated_data.get("address", ""),
            city=validated_data.get("city", ""),
            state=validated_data.get("state", ""),
            pincode=validated_data.get("pincode", ""),
        )
        user.is_staff = True
        user.save()
        return user


# -----------------------------
# Admin Update Serializer
# -----------------------------
class AdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "full_name",
            "username",
            "email",
            "phone_no",
            "address",
            "city",
            "state",
            "pincode",
            "is_active",
        ]