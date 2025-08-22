import { useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { settingsService, AppSettings } from '@/lib/settings';
import { lightColors, darkColors, highContrastColors } from '@/styles/colors';

export const useTheme = () => {
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());
  const [systemTheme, setSystemTheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    // Écouter les changements de paramètres
    const unsubscribe = settingsService.subscribe(setSettings);
    
    // Écouter les changements de thème système
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme);
    });

    return () => {
      unsubscribe();
      subscription?.remove();
    };
  }, []);

  const getCurrentTheme = () => {
    if (settings.theme === 'system') {
      return systemTheme === 'dark' ? 'dark' : 'light';
    }
    return settings.theme;
  };

  const getColors = () => {
    const currentTheme = getCurrentTheme();
    
    if (settings.highContrast) {
      return highContrastColors;
    }
    
    return currentTheme === 'dark' ? darkColors : lightColors;
  };

  const getFontSize = () => {
    const multipliers = {
      small: 0.85,
      normal: 1,
      large: 1.15,
      xlarge: 1.3,
    };
    return multipliers[settings.fontSize];
  };

  return {
    colors: getColors(),
    theme: getCurrentTheme(),
    settings,
    fontSizeMultiplier: getFontSize(),
    isDark: getCurrentTheme() === 'dark',
    isHighContrast: settings.highContrast,
    isReducedMotion: settings.reducedMotion,
  };
};