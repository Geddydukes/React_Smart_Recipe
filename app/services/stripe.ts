import { Alert } from 'react-native';
import { initStripe, useStripe } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

export const stripeService = {
  initialize: async () => {
    try {
      await initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: 'merchant.com.yourapp',
      });
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      Alert.alert('Error', 'Failed to initialize payment system');
    }
  },

  presentPaymentSheet: async (clientSecret: string) => {
    try {
      const { initPaymentSheet, presentPaymentSheet } = useStripe();

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Your App Name',
        paymentIntentClientSecret: clientSecret,
        style: 'alwaysDark',
        googlePay: true,
        merchantCountryCode: 'US',
      });

      if (initError) {
        throw initError;
      }

      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        throw paymentError;
      }

      return true;
    } catch (error) {
      console.error('Payment sheet error:', error);
      Alert.alert('Error', 'Failed to process payment');
      return false;
    }
  },
};
