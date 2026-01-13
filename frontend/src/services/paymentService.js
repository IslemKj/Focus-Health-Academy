/**
 * Payment Service
 * Handles payment routing: iOS uses RevenueCat IAP, Android uses Stripe
 */

import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';

const REVENUECAT_API_KEY = {
  ios: 'appl_zzTmIDHCheohoEBcdOvYpBLpwsX', // Replace with API key from Focus Health Academy app in RevenueCat
  android: 'YOUR_ANDROID_API_KEY', // Optional: for future Android IAP
};

class PaymentService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize RevenueCat SDK
   * Call this once when the app starts
   */
  async initialize() {
    if (this.initialized) return;

    try {
      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY.ios });
        console.log('✅ RevenueCat initialized for iOS');
      }
      // Android continues using Stripe, so no RevenueCat init needed
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize RevenueCat:', error);
    }
  }

  /**
   * Set user ID for RevenueCat (call after login)
   */
  async identifyUser(userId) {
    if (Platform.OS === 'ios') {
      try {
        await Purchases.logIn(String(userId));
        console.log('✅ RevenueCat user identified:', userId);
      } catch (error) {
        console.error('❌ Failed to identify RevenueCat user:', error);
      }
    }
  }

  /**
   * Clear user on logout
   */
  async logout() {
    if (Platform.OS === 'ios') {
      try {
        await Purchases.logOut();
        console.log('✅ RevenueCat user logged out');
      } catch (error) {
        console.error('❌ Failed to logout RevenueCat user:', error);
      }
    }
  }

  /**
   * Purchase a course or event
   * @param {string} type - 'course' or 'event'
   * @param {number} itemId - Course or event ID
   * @param {number} price - Price in the smallest currency unit (e.g., cents)
   * @param {string} currency - Currency code (e.g., 'EUR')
   * @returns {Promise<Object>} Purchase result with transaction ID
   */
  async purchase(type, itemId, price, currency = 'EUR') {
    if (Platform.OS === 'ios') {
      return this.purchaseWithIAP(type, itemId, price, currency);
    } else {
      // Android uses Stripe - this will be handled by the existing PaymentScreen
      return { method: 'stripe', requiresStripeFlow: true };
    }
  }

  /**
   * Purchase using Apple IAP (iOS only)
   */
  async purchaseWithIAP(type, itemId, price, currency) {
    try {
      // Product ID format: course_123 or event_456
      // Remove hyphens from UUID since Apple doesn't allow them in Product IDs
      const sanitizedId = String(itemId).replace(/-/g, '');
      const productId = `${type}_${sanitizedId}`;
      
      console.log(`🛒 Purchasing ${productId} via Apple IAP`);

      // Make the purchase
      const purchaseResult = await Purchases.purchaseProduct(productId);
      
      console.log('✅ Purchase successful:', purchaseResult);

      // Extract transaction details
      const transaction = purchaseResult.transaction;
      
      return {
        method: 'iap',
        success: true,
        transactionId: transaction.transactionIdentifier,
        productId: productId,
        purchaseDate: transaction.purchaseDate,
        entitlements: purchaseResult.entitlements,
      };
    } catch (error) {
      if (error.userCancelled) {
        console.log('❌ User cancelled purchase');
        return { method: 'iap', success: false, cancelled: true };
      }
      
      console.error('❌ IAP purchase failed:', error);
      throw new Error(error.message || 'Purchase failed');
    }
  }

  /**
   * Restore purchases (iOS only)
   */
  async restorePurchases() {
    if (Platform.OS === 'ios') {
      try {
        const customerInfo = await Purchases.restorePurchases();
        console.log('✅ Purchases restored:', customerInfo);
        return customerInfo;
      } catch (error) {
        console.error('❌ Failed to restore purchases:', error);
        throw error;
      }
    }
    return null;
  }

  /**
   * Get customer info and active entitlements (iOS only)
   */
  async getCustomerInfo() {
    if (Platform.OS === 'ios') {
      try {
        const customerInfo = await Purchases.getCustomerInfo();
        return customerInfo;
      } catch (error) {
        console.error('❌ Failed to get customer info:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if platform uses IAP or Stripe
   */
  usesIAP() {
    return Platform.OS === 'ios';
  }

  usesStripe() {
    return Platform.OS === 'android';
  }
}

export default new PaymentService();
