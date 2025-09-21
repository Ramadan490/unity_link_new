// shared/context/LanguageContext.tsx
import i18n from "@/shared/utils/i18n";
import * as Updates from "expo-updates";
import React, { createContext, useContext, useState } from "react";
import { I18nManager } from "react-native";

type LanguageContextType = {
  language: string;
  switchLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState(i18n.language);

  const switchLanguage = async () => {
    const newLang = language === "en" ? "ar" : "en";
    setLanguage(newLang);
    await i18n.changeLanguage(newLang);

    // ✅ RTL toggle
    const isRTL = newLang === "ar";
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      try {
        await Updates.reloadAsync(); // restart to apply layout
      } catch (err) {
        console.warn("Failed to reload app after RTL switch:", err);
      }
    }
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
