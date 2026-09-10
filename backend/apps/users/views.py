import logging

from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import logout, get_user_model
from rest_framework import status
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import *
from .models import *
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiResponse
from django_ratelimit.decorators import ratelimit
from apps.notifications.services import NotificationTemplates
from apps.users.services import RegistrationService, PasswordResetService


logger = logging.getLogger(__name__)

User = get_user_model()


# ==================== REGISTRATION VIEWS ====================

@method_decorator(ratelimit(key='ip', rate='4/m', method='POST', block=True), name='dispatch')
class InitiateRegistrationView(APIView):
    # Initiate registration by sending OTP to email
    permission_classes = [AllowAny]
    serializer_class = InitiateRegistrationSerializer
    
    @extend_schema(
        tags=['auth'],
        request=InitiateRegistrationSerializer,
        summary="Initiate user registration",
        description='Send OTP to email for user registration verification'
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = RegistrationService.initiate_registration(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                username=serializer.validated_data['username'],
                birth_date=serializer.validated_data.get('birth_date'),
            )
            
            logger.info(f'Registration initiated for email: {serializer.validated_data['email']}')
            return Response(result, status=status.HTTP_200_OK)
        
        except ValueError as e:
            logger.warning(f'Registration initiation failed: {str(e)}')
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

        except Exception as e:
            logger.error(f"Unexpected error during registration initiation: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
    
@method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='dispatch')
class VerifyRegistrationOTPView(APIView):
    # Verify OTP and complete user registration
    permission_classes = [AllowAny]
    serializer_class = VerifyRegistrationOTPSerializer
    
    @extend_schema(
        tags=['auth'],
        request=VerifyRegistrationOTPSerializer,
        summary="Verify registration OTP",
        description="Verifies the OTP sent during registration and completes user registration."
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = RegistrationService.verify_and_complete_registration(
                email=serializer.validated_data['email'],
                otp=serializer.validated_data['otp']
            )
            
            user = result['user']
            
            response_data = {
                'message': 'Registration successful',
                'access_token': result['access_token'],
                'refresh_token': result['refresh_token'],
                'user': UserSerializer(user).data
            }
            
            logger.info(f"User registered successfully: {user.email}")
            
            try:
                from apps.users.tasks import send_welcome_email
                send_welcome_email.delay(user.email, user.full_name)
                NotificationTemplates.welcome(user)
                NotificationTemplates.new_user_joined(user)
            except Exception as e:
                logger.error(f"Post-registration notifications failed for {user.email}: {str(e)}")
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        except ValueError as e:
            logger.warning(f'OTP verification failed: {str(e)}')
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f'Unexpected error during OTP verification: {str(e)}')
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    

# ==================== PASSWORD RESET VIEWS ====================

@method_decorator(ratelimit(key='ip', rate='4/m', method='POST', block=True), name='dispatch')
class InitiatePasswordResetView(APIView):
    # Initiate password reset by sending OTP to email
    permission_classes = [AllowAny]
    serializer_class = InitiatePasswordResetSerializer
    
    @extend_schema(
        tags=['auth'],
        request=InitiatePasswordResetSerializer,
        summary='Initiate password reset',
        description='Send OTP to email for password reset'
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = PasswordResetService.initiate_password_reset(
                email=serializer.validated_data['email']
            )
            
            logger.info(f"Password reset initiated for email: {serializer.validated_data['email']}")
            return Response(result, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f'Unexpected error during password reset initiation: {str(e)}')
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='ip', rate='6/m', method='POST', block=True), name='dispatch')
class VerifyPasswordResetOTPView(APIView):
    # Verify password reset OTP and get reset token
    permission_classes = [AllowAny]
    serializer_class = VerifyPasswordResetOTPSerializer
    
    @extend_schema(
        tags=['auth'],
        request=VerifyPasswordResetOTPSerializer,
        summary='Verify password reset OTP',
        description='Verify OTP and receive reset token for password change'
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = PasswordResetService.verify_reset_otp(
                email=serializer.validated_data['email'],
                otp=serializer.validated_data['otp']
            )
            
            logger.info(f"Password reset OTP verified for email: {serializer.validated_data['email']}")
            return Response(result, status=status.HTTP_200_OK)
        
        except ValueError as v:
            logger.warning(f"Password reset OTP verification failed: {str(v)}")
            return Response(
                {'error': str(v)},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Unexpected error during password reset OTP verification: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(ratelimit(key='ip', rate='4/m', method='POST', block=True), name='dispatch')
class ResetPasswordView(APIView):
    # Reset password using reset token
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordSerializer
    
    @extend_schema(
        tags=['auth'],
        request=ResetPasswordSerializer,
        summary='Reset password',
        description='Reset password using the reset token'
    )
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            result = PasswordResetService.reset_password(
                reset_token=serializer.validated_data['reset_token'],
                new_password=serializer.validated_data['new_password']
            )
            
            # Get user by ID from result and Send password update notification
            user_id = result.get('user_id')
            if user_id:
                try:
                    user = User.objects.get(id=user_id)
                    NotificationTemplates.password_updated(user)
                except User.DoesNotExist:
                    pass
                except Exception as e:
                    logger.error(f"Failed to send notification: {str(e)}")
            
            logger.info('Password reset successful')
            return Response(
                {'message': result['message']},
                status=status.HTTP_200_OK
            )
        
        except ValueError as e:
            logger.warning(f"Password reset failed: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Unexpected error during password reset: {str(e)}")
            return Response(
                {'error': 'An unexpected error occurred. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ======================== USER VIEWS =========================


@extend_schema(
    tags=['auth'],
    summary="User login",
    description="Authenticate user and return access and refresh tokens.",
    request=UserLoginSerializer,
    # responses={
    #     200: OpenApiResponse(description="Login successful"),
    #     400: OpenApiResponse(description="Invalid credentials"),
    # },
)
class UserLoginView(APIView):
    permission_classes = [AllowAny]
    serializer_class = UserLoginSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        # login(request, user)
        
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Logged in successfully.',
            'user': UserProfileSerializer(user, context = {"request": request}).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }    
        },
        status = status.HTTP_200_OK
        )
        

@extend_schema(
    tags=['auth'],
    summary="User logout",
    description="Logout user by blacklisting refresh token and clearing session.",
    responses={205: OpenApiResponse(description="Logged out successfully")}
)
class UserLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = None
    
    def post(self, request):
        # logout(request)
        
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                
            logout(request)
        
            return Response(
                {'message': 'Successfully logged out.'},
                status=status.HTTP_205_RESET_CONTENT
            )
        except Exception as e:
            return Response(
                {
                    'error': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
            

@extend_schema(
    tags=['auth'],
    summary="Change password",
    description="Change password for authenticated user.",
    request=ChangePasswordSerializer
)
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ChangePasswordSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        # Change pass
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        logger.info(f'Password changed successfully for user: {user.email}')
        
        # Send password update notification
        NotificationTemplates.password_changed(user)
        
        return Response(
            {'message': 'Password changed successfully!'},
            status=status.HTTP_200_OK
        )

           
@extend_schema_view(
    get=extend_schema(
        tags=['users'],
        summary="Retrieve my profile",
        description="Retrieve currently authenticated user's profile.",
        responses=UserProfileSerializer,
    ),
    put=extend_schema(
        tags=['users'],
        summary="Update my profile",
        description="Fully update your profile.",
        request=UserProfileSerializer,
        responses=UserProfileSerializer,
    ),
    patch=extend_schema(
        tags=['users'],
        summary="Partially update my profile",
        description="Partially update your profile fields.",
        request=UserProfileSerializer,
        responses=UserProfileSerializer,
    ),
    delete=extend_schema(
        tags=['users'],
        summary="Delete my account",
        description="Delete currently authenticated user's account.",
        responses={204: OpenApiResponse(description="Account deleted")},
    ),
)
class MyProfileView(RetrieveUpdateDestroyAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    



#####################################################################################
##                     Google Sign-In Views and Helper Function                    ##
#####################################################################################


@extend_schema_view(
    post=extend_schema(
        tags=['auth'],
        summary="Google OAuth Mobile Login",
        description="Handle Google OAuth mobile login and return authentication tokens.",
        responses={
            200: OpenApiResponse(description="Google login successful"),
            400: OpenApiResponse(description="OAuth validation failed"),
        },
    ),
)
class GoogleLoginMobileView(APIView):
    permission_classes = [AllowAny]
    serializer_class = GoogleOAuthSerializer
    
    @method_decorator(ratelimit(key='ip', rate="120/h", method="POST", block=True))
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


#####################################################################################
##                     Apple Sign-In Views and Helper Function                     ##
#####################################################################################



@extend_schema(
    tags=['auth'],
    summary="Apple mobile login",
    description="Accepts Apple ID token and returns JWT tokens.",
    responses={200: OpenApiResponse(description="Login successful")}
)
class AppleLoginMobileView(APIView):
    permission_classes = [AllowAny]
    serializer_class = AppleOAuthSerializer
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


