"""
Views for chat app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from .models import ChatRoom, Message, MessageReadStatus
from .serializers import (
    ChatRoomSerializer,
    ChatRoomCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    MessageReadStatusSerializer
)


class ChatRoomViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ChatRoom model
    """
    queryset = ChatRoom.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChatRoomCreateSerializer
        return ChatRoomSerializer
    
    def get_queryset(self):
        # Only return chat rooms where user is a participant
        user = self.request.user
        return ChatRoom.objects.filter(participants=user)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def messages(self, request, pk=None):
        """
        Get all messages in a chat room
        GET /api/v1/chat-rooms/{id}/messages/
        """
        chat_room = self.get_object()
        
        # Check if user is a participant
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response({
                'error': 'You are not a participant in this chat room.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        messages = chat_room.messages.all()
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def send_message(self, request, pk=None):
        """
        Send a message in a chat room
        POST /api/v1/chat-rooms/{id}/send_message/
        """
        chat_room = self.get_object()
        
        # Check if user is a participant
        if not chat_room.participants.filter(id=request.user.id).exists():
            return Response({
                'error': 'You are not a participant in this chat room.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = MessageCreateSerializer(
            data={'chat_room': chat_room.id, **request.data},
            context={'request': request}
        )
        
        if serializer.is_valid():
            message = serializer.save()
            
            # Update chat room's updated_at timestamp
            chat_room.updated_at = timezone.now()
            chat_room.save()
            
            return Response(
                MessageSerializer(message).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        """
        Mark all messages in a chat room as read
        POST /api/v1/chat-rooms/{id}/mark_as_read/
        """
        chat_room = self.get_object()
        user = request.user
        
        # Check if user is a participant
        if not chat_room.participants.filter(id=user.id).exists():
            return Response({
                'error': 'You are not a participant in this chat room.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Mark all unread messages as read
        unread_messages = Message.objects.filter(
            chat_room=chat_room,
            is_read=False
        ).exclude(sender=user)
        
        for message in unread_messages:
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            
            # Create read status
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=user
            )
        
        return Response({
            'message': f'{unread_messages.count()} messages marked as read.'
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def get_or_create_direct_chat(self, request):
        """
        Get or create a direct chat with another user
        POST /api/v1/chat-rooms/get_or_create_direct_chat/
        Body: {"user_id": "uuid"}
        """
        user = request.user
        other_user_id = request.data.get('user_id')
        
        if not other_user_id:
            return Response({
                'error': 'user_id is required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Find existing direct chat
        chat_rooms = ChatRoom.objects.filter(
            participants=user,
            is_group=False
        ).filter(participants__id=other_user_id)
        
        if chat_rooms.exists():
            chat_room = chat_rooms.first()
        else:
            # Create new direct chat
            chat_room = ChatRoom.objects.create(is_group=False)
            chat_room.participants.add(user)
            
            from accounts.models import User
            try:
                other_user = User.objects.get(id=other_user_id)
                chat_room.participants.add(other_user)
            except User.DoesNotExist:
                chat_room.delete()
                return Response({
                    'error': 'User not found.'
                }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ChatRoomSerializer(chat_room, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Message model
    """
    queryset = Message.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        # Only return messages from chat rooms where user is a participant
        user = self.request.user
        return Message.objects.filter(chat_room__participants=user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        """
        Mark a message as read
        POST /api/v1/messages/{id}/mark_as_read/
        """
        message = self.get_object()
        user = request.user
        
        # Check if user is a participant
        if not message.chat_room.participants.filter(id=user.id).exists():
            return Response({
                'error': 'You are not a participant in this chat room.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Don't mark own messages as read
        if message.sender == user:
            return Response({
                'error': 'You cannot mark your own message as read.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not message.is_read:
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            
            # Create read status
            MessageReadStatus.objects.get_or_create(
                message=message,
                user=user
            )
        
        return Response({
            'message': 'Message marked as read.'
        }, status=status.HTTP_200_OK)
