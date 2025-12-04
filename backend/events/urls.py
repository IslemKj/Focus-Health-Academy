"""
URL configuration for events app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, EventRegistrationViewSet, EventSpeakerViewSet

app_name = 'events'

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'event-registrations', EventRegistrationViewSet, basename='event-registration')
router.register(r'event-speakers', EventSpeakerViewSet, basename='event-speaker')

urlpatterns = [
    path('', include(router.urls)),
]
