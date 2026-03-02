import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import ar from './ar.json';
import he from './he.json';
import en from './en.json';

const LANGUAGE_KEY = '@app_language';

const translations = { ar, he, en };

/** RTL languages */
const RTL_LANGUAGES = ['ar', 'he'];

// Module-level language tracker for non-React code (services)
let currentLanguage = 'ar';

export const LanguageContext = createContext();

/**
 * Resolve a dot-notated key like "common.error" from a nested object.
 * Supports interpolation: t('key', { name: 'Ali' }) replaces {{name}} with Ali.
 */
const resolve = (obj, path) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

/**
 * Standalone translate function for use outside React components (services, utils).
 * Uses the module-level currentLanguage which is synced by LanguageProvider.
 */
export const translate = (key, params) => {
  let text = resolve(translations[currentLanguage], key);
  if (text === undefined && currentLanguage !== 'en') {
    text = resolve(translations.en, key);
  }
  if (text === undefined && currentLanguage !== 'ar') {
    text = resolve(translations.ar, key);
  }
  if (text === undefined) return key;
  if (params && typeof text === 'string') {
    Object.keys(params).forEach((k) => {
      text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), params[k]);
    });
  }
  return text;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('ar');

  // Load persisted language on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (saved && translations[saved]) {
          setLanguageState(saved);
          currentLanguage = saved;
        }
      } catch (e) {
        // fallback to 'ar'
      }
    })();
  }, []);

  const setLanguage = useCallback(async (lang) => {
    if (translations[lang]) {
      setLanguageState(lang);
      currentLanguage = lang;

      // Update RTL based on language
      const shouldBeRTL = RTL_LANGUAGES.includes(lang);
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }

      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      } catch (e) {
        console.error('Failed to persist language:', e);
      }
    }
  }, []);

  /**
   * Translate a key. Falls back to Arabic, then the key itself.
   * Supports interpolation: t('horses.unavailable', { name: 'Spirit' })
   */
  const t = useCallback(
    (key, params) => {
      let text = resolve(translations[language], key);

      // Fallback to English, then Arabic
      if (text === undefined && language !== 'en') {
        text = resolve(translations.en, key);
      }
      if (text === undefined && language !== 'ar') {
        text = resolve(translations.ar, key);
      }

      // Fallback to key itself
      if (text === undefined) {
        return key;
      }

      // Interpolation: replace {{var}} with params[var]
      if (params && typeof text === 'string') {
        Object.keys(params).forEach((k) => {
          text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), params[k]);
        });
      }

      return text;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access translation function and language state.
 * Usage: const { t, language, setLanguage } = useTranslation();
 */
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
