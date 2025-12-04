"""
Payments webhook and helpers (Stripe)
"""
from django.views import View
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.utils import timezone
import stripe
import json
import io
import base64
import qrcode

from courses.models import Course, Enrollment, LessonProgress
from events.models import Event, EventRegistration
from django.contrib.auth import get_user_model
from notifications.utils import (
    notify_course_enrollment,
    notify_event_registration,
    notify_payment_success
)

User = get_user_model()

stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)


class StripeWebhookView(View):
    """Handle Stripe webhooks to finalize enrollments/registrations."""

    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            ) if webhook_secret else json.loads(payload)
        except Exception as e:
            # Invalid signature or payload
            return HttpResponse(status=400)

        # Handle the checkout.session.completed and payment_intent.succeeded events
        if event['type'] == 'checkout.session.completed':
            self._handle_checkout_session(event)
        elif event['type'] == 'payment_intent.succeeded':
            self._handle_payment_intent(event)

        return HttpResponse(status=200)

    def _handle_checkout_session(self, event):
        """Handle checkout.session.completed event"""
        session = event['data']['object']
        metadata = session.get('metadata', {}) or {}
        obj_type = metadata.get('type')

        # Retrieve common info
        user_id = metadata.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except Exception:
            user = None

        # Amount info
        amount_total = session.get('amount_total')
        currency = session.get('currency', 'eur')
        payment_ref = session.get('id') or session.get('payment_intent')

        if obj_type == 'course':
            course_id = metadata.get('course_id')
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                course = None

            # Create enrollment if missing
            if user and course and not Enrollment.objects.filter(student=user, course=course, is_active=True).exists():
                enrollment = Enrollment.objects.create(student=user, course=course)
                if amount_total:
                    enrollment.paid = True
                    enrollment.amount_paid = float(amount_total) / 100.0
                    enrollment.currency = currency.upper()
                    enrollment.payment_reference = payment_ref

                # Generate QR code only for in-person courses
                if course.is_in_person:
                    qr_payload = {
                        'enrollment_id': str(enrollment.id),
                        'course_id': str(course.id),
                        'student_id': str(user.id),
                        'name': f"{user.get_full_name()}",
                        'course_title': course.title,
                    }
                    qr_text = str(qr_payload)
                    qr = qrcode.QRCode(box_size=10, border=4)
                    qr.add_data(qr_text)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_b64 = base64.b64encode(buffer.read()).decode('utf-8')
                    enrollment.qr_code = qr_b64

                # Create lesson progress entries
                for lesson in course.lessons.all():
                    LessonProgress.objects.create(enrollment=enrollment, lesson=lesson)

                enrollment.save()

        elif obj_type == 'event':
            event_id = metadata.get('event_id')
            try:
                ev = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                ev = None

            if user and ev and not EventRegistration.objects.filter(attendee=user, event=ev, is_cancelled=False).exists():
                registration = EventRegistration.objects.create(attendee=user, event=ev)
                if amount_total:
                    registration.paid = True
                    registration.amount_paid = float(amount_total) / 100.0
                    registration.currency = currency.upper()
                    registration.payment_reference = payment_ref

                # Generate QR code only for in-person events
                if ev.is_in_person:
                    qr_payload = {
                        'registration_id': str(registration.id),
                        'event_id': str(ev.id),
                        'attendee_id': str(user.id),
                        'name': f"{user.get_full_name()}",
                        'event_title': ev.title,
                        'start_date': ev.start_date.isoformat() if ev.start_date else ''
                    }
                    qr_text = str(qr_payload)
                    qr = qrcode.QRCode(box_size=10, border=4)
                    qr.add_data(qr_text)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_b64 = base64.b64encode(buffer.read()).decode('utf-8')
                    registration.qr_code = qr_b64

                registration.save()
                
                # Create notifications
                notify_event_registration(user, ev)
                if amount_total:
                    notify_payment_success(
                        user,
                        float(amount_total) / 100.0,
                        'event',
                        ev.title
                    )

    def _handle_payment_intent(self, event):
        """Handle payment_intent.succeeded event for in-app payments"""
        payment_intent = event['data']['object']
        metadata = payment_intent.get('metadata', {}) or {}
        obj_type = metadata.get('type')

        # Retrieve common info
        user_id = metadata.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except Exception:
            return

        # Amount info
        amount_total = payment_intent.get('amount')
        currency = payment_intent.get('currency', 'eur')
        payment_ref = payment_intent.get('id')

        if obj_type == 'course':
            course_id = metadata.get('course_id')
            try:
                course = Course.objects.get(id=course_id)
            except Course.DoesNotExist:
                return

            # Create enrollment if missing
            if not Enrollment.objects.filter(student=user, course=course, is_active=True).exists():
                enrollment = Enrollment.objects.create(student=user, course=course)
                if amount_total:
                    enrollment.paid = True
                    enrollment.amount_paid = float(amount_total) / 100.0
                    enrollment.currency = currency.upper()
                    enrollment.payment_reference = payment_ref

                # Generate QR code only for in-person courses
                if course.is_in_person:
                    qr_payload = {
                        'enrollment_id': str(enrollment.id),
                        'course_id': str(course.id),
                        'student_id': str(user.id),
                        'name': f"{user.get_full_name()}",
                        'course_title': course.title,
                    }
                    qr_text = str(qr_payload)
                    qr = qrcode.QRCode(box_size=10, border=4)
                    qr.add_data(qr_text)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_b64 = base64.b64encode(buffer.read()).decode('utf-8')
                    enrollment.qr_code = qr_b64

                # Create lesson progress entries
                for lesson in course.lessons.all():
                    LessonProgress.objects.create(enrollment=enrollment, lesson=lesson)

                enrollment.save()

        elif obj_type == 'event':
            event_id = metadata.get('event_id')
            try:
                ev = Event.objects.get(id=event_id)
            except Event.DoesNotExist:
                return

            if not EventRegistration.objects.filter(attendee=user, event=ev, is_cancelled=False).exists():
                registration = EventRegistration.objects.create(attendee=user, event=ev)
                if amount_total:
                    registration.paid = True
                    registration.amount_paid = float(amount_total) / 100.0
                    registration.currency = currency.upper()
                    registration.payment_reference = payment_ref

                # Generate QR code only for in-person events
                if ev.is_in_person:
                    qr_payload = {
                        'registration_id': str(registration.id),
                        'event_id': str(ev.id),
                        'attendee_id': str(user.id),
                        'name': f"{user.get_full_name()}",
                        'event_title': ev.title,
                        'start_date': ev.start_date.isoformat() if ev.start_date else ''
                    }
                    qr_text = str(qr_payload)
                    qr = qrcode.QRCode(box_size=10, border=4)
                    qr.add_data(qr_text)
                    qr.make(fit=True)
                    img = qr.make_image(fill_color="black", back_color="white")
                    buffer = io.BytesIO()
                    img.save(buffer, format='PNG')
                    buffer.seek(0)
                    qr_b64 = base64.b64encode(buffer.read()).decode('utf-8')
                    registration.qr_code = qr_b64

                registration.save()
