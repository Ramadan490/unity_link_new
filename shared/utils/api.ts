// utils/api.ts
import { mockApiFetch } from "./mockApi";

// Use environment variable or default to mock data
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Timeout function
const fetchWithTimeout = (
  url: string,
  options: RequestInit = {},
  timeout = 10000,
): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(
        () => reject(new TypeError("Network request timed out")),
        timeout,
      ),
    ),
  ]);
};

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Use mock data if no valid API URL is configured
  if (!API_BASE_URL || API_BASE_URL.includes("your-api.com")) {
    console.log("📦 Using mock data for:", endpoint);
    return mockApiFetch<T>(endpoint);
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log("🌐 API Request:", url);

    const res = await fetchWithTimeout(
      url,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options?.headers,
        },
        ...options,
      },
      8000,
    ); // 8 second timeout

    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log("✅ API Response:", endpoint, data);
    return data as T;
  } catch (error) {
    console.warn("❌ API fetch failed, using mock data for:", endpoint, error);
    return mockApiFetch<T>(endpoint);
  }
}
