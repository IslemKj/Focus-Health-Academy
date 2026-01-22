/**
 * Main App component for Focus Health Academy
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import { authService } from './src/api';
import paymentService from './src/services/paymentService';
import theme from './src/theme';

// Replace with your Stripe publishable key (Android only)
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SZChoHq60gzA5wHLzxf2pUzwLqG53qUiVkuT9UaCIVBHpbMkUviWgdiVF0LKKlhZescBpWCHnferAAfq0AR1zDN00HPPTzzLt';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize RevenueCat (iOS only)
      await paymentService.initialize();
      
      // Check authentication
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      // If user is authenticated, identify them in RevenueCat (iOS only)
      if (authenticated && Platform.OS === 'ios') {
        try {
          const profile = await authService.getProfile();
          if (profile?.id) {
            await paymentService.identifyUser(profile.id);
          }
        } catch (error) {
          console.error('Failed to identify user in RevenueCat:', error);
        }
      }
    } catch (error) {
      console.error('App initialization error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthChange = async (authenticated) => {
    setIsAuthenticated(authenticated);
    
    // Identify or logout user in RevenueCat (iOS only)
    if (Platform.OS === 'ios') {
      if (authenticated) {
        try {
          const profile = await authService.getProfile();
          if (profile?.id) {
            await paymentService.identifyUser(profile.id);
          }
        } catch (error) {
          console.error('Failed to identify user in RevenueCat:', error);
        }
      } else {
        await paymentService.logout();
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
        <StatusBar style="light" />
        <Navigation 
          isAuthenticated={isAuthenticated} 
          onAuthChange={handleAuthChange}
        />
      </StripeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
  },
});