module.exports = {
  name: 'Chefing',
  slug: 'Chefing',
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
    bundleIdentifier: 'com.yourcompany.reactsmartrecipe',
    deploymentTarget: '15.1',
    useFrameworks: 'static',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.yourcompany.reactsmartrecipe',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-file-system',
    'expo-media-library',
    'expo-image-picker',
    'expo-notifications',
  ],
  extra: {
    eas: {
      projectId: 'your-project-id',
    },
  },
};
