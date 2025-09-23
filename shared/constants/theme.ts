// constants/Colors.ts
import { DarkTheme, LightTheme } from "@/shared/context/ThemeContext";

// Map your old color names to the new theme system
export const Colors = {
  light: LightTheme.colors,
  dark: DarkTheme.colors,
};

// Or if you want to keep the old structure for compatibility:
export const LegacyColors = {
  light: {
    text: LightTheme.colors.text,
    secondaryText: LightTheme.colors.textSecondary,
    background: LightTheme.colors.background,
    card: LightTheme.colors.card,
    border: LightTheme.colors.border,
    tint: LightTheme.colors.primary,
    icon: LightTheme.colors.textSecondary,
    tabIconDefault: LightTheme.colors.textSecondary,
    tabIconSelected: LightTheme.colors.primary,
    danger: LightTheme.colors.error,
  },
  dark: {
    text: DarkTheme.colors.text,
    secondaryText: DarkTheme.colors.textSecondary,
    background: DarkTheme.colors.background,
    card: DarkTheme.colors.card,
    border: DarkTheme.colors.border,
    tint: DarkTheme.colors.primary,
    icon: DarkTheme.colors.textSecondary,
    tabIconDefault: DarkTheme.colors.textSecondary,
    tabIconSelected: DarkTheme.colors.primary,
    danger: DarkTheme.colors.error,
  },
};
