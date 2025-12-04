"""
Models for events app
"""
import uuid
from django.db import models
from django.conf import settings


class Event(models.Model):
    """
    Event model for seminars, congresses, and workshops
    """
    
    EVENT_TYPE_CHOICES = [
        ('seminar', 'Seminar'),
        ('congress', 'Congress'),
        ('workshop', 'Workshop'),
        ('webinar', 'Webinar'),
        ('conference', 'Conference'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, null=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES, default='seminar')
    image = models.URLField(max_length=500, blank=True, null=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_events'
    )
    
    # Event details
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_online = models.BooleanField(default=True)
    is_in_person = models.BooleanField(default=False)
    
    # Location (for in-person events)
    venue = models.CharField(max_length=255, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    
    # Online event details
    meeting_url = models.URLField(blank=True, null=True, help_text='Zoom, Teams, etc.')
    
    # Registration
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_attendees = models.IntegerField(default=0, help_text='0 means unlimited')
    registration_deadline = models.DateTimeField(blank=True, null=True)
    
    # Status
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        ordering = ['-start_date']
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
    
    def __str__(self):
        return self.title
    
    @property
    def registered_count(self):
        return self.registrations.filter(is_cancelled=False).count()
    
    @property
    def is_full(self):
        if self.max_attendees == 0:
            return False
        return self.registered_count >= self.max_attendees
    
    @property
    def is_past(self):
        from django.utils import timezone
        return self.end_date < timezone.now()


class EventRegistration(models.Model):
    """
    Event registration model - tracks attendee registrations
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    attendee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='event_registrations'
    )
    is_cancelled = models.BooleanField(default=False)
    attended = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    registered_at = models.DateTimeField(auto_now_add=True)
    # Payment fields
    paid = models.BooleanField(default=False)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=10, default='EUR')
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True, help_text='Base64 PNG for in-person registrations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_registrations'
        ordering = ['-registered_at']
        unique_together = ['event', 'attendee']
        verbose_name = 'Event Registration'
        verbose_name_plural = 'Event Registrations'
    
    def __str__(self):
        return f"{self.attendee.get_full_name()} - {self.event.title}"


class EventSpeaker(models.Model):
    """
    Speakers for events
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='speakers')
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255, help_text='e.g., Professor, Dr., etc.')
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='speakers/', blank=True, null=True)
    order = models.IntegerField(default=0, help_text='Display order')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_speakers'
        ordering = ['event', 'order']
        verbose_name = 'Event Speaker'
        verbose_name_plural = 'Event Speakers'
    
    def __str__(self):
        return f"{self.name} - {self.event.title}"
