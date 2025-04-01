import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
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
    associatedDomains: ['applinks:chefing.app'],
    infoPlist: {
      LSApplicationQueriesSchemes: ['tiktok', 'instagram'],
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['chefing'],
          CFBundleURLName: 'com.chefing.app',
        },
      ],
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.chefing.app',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'chefing.app',
            pathPrefix: '/share',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  plugins: ['expo-router'],
  scheme: 'chefing',
  extra: {
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    eas: {
      projectId: 'your-project-id',
    },
  },
});
