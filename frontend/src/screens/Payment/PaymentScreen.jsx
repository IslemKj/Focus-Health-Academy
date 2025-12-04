import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

const PaymentScreen = ({ route, navigation }) => {
  const { type, itemId, title, price, onSuccess } = route.params;
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    fetchPaymentIntent();
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
        Alert.alert('Error', 'Failed to initialize payment');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment intent error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to initialize payment');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!clientSecret || !cardComplete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting payment with clientSecret:', clientSecret?.substring(0, 20) + '...');
      
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      console.log('Payment Intent Status:', paymentIntent?.status);
      console.log('Payment Error:', error);

      if (error) {
        console.error('Payment failed:', error);
        Alert.alert('Payment Failed', error.message);
        setLoading(false);
        return;
      }

      if (paymentIntent && paymentIntent.status.toLowerCase() === 'succeeded') {
        console.log('Payment succeeded, confirming with backend...');
        
        // Payment succeeded, now confirm with backend to create enrollment/registration
        try {
          let confirmResponse;
          if (type === 'course') {
            const { coursesService } = require('../../api');
            console.log('Calling confirmPayment for course:', itemId, 'with payment intent:', paymentIntent.id);
            confirmResponse = await coursesService.confirmPayment(itemId, paymentIntent.id);
          } else {
            const { eventsService } = require('../../api');
            console.log('Calling confirmPayment for event:', itemId, 'with payment intent:', paymentIntent.id);
            confirmResponse = await eventsService.confirmPayment(itemId, paymentIntent.id);
          }

          console.log('✅ Backend confirmation successful:', confirmResponse);

          // Check if item is in-person to determine where to navigate
          const isInPerson = confirmResponse?.course?.is_in_person || confirmResponse?.event?.is_in_person || false;
          const hasQRCode = confirmResponse?.qr_code;

          console.log('Is in-person:', isInPerson, 'Has QR:', hasQRCode);

          const successMessage = isInPerson
            ? 'Your enrollment has been confirmed. Check My Tickets for your QR code.'
            : 'Your enrollment has been confirmed. Access your course in My Courses.';

          const targetScreen = isInPerson ? 'MyTickets' : 'MyCourses';

          console.log('Navigating to:', targetScreen);

          Alert.alert(
            'Payment Successful!',
            successMessage,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (onSuccess) onSuccess();
                  // Navigate to ProfileTab, then to the specific screen
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
          console.error('Error response:', confirmError.response?.data);
          console.error('Error status:', confirmError.response?.status);
          const errorMsg = confirmError.response?.data?.error || confirmError.message || 'Unknown error';
          Alert.alert(
            'Payment Processed',
            `Your payment was successful, but there was an issue creating your enrollment: ${errorMsg}. Please refresh My Courses or My Tickets, or contact support if the issue persists.`,
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        console.warn('Payment intent status not succeeded:', paymentIntent?.status);
        Alert.alert('Payment Incomplete', 'Payment was not completed. Please try again.');
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>{title}</Text>
          <Text style={styles.summaryType}>{type === 'course' ? 'Course' : 'Event'}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>€{price}</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          <CardField
            postalCodeEnabled={false}
            placeholders={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={styles.card}
            style={styles.cardContainer}
            onCardChange={(cardDetails) => {
              setCardComplete(cardDetails.complete);
            }}
          />
          <Text style={styles.testCardHint}>Test card: 4242 4242 4242 4242</Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, (!cardComplete || loading) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay €{price}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryType: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardContainer: {
    height: 50,
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  testCardHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentScreen;
