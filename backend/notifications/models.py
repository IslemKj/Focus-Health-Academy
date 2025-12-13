"""
Notifications app models
Handles in-app notifications for user activities
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    """
    Model for user notifications
    """
    NOTIFICATION_TYPES = (
        ('course_enrollment', 'Course Enrollment'),
        ('event_registration', 'Event Registration'),
        ('payment_success', 'Payment Success'),
        ('course_update', 'Course Update'),
        ('event_update', 'Event Update'),
        ('event_reminder', 'Event Reminder'),
        ('post_like', 'Post Like'),
        ('post_comment', 'Post Comment'),
        ('comment_reply', 'Comment Reply'),
        ('admin_announcement', 'Admin Announcement'),
        ('certificate_ready', 'Certificate Ready'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Optional: Link to related object
    link_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Type of linked object (course, event, post, etc.)"
    )
    link_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ID of the linked object (supports both integer and UUID)"
    )
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.notification_type} - {self.title}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            from django.utils import timezone
            self.read_at = timezone.now()
            self.save()
