import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscriptionService } from '../services/subscription';
import {
  SubscriptionStatus,
  PremiumFeature,
  PREMIUM_FEATURES,
} from '../types/subscription';

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSubscriptionStatus();
    }
  }, [user?.id]);

  const loadSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const subscriptionStatus =
        await subscriptionService.getSubscriptionStatus(user!.id);
      setStatus(subscriptionStatus);
    } catch (err) {
      setError('Failed to load subscription status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFeatureEnabled = (featureId: string): boolean => {
    if (!status) return false;
    return status.isActive;
  };

  const getPremiumFeatures = (): PremiumFeature[] => {
    return PREMIUM_FEATURES;
  };

  const getPremiumFeaturesByCategory = (
    category: PremiumFeature['category'],
  ): PremiumFeature[] => {
    return PREMIUM_FEATURES.filter((feature) => feature.category === category);
  };

  const hasActiveSubscription = (): boolean => {
    return status?.isActive || false;
  };

  const getSubscriptionPlan = (): string | null => {
    return status?.plan || null;
  };

  const getSubscriptionEndDate = (): Date | null => {
    return status?.currentPeriodEnd || null;
  };

  const isCanceled = (): boolean => {
    return status?.cancelAtPeriodEnd || false;
  };

  const cancelSubscription = async () => {
    if (!user?.id) return;
    try {
      await subscriptionService.cancelSubscription(user.id);
      await loadSubscriptionStatus();
    } catch (err) {
      setError('Failed to cancel subscription');
      throw err;
    }
  };

  const reactivateSubscription = async () => {
    if (!user?.id) return;
    try {
      await subscriptionService.reactivateSubscription(user.id);
      await loadSubscriptionStatus();
    } catch (err) {
      setError('Failed to reactivate subscription');
      throw err;
    }
  };

  return {
    status,
    loading,
    error,
    isFeatureEnabled,
    getPremiumFeatures,
    getPremiumFeaturesByCategory,
    hasActiveSubscription,
    getSubscriptionPlan,
    getSubscriptionEndDate,
    isCanceled,
    cancelSubscription,
    reactivateSubscription,
    refreshStatus: loadSubscriptionStatus,
  };
}
