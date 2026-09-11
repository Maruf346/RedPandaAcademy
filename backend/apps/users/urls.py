from django.urls import path, include
from .views import *
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.utils import extend_schema


class TaggedTokenRefreshView(TokenRefreshView):
    @extend_schema(tags=['auth'], summary='Refresh access token')
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


router = DefaultRouter()

# router.register("approve", UserApprovalViewSet, basename='user_approval')


urlpatterns = [
        
    # OAuth2 logins
    # path('auth/google/login/', GoogleLoginRedirectView.as_view(), name='google-login'),
    # path('auth/google/callback/', GoogleOAuthCallbackView.as_view(), name='google-login-callback'),
    path('auth/google/login/', GoogleLoginMobileView.as_view(), name='google-mobile-login'),
    
    # path("auth/apple/login/", AppleLoginRedirectView.as_view(), name='apple-login'),
    # path("auth/apple/callback/", AppleOAuthCallbackView.as_view(), name='apple-login-callback'),
    path('auth/apple/login/', AppleLoginMobileView.as_view(), name='apple-mobile-login'),
    
    # Registration endpoints
    path('register/initiate/', InitiateRegistrationView.as_view(), name='register-initiate'),
    path('register/verify/', VerifyRegistrationOTPView.as_view(), name='register-verify'),
    
    # Password reset endpoints
    path('password-reset/initiate/', InitiatePasswordResetView.as_view(), name='password-reset-initiate'),
    path('password-reset/verify/', VerifyPasswordResetOTPView.as_view(), name='password-reset-verify'),
    path('password-reset/confirm/', ResetPasswordView.as_view(), name='password-reset-confirm'),
    
    # User endpoints
    path('login/', UserLoginView.as_view(), name='login'),
    path('token/refresh/', TaggedTokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
    path('me/', MyProfileView.as_view(), name='my-profile'),
 
]
