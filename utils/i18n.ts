import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from '../locales/ar.json';
import en from '../locales/en.json';

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

// Default: English
let languageTag: string = 'en';

// Force RTL if Arabic is chosen
if (languageTag === 'ar' && !I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} else if (languageTag === 'en' && I18nManager.isRTL) {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}


i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources,
  lng: languageTag,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
