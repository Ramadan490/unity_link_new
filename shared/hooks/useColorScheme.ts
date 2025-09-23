// hooks/useColorScheme.ts
import { useTheme } from "@/shared/context/ThemeContext";

// This hook now returns the theme mode based on your context
export function useColorScheme(): "light" | "dark" {
  const { isDark } = useTheme();
  return isDark ? "dark" : "light";
}
