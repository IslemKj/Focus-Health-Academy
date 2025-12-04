/**
 * ManageCourseLessonsScreen
 * Admin screen to manage lessons for a course (CRUD operations)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { coursesService } from '../../api';
import theme from '../../theme';

const ManageCourseLessonsScreen = ({ route, navigation }) => {
  const { courseId, courseTitle } = route.params;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    video_url: '',
    pdf_url: '',
    duration: '10',
    order: '1',
    content_type: 'video',
  });

  const contentTypes = [
    { value: 'video', label: 'Video', icon: 'videocam' },
    { value: 'reading', label: 'Reading', icon: 'book' },
    { value: 'quiz', label: 'Quiz', icon: 'help-circle' },
    { value: 'assignment', label: 'Assignment', icon: 'document-text' },
  ];

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await coursesService.getLessons(courseId);
      const lessonsList = response.results || response;
      // Sort by order
      const sortedLessons = lessonsList.sort((a, b) => a.order - b.order);
      setLessons(sortedLessons);
    } catch (error) {
      console.error('Error loading lessons:', error);
      Alert.alert('Error', 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingLesson(null);
    setLessonForm({
      title: '',
      description: '',
      video_url: '',
      pdf_url: '',
      duration: '10',
      order: (lessons.length + 1).toString(),
      content_type: 'video',
    });
    setShowLessonModal(true);
  };

  const openEditModal = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      description: lesson.description || '',
      video_url: lesson.video_url || '',
      pdf_url: lesson.pdf_url || '',
      duration: lesson.duration?.toString() || '10',
      order: lesson.order?.toString() || '1',
      content_type: lesson.content_type || 'video',
    });
    setShowLessonModal(true);
  };

  const closeModal = () => {
    setShowLessonModal(false);
    setEditingLesson(null);
  };

  const handleSaveLesson = async () => {
    if (!lessonForm.title.trim()) {
      Alert.alert('Error', 'Please enter a lesson title');
      return;
    }

    try {
      setSaving(true);
      const lessonData = {
        ...lessonForm,
        course: courseId,
        duration: parseInt(lessonForm.duration) || 10,
        order: parseInt(lessonForm.order) || 1,
      };

      if (editingLesson) {
        await coursesService.updateLesson(editingLesson.id, lessonData);
        Alert.alert('Success', 'Lesson updated successfully');
      } else {
        await coursesService.createLesson(lessonData);
        Alert.alert('Success', 'Lesson created successfully');
      }

      closeModal();
      loadLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = (lesson) => {
    Alert.alert(
      'Delete Lesson',
      `Are you sure you want to delete "${lesson.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await coursesService.deleteLesson(lesson.id);
              Alert.alert('Success', 'Lesson deleted successfully');
              loadLessons();
            } catch (error) {
              console.error('Error deleting lesson:', error);
              Alert.alert('Error', 'Failed to delete lesson');
            }
          },
        },
      ]
    );
  };

  const renderLessonItem = (lesson, index) => {
    const contentType = contentTypes.find(ct => ct.value === lesson.content_type) || contentTypes[0];
    
    return (
      <View key={lesson.id} style={styles.lessonCard}>
        <View style={styles.lessonHeader}>
          <View style={styles.lessonNumberBadge}>
            <Text style={styles.lessonNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <View style={styles.lessonMetaRow}>
              <Ionicons name={contentType.icon} size={14} color={theme.colors.gray[500]} />
              <Text style={styles.lessonMeta}>{contentType.label}</Text>
              <Ionicons name="time-outline" size={14} color={theme.colors.gray[500]} style={{ marginLeft: 12 }} />
              <Text style={styles.lessonMeta}>{lesson.duration} min</Text>
            </View>
          </View>
        </View>

        <View style={styles.lessonActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(lesson)}
          >
            <Ionicons name="pencil" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteLesson(lesson)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>

        {(lesson.video_url || lesson.pdf_url) && (
          <View style={styles.lessonResources}>
            {lesson.video_url && (
              <View style={styles.resourceTag}>
                <Ionicons name="videocam" size={12} color={theme.colors.primary} />
                <Text style={styles.resourceText}>Video</Text>
              </View>
            )}
            {lesson.pdf_url && (
              <View style={styles.resourceTag}>
                <Ionicons name="document-text" size={12} color={theme.colors.success} />
                <Text style={styles.resourceText}>PDF</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderLessonModal = () => {
    return (
      <Modal
        visible={showLessonModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Ionicons name="close" size={28} color={theme.colors.gray[700]} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Lesson Title *</Text>
              <TextInput
                style={styles.input}
                value={lessonForm.title}
                onChangeText={(text) => setLessonForm({ ...lessonForm, title: text })}
                placeholder="Enter lesson title"
                placeholderTextColor={theme.colors.gray[400]}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={lessonForm.description}
                onChangeText={(text) => setLessonForm({ ...lessonForm, description: text })}
                placeholder="Enter lesson description"
                placeholderTextColor={theme.colors.gray[400]}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Content Type */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Content Type</Text>
              <View style={styles.contentTypeGrid}>
                {contentTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.contentTypeButton,
                      lessonForm.content_type === type.value && styles.contentTypeButtonActive,
                    ]}
                    onPress={() => setLessonForm({ ...lessonForm, content_type: type.value })}
                  >
                    <Ionicons
                      name={type.icon}
                      size={24}
                      color={lessonForm.content_type === type.value ? theme.colors.white : theme.colors.gray[600]}
                    />
                    <Text
                      style={[
                        styles.contentTypeText,
                        lessonForm.content_type === type.value && styles.contentTypeTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Video URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Video URL
                <Text style={styles.labelHint}> (Direct MP4 link recommended)</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={lessonForm.video_url}
                onChangeText={(text) => setLessonForm({ ...lessonForm, video_url: text })}
                placeholder="https://example.com/video.mp4"
                placeholderTextColor={theme.colors.gray[400]}
                autoCapitalize="none"
                keyboardType="url"
              />
              <View style={styles.videoHintBox}>
                <Ionicons name="information-circle-outline" size={16} color={theme.colors.warning} />
                <Text style={styles.videoHintText}>
                  Use direct video links (.mp4, .m3u8). YouTube/Vimeo watch URLs don't work on mobile.
                  Host videos on services like Cloudinary, AWS S3, or Google Drive (direct link).
                </Text>
              </View>
            </View>

            {/* PDF URL */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                PDF Materials URL
                <Text style={styles.labelHint}> (Direct link to PDF)</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={lessonForm.pdf_url}
                onChangeText={(text) => setLessonForm({ ...lessonForm, pdf_url: text })}
                placeholder="https://example.com/lesson-materials.pdf"
                placeholderTextColor={theme.colors.gray[400]}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Duration and Order */}
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Duration (min)</Text>
                <TextInput
                  style={styles.input}
                  value={lessonForm.duration}
                  onChangeText={(text) => setLessonForm({ ...lessonForm, duration: text })}
                  placeholder="10"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Order</Text>
                <TextInput
                  style={styles.input}
                  value={lessonForm.order}
                  onChangeText={(text) => setLessonForm({ ...lessonForm, order: text })}
                  placeholder="1"
                  placeholderTextColor={theme.colors.gray[400]}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
              <Text style={styles.infoText}>
                URLs must be direct links. For YouTube videos, use the full watch URL or embed link.
                For PDFs, use services like Google Drive, Dropbox, or direct hosting.
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.modalFooter}>
            <Button
              title={editingLesson ? 'Update Lesson' : 'Create Lesson'}
              onPress={handleSaveLesson}
              loading={saving}
              disabled={saving}
              leftIcon={editingLesson ? 'checkmark-circle' : 'add-circle'}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.gray[700]} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Manage Lessons</Text>
          <Text style={styles.headerSubtitle}>{courseTitle}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {lessons.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-off-outline" size={64} color={theme.colors.gray[400]} />
            <Text style={styles.emptyText}>No lessons yet</Text>
            <Text style={styles.emptySubtext}>Create your first lesson to get started</Text>
          </View>
        ) : (
          <View style={styles.lessonsList}>
            {lessons.map((lesson, index) => renderLessonItem(lesson, index))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
        <Ionicons name="add" size={32} color={theme.colors.white} />
      </TouchableOpacity>

      {renderLessonModal()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.gray[600],
    marginTop: theme.spacing.lg,
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  lessonsList: {
    padding: theme.spacing.lg,
  },
  lessonCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray[200],
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  lessonNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  lessonNumberText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  lessonMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonMeta: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  lessonActions: {
    flexDirection: 'row',
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  lessonResources: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  resourceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  resourceText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  labelHint: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.normal,
    color: theme.colors.gray[500],
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  contentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  contentTypeButton: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
  },
  contentTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  contentTypeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.gray[700],
    marginTop: theme.spacing.xs,
  },
  contentTypeTextActive: {
    color: theme.colors.white,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[700],
    marginLeft: theme.spacing.sm,
    lineHeight: 20,
  },
  videoHintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.warning + '15',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  videoHintText: {
    flex: 1,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.gray[700],
    marginLeft: theme.spacing.xs,
    lineHeight: 16,
  },
  modalFooter: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
});

export default ManageCourseLessonsScreen;
