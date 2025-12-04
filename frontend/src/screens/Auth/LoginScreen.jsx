/**
 * Modern LoginScreen
 * Responsive multilingual user login interface with logo
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
import { Button, Input } from '../../components';
import { authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');

// Translations
const translations = {
  en: {
    welcomeBack: 'Welcome Back',
    subtitle: 'Sign in to continue learning',
    email: 'Email',
    password: 'Password',
    signIn: 'Sign In',
    forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account? ",
    signUp: 'Sign Up',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    emailRequired: 'Email is required',
    emailInvalid: 'Email is invalid',
    passwordRequired: 'Password is required',
    loginFailed: 'Login Failed',
    invalidCredentials: 'Invalid email or password',
  },
  fr: {
    welcomeBack: 'Bon Retour',
    subtitle: 'Connectez-vous pour continuer à apprendre',
    email: 'Email',
    password: 'Mot de passe',
    signIn: 'Se Connecter',
    forgotPassword: 'Mot de passe oublié ?',
    noAccount: "Vous n'avez pas de compte ? ",
    signUp: 'S\'inscrire',
    enterEmail: 'Entrez votre email',
    enterPassword: 'Entrez votre mot de passe',
    emailRequired: 'L\'email est requis',
    emailInvalid: 'L\'email est invalide',
    passwordRequired: 'Le mot de passe est requis',
    loginFailed: 'Échec de la connexion',
    invalidCredentials: 'Email ou mot de passe invalide',
  },
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { t, language, setLanguage } = useTranslation(translations);

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = t('emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('emailInvalid');
    }
    
    if (!password) {
      newErrors.password = t('passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.login(email, password);
      // Close the modal and return to main app
      navigation.goBack();
    } catch (error) {
      Alert.alert(
        t('loginFailed'),
        error.response?.data?.error || t('invalidCredentials')
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
          <Text style={styles.title}>{t('welcomeBack')}</Text>
          <Text style={styles.subtitle}>{t('subtitle')}</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Input
            label={t('email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('enterEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
            style={styles.input}
          />

          <Input
            label={t('password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('enterPassword')}
            secureTextEntry
            leftIcon="lock-closed-outline"
            error={errors.password}
            style={styles.input}
          />

          <Button
            title={t('signIn')}
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <Button
            title={t('forgotPassword')}
            onPress={() => navigation.navigate('ForgotPassword')}
            variant="ghost"
            fullWidth
            style={styles.forgotButton}
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
          <Text style={styles.footerText}>{t('noAccount')}</Text>
          <Button
            title={t('signUp')}
            onPress={() => navigation.navigate('Register')}
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    marginBottom: 32,
    paddingTop: 20,
  },
  logo: {
    width: width > 768 ? 180 : 140,
    height: width > 768 ? 180 : 140,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: width > 768 ? 36 : 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width > 768 ? 18 : 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
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
  loginButton: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
  },
  forgotButton: {
    marginTop: 8,
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

export default LoginScreen;