import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';
import paymentService from '../../services/paymentService';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Translations
const translations = {
  en: {
    secureCheckout: 'Secure Checkout',
    orderSummary: 'Order Summary',
    courseEnrollment: 'Course Enrollment',
    eventRegistration: 'Event Registration',
    subtotal: 'Subtotal',
    processingFee: 'Processing Fee',
    totalAmount: 'Total Amount',
    paymentMethod: 'Payment Method',
    applePayMethod: 'Apple Pay',
    encryption: '256-bit encryption',
    pciCompliant: 'PCI compliant',
    pay: 'Pay',
    processing: 'Processing...',
    securePaymentInfo: 'Your payment is secure and encrypted. You will be charged',
    error: 'Error',
    failedToInitialize: 'Failed to initialize payment',
    enterCardDetails: 'Please enter complete card details',
    paymentFailed: 'Payment Failed',
    paymentSuccessful: 'Payment Successful!',
    enrollmentConfirmedTickets: 'Your enrollment has been confirmed. Check My Tickets for your QR code.',
    enrollmentConfirmedCourses: 'Your enrollment has been confirmed. Access your course in My Courses.',
    ok: 'OK',
    paymentProcessed: 'Payment Processed',
    enrollmentIssue: 'Your payment was successful, but there was an issue creating your enrollment',
    contactSupport: 'Please refresh My Courses or My Tickets, or contact support if the issue persists.',
    paymentIncomplete: 'Payment Incomplete',
    paymentNotCompleted: 'Payment was not completed. Please try again.',
  },
  fr: {
    secureCheckout: 'Paiement Sécurisé',
    orderSummary: 'Récapitulatif de la Commande',
    courseEnrollment: 'Inscription au Cours',
    eventRegistration: 'Inscription à l\'Événement',
    subtotal: 'Sous-total',
    processingFee: 'Frais de Traitement',
    totalAmount: 'Montant Total',
    paymentMethod: 'Méthode de Paiement',
    applePayMethod: 'Apple Pay',
    encryption: 'Chiffrement 256 bits',
    pciCompliant: 'Conforme PCI',
    pay: 'Payer',
    processing: 'Traitement en cours...',
    securePaymentInfo: 'Votre paiement est sécurisé et crypté. Vous serez débité de',
    error: 'Erreur',
    failedToInitialize: 'Échec de l\'initialisation du paiement',
    enterCardDetails: 'Veuillez entrer les détails complets de la carte',
    paymentFailed: 'Échec du Paiement',
    paymentSuccessful: 'Paiement Réussi !',
    enrollmentConfirmedTickets: 'Votre inscription a été confirmée. Consultez Mes Billets pour votre QR code.',
    enrollmentConfirmedCourses: 'Votre inscription a été confirmée. Accédez à votre cours dans Mes Cours.',
    ok: 'OK',
    paymentProcessed: 'Paiement Traité',
    enrollmentIssue: 'Votre paiement a réussi, mais il y a eu un problème lors de la création de votre inscription',
    contactSupport: 'Veuillez actualiser Mes Cours ou Mes Billets, ou contacter le support si le problème persiste.',
    paymentIncomplete: 'Paiement Incomplet',
    paymentNotCompleted: 'Le paiement n\'a pas été finalisé. Veuillez réessayer.',
  },
};

const PaymentScreen = ({ route, navigation }) => {
  const { type, itemId, title, price, onSuccess } = route.params;
  const { confirmPayment } = useStripe();
  const { t, language } = useTranslation(translations);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';

  useEffect(() => {
    // Only fetch Stripe payment intent on Android
    if (isAndroid) {
      fetchPaymentIntent();
    }
  }, []);

  const fetchPaymentIntent = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'course') {
        const { coursesService } = require('../../api');
        response = await coursesService.createPaymentIntent(itemId);
      } else {
        const { eventsService } = require('../../api');
        response = await eventsService.createPaymentIntent(itemId);
      }

      if (response?.clientSecret) {
        setClientSecret(response.clientSecret);
      } else {
        Alert.alert(t('error'), t('failedToInitialize'));
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      Alert.alert(t('error'), error.response?.data?.error || t('failedToInitialize'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    // Free courses/events: enroll directly without payment
    if (price === 0) {
      await handleFreeEnrollment();
      return;
    }

    if (isIOS) {
      await handleIOSPayment();
    } else {
      await handleAndroidPayment();
    }
  };

  /**
   * Handle free course/event enrollment (no payment needed)
   */
  const handleFreeEnrollment = async () => {
    setLoading(true);
    try {
      console.log(`🆓 Free ${type} enrollment for ${itemId}`);
      
      // Confirm with backend using 'free' as transaction ID
      await confirmPurchaseWithBackend('free');
    } catch (error) {
      console.error('❌ Free enrollment error:', error);
      Alert.alert(t('error'), error.message || t('failedToInitialize'));
      setLoading(false);
    }
  };

  /**
   * iOS: Use Apple In-App Purchase via RevenueCat
   */
  const handleIOSPayment = async () => {
    setLoading(true);
    try {
      console.log(`🍎 Starting iOS IAP for ${type} ${itemId}`);
      
      const result = await paymentService.purchase(type, itemId, price * 100, 'EUR');

      if (result.cancelled) {
        setLoading(false);
        return;
      }

      if (result.success) {
        console.log('✅ IAP purchase successful:', result.transactionId);
        
        // Confirm with backend using transaction ID
        await confirmPurchaseWithBackend(result.transactionId);
      }
    } catch (error) {
      console.error('❌ iOS IAP error:', error);
      Alert.alert(t('paymentFailed'), error.message || t('failedToInitialize'));
      setLoading(false);
    }
  };

  /**
   * Android: Use Stripe (existing flow)
   */
  const handleAndroidPayment = async () => {
    if (!clientSecret || !cardComplete) {
      Alert.alert(t('error'), t('enterCardDetails'));
      return;
    }

    setLoading(true);
    try {
      console.log('🤖 Starting Android Stripe payment with clientSecret:', clientSecret?.substring(0, 20) + '...');
      
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      console.log('Payment Intent Status:', paymentIntent?.status);
      console.log('Payment Error:', error);

      if (error) {
        console.error('Payment failed:', error);
        Alert.alert(t('paymentFailed'), error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status.toLowerCase() === 'succeeded') {
        console.log('✅ Stripe payment succeeded, confirming with backend...');
        await confirmPurchaseWithBackend(paymentIntent.id);
      } else {
        console.warn('Payment intent status not succeeded:', paymentIntent?.status);
        Alert.alert(t('paymentIncomplete'), t('paymentNotCompleted'));
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert(t('error'), t('paymentFailed'));
      setLoading(false);
    }
  };

  /**
   * Confirm purchase with backend (works for both IAP and Stripe)
   */
  const confirmPurchaseWithBackend = async (transactionId) => {
    try {
      let confirmResponse;
      if (type === 'course') {
        const { coursesService } = require('../../api');
        console.log('Calling confirmPayment for course:', itemId, 'with transaction:', transactionId);
        confirmResponse = await coursesService.confirmPayment(itemId, transactionId);
      } else {
        const { eventsService } = require('../../api');
        console.log('Calling confirmPayment for event:', itemId, 'with transaction:', transactionId);
        confirmResponse = await eventsService.confirmPayment(itemId, transactionId);
      }

      console.log('✅ Backend confirmation successful:', confirmResponse);

      // Check if item is in-person to determine where to navigate
      const isInPerson = confirmResponse?.course?.is_in_person || confirmResponse?.event?.is_in_person || false;

      const successMessage = isInPerson
        ? t('enrollmentConfirmedTickets')
        : t('enrollmentConfirmedCourses');

      const targetScreen = isInPerson ? 'MyTickets' : 'MyCourses';

      Alert.alert(
        t('paymentSuccessful'),
        successMessage,
        [
          {
            text: t('ok'),
            onPress: () => {
              if (onSuccess) onSuccess();
              navigation.navigate('Main', {
                screen: 'ProfileTab',
                params: {
                  screen: targetScreen
                }
              });
            },
          },
        ]
      );
    } catch (confirmError) {
      console.error('❌ Backend confirmation error:', confirmError);
      const errorMsg = confirmError.response?.data?.error || confirmError.message || 'Unknown error';
      Alert.alert(
        t('paymentProcessed'),
        `${t('enrollmentIssue')}: ${errorMsg}. ${t('contactSupport')}`,
        [
          {
            text: t('ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('secureCheckout')}</Text>
        <View style={styles.securityBadge}>
          <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Order Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.summaryHeaderText}>{t('orderSummary')}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.itemDetails}>
            <View style={styles.itemIcon}>
              <Ionicons 
                name={type === 'course' ? 'book-outline' : 'calendar-outline'} 
                size={32} 
                color={theme.colors.primary} 
              />
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemType}>
                {type === 'course' ? t('courseEnrollment') : t('eventRegistration')}
              </Text>
              <Text style={styles.itemTitle} numberOfLines={2}>{title}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('subtotal')}</Text>
              <Text style={styles.priceAmount}>€{price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('processingFee')}</Text>
              <Text style={styles.priceAmount}>€0.00</Text>
            </View>
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>{t('totalAmount')}</Text>
            <Text style={styles.totalAmount}>€{price}</Text>
          </View>
        </View>

        {/* Payment Method Card - ONLY SHOW ON ANDROID */}
        {isAndroid && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Ionicons name="card-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.paymentHeaderText}>{t('paymentMethod')}</Text>
            </View>

            <View style={styles.cardFieldWrapper}>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: '1234 5678 9012 3456',
                }}
                cardStyle={styles.cardStyle}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  setCardComplete(cardDetails.complete);
                }}
              />
            </View>

            {/* Security Features */}
            <View style={styles.securityFeatures}>
              <View style={styles.securityItem}>
                <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                <Text style={styles.securityText}>{t('encryption')}</Text>
              </View>
              <View style={styles.securityItem}>
                <Ionicons name="lock-closed" size={16} color="#10B981" />
                <Text style={styles.securityText}>{t('pciCompliant')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* iOS Payment Info */}
        {isIOS && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <Ionicons name="logo-apple" size={24} color={theme.colors.primary} />
              <Text style={styles.paymentHeaderText}>{t('applePayMethod')}</Text>
            </View>
            <Text style={styles.iapInfo}>
              Your purchase will be processed through your Apple ID and appear on your Apple account statement.
            </Text>
          </View>
        )}

        {/* Payment Button */}
        <TouchableOpacity
          style={[
            styles.payButton, 
            (isAndroid && (!cardComplete || loading)) && styles.payButtonDisabled,
            loading && styles.payButtonDisabled
          ]}
          onPress={handlePayment}
          disabled={(isAndroid && !cardComplete) || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.loadingText}>{t('processing')}</Text>
            </View>
          ) : (
            <View style={styles.payButtonContent}>
              <Ionicons name="lock-closed" size={20} color="#fff" />
              <Text style={styles.payButtonText}>{t('pay')} €{price}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
          <Text style={styles.footerText}>
            {t('securePaymentInfo')} €{price}.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: isTablet ? 32 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: isTablet ? 24 : 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginLeft: 16,
  },
  securityBadge: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isTablet ? 32 : 16,
    paddingBottom: 40,
    maxWidth: isTablet ? 600 : '100%',
    alignSelf: 'center',
    width: '100%',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 28 : 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryHeaderText: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: isTablet ? 16 : 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: isTablet ? 26 : 22,
  },
  priceBreakdown: {
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: isTablet ? 16 : 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: isTablet ? 16 : 15,
    color: '#374151',
    fontWeight: '600',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: isTablet ? 19 : 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: isTablet ? 28 : 24,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: isTablet ? 20 : 16,
    padding: isTablet ? 28 : 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentHeaderText: {
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  iapInfo: {
    fontSize: isTablet ? 15 : 14,
    color: '#6B7280',
    lineHeight: isTablet ? 22 : 20,
  },
  cardFieldWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: isTablet ? 8 : 4,
    marginBottom: 16,
  },
  cardField: {
    height: isTablet ? 60 : 50,
  },
  cardStyle: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    fontSize: isTablet ? 18 : 16,
  },
  securityFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: isTablet ? 13 : 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 6,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: isTablet ? 16 : 12,
    padding: isTablet ? 20 : 16,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  payButtonDisabled: {
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    gap: 8,
  },
  footerText: {
    fontSize: isTablet ? 13 : 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: isTablet ? 20 : 18,
    flex: 1,
  },
});

export default PaymentScreen;