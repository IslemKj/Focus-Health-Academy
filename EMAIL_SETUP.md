# Email Configuration Guide

## Overview
The application sends automated emails for:
- ✉️ **Welcome emails** when users register
- 💳 **Purchase confirmations** when courses are purchased
- 🎓 **Certificate emails** when courses are completed

## Email Templates
Modern, responsive HTML templates with app branding (blue #2563EB theme) are located in:
```
backend/templates/emails/
├── base.html                    # Base template with header/footer
├── welcome.html                 # Registration welcome email
├── purchase_confirmation.html   # Course purchase confirmation
└── certificate.html             # Course completion certificate
```

## Development Mode (Default)
By default, emails are printed to the **console** for development:

```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

When you run the backend, emails will appear in your terminal/console window.

## Production Setup

### Option 1: Gmail SMTP (Easiest)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password

3. **Update `.env` file**:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password-here
DEFAULT_FROM_EMAIL=Focus Health Academy <noreply@focushealthacademy.com>
```

**Note**: Gmail has a daily limit of ~500 emails/day for free accounts.

### Option 2: SendGrid (Recommended for Production)

1. **Create SendGrid Account**: https://sendgrid.com/
2. **Get API Key** from Settings → API Keys
3. **Install package**:
```bash
pip install sendgrid-django
```

4. **Update `.env`**:
```env
EMAIL_BACKEND=sgbackend.SendGridBackend
SENDGRID_API_KEY=your-sendgrid-api-key
DEFAULT_FROM_EMAIL=Focus Health Academy <noreply@focushealthacademy.com>
```

### Option 3: Mailgun

1. **Create Mailgun Account**: https://www.mailgun.com/
2. **Verify Domain** (or use sandbox domain for testing)
3. **Update `.env`**:
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=postmaster@yourdomain.mailgun.org
EMAIL_HOST_PASSWORD=your-mailgun-password
DEFAULT_FROM_EMAIL=Focus Health Academy <noreply@yourdomain.com>
```

### Option 4: AWS SES (Best for Scale)

1. **Setup AWS SES**: https://aws.amazon.com/ses/
2. **Verify email/domain**
3. **Install package**:
```bash
pip install django-ses
```

4. **Update settings**:
```python
# In settings.py
EMAIL_BACKEND = 'django_ses.SESBackend'
AWS_ACCESS_KEY_ID = 'your-access-key'
AWS_SECRET_ACCESS_KEY = 'your-secret-key'
AWS_SES_REGION_NAME = 'us-east-1'
AWS_SES_REGION_ENDPOINT = 'email.us-east-1.amazonaws.com'
```

## Testing Emails

### Test in Development Console
Emails automatically print to console in development mode. Check your terminal output.

### Test Email Sending
Create a test view or use Django shell:

```python
python manage.py shell

from core.email_utils import send_email

# Test welcome email
send_email(
    subject='Test Welcome Email',
    to_email='test@example.com',
    template_name='welcome',
    context={
        'user_name': 'Test User',
        'email': 'test@example.com',
        'role': 'student',
        'registration_date': 'December 4, 2025',
    }
)
```

## Email Content

### Welcome Email
- Sent immediately after registration
- Contains account details and next steps
- Call-to-action button to start learning

### Purchase Confirmation
- Sent after successful payment
- Includes order details, course info, and receipt
- Payment reference for records
- Direct link to start the course

### Certificate Email
- Sent when user completes a course (100% progress)
- Sent only once per course completion
- Certificate ID for verification
- Achievement summary
- Links to download certificate and browse more courses

## Customization

### Change Email Colors/Branding
Edit `backend/templates/emails/base.html`:
- Primary color: `#2563EB` (blue)
- Secondary color: `#10B981` (green)
- Logo emoji: 🎓

### Customize Email Content
Edit individual template files:
- `welcome.html` - Registration email
- `purchase_confirmation.html` - Purchase email
- `certificate.html` - Certificate email

### Add More Email Types
1. Create new template in `backend/templates/emails/`
2. Use `send_email()` function from `core.email_utils`
3. Pass appropriate context variables

## Troubleshooting

### Emails Not Sending

**Check Console Output** (Development):
- Emails should print to terminal
- Look for error messages

**Check SMTP Settings**:
```bash
python manage.py shell

from django.core.mail import send_mail
send_mail(
    'Test Subject',
    'Test Message',
    'from@example.com',
    ['to@example.com'],
)
```

### Gmail "Less Secure Apps" Error
- Gmail no longer supports "less secure apps"
- **Must use App Passwords** with 2FA enabled

### SendGrid/Mailgun 401 Error
- Verify API key is correct
- Check account is verified
- Confirm sender email is verified

### Emails Going to Spam

**Best Practices**:
- Use verified domain
- Set up SPF, DKIM, DMARC records
- Don't use free email providers for FROM address
- Keep email content professional
- Avoid spam trigger words

## Security Best Practices

✅ **DO**:
- Keep email credentials in `.env` file
- Use app-specific passwords, not account passwords
- Use environment variables in production
- Regularly rotate API keys

❌ **DON'T**:
- Commit `.env` file to git
- Share email credentials
- Use personal email accounts in production
- Send marketing emails without consent

## Monitoring

### Email Delivery Tracking
Consider using email service features:
- SendGrid: Click/open tracking
- Mailgun: Delivery analytics
- AWS SES: Bounce/complaint handling

### Log Email Errors
Check Django logs for email-related errors:
```bash
# In your Django app logs
tail -f logs/django.log | grep -i email
```

## Cost Estimates

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| Gmail SMTP | 500 emails/day | Not recommended for production |
| SendGrid | 100 emails/day | $15/mo (40k emails) |
| Mailgun | 5,000 emails/mo | $35/mo (50k emails) |
| AWS SES | 62,000 emails/mo (first year) | $0.10 per 1,000 emails |

## Production Checklist

- [ ] Choose email service provider
- [ ] Verify sender domain
- [ ] Configure SMTP settings in `.env`
- [ ] Test email sending
- [ ] Setup SPF/DKIM/DMARC records
- [ ] Monitor delivery rates
- [ ] Implement bounce handling
- [ ] Setup email logging
- [ ] Review email templates
- [ ] Test on mobile devices

## Support

For issues or questions:
- Check Django logs: `python manage.py runserver` output
- Test SMTP connection manually
- Verify email service provider status
- Review email template rendering

## References

- Django Email Documentation: https://docs.djangoproject.com/en/4.2/topics/email/
- SendGrid Django Guide: https://docs.sendgrid.com/for-developers/sending-email/django
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- Mailgun Documentation: https://documentation.mailgun.com/
