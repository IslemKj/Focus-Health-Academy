from django.contrib import admin
from .models import ChatRoom, Message, MessageReadStatus


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    """
    Admin interface for ChatRoom model
    """
    list_display = ['id', 'title', 'is_group', 'participants_count', 'created_at', 'updated_at']
    list_filter = ['is_group', 'created_at']
    search_fields = ['title', 'participants__email']
    ordering = ['-updated_at']
    
    def participants_count(self, obj):
        return obj.participants.count()
    
    participants_count.short_description = 'Participants'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """
    Admin interface for Message model
    """
    list_display = ['sender', 'chat_room', 'content_preview', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['content', 'sender__email', 'chat_room__title']
    ordering = ['-created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content'


@admin.register(MessageReadStatus)
class MessageReadStatusAdmin(admin.ModelAdmin):
    """
    Admin interface for MessageReadStatus model
    """
    list_display = ['user', 'message', 'read_at']
    list_filter = ['read_at']
    search_fields = ['user__email', 'message__content']
    ordering = ['-read_at']
