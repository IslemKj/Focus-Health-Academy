/**
 * Modern ChangePasswordScreen
 * Responsive multilingual change user password interface
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Translations
const translations = {
  en: {
    title: 'Change Password',
    subtitle: 'Update your account password',
    infoTitle: 'Password Requirements',
    infoText: 'Choose a strong password with at least 8 characters, including letters, numbers, and symbols.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    changePasswordButton: 'Change Password',
    cancel: 'Cancel',
    // Placeholders
    enterCurrentPassword: 'Enter current password',
    enterNewPassword: 'Enter new password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    // Validation
    currentPasswordRequired: 'Current password is required',
    newPasswordRequired: 'New password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    confirmPasswordRequired: 'Please confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    // Alerts
    success: 'Success',
    passwordChanged: 'Password changed successfully!',
    error: 'Error',
    failedToChange: 'Failed to change password',
    ok: 'OK',
    // Password strength
    weak: 'Weak',
    medium: 'Medium',
    strong: 'Strong',
    passwordStrength: 'Password Strength',
  },
  fr: {
    title: 'Changer le Mot de Passe',
    subtitle: 'Mettez à jour le mot de passe de votre compte',
    infoTitle: 'Exigences du Mot de Passe',
    infoText: 'Choisissez un mot de passe fort d\'au moins 8 caractères, incluant des lettres, des chiffres et des symboles.',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmNewPassword: 'Confirmer le Nouveau Mot de Passe',
    changePasswordButton: 'Changer le Mot de Passe',
    cancel: 'Annuler',
    // Placeholders
    enterCurrentPassword: 'Entrez le mot de passe actuel',
    enterNewPassword: 'Entrez le nouveau mot de passe',
    confirmNewPasswordPlaceholder: 'Confirmez le nouveau mot de passe',
    // Validation
    currentPasswordRequired: 'Le mot de passe actuel est requis',
    newPasswordRequired: 'Le nouveau mot de passe est requis',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    // Alerts
    success: 'Succès',
    passwordChanged: 'Mot de passe changé avec succès !',
    error: 'Erreur',
    failedToChange: 'Échec du changement de mot de passe',
    ok: 'OK',
    // Password strength
    weak: 'Faible',
    medium: 'Moyen',
    strong: 'Fort',
    passwordStrength: 'Force du Mot de Passe',
  },
};

const ChangePasswordScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { t, language, setLanguage } = useTranslation(translations);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return null;
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) return { level: 'weak', color: '#EF4444', text: t('weak') };
    if (strength <= 4) return { level: 'medium', color: '#F59E0B', text: t('medium') };
    return { level: 'strong', color: '#10B981', text: t('strong') };
  };

  const passwordStrength = calculatePasswordStrength(formData.newPassword);

  const validate = () => {
    const newErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = t('currentPasswordRequired');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('newPasswordRequired');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('passwordTooShort');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('confirmPasswordRequired');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.changePassword(formData.oldPassword, formData.newPassword);
      Alert.alert(
        t('success'),
        t('passwordChanged'),
        [
          {
            text: t('ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      const errorData = error.response?.data;
      Alert.alert(
        t('error'),
        errorData?.old_password?.[0] || errorData?.detail || t('failedToChange')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <ScrollView 
      style={styles.container} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Language Toggle */}
        <TouchableOpacity 
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Ionicons name="language" size={18} color="#2563EB" />
          <Text style={styles.languageText}>
            {language === 'en' ? 'EN' : 'FR'}
          </Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={32} color="#2563EB" />
          </View>
          <Text style={styles.title}>{t('title')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#2563EB" />
            <Text style={styles.infoTitle}>{t('infoTitle')}</Text>
          </View>
          <Text style={styles.infoText}>
            {t('infoText')}
          </Text>
          
          {/* Password requirements checklist */}
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={formData.newPassword.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={formData.newPassword.length >= 8 ? "#10B981" : "#9CA3AF"} 
              />
              <Text style={[
                styles.requirementText,
                formData.newPassword.length >= 8 && styles.requirementMet
              ]}>
                At least 8 characters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) ? "#10B981" : "#9CA3AF"} 
              />
              <Text style={[
                styles.requirementText,
                /[A-Z]/.test(formData.newPassword) && /[a-z]/.test(formData.newPassword) && styles.requirementMet
              ]}>
                Upper & lowercase letters
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/\d/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/\d/.test(formData.newPassword) ? "#10B981" : "#9CA3AF"} 
              />
              <Text style={[
                styles.requirementText,
                /\d/.test(formData.newPassword) && styles.requirementMet
              ]}>
                At least one number
              </Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons 
                name={/[^a-zA-Z\d]/.test(formData.newPassword) ? "checkmark-circle" : "ellipse-outline"} 
                size={16} 
                color={/[^a-zA-Z\d]/.test(formData.newPassword) ? "#10B981" : "#9CA3AF"} 
              />
              <Text style={[
                styles.requirementText,
                /[^a-zA-Z\d]/.test(formData.newPassword) && styles.requirementMet
              ]}>
                At least one symbol
              </Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label={`${t('currentPassword')} *`}
            value={formData.oldPassword}
            onChangeText={(value) => handleChange('oldPassword', value)}
            placeholder={t('enterCurrentPassword')}
            secureTextEntry={!showOldPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showOldPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowOldPassword(!showOldPassword)}
            error={errors.oldPassword}
            style={styles.input}
          />

          <Input
            label={`${t('newPassword')} *`}
            value={formData.newPassword}
            onChangeText={(value) => handleChange('newPassword', value)}
            placeholder={t('enterNewPassword')}
            secureTextEntry={!showNewPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showNewPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
            style={styles.input}
          />

          {/* Password Strength Indicator */}
          {formData.newPassword && passwordStrength && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>{t('passwordStrength')}:</Text>
              <View style={styles.strengthBarContainer}>
                <View 
                  style={[
                    styles.strengthBar,
                    { 
                      width: passwordStrength.level === 'weak' ? '33%' : 
                             passwordStrength.level === 'medium' ? '66%' : '100%',
                      backgroundColor: passwordStrength.color 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.text}
              </Text>
            </View>
          )}

          <Input
            label={`${t('confirmNewPassword')} *`}
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            placeholder={t('confirmNewPasswordPlaceholder')}
            secureTextEntry={!showConfirmPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            style={styles.input}
          />

          <Button
            title={t('changePasswordButton')}
            onPress={handleChangePassword}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />

          <Button
            title={t('cancel')}
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    padding: isTablet ? 40 : 24,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    gap: 6,
  },
  languageText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: isTablet ? 32 : 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isTablet ? 17 : 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#EEF2FF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 16,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#6B7280',
  },
  requirementMet: {
    color: '#10B981',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: isTablet ? 32 : 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    marginBottom: 16,
  },
  strengthContainer: {
    marginBottom: 16,
    marginTop: -8,
  },
  strengthLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
  },
  cancelButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
  },
});

export default ChangePasswordScreen;