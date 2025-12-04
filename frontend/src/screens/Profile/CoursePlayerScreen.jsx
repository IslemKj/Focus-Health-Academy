/**
 * CoursePlayerScreen
 * View and complete course lessons
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Platform,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { coursesService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';
import CertificateModal from '../../components/CertificateModal';

const translations = {
  en: {
    error: 'Error',
    failedToLoadCourse: 'Failed to load course content. The course may not exist.',
    mustBeEnrolled: 'You must be enrolled to track progress',
    success: 'Success',
    lessonMarkedComplete: 'Lesson marked as complete!',
    progressNotAvailable: 'Lesson progress tracking is not available yet. Continue watching!',
    noLessonsAvailable: 'No lessons available',
    videoPlayerComingSoon: 'Video Player Coming Soon',
    minutes: 'minutes',
    description: 'Description',
    markAsComplete: 'Mark as Complete',
    completed: 'Completed',
    courseContent: 'Course Content',
    min: 'min',
    downloadPDF: 'Download PDF',
    openPDF: 'Open PDF',
    downloadingPDF: 'Downloading PDF...',
    pdfDownloaded: 'PDF downloaded successfully',
    pdfDownloadFailed: 'Failed to download PDF',
    lessonMaterials: 'Lesson Materials',
    overallProgress: 'Overall Progress',
    certificate: 'Certificate',
    downloadCertificate: 'Download Certificate',
    congratulations: 'Congratulations! 🎉',
    courseCompleted: 'You have completed this course!',
  },
  fr: {
    error: 'Erreur',
    failedToLoadCourse: 'Échec du chargement du contenu du cours. Le cours peut ne pas exister.',
    mustBeEnrolled: 'Vous devez être inscrit pour suivre la progression',
    success: 'Succès',
    lessonMarkedComplete: 'Leçon marquée comme terminée!',
    progressNotAvailable: 'Le suivi de la progression des leçons n\'est pas encore disponible. Continuez à regarder!',
    noLessonsAvailable: 'Aucune leçon disponible',
    videoPlayerComingSoon: 'Lecteur vidéo bientôt disponible',
    minutes: 'minutes',
    description: 'Description',
    markAsComplete: 'Marquer comme terminé',
    completed: 'Terminé',
    courseContent: 'Contenu du cours',
    min: 'min',
    downloadPDF: 'Télécharger PDF',
    openPDF: 'Ouvrir PDF',
    downloadingPDF: 'Téléchargement du PDF...',
    pdfDownloaded: 'PDF téléchargé avec succès',
    pdfDownloadFailed: 'Échec du téléchargement du PDF',
    lessonMaterials: 'Matériel de cours',
    overallProgress: 'Progression globale',
    certificate: 'Certificat',
    downloadCertificate: 'Télécharger le certificat',
    congratulations: 'Félicitations! 🎉',
    courseCompleted: 'Vous avez terminé ce cours!',
  },
};

const CoursePlayerScreen = ({ route, navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const { courseId, enrollmentId } = route.params;
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [loadingCertificate, setLoadingCertificate] = useState(false);
  const lastPositionRef = useRef({});
  
  // Create video player with initial source
  const [videoSource, setVideoSource] = useState(null);
  
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  // Update video source when lesson changes
  useEffect(() => {
    const updateVideoSource = async () => {
      if (currentLesson?.video_url && player) {
        try {
          setVideoSource(currentLesson.video_url);
          
          // Use replaceAsync instead of replace for iOS
          if (typeof player.replaceAsync === 'function') {
            await player.replaceAsync(currentLesson.video_url);
          } else {
            player.replace(currentLesson.video_url);
          }
          
          // Restore last watched position after a short delay
          setTimeout(() => {
            const savedPosition = lastPositionRef.current[currentLesson.id];
            if (savedPosition && savedPosition > 5) {
              player.currentTime = savedPosition;
            }
          }, 200);
        } catch (error) {
          console.log('Error updating video source:', error);
        }
      }
    };
    
    updateVideoSource();
  }, [currentLesson?.id]);

  // Monitor playback for auto-complete and position saving
  useEffect(() => {
    if (!player || !currentLesson?.id) return;

    const interval = setInterval(() => {
      const currentTime = player.currentTime;
      const duration = player.duration;

      // Save current position
      if (currentTime) {
        lastPositionRef.current[currentLesson.id] = currentTime;
      }

      // Auto-mark as complete when video reaches 90%
      if (currentTime && duration) {
        const percentage = (currentTime / duration) * 100;
        if (percentage >= 90 && !getLessonProgress(currentLesson.id)?.is_completed) {
          markLessonComplete(currentLesson.id);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [player, currentLesson?.id]);

  const loadCourseData = async () => {
    try {
      // Load course and lessons first
      const [courseData, lessonsData] = await Promise.all([
        coursesService.getCourse(courseId),
        coursesService.getLessons(courseId),
      ]);

      setCourse(courseData);
      setLessons(lessonsData.results || lessonsData);

      // Try to load progress if enrollment exists, but don't fail if it doesn't work
      if (enrollmentId) {
        try {
          const progressData = await coursesService.getEnrollmentProgress(enrollmentId);
          setProgress(progressData || []);
        } catch (progressError) {
          console.log('Progress not available:', progressError.message);
          setProgress([]);
        }
      }

      // Set first lesson as current if none selected
      if (lessonsData.results?.length > 0 || lessonsData.length > 0) {
        const firstLesson = lessonsData.results?.[0] || lessonsData[0];
        setCurrentLesson(firstLesson);
      }
    } catch (error) {
      console.error('Error loading course data:', error);
      Alert.alert(t('error'), t('failedToLoadCourse'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const getLessonProgress = (lessonId) => {
    return progress.find((p) => {
      // Handle both nested lesson object and lesson ID
      const progressLessonId = typeof p.lesson === 'object' ? p.lesson.id : p.lesson;
      return progressLessonId === lessonId;
    });
  };

  const markLessonComplete = async (lessonId) => {
    if (!enrollmentId) {
      Alert.alert(t('error'), t('mustBeEnrolled'));
      return;
    }

    // Prevent multiple simultaneous calls
    if (completingLesson) {
      return;
    }

    try {
      setCompletingLesson(true);
      await coursesService.markLessonComplete(enrollmentId, lessonId);
      
      // Only reload progress data, not everything
      const progressData = await coursesService.getEnrollmentProgress(enrollmentId);
      setProgress(progressData || []);
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      Alert.alert(t('error'), 'Failed to mark lesson as complete');
    } finally {
      setCompletingLesson(false);
    }
  };



  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex < lessons.length - 1) {
      setCurrentLesson(lessons[currentIndex + 1]);
      if (player) {
        player.pause();
      }
    }
  };

  const goToPreviousLesson = () => {
    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    if (currentIndex > 0) {
      setCurrentLesson(lessons[currentIndex - 1]);
      if (player) {
        player.pause();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateOverallProgress = () => {
    if (lessons.length === 0) return 0;
    const completedLessons = lessons.filter(lesson => 
      getLessonProgress(lesson.id)?.is_completed
    ).length;
    return Math.round((completedLessons / lessons.length) * 100);
  };

  const handleGetCertificate = async () => {
    if (!enrollmentId) return;
    
    setLoadingCertificate(true);
    try {
      const data = await coursesService.getCertificate(enrollmentId);
      console.log('Certificate data received:', data);
      setCertificateData(data);
      setShowCertificate(true);
    } catch (error) {
      console.error('Error fetching certificate:', error);
      Alert.alert(
        t('error'),
        error.response?.data?.error || 'You must complete 100% of the course to get your certificate.'
      );
    } finally {
      setLoadingCertificate(false);
    }
  };

  const handleDownloadPDF = async (pdfUrl, lessonTitle) => {
    try {
      setDownloading(true);
      Alert.alert(t('success'), t('downloadingPDF'));

      const filename = `${lessonTitle.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      const fileUri = FileSystem.documentDirectory + filename;

      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      Alert.alert(t('success'), t('pdfDownloaded'));
      
      // Open the downloaded PDF
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await Linking.openURL(uri);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      Alert.alert(t('error'), t('pdfDownloadFailed'));
    } finally {
      setDownloading(false);
    }
  };

  const handleOpenPDF = (pdfUrl) => {
    if (Platform.OS === 'web') {
      window.open(pdfUrl, '_blank');
    } else {
      setShowPDFViewer(true);
    }
  };

  const renderLessonItem = (lesson, index) => {
    const lessonProgress = getLessonProgress(lesson.id);
    const isCompleted = lessonProgress?.is_completed;
    const isCurrentLesson = currentLesson?.id === lesson.id;

    return (
      <TouchableOpacity
        key={lesson.id}
        style={[
          styles.lessonItem,
          isCurrentLesson && styles.lessonItemActive,
        ]}
        onPress={() => setCurrentLesson(lesson)}
      >
        <View style={styles.lessonItemLeft}>
          <View
            style={[
              styles.lessonNumber,
              isCompleted && styles.lessonNumberCompleted,
            ]}
          >
            {isCompleted ? (
              <Ionicons name="checkmark" size={16} color={theme.colors.white} />
            ) : (
              <Text style={styles.lessonNumberText}>{index + 1}</Text>
            )}
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDuration}>
              {lesson.duration} {t('min')} • {lesson.content_type}
            </Text>
          </View>
        </View>
        {isCurrentLesson && (
          <Ionicons
            name="play-circle"
            size={24}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!course || !currentLesson) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.gray[400]} />
        <Text style={styles.emptyText}>{t('noLessonsAvailable')}</Text>
      </View>
    );
  }

  const currentLessonProgress = getLessonProgress(currentLesson.id);
  const isCurrentLessonCompleted = currentLessonProgress?.is_completed;
  const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
  const hasNext = currentIndex < lessons.length - 1;
  const hasPrevious = currentIndex > 0;

  const overallProgress = calculateOverallProgress();
  const isCourseCompleted = overallProgress === 100;

  return (
    <View style={styles.container}>
      {/* Overall Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarHeader}>
          <Text style={styles.progressBarLabel}>{t('overallProgress')}</Text>
          <Text style={styles.progressBarPercentage}>{overallProgress}%</Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${overallProgress}%` }]} />
        </View>
      </View>

      {/* Video Player Area */}
      <View style={styles.playerContainer}>
        {currentLesson?.video_url && videoSource ? (
          <VideoView
            player={player}
            style={styles.video}
            nativeControls={true}
            contentFit="contain"
            allowsPictureInPicture={true}
          />
        ) : (
          <View style={styles.videoPlaceholder}>
            <Ionicons
              name="videocam-off-outline"
              size={80}
              color={theme.colors.white}
            />
            <Text style={styles.videoPlaceholderText}>
              {currentLesson?.video_url ? 'Loading video...' : 'No video available for this lesson'}
            </Text>
          </View>
        )}
      </View>

      {/* Lesson Navigation Controls */}
      <View style={styles.navigationBar}>
        <TouchableOpacity
          style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
          onPress={goToPreviousLesson}
          disabled={!hasPrevious}
        >
          <Ionicons 
            name="play-skip-back" 
            size={24} 
            color={hasPrevious ? theme.colors.primary : theme.colors.gray[400]} 
          />
          <Text style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.lessonCounter}>
          <Text style={styles.lessonCounterText}>
            Lesson {currentIndex + 1} of {lessons.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
          onPress={goToNextLesson}
          disabled={!hasNext}
        >
          <Text style={[styles.navButtonText, !hasNext && styles.navButtonTextDisabled]}>
            Next
          </Text>
          <Ionicons 
            name="play-skip-forward" 
            size={24} 
            color={hasNext ? theme.colors.primary : theme.colors.gray[400]} 
          />
        </TouchableOpacity>
      </View>

      {/* Lesson Content */}
      <ScrollView style={styles.content}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonMainTitle}>{currentLesson.title}</Text>
          <View style={styles.lessonMeta}>
            <Ionicons name="time-outline" size={16} color={theme.colors.gray[500]} />
            <Text style={styles.lessonMetaText}>{currentLesson.duration} {t('minutes')}</Text>
            <Ionicons
              name="document-text-outline"
              size={16}
              color={theme.colors.gray[500]}
              style={{ marginLeft: 16 }}
            />
            <Text style={styles.lessonMetaText}>{currentLesson.content_type}</Text>
          </View>
        </View>

        {currentLesson.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <Text style={styles.descriptionText}>{currentLesson.description}</Text>
          </View>
        )}

        {/* PDF Materials Section */}
        {currentLesson.pdf_url && (
          <View style={styles.materialsSection}>
            <Text style={styles.sectionTitle}>{t('lessonMaterials')}</Text>
            <View style={styles.pdfButtonsContainer}>
              <TouchableOpacity
                style={styles.pdfButton}
                onPress={() => handleOpenPDF(currentLesson.pdf_url)}
              >
                <Ionicons name="document-text" size={20} color={theme.colors.white} />
                <Text style={styles.pdfButtonText}>{t('openPDF')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.pdfButton, styles.pdfButtonSecondary]}
                onPress={() => handleDownloadPDF(currentLesson.pdf_url, currentLesson.title)}
                disabled={downloading}
              >
                <Ionicons 
                  name={downloading ? "hourglass" : "download"} 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <Text style={styles.pdfButtonTextSecondary}>
                  {downloading ? t('downloadingPDF') : t('downloadPDF')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isCurrentLessonCompleted && enrollmentId && (
          <Button
            title={completingLesson ? 'Completing...' : t('markAsComplete')}
            onPress={() => markLessonComplete(currentLesson.id)}
            leftIcon="checkmark-circle-outline"
            style={styles.completeButton}
            disabled={completingLesson}
            loading={completingLesson}
          />
        )}

        {isCurrentLessonCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.completedText}>{t('completed')}</Text>
          </View>
        )}

        {/* Certificate Section - Show when course is 100% complete */}
        {isCourseCompleted && (
          <View style={styles.certificateSection}>
            <View style={styles.certificateHeader}>
              <Ionicons name="ribbon" size={48} color={theme.colors.primary} />
              <Text style={styles.certificateTitle}>{t('congratulations')}</Text>
              <Text style={styles.certificateSubtitle}>{t('courseCompleted')}</Text>
            </View>
            <Button
              title={t('downloadCertificate')}
              onPress={handleGetCertificate}
              leftIcon="download-outline"
              style={styles.certificateButton}
              loading={loadingCertificate}
              disabled={loadingCertificate}
            />
          </View>
        )}

        {/* Lessons List */}
        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>{t('courseContent')}</Text>
          <View style={styles.lessonsList}>
            {lessons.map((lesson, index) => renderLessonItem(lesson, index))}
          </View>
        </View>
      </ScrollView>

      {/* PDF Viewer Modal */}
      {showPDFViewer && currentLesson.pdf_url && Platform.OS !== 'web' && (
        <View style={styles.pdfModal}>
          <View style={styles.pdfModalHeader}>
            <Text style={styles.pdfModalTitle}>{currentLesson.title}</Text>
            <TouchableOpacity
              onPress={() => setShowPDFViewer(false)}
              style={styles.pdfCloseButton}
            >
              <Ionicons name="close" size={28} color={theme.colors.gray[700]} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: currentLesson.pdf_url }}
            style={styles.pdfWebView}
            startInLoadingState={true}
            renderLoading={() => (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={styles.pdfLoading}
              />
            )}
          />
        </View>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        visible={showCertificate}
        onClose={() => setShowCertificate(false)}
        certificateData={certificateData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.md,
  },
  playerContainer: {
    backgroundColor: theme.colors.black,
    aspectRatio: 16 / 9,
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[800],
  },
  videoPlaceholderText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    marginTop: theme.spacing.md,
  },
  videoUrl: {
    color: theme.colors.gray[400],
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  navButtonTextDisabled: {
    color: theme.colors.gray[400],
  },
  lessonCounter: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.full,
  },
  lessonCounterText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[700],
  },
  content: {
    flex: 1,
  },
  lessonHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  lessonMainTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMetaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[500],
    marginLeft: theme.spacing.xs,
  },
  descriptionSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  descriptionText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    lineHeight: 24,
  },
  completeButton: {
    margin: theme.spacing.lg,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.success + '20',
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  completedText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
    marginLeft: theme.spacing.xs,
  },
  lessonsSection: {
    padding: theme.spacing.lg,
  },
  lessonsList: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  lessonItemActive: {
    backgroundColor: theme.colors.primary + '10',
  },
  lessonItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  lessonNumberCompleted: {
    backgroundColor: theme.colors.success,
  },
  lessonNumberText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.gray[600],
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  lessonDuration: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  progressBarContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressBarLabel: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  progressBarPercentage: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  materialsSection: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  pdfButtonsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  pdfButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  pdfButtonSecondary: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  pdfButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.white,
  },
  pdfButtonTextSecondary: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  certificateSection: {
    margin: theme.spacing.lg,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  certificateHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  certificateTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  certificateSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  certificateButton: {
    minWidth: 200,
  },
  pdfModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.white,
    zIndex: 1000,
  },
  pdfModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
    backgroundColor: theme.colors.white,
  },
  pdfModalTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  pdfCloseButton: {
    padding: theme.spacing.sm,
  },
  pdfWebView: {
    flex: 1,
  },
  pdfLoading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default CoursePlayerScreen;
