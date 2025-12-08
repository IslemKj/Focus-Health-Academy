/**
 * MyCoursesScreen
 * Display user's enrolled courses with progress tracking
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const CARD_WIDTH = isTablet ? (width - 64) / 2 : width - 32;

const translations = {
  en: {
    myLearning: 'My Learning',
    trackProgress: 'Track your progress and continue learning',
    lessons: 'lessons',
    completed: 'Completed',
    inProgress: 'In Progress',
    notStarted: 'Not Started',
    noCoursesYet: 'No Courses Yet',
    startLearningMessage: 'Start learning by enrolling in a course',
    browseCourses: 'Browse Courses',
    continueButton: 'Continue',
  },
  fr: {
    myLearning: 'Mon Apprentissage',
    trackProgress: 'Suivez vos progrès et continuez à apprendre',
    lessons: 'leçons',
    completed: 'Terminé',
    inProgress: 'En cours',
    notStarted: 'Non commencé',
    noCoursesYet: 'Aucun cours encore',
    startLearningMessage: 'Commencez à apprendre en vous inscrivant à un cours',
    browseCourses: 'Parcourir les cours',
    continueButton: 'Continuer',
  },
};

const MyCoursesScreen = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEnrollments = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await coursesService.getEnrollments();
      const allEnrollments = data.results || data;
      
      // Filter to show only online courses in My Courses
      // In-person courses should only show QR ticket, not in course list
      const onlineCourses = allEnrollments.filter(enrollment => 
        enrollment.course?.delivery_mode === 'online'
      );
      
      setEnrollments(onlineCourses);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEnrollments();
    });
    return unsubscribe;
  }, [navigation]);

  const renderEnrollmentCard = ({ item }) => {
    const course = item.course || {};
    const progress = item.progress_percentage || 0;

    return (
      <TouchableOpacity
        style={[styles.card, isTablet && styles.cardTablet]}
        onPress={() => navigation.navigate('CoursePlayer', { 
          courseId: course.id,
          enrollmentId: item.id 
        })}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: course.image || 'https://via.placeholder.com/300x200' }}
            style={styles.courseImage}
            resizeMode="cover"
          />
          {/* Progress indicator overlay */}
          {progress > 0 && (
            <View style={styles.imageOverlay}>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>{Math.round(progress)}%</Text>
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.title}
          </Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={14} color={theme.colors.gray[500]} />
              <Text style={styles.metaText}>
                {course.lessons_count || 0} {t('lessons')}
              </Text>
            </View>
            
            {course.duration && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={theme.colors.gray[500]} />
                  <Text style={styles.metaText}>{course.duration}</Text>
                </View>
              </>
            )}
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%` },
                  progress === 100 && styles.progressFillComplete
                ]} 
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>
              {progress === 100 ? t('completed') : progress > 0 ? t('continueButton') : t('notStarted')}
            </Text>
            <Ionicons 
              name={progress === 100 ? "checkmark-circle" : "arrow-forward"} 
              size={16} 
              color={progress === 100 ? "#10B981" : theme.colors.primary} 
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.iconContainer}>
          <Ionicons name="book" size={28} color="#2563EB" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>{t('myLearning')}</Text>
          <Text style={styles.headerSubtitle}>{t('trackProgress')}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.languageToggle}
        onPress={toggleLanguage}
      >
        <Ionicons name="language" size={18} color="#6B7280" />
        <Text style={styles.languageText}>
          {language === 'en' ? 'EN' : 'FR'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEnrollmentCard}
        ListHeaderComponent={renderHeader}
        numColumns={isTablet ? 2 : 1}
        key={isTablet ? 'tablet' : 'phone'}
        columnWrapperStyle={isTablet ? styles.columnWrapper : null}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadEnrollments(true)}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons 
                name="school-outline" 
                size={80} 
                color={theme.colors.gray[300]} 
              />
            </View>
            <Text style={styles.emptyTitle}>{t('noCoursesYet')}</Text>
            <Text style={styles.emptyText}>
              {t('startLearningMessage')}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('CoursesTab')}
            >
              <Text style={styles.browseButtonText}>{t('browseCourses')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardTablet: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: theme.colors.gray[100],
  },
  courseImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 12,
  },
  progressBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  progressFillComplete: {
    backgroundColor: '#10B981',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  browseButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});

export default MyCoursesScreen;