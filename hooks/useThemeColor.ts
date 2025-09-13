// hooks/useThemeColor.ts
import { Colors } from '../constants/Colors';
import { useColorScheme } from './useColorScheme'; // ✅ correct path

type Theme = 'light' | 'dark';

type ThemeProps = {
  light?: string;
  dark?: string;
};

export function useThemeColor(
  props: ThemeProps,
  colorName: keyof typeof Colors['light']
) {
  const theme: Theme = useColorScheme() as Theme;
  const colorFromProps = props[theme];

  return colorFromProps ?? Colors[theme][colorName];
}
