/**
 * Enhanced Modern HomeScreen
 * Responsive multilingual main landing screen with featured content, logo, and gallery
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  Platform,
  FlatList,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseCard, EventCard } from '../../components';
import { coursesService, eventsService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Translations
const translations = {
  en: {
    title: 'Focus Health Academy',
    subtitle: 'Learn, Grow, and Excel in Healthcare',
    exploreCourses: 'Explore Courses',
    courses: 'Courses',
    events: 'Events',
    students: 'Students',
    featuredCourses: 'Featured Courses',
    featuredCoursesSubtitle: 'Start your learning journey',
    upcomingEvents: 'Upcoming Events',
    upcomingEventsSubtitle: "Don't miss out",
    pastEvents: 'Past Events Gallery',
    pastEventsSubtitle: 'Highlights from our recent events',
    seeAll: 'See All',
    viewGallery: 'View Full Gallery',
    noCoursesAvailable: 'No courses available yet',
    noUpcomingEvents: 'No upcoming events',
    loading: 'Loading...',
    // Quick Actions
    quickActions: 'Quick Actions',
    browseCourseCatalog: 'Browse Course Catalog',
    upcomingEventsCalendar: 'Events Calendar',
    myLearning: 'My Learning',
    certificates: 'Certificates',
    // Features
    whyChooseUs: 'Why Choose Us',
    expertInstructors: 'Expert Instructors',
    expertInstructorsDesc: 'Learn from healthcare professionals',
    flexibleLearning: 'Flexible Learning',
    flexibleLearningDesc: 'Study at your own pace',
    certifications: 'Certifications',
    certificationsDesc: 'Earn recognized certificates',
    community: 'Community',
    communityDesc: 'Join a network of learners',
  },
  fr: {
    title: 'Focus Health Academy',
    subtitle: 'Apprendre, Grandir et Exceller dans la Santé',
    exploreCourses: 'Explorer les Cours',
    courses: 'Cours',
    events: 'Événements',
    students: 'Étudiants',
    featuredCourses: 'Cours en Vedette',
    featuredCoursesSubtitle: 'Commencez votre parcours d\'apprentissage',
    upcomingEvents: 'Événements à Venir',
    upcomingEventsSubtitle: 'Ne manquez pas',
    pastEvents: 'Galerie d\'Événements Passés',
    pastEventsSubtitle: 'Points forts de nos événements récents',
    seeAll: 'Voir Tout',
    viewGallery: 'Voir la Galerie Complète',
    noCoursesAvailable: 'Aucun cours disponible pour le moment',
    noUpcomingEvents: 'Aucun événement à venir',
    loading: 'Chargement...',
    // Quick Actions
    quickActions: 'Actions Rapides',
    browseCourseCatalog: 'Parcourir le Catalogue',
    upcomingEventsCalendar: 'Calendrier des Événements',
    myLearning: 'Mon Apprentissage',
    certificates: 'Certificats',
    // Features
    whyChooseUs: 'Pourquoi Nous Choisir',
    expertInstructors: 'Instructeurs Experts',
    expertInstructorsDesc: 'Apprenez de professionnels de la santé',
    flexibleLearning: 'Apprentissage Flexible',
    flexibleLearningDesc: 'Étudiez à votre rythme',
    certifications: 'Certifications',
    certificationsDesc: 'Obtenez des certificats reconnus',
    community: 'Communauté',
    communityDesc: 'Rejoignez un réseau d\'apprenants',
  },
};

const HomeScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { t, language, setLanguage } = useTranslation(translations);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, eventsData] = await Promise.all([
        coursesService.getCourses({ page_size: 5 }),
        eventsService.getEvents({ is_featured: true, page_size: 5 }),
      ]);
      setCourses(coursesData.results || coursesData);
      setEvents(eventsData.results || eventsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const quickActions = [
    {
      id: 'courses',
      icon: 'book-outline',
      title: t('browseCourseCatalog'),
      color: '#2563EB',
      bgColor: '#EEF2FF',
      onPress: () => navigation.navigate('CoursesTab'),
    },
    {
      id: 'events',
      icon: 'calendar-outline',
      title: t('upcomingEventsCalendar'),
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      onPress: () => navigation.navigate('Events'),
    },
    {
      id: 'learning',
      icon: 'school-outline',
      title: t('myLearning'),
      color: '#10B981',
      bgColor: '#ECFDF5',
      onPress: () => navigation.navigate('MyCourses'),
    },
    {
      id: 'Tickets',
      icon: 'ticket-outline',
      title: t('Tickets'),
      color: '#F59E0B',
      bgColor: '#FFFBEB',
      onPress: () => navigation.navigate('MyTickets'),
    },
  ];

  const features = [
    {
      icon: 'people',
      title: t('expertInstructors'),
      description: t('expertInstructorsDesc'),
      color: '#2563EB',
    },
    {
      icon: 'time',
      title: t('flexibleLearning'),
      description: t('flexibleLearningDesc'),
      color: '#10B981',
    },
    {
      icon: 'medal',
      title: t('certifications'),
      description: t('certificationsDesc'),
      color: '#F59E0B',
    },
    {
      icon: 'globe',
      title: t('community'),
      description: t('communityDesc'),
      color: '#7C3AED',
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={loading} 
          onRefresh={loadData}
          tintColor="#FFFFFF"
        />
      }
    >
      {/* Hero Section with Logo */}
      <View style={styles.hero}>
        {/* Language Toggle Button */}
        <TouchableOpacity 
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Ionicons name="language" size={16} color="#FFFFFF" />
          <Text style={styles.languageText}>
            {language === 'en' ? 'EN' : 'FR'}
          </Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Image
            source={require('../../../assets/logofhe3.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>{t('title')}</Text>
          <Text style={styles.heroSubtitle}>
            {t('subtitle')}
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate('CoursesTab')}
          >
            <Text style={styles.ctaButtonText}>{t('exploreCourses')}</Text>
            <Ionicons name="arrow-forward" size={20} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="book" size={24} color="#2563EB" />
          </View>
          <Text style={styles.statNumber}>{courses.length}+</Text>
          <Text style={styles.statLabel}>{t('courses')}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="calendar" size={24} color="#7C3AED" />
          </View>
          <Text style={styles.statNumber}>{events.length}+</Text>
          <Text style={styles.statLabel}>{t('events')}</Text>
        </View>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people" size={24} color="#10B981" />
          </View>
          <Text style={styles.statNumber}>500+</Text>
          <Text style={styles.statLabel}>{t('students')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitleSmall}>{t('quickActions')}</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={action.onPress}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
                <Ionicons name={action.icon} size={28} color={action.color} />
              </View>
              <Text style={styles.quickActionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Courses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('featuredCourses')}</Text>
            <Text style={styles.sectionSubtitle}>{t('featuredCoursesSubtitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('CoursesTab')}
          >
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          {courses.slice(0, 3).map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => navigation.navigate('CourseDetails', { courseId: course.id })}
              style={styles.card}
              language={language}
            />
          ))}
        </View>
        {courses.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>{t('noCoursesAvailable')}</Text>
          </View>
        )}
      </View>

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{t('upcomingEvents')}</Text>
            <Text style={styles.sectionSubtitle}>{t('upcomingEventsSubtitle')}</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('Events')}
          >
            <Text style={styles.seeAll}>{t('seeAll')}</Text>
            <Ionicons name="arrow-forward" size={18} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <View style={styles.cardsContainer}>
          {events.slice(0, 3).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
              style={styles.card}
              language={language}
            />
          ))}
        </View>
        {events.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>{t('noUpcomingEvents')}</Text>
          </View>
        )}
      </View>

      {/* Past Events Gallery Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('pastEvents')}</Text>
          {/* <Text style={styles.sectionSubtitle}>{t('pastEventsSubtitle')}</Text> */}
        </View>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={() => Linking.openURL('https://www.focushealth-academy.com/gallery')}
        >
          <Ionicons name="images-outline" size={24} color="#FFFFFF" style={styles.galleryButtonIcon} />
          <Text style={styles.galleryButtonText}>{t('viewGallery')}</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Why Choose Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('whyChooseUs')}</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                <Ionicons name={feature.icon} size={32} color={feature.color} />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  hero: {
    backgroundColor: '#2563EB',
    paddingHorizontal: isTablet ? 40 : 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 50,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  languageToggle: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 10,
    gap: 6,
  },
  languageText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  heroContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: isTablet ? 280 : 220,
    height: isTablet ? 120 : 90,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: isTablet ? 36 : 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: isTablet ? 20 : 18,
    color: '#FFFFFF',
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  ctaButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: isTablet ? 40 : 24,
    marginTop: -35,
    marginBottom: 32,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: isTablet ? 14 : 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: isTablet ? 40 : 24,
    marginBottom: 32,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  sectionTitleSmall: {
    fontSize: isTablet ? 22 : 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: isTablet ? 26 : 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#6B7280',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  seeAll: {
    fontSize: isTablet ? 16 : 15,
    color: '#2563EB',
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: isTablet ? 160 : 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
    lineHeight: 18,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    marginBottom: 0,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 12,
  },
  galleryList: {
    paddingRight: 24,
  },
  galleryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 16,
  },
  galleryButtonIcon: {
    marginRight: 12,
  },
  galleryButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 20,
  },
  featureCard: {
    flex: 1,
    minWidth: isTablet ? 250 : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default HomeScreen;