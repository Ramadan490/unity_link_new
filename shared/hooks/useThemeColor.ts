// hooks/useThemeColor.ts
import { Colors } from "../constants/Colors";
import { useColorScheme } from "./useColorScheme"; // <-- This must exactly match

type Theme = "light" | "dark";

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  props: ThemeProps,
  colorName: keyof typeof Colors.light,
): string {
  const theme: Theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
}
