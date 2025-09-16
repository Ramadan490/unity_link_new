import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import ar from "./locales/ar.json";
import en from "./locales/en.json";

const resources = {
  en: { translation: en },
  ar: { translation: ar },
};

i18n
  .use(initReactI18next)
  .init({
    lng: "en", // 👈 always start in English
    fallbackLng: "en",
    resources,
    interpolation: { escapeValue: false },
  });

// Flip layout if Arabic
if (i18n.language === "ar") {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} else {
  I18nManager.allowRTL(false);
  I18nManager.forceRTL(false);
}

export default i18n;
