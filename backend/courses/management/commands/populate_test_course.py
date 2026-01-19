"""
Management command to populate the test course with sample lessons
"""
from django.core.management.base import BaseCommand
from courses.models import Course, Lesson


class Command(BaseCommand):
    help = 'Populate test course with sample lessons'

    def handle(self, *args, **kwargs):
        # Find the Welcome course
        course_id = 'b9815ad8-93ab-4259-b8e5-efa5c797adae'
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Course {course_id} not found'))
            return
        
        # Delete existing lessons for this course
        Lesson.objects.filter(course=course).delete()
        
        # Sample lessons with working video URLs
        # IMPORTANT: expo-video ONLY works with direct video URLs (mp4, webm, m3u8)
        # YouTube URLs DO NOT work - you must either:
        # 1. Download the video and host it yourself (on PythonAnywhere, AWS S3, etc.)
        # 2. Use Vimeo (provides direct URLs)
        # 3. Use sample videos below
        
        # For your video: https://youtu.be/l1iU0Hn91VY
        # You need to:
        # 1. Download it using https://y2mate.com or similar
        # 2. Upload the MP4 to a hosting service
        # 3. Replace the URL below with the direct MP4 link
        
        lessons_data = [
            {
                'title': 'Introduction to Health & Wellness',
                'description': 'Learn the fundamentals of health and wellness, including key concepts and principles that will guide you throughout this course.',
                'content_type': 'video',
                'order': 1,
                # Your actual health video from Imgur
                'video_url': 'https://i.imgur.com/ZImVbTS.mp4',
                'duration': 15,
                'is_free_preview': True,
            },
            {
                'title': 'Understanding Nutrition Basics',
                'description': 'Explore the essential nutrients your body needs and how to maintain a balanced diet for optimal health.',
                'content_type': 'video',
                'order': 2,
                'video_url': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                'duration': 20,
                'is_free_preview': False,
            },
            {
                'title': 'Physical Activity and Exercise',
                'description': 'Discover the importance of regular physical activity and learn effective exercise techniques for different fitness levels.',
                'content_type': 'video',
                'order': 3,
                'video_url': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'duration': 18,
                'is_free_preview': False,
            },
            {
                'title': 'Mental Health and Stress Management',
                'description': 'Learn strategies to manage stress, improve mental well-being, and maintain a healthy work-life balance.',
                'content_type': 'video',
                'order': 4,
                'video_url': 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                'duration': 22,
                'is_free_preview': False,
            },
            {
                'title': 'Course Materials - Study Guide',
                'description': 'Download the comprehensive study guide that summarizes all key concepts covered in this course.',
                'content_type': 'reading',
                'order': 5,
                'pdf_url': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                'duration': 10,
                'is_free_preview': False,
            },
            {
                'title': 'Final Assessment and Certification',
                'description': 'Complete the final quiz to test your knowledge and earn your course completion certificate.',
                'content_type': 'quiz',
                'order': 6,
                'duration': 30,
                'is_free_preview': False,
            },
        ]
        
        # Create lessons
        for lesson_data in lessons_data:
            lesson = Lesson.objects.create(
                course=course,
                **lesson_data
            )
            self.stdout.write(self.style.SUCCESS(f'Created lesson: {lesson.title}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nSuccessfully created {len(lessons_data)} lessons for {course.title}'))
