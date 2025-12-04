"""
Django management command to populate sample data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from courses.models import Course, Lesson
from events.models import Event
from timeline.models import Post


class Command(BaseCommand):
    help = 'Populate database with sample data for testing'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')

        # Create or get admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@focushealth.com',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('✓ Created admin user (admin@focushealth.com / admin123)'))

        # Category choices from the model
        categories = ['medical', 'nursing', 'psychology', 'other']

        # Create courses
        courses_data = [
            {
                'title': 'Introduction to Healthcare',
                'description': 'Learn the fundamentals of healthcare systems, patient care, and medical terminology. Perfect for beginners entering the healthcare field.',
                'price': 99.99,
                'level': 'beginner',
                'duration_weeks': 8,
                'is_online': True,
            },
            {
                'title': 'Advanced Nursing Techniques',
                'description': 'Master advanced nursing skills including IV therapy, wound care, and patient assessment. Designed for experienced nurses.',
                'price': 199.99,
                'level': 'advanced',
                'duration_weeks': 12,
                'is_online': True,
            },
            {
                'title': 'Medical Ethics and Law',
                'description': 'Understand the ethical and legal aspects of healthcare practice, patient rights, and professional responsibilities.',
                'price': 149.99,
                'level': 'intermediate',
                'duration_weeks': 6,
                'is_online': True,
            },
            {
                'title': 'Mental Health First Aid',
                'description': 'Learn how to provide initial support to someone experiencing a mental health crisis. Essential skills for healthcare professionals.',
                'price': 79.99,
                'level': 'beginner',
                'duration_weeks': 4,
                'is_online': True,
            },
            {
                'title': 'Healthcare Management Essentials',
                'description': 'Develop leadership and management skills for healthcare settings. Learn about operations, finance, and team management.',
                'price': 249.99,
                'level': 'intermediate',
                'duration_weeks': 10,
                'is_online': False,
                'is_in_person': True,
            },
        ]

        for i, course_data in enumerate(courses_data):
            course, created = Course.objects.get_or_create(
                title=course_data['title'],
                defaults={
                    **course_data,
                    'teacher': admin_user,
                    'category': categories[i % len(categories)],
                    'max_students': 30,
                    'is_published': True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created course: {course.title}')
                
                # Add lessons to each course
                lessons_count = 3
                for j in range(lessons_count):
                    Lesson.objects.create(
                        course=course,
                        title=f'Lesson {j + 1}: {course.title.split()[0]} Fundamentals',
                        description=f'In this lesson, you will learn about key concepts in {course.title.lower()}.',
                        video_url=f'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        duration=45,
                        order=j + 1,
                        is_free_preview=(j == 0),
                    )
                self.stdout.write(f'    ✓ Added {lessons_count} lessons')

        # Create events
        events_data = [
            {
                'title': 'Healthcare Innovation Summit 2025',
                'description': 'Join us for a day of insights into the latest healthcare innovations, digital health technologies, and future trends.',
                'start_date': timezone.now() + timedelta(days=30),
                'end_date': timezone.now() + timedelta(days=30, hours=8),
                'is_online': False,
                'is_in_person': True,
                'venue': 'Convention Center, Main Hall',
                'max_attendees': 200,
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Online Nursing Workshop',
                'description': 'Interactive workshop covering advanced patient care techniques and best practices for modern nursing.',
                'start_date': timezone.now() + timedelta(days=15),
                'end_date': timezone.now() + timedelta(days=15, hours=4),
                'is_online': True,
                'is_in_person': False,
                'meeting_url': 'https://zoom.us/j/example123',
                'max_attendees': 100,
                'is_featured': True,
                'is_published': True,
            },
            {
                'title': 'Mental Health Awareness Conference',
                'description': 'A comprehensive conference on mental health awareness, treatment approaches, and community support.',
                'start_date': timezone.now() + timedelta(days=45),
                'end_date': timezone.now() + timedelta(days=46),
                'is_online': False,
                'is_in_person': True,
                'venue': 'University Medical Center',
                'max_attendees': 150,
                'is_featured': True,
                'is_published': True,
            },
        ]

        for event_data in events_data:
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults={
                    **event_data,
                    'organizer': admin_user,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created event: {event.title}')

        # Create sample posts
        posts_data = [
            {
                'content': 'Excited to share that I just completed the Advanced Nursing Techniques course! Highly recommended for all nursing professionals. 🎓',
            },
            {
                'content': 'Looking forward to the Healthcare Innovation Summit next month. Who else is attending? #HealthcareInnovation',
            },
            {
                'content': 'Great session today on patient care best practices. Remember: empathy and communication are just as important as technical skills! 💙',
            },
        ]

        for post_data in posts_data:
            post, created = Post.objects.get_or_create(
                content=post_data['content'],
                defaults={
                    **post_data,
                    'author': admin_user,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created post')

        self.stdout.write(self.style.SUCCESS('\n✅ Sample data created successfully!'))
        self.stdout.write('\nYou can now:')
        self.stdout.write('  - Browse courses and events in the app')
        self.stdout.write('  - Login with: admin@focushealth.com / admin123')
        self.stdout.write('  - Enroll in courses and register for events')
