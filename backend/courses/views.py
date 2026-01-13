"""
Views for courses app
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Course, Lesson, Enrollment, LessonProgress
from .serializers import (
    CourseListSerializer,
    CourseDetailSerializer,
    LessonSerializer,
    EnrollmentSerializer,
    EnrollmentCreateSerializer,
    LessonProgressSerializer
)
import qrcode
import io
import base64
import uuid
import stripe
from django.conf import settings


class CourseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Course model
    Provides CRUD operations for courses
    """
    queryset = Course.objects.filter(is_published=True)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        return CourseDetailSerializer
    
    def perform_create(self, serializer):
        # Only admins can create courses
        if not self.request.user.is_admin:
            raise permissions.PermissionDenied("Only admins can create courses.")
        # Set the teacher to the current user
        serializer.save(teacher=self.request.user)
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # Filter by level
        level = self.request.query_params.get('level', None)
        if level:
            queryset = queryset.filter(level=level)
        
        # Filter by type (online/in-person)
        is_online = self.request.query_params.get('is_online', None)
        if is_online:
            queryset = queryset.filter(is_online=is_online.lower() == 'true')
        
        # Search by title
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(title__icontains=search)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """Add enrollment status when retrieving course details."""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Add is_enrolled field if user is authenticated
        if request.user.is_authenticated:
            is_enrolled = Enrollment.objects.filter(
                student=request.user,
                course=instance,
                is_active=True
            ).exists()
            data['is_enrolled'] = is_enrolled
        else:
            data['is_enrolled'] = False
        
        return Response(data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_payment_intent(self, request, pk=None):
        """Create a Stripe Payment Intent for in-app payment."""
        course = self.get_object()
        user = request.user

        if not getattr(settings, 'STRIPE_SECRET_KEY', None):
            return Response({'error': 'Stripe not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if not course.price or float(course.price) <= 0:
            return Response({'error': 'This course is free.'}, status=status.HTTP_400_BAD_REQUEST)

        stripe.api_key = settings.STRIPE_SECRET_KEY

        try:
            # Create a PaymentIntent with amount and currency
            intent = stripe.PaymentIntent.create(
                amount=int(float(course.price) * 100),  # amount in cents
                currency='eur',
                metadata={
                    'type': 'course',
                    'course_id': str(course.id),
                    'user_id': str(user.id),
                    'course_title': course.title,
                },
                description=f"Course: {course.title}",
            )

            return Response({
                'clientSecret': intent.client_secret,
                'publishableKey': getattr(settings, 'STRIPE_PUBLISHABLE_KEY', ''),
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def confirm_payment(self, request, pk=None):
        """Confirm payment and create enrollment after successful payment (Stripe or IAP)."""
        course = self.get_object()
        user = request.user
        payment_intent_id = request.data.get('payment_intent_id')

        if not payment_intent_id:
            return Response({'error': 'Payment intent ID required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if already enrolled (active)
        if Enrollment.objects.filter(student=user, course=course, is_active=True).exists():
            existing = Enrollment.objects.get(student=user, course=course, is_active=True)
            serializer = EnrollmentSerializer(existing)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Handle free courses/events
        if payment_intent_id == 'free':
            # Check if there's an inactive enrollment and reactivate it
            try:
                enrollment = Enrollment.objects.get(student=user, course=course, is_active=False)
                enrollment.is_active = True
            except Enrollment.DoesNotExist:
                # Create new enrollment if none exists
                enrollment = Enrollment.objects.create(student=user, course=course)
            
            enrollment.paid = True
            enrollment.amount_paid = 0
            enrollment.currency = 'EUR'
            enrollment.payment_reference = 'free'
            
            # Create lesson progress entries for all lessons
            for lesson in course.lessons.all():
                LessonProgress.objects.get_or_create(enrollment=enrollment, lesson=lesson)
            
            enrollment.save()
            serializer = EnrollmentSerializer(enrollment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # Determine payment type: IAP (iOS) vs Stripe (Android)
        # Stripe payment_intent_id starts with 'pi_', IAP transaction IDs don't
        is_iap = not payment_intent_id.startswith('pi_')
        
        amount_paid = 0
        currency = 'EUR'
        
        if is_iap:
            # Apple IAP - RevenueCat already validated the receipt
            # We trust the transaction ID from RevenueCat
            amount_paid = float(course.price) if course.price else 0
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

        # Check if there's an inactive enrollment and reactivate it
        is_reactivation = False
        try:
            enrollment = Enrollment.objects.get(student=user, course=course, is_active=False)
            enrollment.is_active = True
            is_reactivation = True
        except Enrollment.DoesNotExist:
            # Create new enrollment if none exists
            enrollment = Enrollment.objects.create(student=user, course=course)
        
        enrollment.paid = True
        enrollment.amount_paid = amount_paid
        enrollment.currency = currency
        enrollment.payment_reference = payment_intent_id

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

        # Create lesson progress entries only for new enrollments
        if not is_reactivation:
            for lesson in course.lessons.all():
                LessonProgress.objects.create(enrollment=enrollment, lesson=lesson)

        enrollment.save()
        
        # Send purchase confirmation email
        from core.email_utils import send_email
        from datetime import datetime
        lessons = course.lessons.all()
        send_email(
            subject=f'Payment Successful - {course.title}',
            to_email=user.email,
            template_name='purchase_confirmation',
            context={
                'user_name': user.get_full_name() or user.email,
                'course_title': course.title,
                'course_description': course.description[:200] + '...' if len(course.description) > 200 else course.description,
                'course_id': str(course.id),
                'amount': f"{enrollment.amount_paid:.2f}",
                'currency': enrollment.currency,
                'order_id': str(enrollment.id)[:13],
                'purchase_date': datetime.now().strftime('%B %d, %Y at %I:%M %p'),
                'payment_reference': payment_intent_id,
                'lesson_count': lessons.count(),
                'duration': f'{course.duration_weeks} weeks' if course.duration_weeks > 0 else 'Self-paced',
                'instructor_name': course.teacher.get_full_name() if course.teacher else 'Focus Health Academy',
            }
        )
        
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        """
        Enroll the current user in a course
        POST /api/v1/courses/{id}/enroll/
        """
        course = self.get_object()
        user = request.user
        
        # Check if already enrolled
        if Enrollment.objects.filter(student=user, course=course, is_active=True).exists():
            return Response({
                'error': 'You are already enrolled in this course.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if course is full
        if course.is_full:
            return Response({
                'error': 'This course is full.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Handle payment if course has a price
        simulate_payment = request.data.get('simulate_payment', False)

        if course.price and float(course.price) > 0 and not simulate_payment:
            return Response({
                'error': 'Payment required for this course. Include simulate_payment=true in request for testing.'
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        # Create enrollment
        enrollment = Enrollment.objects.create(student=user, course=course)

        # If paid, mark payment fields
        if course.price and float(course.price) > 0:
            enrollment.paid = True
            enrollment.amount_paid = course.price
            enrollment.currency = 'EUR'
            enrollment.payment_reference = str(uuid.uuid4())
            # Generate QR only for in-person courses
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

        # Create lesson progress entries for all lessons
        for lesson in course.lessons.all():
            LessonProgress.objects.create(enrollment=enrollment, lesson=lesson)
        
        enrollment.save()
        serializer = EnrollmentSerializer(enrollment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def unenroll(self, request, pk=None):
        """
        Unenroll the current user from a course (delete enrollment)
        POST /api/v1/courses/{id}/unenroll/
        """
        course = self.get_object()
        user = request.user
        
        try:
            enrollment = Enrollment.objects.get(student=user, course=course, is_active=True)
            enrollment.delete()  # Delete instead of just deactivating
            
            return Response({
                'message': 'Successfully unenrolled from the course.'
            }, status=status.HTTP_200_OK)
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'You are not enrolled in this course.'
            }, status=status.HTTP_400_BAD_REQUEST)


class LessonViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Lesson model
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by course
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        """
        Mark a lesson as completed
        POST /api/v1/lessons/{id}/complete/
        """
        lesson = self.get_object()
        user = request.user
        
        # Get enrollment for this course
        try:
            enrollment = Enrollment.objects.get(
                student=user,
                course=lesson.course,
                is_active=True
            )
        except Enrollment.DoesNotExist:
            return Response({
                'error': 'You are not enrolled in this course.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update lesson progress
        lesson_progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson
        )
        
        if not lesson_progress.is_completed:
            lesson_progress.is_completed = True
            lesson_progress.completed_at = timezone.now()
            lesson_progress.save()
            
            # Update enrollment progress
            total_lessons = enrollment.course.lessons.count()
            completed_lessons = LessonProgress.objects.filter(
                enrollment=enrollment,
                is_completed=True
            ).count()
            
            enrollment.progress_percentage = int((completed_lessons / total_lessons) * 100)
            
            # Check if course is completed
            if enrollment.progress_percentage == 100:
                enrollment.completed_at = timezone.now()
            
            enrollment.save()
        
        serializer = LessonProgressSerializer(lesson_progress)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Enrollment model (read-only)
    Students can view their enrollments
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Admins can see all enrollments, students only see their own
        if user.is_admin:
            return Enrollment.objects.filter(is_active=True).select_related('student', 'course')
        return Enrollment.objects.filter(student=user, is_active=True)
    
    @action(detail=True, methods=['get'], url_path='progress')
    def get_progress(self, request, pk=None):
        """
        Get lesson progress for an enrollment
        GET /api/v1/enrollments/{id}/progress/
        """
        enrollment = self.get_object()
        lesson_progress = LessonProgress.objects.filter(enrollment=enrollment)
        serializer = LessonProgressSerializer(lesson_progress, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], url_path='lessons/(?P<lesson_id>[^/.]+)/complete')
    def mark_lesson_complete(self, request, pk=None, lesson_id=None):
        """
        Mark a lesson as complete for this enrollment
        POST /api/v1/enrollments/{enrollment_id}/lessons/{lesson_id}/complete/
        """
        enrollment = self.get_object()
        
        # Verify the lesson belongs to the course
        try:
            lesson = Lesson.objects.get(id=lesson_id, course=enrollment.course)
        except Lesson.DoesNotExist:
            return Response({
                'error': 'Lesson not found in this course.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Create or update lesson progress
        lesson_progress, created = LessonProgress.objects.get_or_create(
            enrollment=enrollment,
            lesson=lesson,
            defaults={'is_completed': True}
        )
        
        if not created and not lesson_progress.is_completed:
            lesson_progress.is_completed = True
            lesson_progress.save()
        
        # Update overall course progress
        total_lessons = enrollment.course.lessons.count()
        completed_lessons = LessonProgress.objects.filter(
            enrollment=enrollment,
            is_completed=True
        ).count()
        
        if total_lessons > 0:
            enrollment.progress_percentage = int((completed_lessons / total_lessons) * 100)
            enrollment.save()
        
        return Response({
            'message': 'Lesson marked as complete',
            'progress_percentage': enrollment.progress_percentage
        }, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'], url_path='certificate')
    def get_certificate(self, request, pk=None):
        """
        Generate and return certificate for completed course
        GET /api/v1/enrollments/{enrollment_id}/certificate/
        """
        enrollment = self.get_object()
        
        # Check if course is 100% complete
        if enrollment.progress_percentage < 100:
            return Response({
                'error': 'Course must be 100% complete to generate certificate'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate certificate data
        from datetime import datetime
        from core.email_utils import send_email
        
        certificate_data = {
            'certificate_id': f"CERT-{enrollment.id}",
            'student_name': enrollment.student.get_full_name(),
            'course_title': enrollment.course.title,
            'completion_date': enrollment.updated_at.strftime('%B %d, %Y'),
            'instructor_name': enrollment.course.teacher.get_full_name(),
            'progress': enrollment.progress_percentage,
            'issued_date': datetime.now().strftime('%B %d, %Y'),
        }
        
        # Send certificate email (only send once - check if completed_at is null)
        if not enrollment.completed_at:
            enrollment.completed_at = timezone.now()
            enrollment.save()
            
            lessons = enrollment.course.lessons.all()
            send_email(
                subject=f'🏆 Congratulations! You\'ve Completed {enrollment.course.title}',
                to_email=enrollment.student.email,
                template_name='certificate',
                context={
                    'user_name': enrollment.student.get_full_name() or enrollment.student.email,
                    'course_title': enrollment.course.title,
                    'course_id': str(enrollment.course.id),
                    'completion_date': enrollment.updated_at.strftime('%B %d, %Y'),
                    'certificate_id': certificate_data['certificate_id'],
                    'instructor_name': enrollment.course.teacher.get_full_name() if enrollment.course.teacher else 'Focus Health Academy',
                    'lesson_count': lessons.count(),
                    'duration': enrollment.course.duration or 'Self-paced',
                }
            )
        
        return Response(certificate_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='paid-orders', permission_classes=[permissions.IsAdminUser])
    def paid_orders(self, request):
        """
        Get all paid enrollments/orders (Admin only)
        GET /api/v1/enrollments/paid-orders/
        """
        orders = Enrollment.objects.filter(
            paid=True,
            is_active=True
        ).select_related('student', 'course').order_by('-enrolled_at')
        
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
