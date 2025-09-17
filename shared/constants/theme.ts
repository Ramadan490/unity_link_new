/**
 * Global design tokens for colors and fonts.
 * - Colors are split into light & dark modes.
 * - Fonts adapt by platform (iOS, Android, Web).
 *
 * Extend this as your app grows:
 *   - semantic colors: success, warning, error
 *   - brand colors or gradients
 *   - typography scale
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#ffffff";

export const Colors = {
  light: {
    text: "#11181C", // Primary text
    secondaryText: "#687076", // Muted text
    background: "#FFFFFF",
    card: "#F2F2F7", // Card background
    border: "#E5E5EA", // Divider / section border
    tint: tintColorLight, // Accent / brand
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    danger: "#FF3B30", // Errors / destructive
  },
  dark: {
    text: "#ECEDEE",
    secondaryText: "#9BA1A6",
    background: "#151718",
    card: "#1C1C1E",
    border: "#3A3A3C",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    danger: "#FF453A",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui", // Default system font
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  android: {
    sans: "sans-serif",
    serif: "serif",
    rounded: "sans-serif", // fallback
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
});
