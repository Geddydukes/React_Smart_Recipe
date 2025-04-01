import { useEffect, useState } from 'react';
import { Stack, Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { SplashScreen } from 'expo-router';
import { AuthProvider, useAuth } from '@/lib/auth';
import { NotificationHandler } from '../components/NotificationHandler';
import { PaperProvider } from 'react-native-paper';
import { onboardingService } from '@/services/onboarding';
import { View, ActivityIndicator } from 'react-native';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { stripeService } from '../services/stripe';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { user, loading: isAuthLoading } = useAuth();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<
    boolean | null
  >(null);
  const segments = useSegments();
  const router = useRouter();

  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (!isAuthLoading && isOnboardingComplete !== null) {
      const inAuthGroup = segments[0] === 'auth';
      const inOnboarding =
        segments[0] === '(tabs)' && segments[1] === 'recipes';

      if (!user && !inAuthGroup) {
        // Redirect to auth if not logged in
        router.replace('/auth/login' as any);
      } else if (user && inAuthGroup) {
        // Redirect to main app if logged in and in auth group
        router.replace('/(tabs)' as any);
      } else if (user && !isOnboardingComplete && !inOnboarding) {
        // Redirect to onboarding if logged in but onboarding not complete
        router.replace('/(tabs)/recipes' as any);
      }
    }
  }, [user, isAuthLoading, isOnboardingComplete, segments]);

  const checkOnboardingStatus = async () => {
    try {
      const status = await onboardingService.isOnboardingComplete();
      setIsOnboardingComplete(status);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    }
  };

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    stripeService.initialize();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (isAuthLoading || isOnboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <PaperProvider>
        <TutorialProvider>
          <AuthProvider>
            <NotificationHandler />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="meals/create"
                options={{ title: 'Add Meal', headerShown: false }}
              />
              <Stack.Screen
                name="meals/[id]"
                options={{ title: 'Meal Details', headerShown: false }}
              />
              <Stack.Screen
                name="meals/edit/[id]"
                options={{ title: 'Edit Meal', headerShown: false }}
              />
              <Stack.Screen
                name="settings/calories"
                options={{ title: 'Calorie Settings', headerShown: false }}
              />
              <Stack.Screen
                name="settings/notifications"
                options={{ title: 'Notification Settings', headerShown: false }}
              />
              <Stack.Screen
                name="achievements/index"
                options={{ title: 'Achievements', headerShown: false }}
              />
              <Stack.Screen
                name="achievements/details"
                options={{ title: 'Achievement Details', headerShown: false }}
              />
              <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </TutorialProvider>
      </PaperProvider>
    </StripeProvider>
  );
}
