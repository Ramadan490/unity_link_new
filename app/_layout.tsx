// app/_layout.tsx
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import Loading from "@/shared/components/ui/Loading";
import { AuthProvider } from "@/shared/context/AuthContext";
import { ThemeProvider, useTheme } from "@/shared/context/ThemeContext";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Ignore specific warnings
LogBox.ignoreLogs([
  "Non-serializable values were found in the navigation state",
]);

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Custom component to enforce theme and app loading
function ThemedLayout() {
  const { theme } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load resources if needed
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <Loading message="Preparing app..." />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        onLayout={onLayoutRootView}
      >
        <StatusBar
          style="auto"
          backgroundColor={theme.colors.background}
          translucent={false}
        />

        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            {/* Main Tabs Navigation */}
            <Stack.Screen
              name="(tabs)"
              options={{
                animation: "fade",
                gestureEnabled: false,
              }}
            />

            {/* Auth Flow */}
            <Stack.Screen
              name="auth"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                headerShown: false,
              }}
            />

            {/* Modal Screens */}
            <Stack.Screen
              name="modal"
              options={{
                presentation: "modal",
                animation: "slide_from_bottom",
                gestureEnabled: true,
              }}
            />

            {/* Debug Screens */}
            <Stack.Screen
              name="debug/env-check"
              options={{
                presentation: "modal",
              }}
            />
          </Stack>
        </ErrorBoundary>
      </View>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ThemedLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
