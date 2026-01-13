/**
 * CourseDetailsScreen
 * Display course information and enrollment options
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
import { coursesService, authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');

// Translations
const translations = {
  en: {
    instructor: 'Instructor',
    duration: '10 hours',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    price: 'Price',
    free: 'Free',
    aboutCourse: 'About this Course',
    courseDetails: 'Course Details',
    onlineCourse: 'Online Course',
    inPersonCourse: 'In-Person Course',
    studentsEnrolled: 'students enrolled',
    lessons: 'lessons',
    goToCourse: 'Go to Course',
    unenroll: 'Unenroll',
    enrollNow: 'Enroll Now',
    enrolling: 'Enrolling...',
    loginRequired: 'Login Required',
    loginToEnroll: 'Please login to enroll in this course',
    cancel: 'Cancel',
    login: 'Login',
    success: 'Success',
    enrollSuccess: 'You have been enrolled in this course!',
    enrollmentFailed: 'Enrollment Failed',
    failedToEnroll: 'Failed to enroll in course',
    unenrollConfirm: 'Unenroll from Course',
    unenrollMessage: 'Are you sure you want to unenroll from this course?',
    unenrollSuccess: 'You have been unenrolled from this course',
    error: 'Error',
    failedToLoad: 'Failed to load course details',
    failedToUnenroll: 'Failed to unenroll from course',
    courseNotFound: 'Course not found',
  },
  fr: {
    instructor: 'Instructeur',
    duration: '10 heures',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    price: 'Prix',
    free: 'Gratuit',
    aboutCourse: 'À Propos de ce Cours',
    courseDetails: 'Détails du Cours',
    onlineCourse: 'Cours en Ligne',
    inPersonCourse: 'Cours en Présentiel',
    studentsEnrolled: 'étudiants inscrits',
    lessons: 'leçons',
    goToCourse: 'Aller au Cours',
    unenroll: 'Se Désinscrire',
    enrollNow: 'S\'inscrire Maintenant',
    enrolling: 'Inscription...',
    loginRequired: 'Connexion Requise',
    loginToEnroll: 'Veuillez vous connecter pour vous inscrire à ce cours',
    cancel: 'Annuler',
    login: 'Se Connecter',
    success: 'Succès',
    enrollSuccess: 'Vous êtes inscrit à ce cours !',
    enrollmentFailed: 'Échec de l\'Inscription',
    failedToEnroll: 'Échec de l\'inscription au cours',
    unenrollConfirm: 'Se Désinscrire du Cours',
    unenrollMessage: 'Êtes-vous sûr de vouloir vous désinscrire de ce cours ?',
    unenrollSuccess: 'Vous êtes désinscrit de ce cours',
    error: 'Erreur',
    failedToLoad: 'Échec du chargement des détails du cours',
    failedToUnenroll: 'Échec de la désinscription du cours',
    courseNotFound: 'Cours non trouvé',
  },
};

const CourseDetailsScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [localQrBase64, setLocalQrBase64] = useState(null);
  const [showLocalQr, setShowLocalQr] = useState(false);
  const { t, language, setLanguage } = useTranslation(translations);

  const translateLevel = (level) => {
    if (!level) return t('beginner');
    const levelKey = level.toLowerCase();
    const levelMap = { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' };
    return t(levelMap[levelKey] || 'beginner');
  };

  useEffect(() => {
    loadCourseDetails();
    checkAuthStatus();
    loadCurrentUser();
  }, [courseId]);

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

  const loadCourseDetails = async () => {
    try {
      const data = await coursesService.getCourse(courseId);
      setCourse(data);
      setIsEnrolled(data.is_enrolled || false);
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert(t('error'), t('failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('loginRequired'),
        t('loginToEnroll'),
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('login'), onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    setEnrolling(true);
    try {
      // Check if course requires payment
      if (course.price && parseFloat(course.price) > 0) {
        // Navigate to payment screen for paid courses
        setEnrolling(false);
        navigation.navigate('Payment', {
          type: 'course',
          itemId: courseId,
          title: course.title,
          price: course.price,
          onSuccess: () => {
            setIsEnrolled(true);
            loadCourseDetails();
          },
        });
        return;
      }

      // Free course - enroll directly
      const res = await coursesService.enrollCourse(courseId);
      console.log('enroll response', res);
      setIsEnrolled(true);
      
      // Show appropriate success message based on course type
      const successMessage = course.is_in_person
        ? t('enrollSuccess') + ' ' + 'Check My Tickets for your QR code.'
        : t('enrollSuccess') + ' ' + 'Access your course in My Courses.';
      
      Alert.alert(t('success'), successMessage);

      loadCourseDetails();
    } catch (error) {
      Alert.alert(
        t('enrollmentFailed'),
        error.response?.data?.error || t('failedToEnroll')
      );
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = () => {
    Alert.alert(
      t('unenrollConfirm'),
      t('unenrollMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('unenroll'),
          style: 'destructive',
          onPress: async () => {
            try {
              await coursesService.unenrollCourse(courseId);
              setIsEnrolled(false);
              Alert.alert(t('success'), t('unenrollSuccess'));
              loadCourseDetails();
            } catch (error) {
              Alert.alert(t('error'), t('failedToUnenroll'));
            }
          }
        }
      ]
    );
  };

  const handleDeleteCourse = () => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await coursesService.deleteCourse(courseId);
              Alert.alert('Success', 'Course deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
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

  if (!course) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t('courseNotFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Course Image */}
      <Image
        source={{ uri: course.image || 'https://via.placeholder.com/400x250' }}
        style={styles.coverImage}
        resizeMode="cover"
        onError={(error) => console.log('Image load error:', error, 'URL:', course.image)}
      />

      {/* Course Content */}
      <View style={styles.content}>
        {/* Admin Controls */}
        {currentUser?.role === 'admin' && (
          <View style={styles.adminControls}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('EditCourse', { courseId })}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteCourse}
            >
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
              <Text style={styles.adminButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Course Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{course.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={18} color={theme.colors.gray[600]} />
              <Text style={styles.metaText}>{course.teacher_name || t('instructor')}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={18} color={theme.colors.gray[600]} />
              <Text style={styles.metaText}>{course.duration || t('duration')}</Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="bar-chart-outline" size={18} color={theme.colors.gray[600]} />
              <Text style={styles.metaText}>{translateLevel(course.level)}</Text>
            </View>
          </View>

          {course.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
          )}
        </View>

        {/* Price Section */}
        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>{t('price')}</Text>
          <Text style={styles.price}>
            {course.price > 0 ? `€${course.price}` : t('free')}
          </Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('aboutCourse')}</Text>
          <Text style={styles.description}>{course.description}</Text>
        </View>

        {/* Course Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('courseDetails')}</Text>
          
          <View style={styles.detailRow}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.detailText}>
              {course.is_online ? t('onlineCourse') : t('inPersonCourse')}
            </Text>
          </View>

          {course.enrolled_count !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>
                {course.enrolled_count} {t('studentsEnrolled')}
              </Text>
            </View>
          )}

          {course.lessons_count !== undefined && (
            <View style={styles.detailRow}>
              <Ionicons name="book-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.detailText}>
                {course.lessons_count} {t('lessons')}
              </Text>
            </View>
          )}
        </View>

        {/* Enrollment Button */}
        <View style={styles.buttonContainer}>
          {isEnrolled ? (
            <>
              {course.is_in_person ? (
                <Button
                  title="See My Ticket"
                  onPress={() => navigation.navigate('Main', {
                    screen: 'ProfileTab',
                    params: { screen: 'MyTickets' }
                  })}
                  icon="ticket-outline"
                  fullWidth
                  style={styles.enrollButton}
                />
              ) : (
                <Button
                  title={t('goToCourse')}
                  onPress={() => navigation.navigate('Main', {
                    screen: 'ProfileTab',
                    params: {
                      screen: 'CoursePlayer',
                      params: { courseId }
                    }
                  })}
                  fullWidth
                  style={styles.enrollButton}
                />
              )}
              <Button
                title={t('unenroll')}
                onPress={handleUnenroll}
                variant="outline"
                fullWidth
                style={styles.unenrollButton}
              />
            </>
          ) : (
            <Button
              title={enrolling ? t('enrolling') : t('enrollNow')}
              onPress={handleEnroll}
              loading={enrolling}
              fullWidth
              style={styles.enrollButton}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    lineHeight: 32,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  categoryBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  priceLabel: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.primary,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  enrollButton: {
    marginBottom: theme.spacing.sm,
  },
  unenrollButton: {
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

export default CourseDetailsScreen;
