import { supabase } from '../lib/supabase';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  SubscriptionPlans,
} from '../types/subscription';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const STRIPE_API_URL = Constants.expoConfig?.extra?.stripeApiUrl;
const STRIPE_PUBLISHABLE_KEY =
  Constants.expoConfig?.extra?.stripePublishableKey;

if (!STRIPE_API_URL || !STRIPE_PUBLISHABLE_KEY) {
  throw new Error('Stripe configuration is missing');
}

export class SubscriptionError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'SubscriptionError';
  }
}

export const subscriptionService = {
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        throw new SubscriptionError(
          'Failed to fetch subscription status',
          error.code,
        );
      }

      if (!data) {
        return {
          isActive: false,
          plan: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
        };
      }

      return {
        isActive: data.status === 'active',
        plan: data.plan as SubscriptionPlan,
        currentPeriodEnd: data.current_period_end
          ? new Date(data.current_period_end)
          : null,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      };
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      throw error instanceof SubscriptionError
        ? error
        : new SubscriptionError('Failed to fetch subscription status');
    }
  },

  async getSubscriptionPlans(): Promise<SubscriptionPlans> {
    try {
      const response = await fetch(`${STRIPE_API_URL}/prices`, {
        headers: {
          Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`,
        },
      });

      if (!response.ok) {
        throw new SubscriptionError(
          'Failed to fetch subscription plans',
          response.status.toString(),
        );
      }

      const prices = await response.json();

      return {
        monthly: {
          id: prices.monthly.id,
          amount: 799, // $7.99
          currency: 'usd',
          interval: 'month',
        },
        annual: {
          id: prices.annual.id,
          amount: 6399, // $63.99
          currency: 'usd',
          interval: 'year',
        },
      };
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error instanceof SubscriptionError
        ? error
        : new SubscriptionError('Failed to fetch subscription plans');
    }
  },

  async createSubscription(userId: string, priceId: string): Promise<string> {
    try {
      const response = await fetch(`${STRIPE_API_URL}/create-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          userId,
          priceId,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        throw new SubscriptionError(
          'Failed to create subscription',
          response.status.toString(),
        );
      }

      const { clientSecret } = await response.json();
      return clientSecret;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error instanceof SubscriptionError
        ? error
        : new SubscriptionError('Failed to create subscription');
    }
  },

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('user_id', userId);

      if (error) {
        throw new SubscriptionError(
          'Failed to cancel subscription',
          error.code,
        );
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error instanceof SubscriptionError
        ? error
        : new SubscriptionError('Failed to cancel subscription');
    }
  },

  async reactivateSubscription(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('user_id', userId);

      if (error) {
        throw new SubscriptionError(
          'Failed to reactivate subscription',
          error.code,
        );
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error instanceof SubscriptionError
        ? error
        : new SubscriptionError('Failed to reactivate subscription');
    }
  },
};
