"""
Views for accounts app
"""
from rest_framework import status, generics, permissions, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    ProfileUpdateSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing users
    Provides list/retrieve/update/delete for admin users only
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Register a new user
    POST /api/v1/auth/register/
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Send welcome email
        from core.email_utils import send_email
        from datetime import datetime
        send_email(
            subject='Welcome to Focus Health Academy!',
            to_email=user.email,
            template_name='welcome',
            context={
                'user_name': user.get_full_name() or user.email,
                'email': user.email,
                'role': user.role,
                'registration_date': datetime.now().strftime('%B %d, %Y'),
            }
        )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user, context={'request': request}).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Login user and return JWT tokens
    POST /api/v1/auth/login/
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        # Authenticate user using email (since USERNAME_FIELD = 'email')
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user, context={'request': request}).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout user by blacklisting the refresh token
    POST /api/v1/auth/logout/
    """
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception as token_error:
                # Token might already be blacklisted or invalid, but logout should still succeed
                print(f'Token blacklist error (non-fatal): {token_error}')
        
        return Response({
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        # Even if there's an error, return success since local tokens will be cleared
        return Response({
            'message': 'Successfully logged out.'
        }, status=status.HTTP_200_OK)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Get or update user profile
    GET /api/v1/auth/profile/
    PUT/PATCH /api/v1/auth/profile/
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = ProfileUpdateSerializer(
            user, 
            data=request.data, 
            partial=(request.method == 'PATCH')
        )
        if serializer.is_valid():
            serializer.save()
            return Response(
                UserSerializer(user, context={'request': request}).data, 
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change user password
    POST /api/v1/auth/change-password/
    """
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'old_password': 'Wrong password.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password updated successfully.'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request_view(request):
    """
    Request password reset (sends email with token)
    POST /api/v1/auth/password-reset/
    """
    serializer = PasswordResetRequestSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate 6-digit reset code
            import random
            reset_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
            
            # Store reset token
            from .models import PasswordResetToken
            PasswordResetToken.objects.create(
                user=user,
                token=reset_code
            )
            
            # Send email with reset code
            from core.email_utils import send_email
            from datetime import datetime
            send_email(
                subject='Reset Your Password - Focus Health Academy',
                to_email=user.email,
                template_name='password_reset',
                context={
                    'user_name': user.get_full_name() or user.email,
                    'reset_code': reset_code,
                    'request_time': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                }
            )
            
            return Response({
                'message': 'Password reset code has been sent to your email.'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security)
            return Response({
                'message': 'Password reset code has been sent to your email.'
            }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm_view(request):
    """
    Confirm password reset with token
    POST /api/v1/auth/password-reset-confirm/
    """
    serializer = PasswordResetConfirmSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        try:
            user = User.objects.get(email=email)
            
            # Find valid token
            from .models import PasswordResetToken
            reset_token = PasswordResetToken.objects.filter(
                user=user,
                token=token,
                is_used=False
            ).order_by('-created_at').first()
            
            if not reset_token:
                return Response({
                    'error': 'Invalid or expired reset code.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if not reset_token.is_valid():
                return Response({
                    'error': 'Reset code has expired. Please request a new one.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset password
            user.set_password(new_password)
            user.save()
            
            # Mark token as used
            reset_token.is_used = True
            reset_token.save()
            
            return Response({
                'message': 'Password has been reset successfully.'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid email address.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_account_view(request):
    """
    Delete user account (GDPR compliance)
    DELETE /api/v1/auth/delete-account/
    """
    user = request.user
    
    # Require password confirmation for security
    password = request.data.get('password')
    if not password:
        return Response({
            'error': 'Password confirmation is required to delete your account.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    if not user.check_password(password):
        return Response({
            'error': 'Incorrect password. Please try again.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Send account deletion confirmation email before deletion
    from core.email_utils import send_email
    from datetime import datetime
    try:
        send_email(
            subject='Account Deletion Confirmation - Focus Health Academy',
            to_email=user.email,
            template_name='account_deleted',
            context={
                'user_name': user.get_full_name() or user.email,
                'deletion_date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
            }
        )
    except Exception as e:
        # Log error but continue with deletion
        print(f'Failed to send deletion email: {e}')
    
    # Delete user account and all associated data
    user_email = user.email
    user.delete()
    
    return Response({
        'message': 'Your account has been permanently deleted. We\'re sorry to see you go.'
    }, status=status.HTTP_200_OK)
