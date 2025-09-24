// shared/context/ThemeContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Appearance, I18nManager, useColorScheme } from "react-native";

// ---- Theme Interfaces ----
export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;

    background: string;
    backgroundElevated: string;
    backgroundHighlight: string;

    surface: string;
    surface2: string;
    surface3: string;

    text: string;
    textSecondary: string;
    textTertiary: string;
    textQuaternary: string;

    success: string;
    warning: string;
    error: string;
    info: string;

    border: string;
    divider: string;

    overlay: string;
    overlay2: string;

    card: string;
    notification: string;

    danger: string;
    disabled: string;
  };
  spacing: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  borderRadius: {
    none: number;
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    round: number;
  };
}

// ---- Light Theme ----
export const LightTheme: Theme = {
  colors: {
    primary: "#007AFF",
    primaryDark: "#0056CC",
    primaryLight: "#4DA6FF",
    secondary: "#5856D6",
    accent: "#FF2D55",

    background: "#F8F9FA",
    backgroundElevated: "#FFFFFF",
    backgroundHighlight: "#F0F0F0",

    surface: "#FFFFFF",
    surface2: "#F8F8F8",
    surface3: "#F0F0F0",

    text: "#1A1A1A",
    textSecondary: "#666666",
    textTertiary: "#999999",
    textQuaternary: "#CCCCCC",

    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",

    border: "#E0E0E0",
    divider: "#F0F0F0",

    overlay: "rgba(0,0,0,0.4)",
    overlay2: "rgba(0,0,0,0.2)",

    card: "#FFFFFF",
    notification: "#FF453A",

    danger: "#FF3B30",
    disabled: "#A9A9A9",
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
};

// ---- Dark Theme ----
export const DarkTheme: Theme = {
  colors: {
    primary: "#007AFF",
    primaryDark: "#0056CC",
    primaryLight: "#4DA6FF",
    secondary: "#5856D6",
    accent: "#FF2D55",

    background: "#121212",
    backgroundElevated: "#1C1C1E",
    backgroundHighlight: "#2C2C2E",

    surface: "#1E1E1E",
    surface2: "#252525",
    surface3: "#2D2D2D",

    text: "#FFFFFF",
    textSecondary: "#EBEBF599",
    textTertiary: "#EBEBF54D",
    textQuaternary: "#EBEBF52E",

    success: "#34C759",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",

    border: "#38383A",
    divider: "#272729",

    overlay: "rgba(0,0,0,0.6)",
    overlay2: "rgba(0,0,0,0.4)",

    card: "#1C1C1E",
    notification: "#FF453A",

    danger: "#FF453A",
    disabled: "#5A5A5A",
  },
  spacing: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  borderRadius: {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
};

// ---- Context Setup ----
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isRTL: boolean; // ✅ Added
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  useEffect(() => {
    loadThemePreference();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === "dark");
    });

    return () => subscription.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themePreference");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme preference:", error);
    }
  };

  const saveThemePreference = async (darkMode: boolean) => {
    try {
      await AsyncStorage.setItem(
        "themePreference",
        darkMode ? "dark" : "light"
      );
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    saveThemePreference(newIsDark);
  };

  const value = {
    theme: isDark ? DarkTheme : LightTheme,
    isDark,
    isRTL, // ✅ exposed here
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// ---- Hook ----
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
