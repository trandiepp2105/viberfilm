from django.urls import path
from .views import RegisterView, LoginView, LogoutView, SendOtpView, VerifyEmailView, RefreshTokenView, ForgetPasswordView, ResetPasswordView, CreateStaffView, AdminLoginView, ChangePasswordView, ChangeInformationView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('send-otp/', SendOtpView.as_view(), name='send_otp'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_otp'),
    path('refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path('forget-password/', ForgetPasswordView.as_view(), name='forget_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('create-staff/', CreateStaffView.as_view(), name='create-staff'),
    path('admin/login/', AdminLoginView.as_view(), name='create-admin'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('change-information/', ChangeInformationView.as_view(), name='change_information'),
]
