import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import de from '../locales/de.json';
import en from '../locales/en.json';
import pirate from '../locales/pirate.json';
import { extraTranslations } from '../locales/extraTranslations';
import { legalTranslations } from '../locales/legalTranslations';

function deepMerge<T extends Record<string, any>>(base: T, extra: Record<string, any>): T {
  const result = { ...base } as Record<string, any>;

  for (const [key, value] of Object.entries(extra)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

export const languages = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'pirate', label: 'Piratensprache' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: deepMerge(deepMerge(de, extraTranslations.de), legalTranslations.de) },
      en: { translation: deepMerge(deepMerge(en, extraTranslations.en), legalTranslations.en) },
      pirate: { translation: deepMerge(deepMerge(pirate, extraTranslations.pirate), legalTranslations.pirate) },
    },
    fallbackLng: 'de',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

export default i18n;
