import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Chefing',
  slug: 'chefing',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.chefing.app',
    buildNumber: '1.0.0',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.chefing.app',
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image-picker',
    'expo-media-library',
  ],
  scheme: 'chefing',
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  sdkVersion: '52.0.0',
  extra: {
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
    appName: process.env.EXPO_PUBLIC_APP_NAME,
    appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
    appEnv: process.env.EXPO_PUBLIC_APP_ENV,
  },
};

export default config;
