from django.contrib import admin
from .models import Course, Lesson, Enrollment, LessonProgress


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """
    Admin interface for Course model
    """
    list_display = ['title', 'teacher', 'category', 'level', 'price', 'is_published', 'created_at']
    list_filter = ['category', 'level', 'is_online', 'is_in_person', 'is_published']
    search_fields = ['title', 'description', 'teacher__email']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'short_description', 'description', 'image')
        }),
        ('Course Details', {
            'fields': ('teacher', 'category', 'level', 'price', 'duration_weeks')
        }),
        ('Delivery Method', {
            'fields': ('is_online', 'is_in_person', 'max_students')
        }),
        ('Status', {
            'fields': ('is_published',)
        }),
    )


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """
    Admin interface for Lesson model
    """
    list_display = ['title', 'course', 'order', 'duration', 'is_free_preview', 'created_at']
    list_filter = ['course', 'is_free_preview']
    search_fields = ['title', 'description', 'course__title']
    ordering = ['course', 'order']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """
    Admin interface for Enrollment model
    """
    list_display = ['student', 'course', 'progress_percentage', 'is_active', 'enrolled_at']
    list_filter = ['is_active', 'enrolled_at', 'completed_at']
    search_fields = ['student__email', 'course__title']
    ordering = ['-enrolled_at']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    """
    Admin interface for LessonProgress model
    """
    list_display = ['enrollment', 'lesson', 'is_completed', 'completed_at']
    list_filter = ['is_completed', 'completed_at']
    search_fields = ['enrollment__student__email', 'lesson__title']
