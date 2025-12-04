"""
Views for timeline app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Like
from .serializers import (
    PostSerializer,
    PostListSerializer,
    PostCreateSerializer,
    CommentSerializer,
    CommentCreateSerializer,
    LikeSerializer
)
from notifications.utils import notify_post_like, notify_post_comment


class PostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Post model
    Provides CRUD operations for posts
    """
    queryset = Post.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        elif self.action == 'create':
            return PostCreateSerializer
        return PostSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by author
        author_id = self.request.query_params.get('author', None)
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only author can update their post
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own posts.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only author can delete their post
        if instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own posts.")
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """
        Like a post
        POST /api/v1/posts/{id}/like/
        """
        post = self.get_object()
        user = request.user
        
        # Check if already liked
        like, created = Like.objects.get_or_create(post=post, user=user)
        
        if created:
            # Create notification for post author
            notify_post_like(post.author, post, user)
            
            return Response({
                'message': 'Post liked successfully.',
                'likes_count': post.likes_count
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'message': 'You already liked this post.',
                'likes_count': post.likes_count
            }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unlike(self, request, pk=None):
        """
        Unlike a post
        POST /api/v1/posts/{id}/unlike/
        """
        post = self.get_object()
        user = request.user
        
        try:
            like = Like.objects.get(post=post, user=user)
            like.delete()
            
            return Response({
                'message': 'Post unliked successfully.',
                'likes_count': post.likes_count
            }, status=status.HTTP_200_OK)
        except Like.DoesNotExist:
            return Response({
                'error': 'You have not liked this post.'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        """
        Get all comments for a post
        GET /api/v1/posts/{id}/comments/
        """
        post = self.get_object()
        comments = post.comments.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        """
        Add a comment to a post
        POST /api/v1/posts/{id}/add_comment/
        """
        post = self.get_object()
        serializer = CommentCreateSerializer(
            data={'post': post.id, 'content': request.data.get('content')},
            context={'request': request}
        )
        
        if serializer.is_valid():
            comment = serializer.save()
            
            # Create notification for post author
            notify_post_comment(post.author, post, request.user, comment.content)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Comment model
    """
    queryset = Comment.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by post
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def perform_update(self, serializer):
        # Only author can update their comment
        if serializer.instance.author != self.request.user:
            raise permissions.PermissionDenied("You can only edit your own comments.")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Author or admin can delete the comment
        user = self.request.user
        is_admin = getattr(user, 'is_admin', False)
        if instance.author != user and not is_admin:
            raise permissions.PermissionDenied("You can only delete your own comments.")
        instance.delete()


class LikeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Like model (read-only)
    """
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by post
        post_id = self.request.query_params.get('post', None)
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        
        return queryset
