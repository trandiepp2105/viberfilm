from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .serializers import *
import redis
import random
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.http import JsonResponse
from core.permissions import IsAdminUser
from django.core.cache import cache
import hashlib
from core.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.views import TokenObtainPairView

def hash_email(email):
    return hashlib.sha256(email.encode()).hexdigest()

def hash_key(key):
    return hashlib.sha256(key.encode()).hexdigest()

def verifyOtp(email, otp):
    email_hash = hash_email(email)
    saved_otp = cache.get(f'otp:{email_hash}')
    if saved_otp is None:
        return False  
    return otp == str(saved_otp)  


def sendOtp(email):
    otp = random.randint(100000, 999999)
    email_hash = hash_email(email)
    cache.set(f'otp:{email_hash}', otp, timeout=300)  # Lưu OTP vào cache trong 5 phút
    send_mail(
        subject="Your OTP Code",
        message=f"Your OTP is {otp}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
    )
    return otp

class SendOtpView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING)
            },
            required=['email']
        ),
        responses={
            200: "OTP sent",
            404: "User not found"
        }
    )    
    def post(self, request):
        email = request.data.get('email')
        try:
            otp = sendOtp(email)
            if otp:
                return Response({'message': 'OTP sent'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class VerifyEmailView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'otp': openapi.Schema(type=openapi.TYPE_STRING)
            },
            required=['email', 'otp']
        ),
        responses={
            200: "OTP verified",
            400: "Invalid OTP"
        }
    )
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        if verifyOtp(email, otp):
            user = User.objects.get(email=email)
            user.is_verified = True
            user.save()
            return Response({'message': 'OTP verified'}, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
class RegisterView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password', 'email'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='Username'),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description='Password'),
                'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL, description='Email')
            }
        ),
        responses={
            201: "User created",
            400: "Invalid data",
            409: "Email or username already exists"
        }
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_409_CONFLICT)

        user = serializer.save()
        sendOtp(user.email)
        return Response({"message": "OTP sent"}, status=status.HTTP_201_CREATED)
        
class LoginView(APIView):
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['email', 'password']
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access_token': openapi.Schema(type=openapi.TYPE_STRING),
                    'refresh_token': openapi.Schema(type=openapi.TYPE_STRING),
                }
            ),
            400: "Invalid credentials"
        }
    )
    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({'message':'Login success'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=False,
                samesite='Lax',
                secure=False,
                domain=None,
                path='/',
                max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()
            )
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=False,
                samesite='Lax',
                secure=False,
                domain=None,
                path='/',
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()

            )
            return response
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

# class LoginView(TokenObtainPairView):

#     serializer_class = CustomTokenObtainPairSerializer
#     def post(self, request, *args, **kwargs):
#         response = super().post(request, *args, **kwargs)
#         data = response.data

#         # Set cookies
#         access_token = data.get('access')
#         refresh_token = data.get('refresh')
#         access_token_lifetime = api_settings.ACCESS_TOKEN_LIFETIME
#         refresh_token_lifetime = api_settings.REFRESH_TOKEN_LIFETIME
#         if access_token:
#             response.set_cookie(
#                 key='access',
#                 value=access_token,
#                 httponly=False,  # Bảo mật cookie, không truy cập được từ JavaScript
#                 max_age=access_token_lifetime.total_seconds(),  # Thời gian sống của cookie
#                 secure=True,  # Chỉ cho phép trên HTTPS (tắt nếu là localhost)
#                 samesite="None" # Chính sách gửi cookie (Lax hoặc Strict)
#             )
#         if refresh_token:
#             response.set_cookie(
#                 key='refresh',
#                 value=refresh_token,
#                 httponly=False,
#                 max_age=refresh_token_lifetime.total_seconds(),
#                 secure=True,
#                 samesite="None"
#             )

#         return response


class AdminLoginView(APIView):

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['email', 'password']
        ),
        responses={
            200: openapi.Response(
                description="Login successful. Access and refresh tokens are set in a cookie with 2 keys access_token and refresh_token",
            ),
            403: openapi.Response(
                description="Forbidden: User is not a staff member."
            ),
            400: openapi.Response(
                description="Invalid credentials."
            )
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data

            if not user.is_staff:
                return Response({'error': 'User is not a staff member.'}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            response = JsonResponse({'message':'Login success'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=False,
                samesite='Lax',
                secure=False,
                domain=None,
                path='/',
                max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()
            )
            response.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=False,
                samesite='Lax',
                secure=False,
                domain=None,
                path='/',
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()
            )
            return response
        
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    @swagger_auto_schema(
        operation_description="Logs out the user by invalidating the refresh token. "
                            "The refresh token is taken from cookies, and the access/refresh tokens are cleared.",
        security=[{'Bearer': []}],  # Yêu cầu user gửi JWT trong header Authorization
        responses={
            200: openapi.Response(
                description="Successfully logged out. The refresh token is invalidated, and access/refresh tokens are cleared from cookies."
            ),
            400: openapi.Response(
                description="Invalid or expired refresh token in cookies."
            ),
            401: openapi.Response(
                description="Unauthorized: User is not authenticated. Ensure a valid access token is sent in the Authorization header."
            ),
            403: openapi.Response(
                description="Forbidden: User does not have the necessary permissions."
            )
        }
    )

    def post(self, request):
        token = request.COOKIES.get('refresh_token')
        if not token:
            return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Chuyển đổi token thành đối tượng RefreshToken
            token_obj = RefreshToken(token)
            
            # Hủy token bằng cách thêm nó vào blacklist
            token_obj.blacklist()

            response = JsonResponse({'message': 'Successfully logged out'})
            response.set_cookie(
                key='refresh_token',
                value="",
                httponly=False,
                samesite='Lax',
                secure=False,
                path='/',
                max_age=api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()
            )
            response.set_cookie(
                key='access_token',
                value="",
                httponly=False,
                samesite='Lax',
                secure=False,
                path='/',
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()

            )
            return response
        except InvalidToken:
            return Response({'error': 'The refresh token is invalid or expired'}, status=status.HTTP_400_BAD_REQUEST)
        except TokenError as e:
            return Response({'error': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

class RefreshTokenView(APIView):
    @swagger_auto_schema(
        operation_description="Generates a new access token using the refresh token stored in cookies. "
                              "If the refresh token is valid, a new access token is returned in cookies.",
        responses={
            200: openapi.Response(
                description="Token refreshed successfully. A new access token is set in cookies.",
            ),
            400: openapi.Response(
                description="No refresh token found in cookies.",
            ),
            401: openapi.Response(
                description="Invalid or expired refresh token.",
            ),
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')  
        if not refresh_token:
            return Response({'error': 'No refresh token found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token) 
            new_access_token = str(refresh.access_token)  # 🛠 Tạo access token mới
            
            response = JsonResponse({'message': 'Token refreshed'}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=False,
                samesite='Lax',
                secure=False,
                path='/',
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds()

            )
            return response
        except Exception:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class ForgetPasswordView(APIView):
    @swagger_auto_schema(
        operation_description="Sends an OTP to the user's email for password reset verification. "
                              "If the provided email exists in the system, an OTP will be sent.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format="email",
                    description="The email address associated with the user account that needs a password reset."
                ),
            },
        ),
        responses={
            200: openapi.Response(
                description="OTP sent successfully to the provided email.",
                examples={"application/json": {"message": "OTP sent"}}
            ),
            404: openapi.Response(
                description="User not found for the provided email.",
                examples={"application/json": {"error": "User not found"}}
            ),
        }
    )   
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            otp = sendOtp(email)
            if otp:
                return Response({'message': 'OTP sent'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    @swagger_auto_schema(
        operation_description="Resets the user's password using the provided email and OTP. "
                              "If the OTP is verified, a new key is generated and sent to the user's email.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="User's registered email"),
                'otp': openapi.Schema(type=openapi.TYPE_STRING, description="One-time password sent to the user's email"),
            },
            required=['email', 'otp']
        ),
        responses={
            200: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example="OTP verified"),
                    'key': openapi.Schema(type=openapi.TYPE_STRING, example="hashed_key_value"),
                },
            ),
            400: openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'error': openapi.Schema(type=openapi.TYPE_STRING, example="Invalid OTP"),
                },
            )
        }
    )
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        #new_password = request.data.get('new_password')
        if verifyOtp(email, otp):
            key = random.randint(1000, 9999)
            key_hash = hash_key(str(key))
            cache.set(f'key:{email}', key_hash, timeout=300)
            return Response({'message': 'OTP verified',
                                'key': key_hash
                             }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
class ChangePasswordView(APIView):
    @swagger_auto_schema(
        operation_description="Changes the user's password using the provided key and new password. "
                              "The key is verified against the email address, and the password is updated.",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING),
                'key': openapi.Schema(type=openapi.TYPE_STRING),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['email', 'key', 'new_password']
        ),
        responses={
            200: "Password changed",
            400: "Invalid key"
        }
    )
    def post(self, request):
        email = request.data.get('email')
        key = request.data.get('key')
        new_password = request.data.get('new_password')
        key_hash = cache.get(f'key:{email}')
        if key_hash is None:
            return Response({'error': 'Invalid key'}, status=status.HTTP_400_BAD_REQUEST)
        if key_hash != key:
            return Response({'error': 'Invalid key'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.get(email=email)
        user.set_password(new_password)
        user.save()
        return Response({'message': 'Password changed'}, status=status.HTTP_200_OK)
    
class CreateStaffView(APIView):
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING),
                'password': openapi.Schema(type=openapi.TYPE_STRING),
                'email': openapi.Schema(type=openapi.TYPE_STRING),
            },
            required=['username', 'password', 'email']
        ),
        responses={
            201: "Staff created",
            400: "Email already exists"
        }
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.create(serializer.validated_data)
        user.save()
        return Response('Staff created', status=status.HTTP_201_CREATED)
    
class ChangeInformationView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser]

    @swagger_auto_schema(
        operation_summary="Change user information",
        operation_description="Change user information such as username, birthday, phone number, and profile picture.",
        manual_parameters=[
            openapi.Parameter(
                'username',
                openapi.IN_FORM,
                description="User's username",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                'birthday',
                openapi.IN_FORM,
                description="User's birthday (YYYY-MM-DD)",
                type=openapi.TYPE_STRING,
                format=openapi.FORMAT_DATE,
            ),
            openapi.Parameter(
                'phone_number',
                openapi.IN_FORM,
                description="User's phone number",
                type=openapi.TYPE_STRING,
            ),
            openapi.Parameter(
                'profile_picture',
                openapi.IN_FORM,
                description="User's profile picture",
                type=openapi.TYPE_FILE,
            ),
        ],
        responses={
            200: "Information updated successfully",
            400: "Invalid data",
        }
    )
    def patch(self, request):
        user = request.user
        serializer = ChangeInformationSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Information updated successfully'}, status=status.HTTP_200_OK)
        
        # Bắt lỗi chi tiết hơn
        error_messages = {}
        for field, errors in serializer.errors.items():
            error_messages[field] = [str(error) for error in errors]
        
        return Response({
            'message': 'Invalid data',
            'errors': error_messages
        }, status=status.HTTP_400_BAD_REQUEST)