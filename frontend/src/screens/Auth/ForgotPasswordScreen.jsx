/**
 * ForgotPasswordScreen
 * Password recovery screen
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input } from '../../components';
import { authService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    error: 'Error',
    enterEmailAddress: 'Please enter your email address',
    enterValidEmail: 'Please enter a valid email address',
    failedToSendEmail: 'Failed to send reset email. Please try again.',
    emailSent: 'Email Sent!',
    sentInstructions: 'We\'ve sent password reset instructions to',
    checkInbox: 'Please check your inbox and follow the instructions to reset your password.',
    backToLogin: 'Back to Login',
    forgotPassword: 'Forgot Password?',
    enterEmailInstructions: 'No worries! Enter your email address and we\'ll send you instructions to reset your password.',
    emailAddress: 'Email Address',
    enterYourEmail: 'Enter your email',
    sendResetLink: 'Send Reset Link',
  },
  fr: {
    error: 'Erreur',
    enterEmailAddress: 'Veuillez entrer votre adresse e-mail',
    enterValidEmail: 'Veuillez entrer une adresse e-mail valide',
    failedToSendEmail: 'Échec de l\'envoi de l\'e-mail de réinitialisation. Veuillez réessayer.',
    emailSent: 'E-mail envoyé!',
    sentInstructions: 'Nous avons envoyé des instructions de réinitialisation du mot de passe à',
    checkInbox: 'Veuillez vérifier votre boîte de réception et suivre les instructions pour réinitialiser votre mot de passe.',
    backToLogin: 'Retour à la connexion',
    forgotPassword: 'Mot de passe oublié?',
    enterEmailInstructions: 'Pas de soucis! Entrez votre adresse e-mail et nous vous enverrons des instructions pour réinitialiser votre mot de passe.',
    emailAddress: 'Adresse e-mail',
    enterYourEmail: 'Entrez votre e-mail',
    sendResetLink: 'Envoyer le lien de réinitialisation',
  },
};

const ForgotPasswordScreen = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(t('error'), t('enterEmailAddress'));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert(t('error'), t('enterValidEmail'));
      return;
    }

    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      // Navigate to code entry screen
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('failedToSendEmail')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={64}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>{t('forgotPassword')}</Text>
        <Text style={styles.subtitle}>
          {t('enterEmailInstructions')}
        </Text>

        <View style={styles.form}>
          <Input
            label={t('emailAddress')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('enterYourEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <Button
            title={t('sendResetLink')}
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />

          <Button
            title={t('backToLogin')}
            onPress={() => navigation.goBack()}
            variant="ghost"
            fullWidth
            style={styles.cancelButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
});

export default ForgotPasswordScreen;
