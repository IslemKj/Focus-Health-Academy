/**
 * Modern RegisterScreen
 * Responsive multilingual user registration interface with logo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');

// Translations
const translations = {
  en: {
    createAccount: 'Create Account',
    subtitle: 'Join Focus Health Academy today',
    email: 'Email',
    username: 'Username',
    firstName: 'First Name',
    lastName: 'Last Name',
    phone: 'Phone',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccountButton: 'Create Account',
    alreadyHaveAccount: 'Already have an account? ',
    signIn: 'Sign In',
    required: '*',
    // Placeholders
    enterEmail: 'Enter your email',
    chooseUsername: 'Choose a username',
    enterFirstName: 'First name',
    enterLastName: 'Last name',
    enterPhone: 'Your phone number',
    createPassword: 'Create a password',
    confirmYourPassword: 'Confirm your password',
    // Validation errors
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    usernameRequired: 'Username is required',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    passwordRequired: 'Password is required',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsDoNotMatch: 'Passwords do not match',
    // Alerts
    success: 'Success',
    accountCreated: 'Account created successfully!',
    registrationFailed: 'Registration Failed',
    checkInformation: 'Please check your information and try again',
    // Consent
    agreeToTerms: 'I agree to the ',
    termsAndConditions: 'Terms & Conditions',
    and: ' and ',
    privacyPolicy: 'Privacy Policy',
    mustAgreeToTerms: 'You must agree to the Terms & Conditions and Privacy Policy',
  },
  fr: {
    createAccount: 'Créer un Compte',
    subtitle: 'Rejoignez Focus Health Academy aujourd\'hui',
    email: 'Email',
    username: 'Nom d\'utilisateur',
    firstName: 'Prénom',
    lastName: 'Nom',
    phone: 'Téléphone',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    createAccountButton: 'Créer un Compte',
    alreadyHaveAccount: 'Vous avez déjà un compte ? ',
    signIn: 'Se Connecter',
    required: '*',
    // Placeholders
    enterEmail: 'Entrez votre email',
    chooseUsername: 'Choisissez un nom d\'utilisateur',
    enterFirstName: 'Prénom',
    enterLastName: 'Nom',
    enterPhone: 'Votre numéro de téléphone',
    createPassword: 'Créez un mot de passe',
    confirmYourPassword: 'Confirmez votre mot de passe',
    // Validation errors
    emailRequired: 'L\'email est requis',
    emailInvalid: 'L\'email est invalide',
    usernameRequired: 'Le nom d\'utilisateur est requis',
    firstNameRequired: 'Le prénom est requis',
    lastNameRequired: 'Le nom est requis',
    passwordRequired: 'Le mot de passe est requis',
    passwordTooShort: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    // Alerts
    success: 'Succès',
    accountCreated: 'Compte créé avec succès !',
    registrationFailed: 'Échec de l\'inscription',
    checkInformation: 'Veuillez vérifier vos informations et réessayer',
    // Consent
    agreeToTerms: 'J\'accepte les ',
    termsAndConditions: 'Conditions Générales',
    and: ' et la ',
    privacyPolicy: 'Politique de Confidentialité',
    mustAgreeToTerms: 'Vous devez accepter les Conditions Générales et la Politique de Confidentialité',
  },
};

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { t, language, setLanguage } = useTranslation(translations);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('emailInvalid');
    }

    if (!formData.username) {
      newErrors.username = t('usernameRequired');
    }

    if (!formData.first_name) {
      newErrors.first_name = t('firstNameRequired');
    }

    if (!formData.last_name) {
      newErrors.last_name = t('lastNameRequired');
    }

    if (!formData.password) {
      newErrors.password = t('passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('passwordTooShort');
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = t('passwordsDoNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    if (!agreedToTerms) {
      Alert.alert(t('registrationFailed'), t('mustAgreeToTerms'));
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      Alert.alert(t('success'), t('accountCreated'), [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData) {
        setErrors(errorData);
      }
      Alert.alert(
        t('registrationFailed'),
        errorData?.detail || t('checkInformation')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Language Toggle */}
        <TouchableOpacity 
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>
            {language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </Text>
        </TouchableOpacity>

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logofhe2.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('createAccount')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label={`${t('email')} ${t('required')}`}
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder={t('enterEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
            style={styles.input}
          />

          <Input
            label={`${t('username')} ${t('required')}`}
            value={formData.username}
            onChangeText={(value) => handleChange('username', value)}
            placeholder={t('chooseUsername')}
            autoCapitalize="none"
            leftIcon="person-outline"
            error={errors.username}
            style={styles.input}
          />

          <Input
            label={`${t('firstName')} ${t('required')}`}
            value={formData.first_name}
            onChangeText={(value) => handleChange('first_name', value)}
            placeholder={t('enterFirstName')}
            error={errors.first_name}
            style={styles.input}
          />

          <Input
            label={`${t('lastName')} ${t('required')}`}
            value={formData.last_name}
            onChangeText={(value) => handleChange('last_name', value)}
            placeholder={t('enterLastName')}
            error={errors.last_name}
            style={styles.input}
          />

          <Input
            label={t('phone')}
            value={formData.phone}
            onChangeText={(value) => handleChange('phone', value)}
            placeholder={t('enterPhone')}
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phone}
            style={styles.input}
          />

          <Input
            label={`${t('password')} ${t('required')}`}
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            placeholder={t('createPassword')}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
            style={styles.input}
          />

          <Input
            label={`${t('confirmPassword')} ${t('required')}`}
            value={formData.password2}
            onChangeText={(value) => handleChange('password2', value)}
            placeholder={t('confirmYourPassword')}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password2}
            style={styles.input}
          />

          {/* Terms and Privacy Consent */}
          <TouchableOpacity
            style={styles.consentContainer}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && (
                <Ionicons name="checkmark" size={18} color="#fff" />
              )}
            </View>
            <Text style={styles.consentText}>
              {t('agreeToTerms')}
              <Text 
                style={styles.consentLink}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('TermsConditions');
                }}
              >
                {t('termsAndConditions')}
              </Text>
              {t('and')}
              <Text 
                style={styles.consentLink}
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate('PrivacyPolicy');
                }}
              >
                {t('privacyPolicy')}
              </Text>
            </Text>
          </TouchableOpacity>

          <Button
            title={t('createAccountButton')}
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.registerButton}
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.divider} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('alreadyHaveAccount')}</Text>
          <Button
            title={t('signIn')}
            onPress={() => navigation.navigate('Login')}
            variant="ghost"
            size="small"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: width > 768 ? 40 : 24,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 32,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  languageToggle: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  languageText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: width > 768 ? 140 : 110,
    height: width > 768 ? 140 : 110,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: width > 768 ? 32 : 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width > 768 ? 17 : 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: width > 768 ? 32 : 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfInput: {
    flex: 1,
    marginBottom: 16,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2563EB',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  consentLink: {
    color: '#2563EB',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  registerButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontSize: width > 768 ? 16 : 15,
    color: '#6B7280',
  },
});

export default RegisterScreen;