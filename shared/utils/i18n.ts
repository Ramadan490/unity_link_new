import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      profile: "Profile",
      switchToArabic: "Switch to Arabic",
      switchToEnglish: "Switch to English",
      editInfo: "Edit Info",
    },
  },
  ar: {
    translation: {
      profile: "الملف الشخصي",
      switchToArabic: "التبديل إلى العربية",
      switchToEnglish: "التبديل إلى الإنجليزية",
      editInfo: "تعديل المعلومات",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // ✅ no need for React
  },
  // compatibilityJSON: "v3", // ❌ remove this (or set to "v4" if needed)
});

export default i18n;
