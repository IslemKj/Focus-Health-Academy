/**
 * CreateCourseScreen
 * Admin screen to create a new course
 */

import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { coursesService } from '../../api';
import theme from '../../theme';

const CreateCourseScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
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

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        updateField('image', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
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

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        duration_weeks: parseInt(formData.duration_weeks) || 4,
        max_students: parseInt(formData.max_students) || 30,
        is_published: true,
      };

      await coursesService.createCourse(courseData);
      Alert.alert('Success', 'Course created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Course Information</Text>

        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Introduction to Healthcare"
            value={formData.title}
            onChangeText={(value) => updateField('title', value)}
            maxLength={200}
          />
        </View>

        {/* Short Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Short Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="Brief summary (1-2 sentences)"
            value={formData.short_description}
            onChangeText={(value) => updateField('short_description', value)}
            maxLength={200}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Image */}
        <View style={styles.inputGroup}>
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
          <Text style={styles.helperText}>Enter a URL to an image hosted online (e.g., from Imgur, Cloudinary, etc.)</Text>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Detailed course description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={6}
          />
        </View>

        <Text style={styles.sectionTitle}>Course Details</Text>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {categories.find(c => c.value === formData.category)?.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Level */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Level</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowLevelModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {levels.find(l => l.value === formData.level)?.label}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
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

        {/* Duration */}
        <View style={styles.inputGroup}>
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
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Max Students</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={formData.max_students}
            onChangeText={(value) => updateField('max_students', value)}
            keyboardType="number-pad"
          />
        </View>

        <Text style={styles.sectionTitle}>Delivery Method</Text>

        {/* Online/In-Person Switches */}
        <View style={styles.switchGroup}>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Online Course</Text>
            <Switch
              value={formData.is_online}
              onValueChange={(value) => updateField('is_online', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_online ? '#2563EB' : '#F3F4F6'}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>In-Person Course</Text>
            <Switch
              value={formData.is_in_person}
              onValueChange={(value) => updateField('is_in_person', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_in_person ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Create Course</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
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
    height: 120,
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
    color: theme.colors.primary,
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
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  imageButtonText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 8,
    marginTop: 4,
  },
  modalOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '600',
  },
  switchGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateCourseScreen;
