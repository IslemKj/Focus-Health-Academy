from django.contrib import admin
from .models import Event, EventRegistration, EventSpeaker


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    """
    Admin interface for Event model
    """
    list_display = [
        'title', 'event_type', 'organizer', 'start_date',
        'end_date', 'is_online', 'is_in_person', 'is_published', 'is_featured'
    ]
    list_filter = ['event_type', 'is_online', 'is_in_person', 'is_published', 'is_featured', 'start_date']
    search_fields = ['title', 'description', 'organizer__email']
    ordering = ['-start_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'short_description', 'description', 'event_type', 'image', 'organizer')
        }),
        ('Date & Time', {
            'fields': ('start_date', 'end_date', 'registration_deadline')
        }),
        ('Delivery Method', {
            'fields': ('is_online', 'is_in_person', 'meeting_url')
        }),
        ('Location (In-Person)', {
            'fields': ('venue', 'address', 'city', 'country')
        }),
        ('Registration', {
            'fields': ('price', 'max_attendees')
        }),
        ('Status', {
            'fields': ('is_published', 'is_featured')
        }),
    )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    """
    Admin interface for EventRegistration model
    """
    list_display = ['attendee', 'event', 'is_cancelled', 'attended', 'registered_at']
    list_filter = ['is_cancelled', 'attended', 'registered_at']
    search_fields = ['attendee__email', 'event__title']
    ordering = ['-registered_at']


@admin.register(EventSpeaker)
class EventSpeakerAdmin(admin.ModelAdmin):
    """
    Admin interface for EventSpeaker model
    """
    list_display = ['name', 'title', 'event', 'order']
    list_filter = ['event']
    search_fields = ['name', 'title', 'event__title']
    ordering = ['event', 'order']
