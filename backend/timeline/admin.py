from django.contrib import admin
from .models import Post, Comment, Like


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    """
    Admin interface for Post model
    """
    list_display = ['author', 'content_preview', 'likes_count', 'comments_count', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__email', 'author__username']
    ordering = ['-created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content'


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    """
    Admin interface for Comment model
    """
    list_display = ['author', 'post', 'content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__email', 'post__content']
    ordering = ['-created_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    
    content_preview.short_description = 'Content'


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    """
    Admin interface for Like model
    """
    list_display = ['user', 'post', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'post__content']
    ordering = ['-created_at']
