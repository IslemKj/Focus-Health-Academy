/**
 * CreatePostScreen
 * Create a new timeline post
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components';
import { timelineService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    createPost: 'Create Post',
    whatsOnYourMind: 'What\'s on your mind?',
    photo: 'Photo',
    post: 'Post',
    posting: 'Posting...',
    error: 'Error',
    writeSomething: 'Please write something to post',
    success: 'Success',
    postCreatedSuccess: 'Post created successfully',
    failedToCreatePost: 'Failed to create post',
    selectImageSource: 'Select Image Source',
    camera: 'Camera',
    gallery: 'Gallery',
    cancel: 'Cancel',
    permissionRequired: 'Permission Required',
    cameraPermissionMessage: 'We need camera permission to take photos',
    galleryPermissionMessage: 'We need gallery permission to select photos',
  },
  fr: {
    createPost: 'Créer une publication',
    whatsOnYourMind: 'À quoi pensez-vous?',
    photo: 'Photo',
    post: 'Publier',
    posting: 'Publication en cours...',
    error: 'Erreur',
    writeSomething: 'Veuillez écrire quelque chose à publier',
    success: 'Succès',
    postCreatedSuccess: 'Publication créée avec succès',
    failedToCreatePost: 'Échec de la création de la publication',
    selectImageSource: 'Sélectionner la source de l\'image',
    camera: 'Appareil photo',
    gallery: 'Galerie',
    cancel: 'Annuler',
    permissionRequired: 'Permission requise',
    cameraPermissionMessage: 'Nous avons besoin de la permission de la caméra pour prendre des photos',
    galleryPermissionMessage: 'Nous avons besoin de la permission de la galerie pour sélectionner des photos',
  },
};

const CreatePostScreen = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert(t('error'), t('writeSomething'));
      return;
    }

    setLoading(true);
    try {
      // Pass content and image separately (not as FormData)
      await timelineService.createPost(content.trim(), selectedImage);
      Alert.alert(t('success'), t('postCreatedSuccess'));
      navigation.goBack();
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert(
        t('error'),
        error.response?.data?.content?.[0] || 
        error.response?.data?.error || 
        t('failedToCreatePost')
      );
    } finally {
      setLoading(false);
    }
  };

  const showImageSourceOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('cancel'), t('camera'), t('gallery')],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            pickImageFromCamera();
          } else if (buttonIndex === 2) {
            pickImageFromGallery();
          }
        }
      );
    } else {
      Alert.alert(
        t('selectImageSource'),
        '',
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('camera'), onPress: pickImageFromCamera },
          { text: t('gallery'), onPress: pickImageFromGallery },
        ],
        { cancelable: true }
      );
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired'), t('cameraPermissionMessage'));
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert(t('error'), 'Failed to take photo');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permissionRequired'), t('galleryPermissionMessage'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert(t('error'), 'Failed to select image');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={28} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('createPost')}</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder={t('whatsOnYourMind')}
            placeholderTextColor={theme.colors.gray[400]}
            multiline
            autoFocus
            textAlignVertical="top"
          />

          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={showImageSourceOptions}
          >
            <Ionicons name="image-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.toolbarText}>{t('photo')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={loading ? t('posting') : t('post')}
          onPress={handlePost}
          loading={loading}
          disabled={!content.trim()}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 36,
  },
  inputContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
    minHeight: 200,
  },
  imagePreview: {
    marginTop: theme.spacing.md,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme.colors.gray[200],
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 14,
  },
  toolbar: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.gray[100],
    borderRadius: 20,
  },
  toolbarText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.primary,
    marginLeft: 6,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background.paper,
  },
});

export default CreatePostScreen;
