"""
Notifications app serializers
"""

from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for Notification model
    """
    
    class Meta:
        model = Notification
        fields = [
            'id',
            'notification_type',
            'title',
            'message',
            'link_type',
            'link_id',
            'is_read',
            'created_at',
            'read_at',
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class NotificationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating notifications (admin use)
    """
    
    class Meta:
        model = Notification
        fields = [
            'user',
            'notification_type',
            'title',
            'message',
            'link_type',
            'link_id',
        ]
