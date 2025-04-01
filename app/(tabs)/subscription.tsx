import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';
import { subscriptionService } from '../../services/subscription';
import { stripeService } from '../../services/stripe';
import { useAuth } from '../../hooks/useAuth';
import { PREMIUM_FEATURES } from '../../types/subscription';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const {
    status,
    loading,
    error,
    hasActiveSubscription,
    getSubscriptionPlan,
    getSubscriptionEndDate,
    isCanceled,
    cancelSubscription,
    reactivateSubscription,
    refreshStatus,
  } = useSubscription();

  const [plans, setPlans] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(
    null,
  );
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  const loadSubscriptionPlans = async () => {
    try {
      const subscriptionPlans =
        await subscriptionService.getSubscriptionPlans();
      setPlans(subscriptionPlans);
      // Default to monthly plan
      setSelectedPlan('monthly');
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
      Alert.alert(
        'Error',
        'Failed to load subscription plans. Please try again later.',
      );
    }
  };

  const handleSubscribe = async () => {
    if (!user?.id || !selectedPlan || !plans) return;

    try {
      setProcessing(true);
      const priceId = plans[selectedPlan].id;
      const clientSecret = await subscriptionService.createSubscription(
        user.id,
        priceId,
      );

      const success = await stripeService.presentPaymentSheet(clientSecret);

      if (success) {
        await refreshStatus();
        Alert.alert('Success', 'Your subscription has been activated!', [
          { text: 'OK', onPress: () => {} },
        ]);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      Alert.alert('Error', 'Failed to process subscription. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
      Alert.alert(
        'Subscription Cancelled',
        'Your subscription will end at the end of the current billing period.',
      );
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
      Alert.alert('Success', 'Your subscription has been reactivated!');
    } catch (err) {
      Alert.alert(
        'Error',
        'Failed to reactivate subscription. Please try again.',
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (hasActiveSubscription()) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
          <Text style={styles.title}>Premium Active</Text>
          <Text style={styles.subtitle}>
            Your {getSubscriptionPlan()} subscription is active
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Features</Text>
          {PREMIUM_FEATURES.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <Text style={styles.detailText}>Plan: {getSubscriptionPlan()}</Text>
          <Text style={styles.detailText}>
            Renewal Date: {getSubscriptionEndDate()?.toLocaleDateString()}
          </Text>
        </View>

        {isCanceled() ? (
          <TouchableOpacity
            style={[styles.button, styles.reactivateButton]}
            onPress={handleReactivateSubscription}
          >
            <Text style={styles.buttonText}>Reactivate Subscription</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancelSubscription}
          >
            <Text style={styles.buttonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="star" size={64} color="#FFD700" />
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock all features and enhance your cooking experience
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        {PREMIUM_FEATURES.map((feature) => (
          <View key={feature.id} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.featureText}>{feature.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <View style={styles.planContainer}>
          <TouchableOpacity
            style={[
              styles.planButton,
              selectedPlan === 'monthly' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('monthly')}
          >
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>
              ${plans?.monthly?.amount / 100}/month
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planButton,
              selectedPlan === 'annual' && styles.selectedPlan,
            ]}
            onPress={() => setSelectedPlan('annual')}
          >
            <Text style={styles.planTitle}>Annual</Text>
            <Text style={styles.planPrice}>
              ${plans?.annual?.amount / 100}/year
            </Text>
            <Text style={styles.savingsText}>Save 33%</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.subscribeButton]}
        onPress={handleSubscribe}
        disabled={processing || !selectedPlan}
      >
        {processing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Subscribe Now</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 16,
  },
  planContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  planButton: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedPlan: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 20,
    color: '#4CAF50',
  },
  savingsText: {
    color: '#4CAF50',
    marginTop: 5,
  },
  button: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  subscribeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF5252',
  },
  reactivateButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
});
