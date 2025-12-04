"""
Email utility functions for sending emails with templates
"""
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_email(subject, to_email, template_name, context):
    """
    Send an email using HTML template
    
    Args:
        subject: Email subject
        to_email: Recipient email address (string or list)
        template_name: Name of the template file (without .html)
        context: Dictionary of context variables for the template
    """
    # Add app branding to context
    context.update({
        'app_name': 'Focus Health Academy',
        'app_url': settings.FRONTEND_DOMAIN or 'http://localhost:19006',
        'primary_color': '#2563EB',
        'secondary_color': '#10B981',
    })
    
    # Render HTML content
    html_content = render_to_string(f'emails/{template_name}.html', context)
    
    # Create email
    email = EmailMultiAlternatives(
        subject=subject,
        body='',  # Plain text fallback (optional)
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[to_email] if isinstance(to_email, str) else to_email
    )
    
    email.attach_alternative(html_content, "text/html")
    
    try:
        email.send()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
