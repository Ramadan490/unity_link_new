// config/index.ts
export const Config = {
  API: {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || "http://192.168.12.125:3000",
    TIMEOUT: 30000, // 30 seconds
    ENDPOINTS: {
      AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
        LOGOUT: "/auth/logout",
        FORGOT_PASSWORD: "/auth/forgot-password",
        RESET_PASSWORD: "/auth/reset-password",
        PROFILE: "/auth/profile",
      },
      USERS: {
        BASE: "/users",
        ROLES: "/users/roles",
        PROFILE: "/users/profile",
      },
      ANNOUNCEMENTS: "/announcements",
      EVENTS: "/events",
      MEMORIALS: "/memorials",
      REQUESTS: "/requests",
    },
  },
  APP: {
    NAME: "UnityLink",
    VERSION: "1.0.0",
    ENV: process.env.NODE_ENV || "development",
  },
  STORAGE: {
    AUTH_TOKEN: "auth_token",
    USER_DATA: "user_data",
    APP_SETTINGS: "app_settings",
  },
  ERRORS: {
    NETWORK: "Network error. Please check your connection.",
    TIMEOUT: "Request timeout. Please try again.",
    SERVER: "Server error. Please try again later.",
    UNAUTHORIZED: "Unauthorized access. Please login again.",
  },
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${Config.API.BASE_URL}${endpoint}`;
};

// Type exports for better TypeScript support
export type ApiEndpoint = keyof typeof Config.API.ENDPOINTS;
export type AuthEndpoint = keyof typeof Config.API.ENDPOINTS.AUTH;
export type UsersEndpoint = keyof typeof Config.API.ENDPOINTS.USERS;