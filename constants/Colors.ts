/**
 * Global color palette for light and dark themes.
 * Centralized here so all components use consistent colors.
 *
 * You can extend this as your app grows.
 * Example: success, warning, info, gradients, etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#ffffff';

export const Colors = {
  light: {
    text: '#11181C',           // Primary text
    secondaryText: '#687076',  // Secondary text / muted
    background: '#FFFFFF',     // Main app background
    card: '#F2F2F7',           // Card background
    border: '#E5E5EA',         // Card / section borders
    tint: tintColorLight,      // Brand / accent color
    icon: '#687076',           // Default icon
    tabIconDefault: '#687076', // Tab bar icon default
    tabIconSelected: tintColorLight, // Tab bar icon selected
    danger: '#FF3B30',         // Errors, destructive actions
  },
  dark: {
    text: '#ECEDEE',           // Primary text
    secondaryText: '#9BA1A6',  // Secondary text / muted
    background: '#151718',     // Main app background
    card: '#1C1C1E',           // Card background
    border: '#3A3A3C',         // Card / section borders
    tint: tintColorDark,       // Brand / accent color
    icon: '#9BA1A6',           // Default icon
    tabIconDefault: '#9BA1A6', // Tab bar icon default
    tabIconSelected: tintColorDark, // Tab bar icon selected
    danger: '#FF453A',         // Errors, destructive actions
  },
};
