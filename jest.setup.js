import '@testing-library/jest-native/extend-expect';

// Mock window object
global.window = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
  setTimeout: jest.fn((cb) => cb()),
  clearTimeout: jest.fn(),
};

// Mock global object
global.setTimeout = jest.fn((cb) => cb());
global.clearTimeout = jest.fn();

// Mock React Native components and APIs
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => {
  const GestureHandler = require('react-native-gesture-handler/jestSetup');
  return GestureHandler;
});

jest.mock('expo-router', () => ({
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => ''),
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}));

jest.mock('expo-asset', () => ({
  Asset: {
    loadAsync: jest.fn(),
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'test-url',
      supabaseAnonKey: 'test-key',
    },
  },
}));

// Mock React Native's Animated
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated = {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      interpolate: jest.fn(),
    })),
    timing: () => ({
      start: jest.fn(),
    }),
  };
  return RN;
});

// Use fake timers
jest.useFakeTimers();

// Mock Google AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => 'Mocked AI response',
        },
      }),
      countTokens: jest.fn().mockResolvedValue({ totalTokens: 100 }),
    })),
  })),
}));

// Mock Supabase Client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb) => cb({ data: [], error: null })),
    })),
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnThis(),
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
      remove: jest.fn(),
    },
  })),
}));
