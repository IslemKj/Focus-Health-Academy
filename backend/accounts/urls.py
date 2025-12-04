"""
URL configuration for accounts app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register_view,
    login_view,
    logout_view,
    profile_view,
    change_password_view,
    password_reset_request_view,
    password_reset_confirm_view,
    UserViewSet,
)

app_name = 'accounts'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile endpoints
    path('auth/profile/', profile_view, name='profile'),
    path('auth/change-password/', change_password_view, name='change_password'),
    
    # Password reset endpoints
    path('auth/password-reset/', password_reset_request_view, name='password_reset_request'),
    path('auth/password-reset-confirm/', password_reset_confirm_view, name='password_reset_confirm'),
]

# Router for admin user management
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns += [
    path('', include(router.urls)),
]
