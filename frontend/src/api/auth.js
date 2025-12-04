/**
 * Authentication API service
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './client';
import { ENDPOINTS } from './config';

export const authService = {
  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    
    const { user, tokens } = response.data;
    
    // Store tokens and user data
    await AsyncStorage.setItem('access_token', tokens.access);
    await AsyncStorage.setItem('refresh_token', tokens.refresh);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { user, tokens };
  },

  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    
    const { user, tokens } = response.data;
    
    // Store tokens and user data
    await AsyncStorage.setItem('access_token', tokens.access);
    await AsyncStorage.setItem('refresh_token', tokens.refresh);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { user, tokens };
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT, {
        refresh_token: refreshToken,
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    // Check if profileData is FormData (for file uploads)
    const isFormData = profileData instanceof FormData;
    
    const config = isFormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await apiClient.patch(ENDPOINTS.AUTH.PROFILE, profileData, config);
    
    // Update stored user data
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (oldPassword, newPassword) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword,
    });
    
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.PASSWORD_RESET, {
      email,
    });
    
    return response.data;
  },

  /**
   * Confirm password reset with code
   */
  confirmPasswordReset: async (email, token, newPassword) => {
    const response = await apiClient.post(ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, {
      email,
      token,
      new_password: newPassword,
      new_password2: newPassword,
    });
    
    return response.data;
  },

  /**
   * Get stored user data
   */
  getStoredUser: async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },
};
