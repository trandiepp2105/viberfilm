from rest_framework import serializers
from .models import User, Role, UserRole
from django.contrib.auth import authenticate
from rest_framework.status import HTTP_404_NOT_FOUND, HTTP_401_UNAUTHORIZED
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email

        return token
        
    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Kiểm tra tài khoản có tồn tại
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed(
                detail="User does not exist",
                code=HTTP_404_NOT_FOUND
            )

        # Kiểm tra mật khẩu
        if not user.check_password(password):
            raise AuthenticationFailed(
                detail="Incorrect password",
                code=HTTP_401_UNAUTHORIZED
            )

        # Gọi validate gốc để lấy token
        return super().validate(attrs)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'birthday', 'phone_number', 'profile_picture']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['role_id', 'role_name', 'permissions']

# class RegisterSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = User
#         fields = ['username', 'password', 'email']

#     def create(self, validated_data):
#         if User.objects.filter(email=validated_data['email']).exists() or User.objects.filter(username=validated_data['username']).exists():
#             user = User.objects.get(email=validated_data['email'])
#             if user.is_verified:
#                 raise serializers.ValidationError("Email or User Name already exists")
#             else:
#                 user.delete()
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data['email'],
#             password=validated_data['password']
#         )
#         return user


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate(self, data):
        """
        - Check for an existing user by email first.
        - If a username is already linked to another email, raise an error.
        - If an email exists but is not verified, delete the old user to allow re-registration.
        """
        user_by_email = User.objects.filter(email=data['email']).first()
        user_by_username = User.objects.filter(username=data['username']).first()

        if user_by_email:
            if user_by_username and user_by_username.id != user_by_email.id:
                raise serializers.ValidationError({"username": "Username is already in use by another account."})

            if user_by_email.is_verified:
                raise serializers.ValidationError({"email": "This email is already registered and verified."})

            # If the email is unverified, delete the old user to allow re-registration
            user_by_email.delete()
            return data
        if user_by_username:
            raise serializers.ValidationError({"username": "This username is already taken."})

        return data

    def create(self, validated_data):
        """
        Create a new user after validation.
        """
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

       
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        try:
            user = User.objects.get(email=data['email'])  
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid credentials")

        if not user.check_password(data['password']):  
            raise serializers.ValidationError("Invalid credentials")

        return user  
    
    
class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'birthday', 'phone_number', 'profile_picture', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_staff = True 
        user.save()
        return user
    
class ChangeInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'birthday', 'phone_number', 'profile_picture']
        extra_kwargs = {
            'username': {'required': False},
            'birthday': {'required': False},
            'phone_number': {'required': False},
            'profile_picture': {'required': False},
        }
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
