// Configuration des tests
import { vi } from 'vitest';

// Définir __DEV__ pour l'environnement de test
global.__DEV__ = true;

// Mock des variables d'environnement
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock global de Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  }))
}));

// Mock des modules React Native
vi.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: vi.fn((options) => options.ios || options.default),
  },
  Alert: {
    alert: vi.fn(),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 812 })),
  },
  StyleSheet: {
    create: vi.fn((styles) => styles),
  },
  Appearance: {
    getColorScheme: vi.fn(() => 'light'),
    addChangeListener: vi.fn(() => ({ remove: vi.fn() })),
  },
  AccessibilityInfo: {
    isScreenReaderEnabled: vi.fn(() => Promise.resolve(false)),
    isReduceMotionEnabled: vi.fn(() => Promise.resolve(false)),
    addEventListener: vi.fn(),
    announceForAccessibility: vi.fn(),
  },
}));

// Mock Expo modules
vi.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  requestBackgroundPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getForegroundPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getBackgroundPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  watchPositionAsync: vi.fn(() => 
    Promise.resolve({ remove: vi.fn() })
  ),
  Accuracy: {
    BestForNavigation: 6,
  },
}));

vi.mock('expo-constants', () => ({
  default: {
    appOwnership: 'standalone',
  },
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(() => Promise.resolve(null)),
    setItem: vi.fn(() => Promise.resolve()),
    removeItem: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('expo-notifications', () => ({
  requestPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getPermissionsAsync: vi.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  scheduleNotificationAsync: vi.fn(() => Promise.resolve()),
  cancelAllScheduledNotificationsAsync: vi.fn(() => Promise.resolve()),
  setNotificationHandler: vi.fn(),
}));

vi.mock('expo-task-manager', () => ({
  defineTask: vi.fn(),
  isTaskRegisteredAsync: vi.fn(() => Promise.resolve(false)),
  startLocationUpdatesAsync: vi.fn(() => Promise.resolve()),
  stopLocationUpdatesAsync: vi.fn(() => Promise.resolve()),
}));

// Mock React Testing Library pour les tests de composants
vi.mock('@testing-library/react-native', async () => {
  const actual = await vi.importActual('@testing-library/react-native');
  return {
    ...actual,
    render: vi.fn(),
    fireEvent: {
      press: vi.fn(),
      changeText: vi.fn(),
    },
  };
});

// Supprimer les warnings de console pendant les tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Warning:') || args[0].includes('React'))
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Filtrer les messages d'erreur attendus du ERROR_HANDLER
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('[ERROR_HANDLER]')
  ) {
    return; // Ignorer les logs d'erreur attendus pendant les tests
  }
  originalConsoleError(...args);
};