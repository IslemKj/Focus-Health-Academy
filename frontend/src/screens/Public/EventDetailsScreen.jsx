/**
 * EventDetailsScreen
 * Display event information and registration options
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { eventsService, authService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    errorLoadingEvent: 'Failed to load event details',
    loginRequired: 'Login Required',
    pleaseLoginToRegister: 'Please login to register for this event',
    cancel: 'Cancel',
    login: 'Login',
    success: 'Success',
    registeredSuccess: 'You have been registered for this event!',
    registrationFailed: 'Registration Failed',
    failedToRegister: 'Failed to register for event',
    cancelRegistration: 'Cancel Registration',
    confirmCancelRegistration: 'Are you sure you want to cancel your registration?',
    no: 'No',
    yes: 'Yes',
    registrationCancelled: 'Your registration has been cancelled',
    error: 'Error',
    failedToCancelRegistration: 'Failed to cancel registration',
    eventNotFound: 'Event not found',
    event: 'Event',
    startDate: 'Start Date',
    endDate: 'End Date',
    location: 'Location',
    onlineEvent: 'Online Event',
    toBeAnnounced: 'To be announced',
    organizer: 'Organizer',
    registeredAttendees: 'Registered Attendees',
    aboutThisEvent: 'About this Event',
    speakers: 'Speakers',
    youAreRegistered: 'You are registered for this event',
    cancelRegistrationButton: 'Cancel Registration',
    registering: 'Registering...',
    registerNow: 'Register Now',
  },
  fr: {
    errorLoadingEvent: 'Échec du chargement des détails de l\'événement',
    loginRequired: 'Connexion requise',
    pleaseLoginToRegister: 'Veuillez vous connecter pour vous inscrire à cet événement',
    cancel: 'Annuler',
    login: 'Connexion',
    success: 'Succès',
    registeredSuccess: 'Vous êtes inscrit à cet événement!',
    registrationFailed: 'Échec de l\'inscription',
    failedToRegister: 'Échec de l\'inscription à l\'événement',
    cancelRegistration: 'Annuler l\'inscription',
    confirmCancelRegistration: 'Êtes-vous sûr de vouloir annuler votre inscription?',
    no: 'Non',
    yes: 'Oui',
    registrationCancelled: 'Votre inscription a été annulée',
    error: 'Erreur',
    failedToCancelRegistration: 'Échec de l\'annulation de l\'inscription',
    eventNotFound: 'Événement non trouvé',
    event: 'Événement',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    location: 'Lieu',
    onlineEvent: 'Événement en ligne',
    toBeAnnounced: 'À annoncer',
    organizer: 'Organisateur',
    registeredAttendees: 'Participants inscrits',
    aboutThisEvent: 'À propos de cet événement',
    speakers: 'Intervenants',
    youAreRegistered: 'Vous êtes inscrit à cet événement',
    cancelRegistrationButton: 'Annuler l\'inscription',
    registering: 'Inscription en cours...',
    registerNow: 'S\'inscrire maintenant',
  },
};

const { width } = Dimensions.get('window');

const EventDetailsScreen = ({ route, navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadEventDetails();
    checkAuthStatus();
    loadCurrentUser();
  }, [eventId]);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const profile = await authService.getProfile();
      setCurrentUser(profile);
    } catch (error) {
      setCurrentUser(null);
    }
  };

  const loadEventDetails = async () => {
    try {
      const data = await eventsService.getEvent(eventId);
      setEvent(data);
      setIsRegistered(data.is_registered || false);
    } catch (error) {
      console.error('Error loading event:', error);
      Alert.alert(t('error'), t('errorLoadingEvent'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('loginRequired'),
        t('pleaseLoginToRegister'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setRegistering(true);
    try {
      // Check if event requires payment
      if (event.price && parseFloat(event.price) > 0) {
        // Navigate to payment screen for paid events
        setRegistering(false);
        navigation.navigate('Payment', {
          type: 'event',
          itemId: eventId,
          title: event.title,
          price: event.price,
          onSuccess: () => {
            setIsRegistered(true);
            loadEventDetails();
          },
        });
        return;
      }

      // Free event - register directly
      const res = await eventsService.registerEvent(eventId);
      setIsRegistered(true);
      
      // Show appropriate success message based on event type
      const successMessage = event.is_in_person
        ? t('registeredSuccess') + ' ' + 'Check My Tickets for your QR code.'
        : t('registeredSuccess');
      
      Alert.alert(t('success'), successMessage);
      
      loadEventDetails();
    } catch (error) {
      Alert.alert(
        t('registrationFailed'),
        error.response?.data?.error || t('failedToRegister')
      );
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = () => {
    Alert.alert(
      t('cancelRegistration'),
      t('confirmCancelRegistration'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsService.cancelRegistration(eventId);
              setIsRegistered(false);
              Alert.alert(t('success'), t('registrationCancelled'));
              loadEventDetails();
            } catch (error) {
              Alert.alert(t('error'), t('failedToCancelRegistration'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsService.deleteEvent(eventId);
              Alert.alert('Success', 'Event deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('eventNotFound')}</Text>
      </View>
    );
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Language Toggle */}
      <TouchableOpacity 
        style={styles.languageToggle}
        onPress={toggleLanguage}
      >
        <Ionicons name="language" size={20} color="#2563EB" />
        <Text style={styles.languageText}>
          {language === 'en' ? 'EN' : 'FR'}
        </Text>
      </TouchableOpacity>

      {/* Event Image */}
      <Image
        source={{ uri: event.image || 'https://via.placeholder.com/400x250' }}
        style={styles.coverImage}
        resizeMode="cover"
      />

      {/* Event Details */}
      <View style={styles.content}>
        {/* Admin Controls */}
        {currentUser?.role === 'admin' && (
          <View style={styles.adminControls}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditEvent', { eventId })}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteEvent}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Event Header */}
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{event.event_type || t('event')}</Text>
          </View>
          
          <Text style={styles.title}>{event.title}</Text>
        </View>

        {/* Date & Time */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('startDate')}</Text>
              <Text style={styles.infoValue}>{formatDate(event.start_date)}</Text>
            </View>
          </View>

          {event.end_date && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('endDate')}</Text>
                <Text style={styles.infoValue}>{formatDate(event.end_date)}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          <View style={styles.infoRow}>
            <Ionicons 
              name={event.is_online ? 'videocam-outline' : 'location-outline'} 
              size={24} 
              color={theme.colors.primary} 
            />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('location')}</Text>
              <Text style={styles.infoValue}>
                {event.is_online 
                  ? t('onlineEvent') 
                  : event.venue || t('toBeAnnounced')}
              </Text>
            </View>
          </View>

          {/* Organizer */}
          {event.organizer_name && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('organizer')}</Text>
                <Text style={styles.infoValue}>{event.organizer_name}</Text>
              </View>
            </View>
          )}

          {/* Attendees Count */}
          {event.attendees_count !== undefined && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('registeredAttendees')}</Text>
                <Text style={styles.infoValue}>
                  {event.attendees_count} 
                  {event.max_attendees && ` / ${event.max_attendees}`}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutThisEvent')}</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {/* Speakers Section */}
        {event.speakers && event.speakers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('speakers')}</Text>
            {event.speakers.map((speaker, index) => (
              <View key={index} style={styles.speakerCard}>
                <Image
                  source={{ uri: speaker.photo || 'https://via.placeholder.com/60' }}
                  style={styles.speakerPhoto}
                />
                <View style={styles.speakerInfo}>
                  <Text style={styles.speakerName}>{speaker.name}</Text>
                  <Text style={styles.speakerTitle}>{speaker.title}</Text>
                  {speaker.bio && (
                    <Text style={styles.speakerBio} numberOfLines={2}>
                      {speaker.bio}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Registration Button */}
        <View style={styles.buttonContainer}>
          {isRegistered ? (
            <View>
              <View style={styles.registeredBanner}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <Text style={styles.registeredText}>{t('youAreRegistered')}</Text>
              </View>
              {event.is_in_person ? (
                <Button
                  title="See My Ticket"
                  onPress={() => navigation.navigate('Main', {
                    screen: 'ProfileTab',
                    params: { screen: 'MyTickets' }
                  })}
                  icon="ticket-outline"
                  fullWidth
                  style={styles.cancelButton}
                />
              ) : null}
              <Button
                title={t('cancelRegistrationButton')}
                onPress={handleCancelRegistration}
                variant="outline"
                fullWidth
                style={styles.cancelButton}
              />
            </View>
          ) : (
            <Button
              title={registering ? t('registering') : t('registerNow')}
              onPress={handleRegister}
              loading={registering}
              fullWidth
              style={styles.registerButton}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    gap: 6,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: theme.colors.gray[200],
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  typeBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    lineHeight: 32,
  },
  infoCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  speakerCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  speakerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gray[200],
  },
  speakerInfo: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  speakerTitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  speakerBio: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  registeredBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.md,
  },
  registeredText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.success,
    marginLeft: theme.spacing.sm,
  },
  registerButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  adminControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EventDetailsScreen;
