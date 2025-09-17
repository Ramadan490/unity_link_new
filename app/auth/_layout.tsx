// app/auth/_layout.tsx
import { AuthProvider } from "@/shared/context/AuthContext";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false, // hide header for login/register
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </AuthProvider>
  );
}
