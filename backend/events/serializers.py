"""
Serializers for events app
"""
from rest_framework import serializers
from .models import Event, EventRegistration, EventSpeaker
from accounts.serializers import UserSerializer


class EventSpeakerSerializer(serializers.ModelSerializer):
    """
    Serializer for Event Speaker model
    """
    
    class Meta:
        model = EventSpeaker
        fields = [
            'id', 'event', 'name', 'title', 'bio', 'photo',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventListSerializer(serializers.ModelSerializer):
    """
    Serializer for Event list view (minimal fields)
    """
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'short_description', 'event_type', 'image',
            'organizer_name', 'start_date', 'end_date', 'is_online',
            'is_in_person', 'venue', 'city', 'country', 'price',
            'registered_count', 'is_full', 'is_past', 'is_featured'
        ]


class EventDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Event detail view (with speakers)
    """
    organizer = UserSerializer(read_only=True)
    speakers = EventSpeakerSerializer(many=True, read_only=True)
    registered_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'short_description', 'event_type',
            'image', 'organizer', 'speakers', 'start_date', 'end_date',
            'is_online', 'is_in_person', 'venue', 'address', 'city',
            'country', 'meeting_url', 'price', 'max_attendees',
            'registration_deadline', 'is_published', 'is_featured',
            'registered_count', 'is_full', 'is_past',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EventRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for Event Registration model
    """
    attendee = UserSerializer(read_only=True)
    event = EventListSerializer(read_only=True)
    
    class Meta:
        model = EventRegistration
        fields = [
            'id', 'event', 'attendee', 'is_cancelled', 'attended',
            'notes', 'registered_at',
            # Payment fields
            'paid', 'amount_paid', 'currency', 'payment_reference', 'qr_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'registered_at', 'created_at', 'updated_at']


class EventRegistrationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating event registrations
    """
    
    class Meta:
        model = EventRegistration
        fields = ['event', 'notes']
    
    def create(self, validated_data):
        validated_data['attendee'] = self.context['request'].user
        return super().create(validated_data)
