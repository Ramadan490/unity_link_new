// utils/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Expo automatically exposes variables prefixed with EXPO_PUBLIC_
// No need to use @env
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function apiGet(endpoint: string) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export async function apiPost(endpoint: string, body: any) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export { API_URL };
