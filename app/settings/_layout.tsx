// app/settings/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { useAuthGuard } from '../../hooks/useAuthGuard';

export default function SettingsLayout() {
  // ✅ Protect settings routes (redirects to login if not authenticated)
  useAuthGuard();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1a1a1a' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen
        name="profile"
        options={{ title: 'Settings - Profile' }}
      />
      {/* ℹ️ You can add more settings screens here later */}
    </Stack>
  );
}
