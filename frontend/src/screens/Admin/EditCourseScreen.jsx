/**
 * EditCourseScreen
 * Admin screen to edit an existing course
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
  Switch,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesService } from '../../api';
import theme from '../../theme';

const EditCourseScreen = ({ route, navigation }) => {
  const { courseId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    price: '0',
    image: '',
    category: 'medical',
    level: 'beginner',
    is_online: true,
    is_in_person: false,
    duration_weeks: '4',
    max_students: '30',
  });

  const categories = [
    { value: 'medical', label: 'Medical' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'dentistry', label: 'Dentistry' },
    { value: 'psychology', label: 'Psychology' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'other', label: 'Other' },
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const course = await coursesService.getCourse(courseId);
      setFormData({
        title: course.title || '',
        description: course.description || '',
        short_description: course.short_description || '',
        price: course.price?.toString() || '0',
        image: course.image || '',
        category: course.category || 'medical',
        level: course.level || 'beginner',
        is_online: course.is_online ?? true,
        is_in_person: course.is_in_person ?? false,
        duration_weeks: course.duration_weeks?.toString() || '4',
        max_students: course.max_students?.toString() || '30',
      });
    } catch (error) {
      console.error('Error loading course:', error);
      Alert.alert('Error', 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter a course description');
      return false;
    }
    if (!formData.short_description.trim()) {
      Alert.alert('Error', 'Please enter a short description');
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration_weeks: parseInt(formData.duration_weeks) || 4,
        max_students: parseInt(formData.max_students) || 30,
        is_published: true,
      };

      await coursesService.updateCourse(courseId, courseData);
      Alert.alert('Success', 'Course updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating course:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading course data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Edit Course</Text>

        {/* Manage Lessons Button */}
        <TouchableOpacity
          style={styles.manageLessonsButton}
          onPress={() => navigation.navigate('ManageCourseLessons', { 
            courseId: courseId,
            courseTitle: formData.title || 'Course'
          })}
        >
          <View style={styles.manageLessonsContent}>
            <Ionicons name="play-circle" size={24} color={theme.colors.primary} />
            <View style={styles.manageLessonsText}>
              <Text style={styles.manageLessonsTitle}>Manage Lessons</Text>
              <Text style={styles.manageLessonsSubtitle}>Add videos, PDFs and organize content</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.gray[400]} />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter course title"
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
          />
        </View>

        {/* Short Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Short Description</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief description"
            value={formData.short_description}
            onChangeText={(value) => updateField('short_description', value)}
            maxLength={500}
          />
        </View>

        {/* Image */}
        <View style={styles.section}>
          <Text style={styles.label}>Course Image URL</Text>
          {formData.image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => updateField('image', '')}
              >
                <Ionicons name="close-circle" size={30} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="https://example.com/course-image.jpg"
            value={formData.image}
            onChangeText={(value) => updateField('image', value)}
          />
          <Text style={styles.helperText}>Enter a URL to an image hosted online</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed course description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Price (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={formData.price}
            onChangeText={(value) => updateField('price', value)}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {categories.find(c => c.value === formData.category)?.label || 'Select Category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Level */}
        <View style={styles.section}>
          <Text style={styles.label}>Level</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowLevelModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {levels.find(l => l.value === formData.level)?.label || 'Select Level'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Duration (weeks)</Text>
          <TextInput
            style={styles.input}
            placeholder="4"
            value={formData.duration_weeks}
            onChangeText={(value) => updateField('duration_weeks', value)}
            keyboardType="number-pad"
          />
        </View>

        {/* Max Students */}
        <View style={styles.section}>
          <Text style={styles.label}>Max Students</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={formData.max_students}
            onChangeText={(value) => updateField('max_students', value)}
            keyboardType="number-pad"
          />
        </View>

        {/* Online/In-Person Switches */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Online Course</Text>
            <Switch
              value={formData.is_online}
              onValueChange={(value) => updateField('is_online', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_online ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>In-Person Course</Text>
            <Switch
              value={formData.is_in_person}
              onValueChange={(value) => updateField('is_in_person', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_in_person ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Update Button */}
        <TouchableOpacity
          style={[styles.updateButton, saving && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={saving}
        >
          <Text style={styles.updateButtonText}>
            {saving ? 'Updating...' : 'Update Course'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.modalOption,
                  formData.category === cat.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateField('category', cat.value);
                  setShowCategoryModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.category === cat.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {cat.label}
                </Text>
                {formData.category === cat.value && (
                  <Ionicons name="checkmark" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Level Modal */}
      <Modal
        visible={showLevelModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLevelModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLevelModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Level</Text>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.modalOption,
                  formData.level === level.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateField('level', level.value);
                  setShowLevelModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.level === level.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
                {formData.level === level.value && (
                  <Ionicons name="checkmark" size={24} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonDisabled: {
    opacity: 0.5,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  manageLessonsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  manageLessonsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  manageLessonsText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  manageLessonsTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  manageLessonsSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.gray[600],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalOptionSelected: {
    backgroundColor: '#EFF6FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: theme.colors.gray[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 15,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    marginTop: 4,
  },
});

export default EditCourseScreen;
