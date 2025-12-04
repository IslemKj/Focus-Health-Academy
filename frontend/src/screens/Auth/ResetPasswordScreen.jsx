/**
 * ResetPasswordScreen
 * Enter reset code and new password
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
    success: 'Success',
    enterCode: 'Please enter the reset code',
    invalidCode: 'Reset code must be 6 digits',
    enterNewPassword: 'Please enter a new password',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsDontMatch: 'Passwords do not match',
    passwordResetFailed: 'Failed to reset password. Please try again.',
    invalidOrExpiredCode: 'Invalid or expired code. Please request a new one.',
    passwordResetSuccess: 'Your password has been reset successfully!',
    resetPassword: 'Reset Password',
    enterCodeInstructions: 'We\'ve sent a 6-digit code to',
    pleaseEnterCode: 'Please enter the code and your new password below.',
    resetCode: 'Reset Code',
    enterCodePlaceholder: 'Enter 6-digit code',
    newPassword: 'New Password',
    enterNewPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm Password',
    reenterPassword: 'Re-enter new password',
    resetMyPassword: 'Reset My Password',
    backToLogin: 'Back to Login',
    didntReceiveCode: 'Didn\'t receive the code?',
    resendCode: 'Resend Code',
    codeSent: 'Code Sent',
    newCodeSent: 'A new reset code has been sent to your email.',
  },
  fr: {
    error: 'Erreur',
    success: 'Succès',
    enterCode: 'Veuillez entrer le code de réinitialisation',
    invalidCode: 'Le code de réinitialisation doit comporter 6 chiffres',
    enterNewPassword: 'Veuillez entrer un nouveau mot de passe',
    passwordTooShort: 'Le mot de passe doit comporter au moins 8 caractères',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    passwordResetFailed: 'Échec de la réinitialisation du mot de passe. Veuillez réessayer.',
    invalidOrExpiredCode: 'Code invalide ou expiré. Veuillez en demander un nouveau.',
    passwordResetSuccess: 'Votre mot de passe a été réinitialisé avec succès!',
    resetPassword: 'Réinitialiser le mot de passe',
    enterCodeInstructions: 'Nous avons envoyé un code à 6 chiffres à',
    pleaseEnterCode: 'Veuillez entrer le code et votre nouveau mot de passe ci-dessous.',
    resetCode: 'Code de réinitialisation',
    enterCodePlaceholder: 'Entrez le code à 6 chiffres',
    newPassword: 'Nouveau mot de passe',
    enterNewPasswordPlaceholder: 'Entrez le nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    reenterPassword: 'Entrez à nouveau le nouveau mot de passe',
    resetMyPassword: 'Réinitialiser mon mot de passe',
    backToLogin: 'Retour à la connexion',
    didntReceiveCode: 'Vous n\'avez pas reçu le code?',
    resendCode: 'Renvoyer le code',
    codeSent: 'Code envoyé',
    newCodeSent: 'Un nouveau code de réinitialisation a été envoyé à votre e-mail.',
  },
};

const ResetPasswordScreen = ({ route, navigation }) => {
  const { t } = useTranslation(translations);
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResetPassword = async () => {
    // Validation
    if (!code) {
      Alert.alert(t('error'), t('enterCode'));
      return;
    }

    if (code.length !== 6 || !/^\d+$/.test(code)) {
      Alert.alert(t('error'), t('invalidCode'));
      return;
    }

    if (!newPassword) {
      Alert.alert(t('error'), t('enterNewPassword'));
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch'));
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset(email, code, newPassword);
      
      Alert.alert(
        t('success'),
        t('passwordResetSuccess'),
        [
          {
            text: t('backToLogin'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      const message = error.response?.data?.error || 
                     error.response?.data?.message || 
                     t('passwordResetFailed');
      
      // Check if it's a token validation error
      if (message.toLowerCase().includes('invalid') || 
          message.toLowerCase().includes('expired') ||
          message.toLowerCase().includes('utilisé')) {
        Alert.alert(t('error'), t('invalidOrExpiredCode'));
      } else {
        Alert.alert(t('error'), message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    try {
      await authService.requestPasswordReset(email);
      Alert.alert(t('codeSent'), t('newCodeSent'));
      setCode(''); // Clear the code input
    } catch (error) {
      Alert.alert(
        t('error'),
        error.response?.data?.error || t('passwordResetFailed')
      );
    } finally {
      setResending(false);
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
            name="key-outline"
            size={64}
            color={theme.colors.primary}
          />
        </View>

        <Text style={styles.title}>{t('resetPassword')}</Text>
        
        <View style={styles.instructionsContainer}>
          <Text style={styles.subtitle}>
            {t('enterCodeInstructions')}
          </Text>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.subtitle}>
            {t('pleaseEnterCode')}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('resetCode')}
            value={code}
            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ''))}
            placeholder={t('enterCodePlaceholder')}
            keyboardType="number-pad"
            maxLength={6}
            leftIcon="keypad-outline"
          />

          <Input
            label={t('newPassword')}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('enterNewPasswordPlaceholder')}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <Input
            label={t('confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('reenterPassword')}
            secureTextEntry
            leftIcon="lock-closed-outline"
          />

          <Button
            title={t('resetMyPassword')}
            onPress={handleResetPassword}
            loading={loading}
            fullWidth
            style={styles.submitButton}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>{t('didntReceiveCode')}</Text>
            <Button
              title={t('resendCode')}
              onPress={handleResendCode}
              variant="ghost"
              loading={resending}
              style={styles.resendButton}
            />
          </View>

          <Button
            title={t('backToLogin')}
            onPress={() => navigation.navigate('Login')}
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
    marginBottom: theme.spacing.md,
  },
  instructionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emailText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
    textAlign: 'center',
    marginVertical: theme.spacing.xs,
  },
  form: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  submitButton: {
    marginTop: theme.spacing.md,
  },
  resendContainer: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
  },
  resendText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  resendButton: {
    paddingVertical: theme.spacing.xs,
  },
  cancelButton: {
    marginTop: theme.spacing.sm,
  },
});

export default ResetPasswordScreen;
