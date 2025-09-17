// context/ThemeContext.tsx
import React, { createContext, ReactNode, useContext } from "react";

export interface Theme {
  colors: {
    // Brand colors
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;

    // Background colors
    background: string;
    backgroundElevated: string;
    backgroundHighlight: string;

    // Surface colors
    surface: string;
    surface2: string;
    surface3: string;

    // Text colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    textQuaternary: string;

    // Status colors
    success: string;
    warning: string;
    error: string;
    info: string;

    // Border and divider
    border: string;
    divider: string;

    // Overlays
    overlay: string;
    overlay2: string;

    // Special colors
    card: string;
    notification: string;
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

// Dark theme configuration
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

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: DarkTheme,
  isDark: true,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const value = {
    theme: DarkTheme,
    isDark: true, // Always dark mode
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
