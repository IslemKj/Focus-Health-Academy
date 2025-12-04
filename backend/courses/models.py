"""
Models for courses app
"""
import uuid
from django.db import models
from django.conf import settings


class Course(models.Model):
    """
    Course model for online and in-person courses
    """
    
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    CATEGORY_CHOICES = [
        ('medical', 'Medical'),
        ('nursing', 'Nursing'),
        ('pharmacy', 'Pharmacy'),
        ('dentistry', 'Dentistry'),
        ('psychology', 'Psychology'),
        ('nutrition', 'Nutrition'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    image = models.URLField(max_length=500, blank=True, null=True)
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='courses_taught'
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    is_online = models.BooleanField(default=True)
    is_in_person = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    duration_weeks = models.IntegerField(default=0, help_text='Course duration in weeks')
    max_students = models.IntegerField(default=0, help_text='0 means unlimited')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
    
    def __str__(self):
        return self.title
    
    @property
    def enrolled_count(self):
        return self.enrollments.filter(is_active=True).count()
    
    @property
    def is_full(self):
        if self.max_students == 0:
            return False
        return self.enrolled_count >= self.max_students


class Lesson(models.Model):
    """
    Lesson model - belongs to a course
    """
    
    CONTENT_TYPE_CHOICES = [
        ('video', 'Video'),
        ('reading', 'Reading'),
        ('quiz', 'Quiz'),
        ('assignment', 'Assignment'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPE_CHOICES, default='video')
    order = models.IntegerField(default=0, help_text='Lesson order in the course')
    video_url = models.URLField(blank=True, null=True, help_text='YouTube or Vimeo URL')
    pdf_url = models.URLField(blank=True, null=True, help_text='Direct PDF URL')
    duration = models.IntegerField(default=0, help_text='Duration in minutes')
    is_free_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lessons'
        ordering = ['course', 'order']
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Enrollment(models.Model):
    """
    Enrollment model - tracks student course enrollments
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrollments'
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    is_active = models.BooleanField(default=True)
    progress_percentage = models.IntegerField(default=0)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    # Payment fields
    paid = models.BooleanField(default=False)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency = models.CharField(max_length=10, default='EUR')
    payment_reference = models.CharField(max_length=255, blank=True, null=True)
    qr_code = models.TextField(blank=True, null=True, help_text='Base64 PNG for in-person enrollments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'enrollments'
        ordering = ['-enrolled_at']
        unique_together = ['student', 'course']
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title}"


class LessonProgress(models.Model):
    """
    Tracks individual lesson completion for each student
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='lesson_progress'
    )
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lesson_progress'
        unique_together = ['enrollment', 'lesson']
        verbose_name = 'Lesson Progress'
        verbose_name_plural = 'Lesson Progress'
    
    def __str__(self):
        return f"{self.enrollment.student.get_full_name()} - {self.lesson.title}"
