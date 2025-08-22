import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, AccessibilityInfo } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'fr' | 'en';
export type Units = 'metric' | 'imperial';
export type VoiceGuidance = 'none' | 'basic' | 'detailed';

export interface AppSettings {
  // Apparence
  theme: ThemeMode;
  reducedMotion: boolean;
  highContrast: boolean;
  
  // Accessibilité
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  voiceGuidance: VoiceGuidance;
  hapticFeedback: boolean;
  screenReader: boolean;
  
  // Unités et langue
  language: Language;
  units: Units;
  
  // Notifications
  activityReminders: boolean;
  weeklyReports: boolean;
  achievementNotifications: boolean;
  
  // Confidentialité RGPD
  dataCollection: boolean;
  analytics: boolean;
  crashReports: boolean;
  locationHistory: boolean;
  
  // Activité
  autoStart: boolean;
  autoPause: boolean;
  gpsAccuracy: 'low' | 'medium' | 'high';
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  fontSize: 'normal',
  voiceGuidance: 'basic',
  hapticFeedback: true,
  screenReader: false,
  language: 'fr',
  units: 'metric',
  activityReminders: true,
  weeklyReports: true,
  achievementNotifications: true,
  dataCollection: true,
  analytics: false,
  crashReports: true,
  locationHistory: true,
  autoStart: false,
  autoPause: true,
  gpsAccuracy: 'high',
};

class SettingsService {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private listeners: ((settings: AppSettings) => void)[] = [];

  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('app_settings');
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      
      // Détecter les préférences système
      await this.detectSystemPreferences();
      
    } catch (error) {
      console.error('Erreur initialisation paramètres:', error);
    }
  }

  private async detectSystemPreferences(): Promise<void> {
    try {
      // Détecter le lecteur d'écran
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      if (screenReaderEnabled !== this.settings.screenReader) {
        await this.updateSetting('screenReader', screenReaderEnabled);
      }

      // Détecter les animations réduites
      const reduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      if (reduceMotionEnabled !== this.settings.reducedMotion) {
        await this.updateSetting('reducedMotion', reduceMotionEnabled);
      }
    } catch (error) {
      console.warn('Impossible de détecter les préférences système:', error);
    }
  }

  async updateSetting<K extends keyof AppSettings>(
    key: K, 
    value: AppSettings[K]
  ): Promise<void> {
    this.settings = { ...this.settings, [key]: value };
    
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    return this.settings[key];
  }

  subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Méthodes utilitaires
  getCurrentTheme(): 'light' | 'dark' {
    if (this.settings.theme === 'system') {
      return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    }
    return this.settings.theme;
  }

  // Export/Import RGPD
  async exportUserData(): Promise<string> {
    const data = {
      settings: this.settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(data, null, 2);
  }

  async importUserData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      if (data.settings) {
        this.settings = { ...DEFAULT_SETTINGS, ...data.settings };
        await AsyncStorage.setItem('app_settings', JSON.stringify(this.settings));
        this.notifyListeners();
      }
    } catch (error) {
      throw new Error('Format de données invalide');
    }
  }

  async resetAllSettings(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };
    await AsyncStorage.setItem('app_settings', JSON.stringify(this.settings));
    this.notifyListeners();
  }
}

export const settingsService = new SettingsService();