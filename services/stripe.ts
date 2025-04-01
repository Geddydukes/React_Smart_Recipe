import { Alert } from 'react-native';
import {
  initStripe,
  useStripe,
  StripeError,
} from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.stripePublishableKey;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe publishable key is not configured');
}

export const stripeService = {
  initialize: async () => {
    try {
      await initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: 'merchant.com.reactsmartrecipe',
      });
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      Alert.alert('Error', 'Failed to initialize payment system');
      throw error;
    }
  },

  presentPaymentSheet: async (clientSecret: string): Promise<boolean> => {
    try {
      const { initPaymentSheet, presentPaymentSheet } = useStripe();

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'React Smart Recipe',
        paymentIntentClientSecret: clientSecret,
        style: 'alwaysDark',
        googlePay: true,
        merchantCountryCode: 'US',
        defaultBillingDetails: {
          name: 'User Name',
          email: 'user@example.com',
        },
      });

      if (initError) {
        throw new Error(initError.message);
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      return true;
    } catch (error) {
      const stripeError = error as StripeError;
      console.error('Payment sheet error:', stripeError);
      Alert.alert('Error', stripeError.message || 'Failed to process payment');
      return false;
    }
  },

  handlePaymentError: (error: StripeError) => {
    console.error('Stripe error:', error);
    Alert.alert(
      'Payment Error',
      error.message || 'An error occurred during payment',
    );
  },
};
