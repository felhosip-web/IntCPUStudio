import React, { createContext, useContext, useEffect, useState } from 'react';
import { TRANSLATIONS, TranslationKey } from './translations';
import { Language, SimulatorSettings } from '../types/settings';
import {
  loadStoredSettings,
  resetStoredSettings,
  saveStoredSettings,
} from '../core/settingsStore';
import { updateAudioSettings } from '../core/audio';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  settings: SimulatorSettings;
  updateSettings: (newSettings: Partial<SimulatorSettings>) => void;
  resetSettings: () => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<SimulatorSettings>(() => loadStoredSettings());

  const language = settings.language || 'hu';

  // Dynamic Theme Mode Synchronization (Dark, System, Light, Hacker)
  useEffect(() => {
    const mode = settings.themeMode || 'dark';

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const applySystemTheme = () => {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', resolved);
        document.documentElement.setAttribute('data-theme-setting', 'system');
      };
      applySystemTheme();

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', applySystemTheme);
        return () => mediaQuery.removeEventListener('change', applySystemTheme);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(applySystemTheme);
        return () => mediaQuery.removeListener(applySystemTheme);
      }
    } else {
      document.documentElement.setAttribute('data-theme', mode);
      document.documentElement.setAttribute('data-theme-setting', mode);
    }
  }, [settings.themeMode]);

  useEffect(() => {
    saveStoredSettings(settings);
    updateAudioSettings(settings);
  }, [settings]);

  const setLanguage = (lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  const updateSettings = (newSettings: Partial<SimulatorSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  };

  const resetSettings = () => {
    const defaults = resetStoredSettings();
    setSettings(defaults);
  };

  const t = (key: TranslationKey): string => {
    const dict = TRANSLATIONS[language] || TRANSLATIONS.hu;
    return (dict as Record<string, string>)[key] || (TRANSLATIONS.hu as Record<string, string>)[key] || key;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        settings,
        updateSettings,
        resetSettings,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
