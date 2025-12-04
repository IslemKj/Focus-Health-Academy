/**
 * CreateEventScreen
 * Admin screen to create a new event
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { eventsService } from '../../api/events';

const CreateEventScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [showEventTypeModal, setShowEventTypeModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    image: '',
    event_type: 'seminar',
    price: '0',
    is_online: true,
    is_in_person: false,
    venue: '',
    city: '',
    country: '',
    meeting_url: '',
    max_attendees: '0',
  });

  const eventTypes = [
    { value: 'seminar', label: 'Seminar' },
    { value: 'congress', label: 'Congress' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'conference', label: 'Conference' },
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

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimeForDisplay = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDateTimeForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setStartDate(newDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setEndDate(newDate);
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'Please enter an event description');
      return false;
    }
    if (endDate <= startDate) {
      Alert.alert('Error', 'End date must be after start date');
      return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const eventData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        max_attendees: parseInt(formData.max_attendees) || 0,
        start_date: formatDateTimeForAPI(startDate),
        end_date: formatDateTimeForAPI(endDate),
        is_published: true,
      };

      await eventsService.createEvent(eventData);
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Create New Event</Text>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter event title"
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
          <Text style={styles.label}>Event Image URL</Text>
          {formData.image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.image }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => updateField('image', '')}
              >
                <Ionicons name="close-circle" size={30} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : null}
          <TextInput
            style={styles.input}
            placeholder="https://example.com/event-image.jpg"
            value={formData.image}
            onChangeText={(value) => updateField('image', value)}
          />
          <Text style={styles.helperText}>Enter a URL to an image hosted online (e.g., from Imgur, Cloudinary, etc.)</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter detailed event description"
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Event Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Event Type</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowEventTypeModal(true)}
          >
            <Text style={styles.selectButtonText}>
              {eventTypes.find(t => t.value === formData.event_type)?.label || 'Select Type'}
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

        {/* Start Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date & Time *</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateButton, { flex: 1, marginRight: 8 }]}
              onPress={() => setShowStartDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>{formatDateForDisplay(startDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { flex: 1 }]}
              onPress={() => setShowStartTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>{formatTimeForDisplay(startDate)}</Text>
            </TouchableOpacity>
          </View>
          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display="default"
              onChange={onStartDateChange}
            />
          )}
          {showStartTimePicker && (
            <DateTimePicker
              value={startDate}
              mode="time"
              display="default"
              onChange={onStartTimeChange}
            />
          )}
        </View>

        {/* End Date */}
        <View style={styles.section}>
          <Text style={styles.label}>End Date & Time *</Text>
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={[styles.dateButton, { flex: 1, marginRight: 8 }]}
              onPress={() => setShowEndDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>{formatDateForDisplay(endDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateButton, { flex: 1 }]}
              onPress={() => setShowEndTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#6B7280" />
              <Text style={styles.dateButtonText}>{formatTimeForDisplay(endDate)}</Text>
            </TouchableOpacity>
          </View>
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display="default"
              onChange={onEndDateChange}
            />
          )}
          {showEndTimePicker && (
            <DateTimePicker
              value={endDate}
              mode="time"
              display="default"
              onChange={onEndTimeChange}
            />
          )}
        </View>

        {/* Online/In-Person */}
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Online Event</Text>
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
            <Text style={styles.label}>In-Person Event</Text>
            <Switch
              value={formData.is_in_person}
              onValueChange={(value) => updateField('is_in_person', value)}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={formData.is_in_person ? '#2563EB' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Meeting URL (for online events) */}
        {formData.is_online && (
          <View style={styles.section}>
            <Text style={styles.label}>Meeting URL</Text>
            <TextInput
              style={styles.input}
              placeholder="Zoom, Teams, or other meeting link"
              value={formData.meeting_url}
              onChangeText={(value) => updateField('meeting_url', value)}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        )}

        {/* Venue (for in-person events) */}
        {formData.is_in_person && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Venue</Text>
              <TextInput
                style={styles.input}
                placeholder="Event venue name"
                value={formData.venue}
                onChangeText={(value) => updateField('venue', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                value={formData.city}
                onChangeText={(value) => updateField('city', value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Country"
                value={formData.country}
                onChangeText={(value) => updateField('country', value)}
              />
            </View>
          </>
        )}

        {/* Max Attendees */}
        <View style={styles.section}>
          <Text style={styles.label}>Max Attendees</Text>
          <TextInput
            style={styles.input}
            placeholder="0 for unlimited"
            value={formData.max_attendees}
            onChangeText={(value) => updateField('max_attendees', value)}
            keyboardType="number-pad"
          />
        </View>

        {/* Create Button */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Event Type Modal */}
      <Modal
        visible={showEventTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEventTypeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEventTypeModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event Type</Text>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.modalOption,
                  formData.event_type === type.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  updateField('event_type', type.value);
                  setShowEventTypeModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.event_type === type.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {type.label}
                </Text>
                {formData.event_type === type.value && (
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
    minHeight: 100,
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
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  createButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
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
    backgroundColor: '#F3F4F6',
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    marginTop: 4,
  },
});

export default CreateEventScreen;
