import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import Loading from '../../components/ui/Loading';
import { useAuth } from '../../context/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // ✅ go to a real tab screen
      router.replace('/announcements');
    }
  }, [user, loading]);

  if (loading) {
    return <Loading message="Checking session..." />;
  }

  return (
    <Stack screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="login"
        options={{ title: 'Login', headerBackVisible: false }}
      />
      <Stack.Screen
        name="register"
        options={{ title: 'Register' }}
      />
    </Stack>
  );
}
