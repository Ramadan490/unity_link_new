// shared/utils/api.ts - FIXED IMPORTS
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.12.125:3000/api";

// ✅ FIXED: Import from the correct file path
import { Storage } from "./storage"; // This imports your custom Storage utility

export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  console.log(`🌐 API CALL: ${options.method || "GET"} ${url}`);

  // ✅ FIXED: Now using your custom Storage.getAuthToken()
  const token = await Storage.getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const finalHeaders = {
    ...headers,
    ...((options.headers as Record<string, string>) || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers: finalHeaders,
  });

  console.log(`📡 RESPONSE: ${res.status} for ${url}`);

  if (!res.ok) {
    if (res.status === 401) {
      // ✅ FIXED: Now using your custom Storage.removeAuthToken()
      await Storage.removeAuthToken();
    }
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
};
