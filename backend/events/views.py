"""
Views for events app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.conf import settings
import stripe
import qrcode
import io
import base64
from .models import Event, EventRegistration, EventSpeaker
from .serializers import (
    EventListSerializer,
    EventDetailSerializer,
    EventRegistrationSerializer,
    EventRegistrationCreateSerializer,
    EventSpeakerSerializer
)
import qrcode
import io
import base64
import uuid


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Event model
    Provides CRUD operations for events
    """
    queryset = Event.objects.filter(is_published=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        return EventDetailSerializer
    
    def perform_create(self, serializer):
        # Only admins can create events
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only admins can create events.")
        # Set the organizer to the current user
        serializer.save(organizer=self.request.user)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by online/in-person
        is_online = self.request.query_params.get('is_online', None)
        if is_online:
            queryset = queryset.filter(is_online=is_online.lower() == 'true')
        
        # Filter by featured
        is_featured = self.request.query_params.get('is_featured', None)
        if is_featured:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        
        # Filter by upcoming/past
        show_past = self.request.query_params.get('show_past', 'false')
        if show_past.lower() == 'false':
            queryset = queryset.filter(end_date__gte=timezone.now())
        
        # Search by title
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Add registration status when retrieving event details."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add is_registered field if user is authenticated
        if request.user.is_authenticated:
            is_registered = EventRegistration.objects.filter(
                attendee=request.user,
                event=instance,
                is_cancelled=False
            ).exists()
            data['is_registered'] = is_registered
        else:
            data['is_registered'] = False
        
        return Response(data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        """
        Register the current user for an event
        POST /api/v1/events/{id}/register/
        """
        event = self.get_object()
        user = request.user
        
        # Check if already registered
        if EventRegistration.objects.filter(
            attendee=user,
            event=event,
            is_cancelled=False
        ).exists():
            return Response({
                'error': 'You are already registered for this event.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event is full
        if event.is_full:
            return Response({
                'error': 'This event is full.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if event is past
        if event.is_past:
            return Response({
                'error': 'This event has already ended.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check registration deadline
        if event.registration_deadline and timezone.now() > event.registration_deadline:
            return Response({
                'error': 'Registration deadline has passed.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle payment if event has a price
        notes = request.data.get('notes', '')
        simulate_payment = request.data.get('simulate_payment', False)

        registration = EventRegistration.objects.create(
            attendee=user,
            event=event,
            notes=notes
        )

        if event.price and float(event.price) > 0:
            if not simulate_payment:
                # Payment required
                # Frontend should call with simulate_payment=true or integrate real gateway
                registration.delete()
                return Response({
                    'error': 'Payment required for this event. Include simulate_payment=true in request for testing.'
                }, status=status.HTTP_402_PAYMENT_REQUIRED)

            # Simulate payment success
            registration.paid = True
            registration.amount_paid = event.price
            registration.currency = 'EUR'
            registration.payment_reference = str(uuid.uuid4())

            # If in-person generate QR code (base64 PNG)
            if event.is_in_person:
                qr_payload = {
                    'registration_id': str(registration.id),
                    'event_id': str(event.id),
                    'attendee_id': str(user.id),
                    'name': f"{user.get_full_name()}",
                    'event_title': event.title,
                    'start_date': event.start_date.isoformat(),
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

        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_payment_intent(self, request, pk=None):
        """Create a Stripe Payment Intent for in-app payment."""
        event = self.get_object()
        user = request.user

        from django.conf import settings
        if not getattr(settings, 'STRIPE_SECRET_KEY', None):
            return Response({'error': 'Stripe not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not event.price or float(event.price) <= 0:
            return Response({'error': 'This event is free.'}, status=status.HTTP_400_BAD_REQUEST)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            # Create a PaymentIntent with amount and currency
            intent = stripe.PaymentIntent.create(
                amount=int(float(event.price) * 100),  # amount in cents
                currency='eur',
                metadata={
                    'type': 'event',
                    'event_id': str(event.id),
                    'user_id': str(user.id),
                    'event_title': event.title,
                },
                description=f"Event: {event.title}",
            )

            return Response({
                'clientSecret': intent.client_secret,
                'publishableKey': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', ''),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirm_payment(self, request, pk=None):
        """Confirm payment and create registration after successful payment (Stripe or IAP)."""
        event = self.get_object()
        user = request.user
        payment_intent_id = request.data.get('payment_intent_id')

        from django.conf import settings
        if not payment_intent_id:
            return Response({'error': 'Payment intent ID required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already registered (active)
        if EventRegistration.objects.filter(attendee=user, event=event, is_cancelled=False).exists():
            existing = EventRegistration.objects.get(attendee=user, event=event, is_cancelled=False)
            serializer = EventRegistrationSerializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Handle free events
        if payment_intent_id == 'free':
            # Check if there's a cancelled registration and reactivate it
            try:
                registration = EventRegistration.objects.get(attendee=user, event=event, is_cancelled=True)
                registration.is_cancelled = False
            except EventRegistration.DoesNotExist:
                # Create new registration if none exists
                registration = EventRegistration.objects.create(attendee=user, event=event)
            
            registration.amount_paid = 0
            registration.currency = 'EUR'
            registration.payment_reference = 'free'
            
            # Generate QR code for in-person events
            if event.is_in_person:
                import qrcode
                import io
                import base64
                qr_payload = {
                    'registration_id': str(registration.id),
                    'event_id': str(event.id),
                    'attendee_id': str(user.id),
                    'name': f"{user.get_full_name()}",
                    'event_title': event.title,
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
            serializer = EventRegistrationSerializer(registration)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Determine payment type: IAP (iOS) vs Stripe (Android)
        # Stripe payment_intent_id starts with 'pi_', IAP transaction IDs don't
        is_iap = not payment_intent_id.startswith('pi_')
        
        amount_paid = 0
        currency = 'EUR'
        
        if is_iap:
            # Apple IAP - RevenueCat already validated the receipt
            # We trust the transaction ID from RevenueCat
            amount_paid = float(event.price) if event.price else 0
            currency = 'EUR'
            # In production, you could add additional validation here
            # or use RevenueCat webhooks for extra security
        else:
            # Stripe payment verification (Android)
            stripe.api_key = getattr(settings, 'STRIPE_SECRET_KEY', None)
            try:
                intent = stripe.PaymentIntent.retrieve(payment_intent_id)
                if intent.status != 'succeeded':
                    return Response({'error': 'Payment not completed.'}, status=status.HTTP_400_BAD_REQUEST)
                amount_paid = float(intent.amount) / 100.0
                currency = intent.currency.upper()
            except Exception as e:
                return Response({'error': f'Payment verification failed: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if there's a cancelled registration and reactivate it
        try:
            registration = EventRegistration.objects.get(attendee=user, event=event, is_cancelled=True)
            registration.is_cancelled = False
        except EventRegistration.DoesNotExist:
            # Create new registration if none exists
            registration = EventRegistration.objects.create(attendee=user, event=event)
        registration.paid = True
        registration.amount_paid = amount_paid
        registration.currency = currency
        registration.payment_reference = payment_intent_id

        # Generate QR code only for in-person events
        if event.is_in_person:
            qr_payload = {
                'registration_id': str(registration.id),
                'event_id': str(event.id),
                'attendee_id': str(user.id),
                'name': f"{user.get_full_name()}",
                'event_title': event.title,
                'start_date': event.start_date.isoformat() if event.start_date else ''
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
        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel_registration(self, request, pk=None):
        """
        Cancel registration for an event
        POST /api/v1/events/{id}/cancel_registration/
        """
        event = self.get_object()
        user = request.user
        
        try:
            registration = EventRegistration.objects.get(
                attendee=user,
                event=event,
                is_cancelled=False
            )
            registration.is_cancelled = True
            registration.save()
            
            return Response({
                'message': 'Successfully cancelled your registration.'
            }, status=status.HTTP_200_OK)
        except EventRegistration.DoesNotExist:
            return Response({
                'error': 'You are not registered for this event.'
            }, status=status.HTTP_400_BAD_REQUEST)


class EventRegistrationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for EventRegistration model (read-only)
    Users can view their event registrations
    Admins can view all registrations
    """
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Admins can see all registrations, users only see their own
        if user.is_admin:
            return EventRegistration.objects.filter(is_cancelled=False).select_related('attendee', 'event')
        return EventRegistration.objects.filter(attendee=user, is_cancelled=False)


class EventSpeakerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EventSpeaker model
    """
    queryset = EventSpeaker.objects.all()
    serializer_class = EventSpeakerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by event
        event_id = self.request.query_params.get('event', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)
        
        return queryset
