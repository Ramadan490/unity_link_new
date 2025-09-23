// shared/utils/index.ts

// Re-export everything from individual utility files
// Import and bundle locales
import ar from "./locales/ar.json";
import en from "./locales/en.json";

export * from "./api";
export * from "./formatDate";
export * from "./roleUtils";
export * from "./storage";

// Export i18n properly (default export wrapped)
export { default as i18n } from "./i18n";

export const locales = { ar, en };
