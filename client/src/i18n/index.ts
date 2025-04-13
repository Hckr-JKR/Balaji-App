import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import mrTranslation from './locales/mr.json';
import taTranslation from './locales/ta.json';

// Configure i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      hi: {
        translation: hiTranslation
      },
      mr: {
        translation: mrTranslation
      },
      ta: {
        translation: taTranslation
      }
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
