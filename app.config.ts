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
    deploymentTarget: '15.1',
    infoPlist: {
      NSCameraUsageDescription:
        'This app uses the camera to take photos of your recipes.',
      NSPhotoLibraryUsageDescription:
        'This app uses your photo library to add images to your recipes.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.chefing.app',
    versionCode: 1,
    permissions: ['CAMERA', 'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-image-picker',
    'expo-media-library',
    [
      '@stripe/stripe-react-native',
      {
        merchantIdentifier: 'merchant.com.chefing',
        enableGooglePay: true,
      },
    ],
    'expo-dev-client',
  ],
  scheme: 'chefing',
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  sdkVersion: '50.0.0',
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
