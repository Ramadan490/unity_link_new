// app/(tabs)/profile/_layout.tsx
import { useTheme } from "@/shared/context/ThemeContext";
import { Stack } from "expo-router";
import React from "react";

export default function ProfileLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {/* 👇 default profile tab screen */}
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      {/* 👇 sub-pages with headers + back button */}
      <Stack.Screen
        name="appearance"
        options={{ title: "Appearance" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Notifications" }}
      />
      <Stack.Screen
        name="security"
        options={{ title: "Privacy & Security" }}
      />
      <Stack.Screen
        name="help"
        options={{ title: "Help & Support" }}
      />
      <Stack.Screen
        name="terms"
        options={{ title: "Terms & Conditions" }}
      />
      <Stack.Screen
        name="edit"
        options={{ title: "Edit Profile" }}
      />
    </Stack>
  );
}
