import { AuthProvider } from "@/shared/context/AuthContext";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { ThemeProvider, useTheme } from "@/shared/context/ThemeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ThemedStatusBar />
          <Stack screenOptions={{ headerShown: false }} />
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
