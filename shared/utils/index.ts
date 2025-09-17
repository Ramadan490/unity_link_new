// Re-export everything from individual utility files
export * from "./api";
export * from "./formatDate";
export * from "./i18n";

// Import and bundle locales
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export const locales = { ar, en };
