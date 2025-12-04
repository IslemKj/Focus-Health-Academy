/**
 * Main App component for Focus Health Academy
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import Navigation from './src/navigation';
import { authService } from './src/api';
import theme from './src/theme';

// Replace with your Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51SZCiOH9PfzfrhLGBMdvj0OBwHqJdxeIwUcbqk5B5rBXizAaH5XpqKM6fZVdfp4Hvp2Ssv299ZGQavAirGaX99Cj00LxAw7oyI';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
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
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StatusBar style="light" />
      <Navigation 
        isAuthenticated={isAuthenticated} 
        onAuthChange={setIsAuthenticated}
      />
    </StripeProvider>
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
