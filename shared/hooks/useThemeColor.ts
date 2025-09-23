// shared/hooks/useThemeColor.ts
import { useTheme } from "../context/ThemeContext";

type ThemeProps = {
  light?: string;
  dark?: string;
};

// Map old color names to new theme color paths
const colorMap: Record<
  string,
  keyof ReturnType<typeof useTheme>["theme"]["colors"]
> = {
  background: "background",
  text: "text",
  textSecondary: "textSecondary",
  textTertiary: "textTertiary",
  textQuaternary: "textQuaternary",
  card: "card",
  border: "border",
  divider: "divider",
  notification: "notification",
  primary: "primary",
  primaryDark: "primaryDark",
  primaryLight: "primaryLight",
  secondary: "secondary",
  accent: "accent",
  success: "success",
  warning: "warning",
  error: "error",
  info: "info",
  overlay: "overlay",
  overlay2: "overlay2",
  backgroundElevated: "backgroundElevated",
  backgroundHighlight: "backgroundHighlight",
  surface: "surface",
  surface2: "surface2",
  surface3: "surface3",
  icon: "textSecondary",
  tabIconDefault: "textSecondary",
  tabIconSelected: "primary",
  danger: "error",
};

export function useThemeColor(props: ThemeProps, colorName: string): string {
  const { theme, isDark } = useTheme();

  // Use props if provided
  const colorFromProps = isDark ? props.dark : props.light;
  if (colorFromProps) {
    return colorFromProps;
  }

  // Try to get from new theme system using mapping
  const mappedColorName = colorMap[colorName];
  if (mappedColorName && theme.colors[mappedColorName]) {
    return theme.colors[mappedColorName];
  }

  // Fallback with warning
  console.warn(
    `Color "${colorName}" not found in theme mapping, using primary as fallback`,
  );
  return theme.colors.primary;
}

// ✅ Proper custom hooks
export function useLightColors() {
  const { theme } = useTheme();
  return theme.colors;
}

export function useDarkColors() {
  const { theme } = useTheme();
  return theme.colors;
}
