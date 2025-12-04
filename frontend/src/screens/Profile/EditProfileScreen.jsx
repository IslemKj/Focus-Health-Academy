/**
 * EditProfileScreen
 * Edit user profile information
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { authService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    tapToChangePhoto: 'Tap to change photo',
    personalInformation: 'Personal Information',
    firstName: 'First Name',
    enterFirstName: 'Enter your first name',
    lastName: 'Last Name',
    enterLastName: 'Enter your last name',
    email: 'Email',
    enterEmail: 'Enter your email',
    phone: 'Phone',
    enterPhone: 'Enter your phone number',
    about: 'About',
    bio: 'Bio',
    tellUsAbout: 'Tell us about yourself',
    location: 'Location',
    city: 'City',
    enterCity: 'Enter your city',
    country: 'Country',
    enterCountry: 'Enter your country',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    success: 'Success',
    profileUpdatedSuccess: 'Profile updated successfully!',
    ok: 'OK',
    error: 'Error',
    failedToUpdateProfile: 'Failed to update profile',
  },
  fr: {
    tapToChangePhoto: 'Appuyez pour changer la photo',
    personalInformation: 'Informations personnelles',
    firstName: 'Prénom',
    enterFirstName: 'Entrez votre prénom',
    lastName: 'Nom',
    enterLastName: 'Entrez votre nom',
    email: 'E-mail',
    enterEmail: 'Entrez votre e-mail',
    phone: 'Téléphone',
    enterPhone: 'Entrez votre numéro de téléphone',
    about: 'À propos',
    bio: 'Biographie',
    tellUsAbout: 'Parlez-nous de vous',
    location: 'Localisation',
    city: 'Ville',
    enterCity: 'Entrez votre ville',
    country: 'Pays',
    enterCountry: 'Entrez votre pays',
    saveChanges: 'Enregistrer les modifications',
    cancel: 'Annuler',
    firstNameRequired: 'Le prénom est requis',
    lastNameRequired: 'Le nom est requis',
    emailRequired: 'L\'e-mail est requis',
    emailInvalid: 'L\'e-mail est invalide',
    success: 'Succès',
    profileUpdatedSuccess: 'Profil mis à jour avec succès!',
    ok: 'OK',
    error: 'Erreur',
    failedToUpdateProfile: 'Échec de la mise à jour du profil',
  },
};

const EditProfileScreen = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        city: data.city || '',
        country: data.country || '',
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_name) {
      newErrors.first_name = t('firstNameRequired');
    }

    if (!formData.last_name) {
      newErrors.last_name = t('lastNameRequired');
    }

    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.updateProfile(formData);
      Alert.alert(t('success'), t('profileUpdatedSuccess'), [
        {
          text: t('ok'),
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        setErrors(errorData);
      }
      Alert.alert(t('error'), t('failedToUpdateProfile'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <View style={styles.avatarOverlay}>
            <Ionicons name="camera" size={24} color={theme.colors.white} />
          </View>
        </TouchableOpacity>
        <Text style={styles.avatarHint}>{t('tapToChangePhoto')}</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>{t('personalInformation')}</Text>

        <Input
          label={`${t('firstName')} *`}
          value={formData.first_name}
          onChangeText={(value) => handleChange('first_name', value)}
          placeholder={t('enterFirstName')}
          leftIcon="person-outline"
          error={errors.first_name}
        />

        <Input
          label={`${t('lastName')} *`}
          value={formData.last_name}
          onChangeText={(value) => handleChange('last_name', value)}
          placeholder={t('enterLastName')}
          leftIcon="person-outline"
          error={errors.last_name}
        />

        <Input
          label={`${t('email')} *`}
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder={t('enterEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
          error={errors.email}
        />

        <Input
          label={t('phone')}
          value={formData.phone}
          onChangeText={(value) => handleChange('phone', value)}
          placeholder={t('enterPhone')}
          keyboardType="phone-pad"
          leftIcon="call-outline"
          error={errors.phone}
        />

        <Text style={styles.sectionTitle}>{t('about')}</Text>

        <Input
          label={t('bio')}
          value={formData.bio}
          onChangeText={(value) => handleChange('bio', value)}
          placeholder={t('tellUsAbout')}
          multiline
          numberOfLines={4}
          error={errors.bio}
        />

        <Text style={styles.sectionTitle}>{t('location')}</Text>

        <Input
          label={t('city')}
          value={formData.city}
          onChangeText={(value) => handleChange('city', value)}
          placeholder={t('enterCity')}
          leftIcon="location-outline"
          error={errors.city}
        />

        <Input
          label={t('country')}
          value={formData.country}
          onChangeText={(value) => handleChange('country', value)}
          placeholder={t('enterCountry')}
          leftIcon="globe-outline"
          error={errors.country}
        />

        <Button
          title={t('saveChanges')}
          onPress={handleSave}
          loading={loading}
          fullWidth
          style={styles.saveButton}
        />

        <Button
          title={t('cancel')}
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          style={styles.cancelButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.white,
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.white,
  },
  avatarHint: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  saveButton: {
    marginTop: theme.spacing.xl,
  },
  cancelButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
});

export default EditProfileScreen;
