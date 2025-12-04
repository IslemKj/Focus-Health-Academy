"""
Serializers for courses app
"""
from rest_framework import serializers
from .models import Course, Lesson, Enrollment, LessonProgress
from accounts.serializers import UserSerializer


class LessonSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson model
    """
    
    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'description', 'content_type', 'order',
            'video_url', 'pdf_url', 'duration', 'is_free_preview',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseListSerializer(serializers.ModelSerializer):
    """
    Serializer for Course list view (minimal fields)
    """
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'short_description', 'price', 'image',
            'teacher_name', 'category', 'level', 'is_online',
            'is_in_person', 'duration_weeks', 'enrolled_count',
            'is_full', 'created_at'
        ]


class CourseDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for Course detail view (with lessons)
    """
    teacher = UserSerializer(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)
    enrolled_count = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'short_description', 'price',
            'image', 'teacher', 'category', 'level', 'is_online',
            'is_in_person', 'is_published', 'duration_weeks',
            'max_students', 'enrolled_count', 'is_full', 'lessons',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LessonProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for Lesson Progress
    """
    lesson = LessonSerializer(read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = [
            'id', 'enrollment', 'lesson', 'is_completed',
            'completed_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Enrollment model
    """
    student = UserSerializer(read_only=True)
    course = CourseListSerializer(read_only=True)
    lesson_progress = LessonProgressSerializer(many=True, read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'student', 'course', 'is_active',
            'progress_percentage', 'enrolled_at', 'completed_at',
            'lesson_progress',
            # Payment fields
            'paid', 'amount_paid', 'currency', 'payment_reference', 'qr_code',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'enrolled_at', 'created_at', 'updated_at']


class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating enrollments
    """
    
    class Meta:
        model = Enrollment
        fields = ['course']
    
    def create(self, validated_data):
        validated_data['student'] = self.context['request'].user
        return super().create(validated_data)
