import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  APP_SETTINGS: "app_settings",
} as const;

export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "board_member" | "community_member";
  avatar?: string;
  createdAt?: string;
  phone?: string;
  communityId?: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  notifications: boolean;
  language: string;
  lastSync?: string;
  biometricAuth?: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "auto",
  notifications: true,
  language: "en",
  biometricAuth: false,
};

function safeJSONParse<T>(data: string | null): T | null {
  try {
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export class StorageError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = "StorageError";
  }
}

export const Storage = {
  async setToken(token: string) {
    if (!token) throw new StorageError("Token cannot be empty", "setToken");
    await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  async getToken() {
    return (await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN)) || null;
  },
  async removeToken() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
  },

  async setUserData(data: UserData) {
    await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(data));
  },
  async getUserData(): Promise<UserData | null> {
    const parsed = safeJSONParse<UserData>(
      await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA),
    );
    return parsed && parsed.id && parsed.email ? parsed : null;
  },
  async removeUserData() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
  },

  async setAppSettings(settings: Partial<AppSettings>) {
    const current = await this.getAppSettings();
    const merged = { ...current, ...settings };
    await SecureStore.setItemAsync(
      STORAGE_KEYS.APP_SETTINGS,
      JSON.stringify(merged),
    );
  },
  async getAppSettings(): Promise<AppSettings> {
    const parsed = safeJSONParse<AppSettings>(
      await SecureStore.getItemAsync(STORAGE_KEYS.APP_SETTINGS),
    );
    return parsed ? { ...DEFAULT_SETTINGS, ...parsed } : DEFAULT_SETTINGS;
  },
  async removeAppSettings() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.APP_SETTINGS);
  },

  async clearAll() {
    await Promise.all([
      this.removeToken(),
      this.removeUserData(),
      this.removeAppSettings(),
    ]);
  },
  async isAuthenticated() {
    const [token, userData] = await Promise.all([
      this.getToken(),
      this.getUserData(),
    ]);
    return !!(token && userData);
  },
};
