/**
 * Modern ProfileScreen
 * Responsive multilingual user profile and settings with logo
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '../../components';
import { authService, coursesService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Translations
const translations = {
  en: {
    // Loading
    loading: 'Loading...',
    // Guest
    welcomeGuest: 'Welcome, Guest!',
    guestSubtitle: 'Login to access your profile, courses, and more',
    loginRegister: 'Login / Register',
    // Profile
    editProfile: 'Edit Profile',
    myCourses: 'My Courses',
    myEnrollments: 'My Enrollments',
    myTickets: 'My Tickets',
    changePassword: 'Change Password',
    helpSupport: 'Help & Support',
    settings: 'Settings',
    notifications: 'Notifications',
    language: 'Language',
    about: 'About',
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms & Conditions',
    logout: 'Logout',
    // Stats
    coursesEnrolled: 'Courses Enrolled',
    coursesCompleted: 'Completed',
    certificates: 'Certificates',
    // Alerts
    logoutTitle: 'Logout',
    logoutMessage: 'Are you sure you want to logout?',
    cancel: 'Cancel',
    confirm: 'Logout',
    deleteAccount: 'Delete Account',
    deleteAccountTitle: 'Delete Account',
    deleteAccountMessage: 'This will permanently delete your account and all associated data. This action cannot be undone.',
    deleteAccountConfirm: 'Delete Account',
    deleteAccountPassword: 'Enter Password',
    deleteAccountPasswordPlaceholder: 'Enter your password to confirm',
    deleteAccountSuccess: 'Your account has been deleted successfully.',
    deleteAccountError: 'Failed to delete account. Please check your password and try again.',
    // Roles
    student: 'STUDENT',
    instructor: 'INSTRUCTOR',
    admin: 'ADMIN',
  },
  fr: {
    // Loading
    loading: 'Chargement...',
    // Guest
    welcomeGuest: 'Bienvenue, Invité !',
    guestSubtitle: 'Connectez-vous pour accéder à votre profil, vos cours et plus encore',
    loginRegister: 'Se Connecter / S\'inscrire',
    // Profile
    editProfile: 'Modifier le Profil',
    myCourses: 'Mes Cours',
    myEnrollments: 'Mes Inscriptions',
    myTickets: 'Mes Billets',
    changePassword: 'Changer le Mot de Passe',
    helpSupport: 'Aide & Support',
    settings: 'Paramètres',
    notifications: 'Notifications',
    language: 'Langue',
    about: 'À Propos',
    privacyPolicy: 'Politique de Confidentialité',
    termsConditions: 'Conditions Générales',
    logout: 'Se Déconnecter',
    // Stats
    coursesEnrolled: 'Cours Inscrits',
    coursesCompleted: 'Terminés',
    certificates: 'Certificats',
    // Alerts
    logoutTitle: 'Déconnexion',
    logoutMessage: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    cancel: 'Annuler',
    confirm: 'Se Déconnecter',
    deleteAccount: 'Supprimer le Compte',
    deleteAccountTitle: 'Supprimer le Compte',
    deleteAccountMessage: 'Cela supprimera définitivement votre compte et toutes les données associées. Cette action est irréversible.',
    deleteAccountConfirm: 'Supprimer le Compte',
    deleteAccountPassword: 'Entrez le Mot de Passe',
    deleteAccountPasswordPlaceholder: 'Entrez votre mot de passe pour confirmer',
    deleteAccountSuccess: 'Votre compte a été supprimé avec succès.',
    deleteAccountError: 'Échec de la suppression du compte. Veuillez vérifier votre mot de passe et réessayer.',
    // Roles
    student: 'ÉTUDIANT',
    instructor: 'INSTRUCTEUR',
    admin: 'ADMINISTRATEUR',
  },
};

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    certificates: 0,
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const { t, language, setLanguage } = useTranslation(translations);

  const loadProfile = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const data = await authService.getProfile();
        setUser(data);
        
        // Load stats
        await loadStats();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const enrollments = await coursesService.getEnrollments();
      const enrollmentsList = enrollments.results || enrollments;
      
      const enrolled = enrollmentsList.length;
      const completed = enrollmentsList.filter(e => e.progress_percentage === 100).length;
      const certificates = completed; // Certificates = completed courses
      
      setStats({ enrolled, completed, certificates });
    } catch (error) {
      console.log('Error loading stats:', error);
      // Keep default stats if error
    }
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photos to upload a profile picture.');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handleUploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadAvatar = async (uri) => {
    setUploadingAvatar(true);
    try {
      // Create form data
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      });

      // Upload avatar
      const updatedUser = await authService.updateProfile(formData);
      
      // Update user state immediately
      setUser(updatedUser);
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('logoutTitle'),
      t('logoutMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            loadProfile();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('deleteAccountTitle'),
      t('deleteAccountMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAccountConfirm'),
          style: 'destructive',
          onPress: () => {
            // Prompt for password
            Alert.prompt(
              t('deleteAccountPassword'),
              t('deleteAccountPasswordPlaceholder'),
              [
                { text: t('cancel'), style: 'cancel' },
                {
                  text: t('deleteAccountConfirm'),
                  style: 'destructive',
                  onPress: async (password) => {
                    if (!password) {
                      Alert.alert('Error', 'Password is required');
                      return;
                    }
                    try {
                      await authService.deleteAccount(password);
                      setUser(null);
                      setIsAuthenticated(false);
                      Alert.alert('Success', t('deleteAccountSuccess'));
                      loadProfile();
                    } catch (error) {
                      console.error('Delete account error:', error);
                      Alert.alert('Error', t('deleteAccountError'));
                    }
                  },
                },
              ],
              'secure-text'
            );
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadProfile();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.guestContainer}>
        {/* Language Toggle */}
        <TouchableOpacity 
          style={styles.languageToggle}
          onPress={toggleLanguage}
        >
          <Text style={styles.languageText}>
            {language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logofhe2.png')}
            style={styles.guestLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.guestContent}>
          <Ionicons name="person-circle-outline" size={100} color="#9CA3AF" />
          <Text style={styles.guestTitle}>{t('welcomeGuest')}</Text>
          <Text style={styles.guestSubtitle}>
            {t('guestSubtitle')}
          </Text>
          <Button
            title={t('loginRegister')}
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </ScrollView>
    );
  }

  const getRoleTranslation = (role) => {
    const roleKey = role?.toLowerCase() || 'student';
    return t(roleKey);
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Language Toggle */}
      <TouchableOpacity 
        style={styles.languageToggleProfile}
        onPress={toggleLanguage}
      >
        <Ionicons name="language" size={20} color="#2563EB" />
        <Text style={styles.languageTextProfile}>
          {language === 'en' ? 'EN' : 'FR'}
        </Text>
      </TouchableOpacity>

      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: user.avatar || 'https://via.placeholder.com/120' }}
            style={styles.avatar}
          />
          <TouchableOpacity 
            style={styles.editAvatarButton}
            onPress={handlePickImage}
            disabled={uploadingAvatar}
          >
            {uploadingAvatar ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="camera" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.name}>
          {user.first_name} {user.last_name}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{getRoleTranslation(user.role)}</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={28} color="#2563EB" />
          <Text style={styles.statNumber}>{stats.enrolled}</Text>
          <Text style={styles.statLabel}>{t('coursesEnrolled')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#10B981" />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>{t('coursesCompleted')}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="ribbon-outline" size={28} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.certificates}</Text>
          <Text style={styles.statLabel}>{t('certificates')}</Text>
        </View>
      </View>

      {/* Menu Section - Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="create-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('editProfile')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyCourses')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="school-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('myCourses')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('MyTickets')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="ticket-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('myTickets')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="lock-closed-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('changePassword')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Menu Section - Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="notifications-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('notifications')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={toggleLanguage}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="language-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('language')}</Text>
          <View style={styles.languageBadge}>
            <Text style={styles.languageBadgeText}>
              {language === 'en' ? '🇬🇧 English' : '🇫🇷 Français'}
            </Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Menu Section - Legal & Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal & Support</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('PrivacyPolicy')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('privacyPolicy')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TermsConditions')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="document-text-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('termsConditions')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => Linking.openURL('https://www.focushealth-academy.com/contact')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="help-circle-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('helpSupport')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, styles.lastMenuItem]}
          onPress={() => Linking.openURL('https://www.focushealth-academy.com/about')}
        >
          <View style={styles.menuIconContainer}>
            <Ionicons name="information-circle-outline" size={24} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>{t('about')}</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Admin Section - visible only to admins */}
      {user?.role === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="qr-code-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Scan Tickets</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Orders')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="receipt-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Orders</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="settings-outline" size={24} color="#2563EB" />
            </View>
            <Text style={styles.menuText}>Manage Users</Text>
            <Ionicons name="chevron-forward-outline" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Delete Account Button */}
      <View style={styles.deleteAccountSection}>
        <Button
          title={t('deleteAccount')}
          onPress={handleDeleteAccount}
          variant="outline"
          fullWidth
          leftIcon="trash-outline"
          style={styles.deleteAccountButton}
          textStyle={styles.deleteAccountButtonText}
        />
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          fullWidth
          leftIcon="logout"
          style={styles.logoutButton}
        />
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  
  // Guest Screen
  guestContainer: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  languageToggle: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 24,
    marginBottom: 20,
  },
  languageText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  guestLogo: {
    width: isTablet ? 160 : 120,
    height: isTablet ? 160 : 120,
  },
  guestContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  guestTitle: {
    fontSize: isTablet ? 32 : 26,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: isTablet ? 18 : 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loginButton: {
    minWidth: 200,
    height: 52,
    borderRadius: 12,
  },

  // Profile Screen
  languageToggleProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    margin: 16,
    gap: 6,
  },
  languageTextProfile: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    marginHorizontal: isTablet ? 40 : 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  email: {
    fontSize: isTablet ? 17 : 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: isTablet ? 40 : 16,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Menu Sections
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    marginHorizontal: isTablet ? 40 : 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    flex: 1,
    fontSize: isTablet ? 17 : 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  languageBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  languageBadgeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Delete Account
  deleteAccountSection: {
    paddingHorizontal: isTablet ? 40 : 16,
    marginBottom: 12,
    marginTop: 24,
  },
  deleteAccountButton: {
    height: 52,
    borderRadius: 12,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  deleteAccountButtonText: {
    color: '#DC2626',
    fontWeight: '600',
  },

  // Logout
  logoutSection: {
    paddingHorizontal: isTablet ? 40 : 16,
    marginBottom: 24,
  },
  logoutButton: {
    height: 52,
    borderRadius: 12,
    borderColor: '#EF4444',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ProfileScreen;