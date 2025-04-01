import { useEffect } from 'react';
import { Stack } from 'expo-router';
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
import { AuthProvider } from '@/lib/auth';
import { NotificationHandler } from '../components/NotificationHandler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter: Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
  );
}
