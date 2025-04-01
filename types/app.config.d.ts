declare module 'expo-constants' {
  interface Constants {
    expoConfig?: {
      extra?: {
        stripePublishableKey?: string;
        supabaseUrl?: string;
        supabaseAnonKey?: string;
        supabaseServiceRoleKey?: string;
        geminiApiKey?: string;
        appName?: string;
        appVersion?: string;
        appEnv?: string;
      };
    };
  }
}
