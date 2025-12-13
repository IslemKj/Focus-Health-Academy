"""
Utility functions for creating notifications
"""

from .models import Notification


def create_notification(user, notification_type, title, message, link_type=None, link_id=None):
    """
    Helper function to create a notification
    
    Args:
        user: User instance
        notification_type: One of NOTIFICATION_TYPES
        title: Notification title
        message: Notification message
        link_type: Optional type of linked object
        link_id: Optional ID of linked object
    
    Returns:
        Notification instance
    """
    return Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        link_type=link_type,
        link_id=link_id
    )


def notify_course_enrollment(user, course):
    """Create notification for course enrollment"""
    return create_notification(
        user=user,
        notification_type='course_enrollment',
        title='Course Enrollment Successful',
        message=f'You have successfully enrolled in "{course.title}"',
        link_type='course',
        link_id=course.id
    )


def notify_event_registration(user, event):
    """Create notification for event registration"""
    return create_notification(
        user=user,
        notification_type='event_registration',
        title='Event Registration Successful',
        message=f'You have successfully registered for "{event.title}"',
        link_type='event',
        link_id=event.id
    )


def notify_payment_success(user, amount, item_type, item_title):
    """Create notification for successful payment"""
    return create_notification(
        user=user,
        notification_type='payment_success',
        title='Payment Successful',
        message=f'Your payment of €{amount} for {item_type} "{item_title}" was successful'
    )


def notify_post_like(user, post, liker):
    """Create notification when someone likes a post"""
    if user != liker:  # Don't notify if user likes their own post
        return create_notification(
            user=user,
            notification_type='post_like',
            title='New Like',
            message=f'{liker.get_full_name() or liker.email} liked your post',
            link_type='post',
            link_id=str(post.id)
        )


def notify_post_comment(user, post, commenter, comment_text):
    """Create notification when someone comments on a post"""
    if user != commenter:  # Don't notify if user comments on their own post
        preview = comment_text[:50] + '...' if len(comment_text) > 50 else comment_text
        return create_notification(
            user=user,
            notification_type='post_comment',
            title='New Comment',
            message=f'{commenter.get_full_name() or commenter.email} commented: "{preview}"',
            link_type='post',
            link_id=str(post.id)
        )


def notify_comment_reply(user, post, replier, reply_text):
    """Create notification when someone replies to a comment"""
    if user != replier:
        preview = reply_text[:50] + '...' if len(reply_text) > 50 else reply_text
        return create_notification(
            user=user,
            notification_type='comment_reply',
            title='New Reply',
            message=f'{replier.get_full_name() or replier.email} replied: "{preview}"',
            link_type='post',
            link_id=post.id
        )


def notify_event_reminder(user, event):
    """Create notification for upcoming event reminder"""
    return create_notification(
        user=user,
        notification_type='event_reminder',
        title='Event Reminder',
        message=f'Reminder: "{event.title}" is coming up soon on {event.date.strftime("%B %d, %Y")}',
        link_type='event',
        link_id=event.id
    )
