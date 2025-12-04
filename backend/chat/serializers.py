"""
Serializers for chat app
"""
from rest_framework import serializers
from .models import ChatRoom, Message, MessageReadStatus
from accounts.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message model
    """
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_room', 'sender', 'content', 'image', 'file',
            'is_read', 'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sender', 'created_at', 'updated_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating messages
    """
    
    class Meta:
        model = Message
        fields = ['chat_room', 'content', 'image', 'file']
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ChatRoomSerializer(serializers.ModelSerializer):
    """
    Serializer for ChatRoom model
    """
    participants = UserSerializer(many=True, read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'participants', 'title', 'is_group',
            'last_message', 'unread_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Message.objects.filter(
                chat_room=obj,
                is_read=False
            ).exclude(sender=request.user).count()
        return 0


class ChatRoomCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating chat rooms
    """
    participant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True
    )
    
    class Meta:
        model = ChatRoom
        fields = ['title', 'is_group', 'participant_ids']
    
    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids')
        chat_room = ChatRoom.objects.create(**validated_data)
        
        # Add creator as participant
        chat_room.participants.add(self.context['request'].user)
        
        # Add other participants
        from accounts.models import User
        for participant_id in participant_ids:
            try:
                user = User.objects.get(id=participant_id)
                chat_room.participants.add(user)
            except User.DoesNotExist:
                pass
        
        return chat_room


class MessageReadStatusSerializer(serializers.ModelSerializer):
    """
    Serializer for MessageReadStatus model
    """
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MessageReadStatus
        fields = ['id', 'message', 'user', 'read_at', 'created_at']
        read_only_fields = ['id', 'user', 'read_at', 'created_at']
