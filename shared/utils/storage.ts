// shared/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Storage = {
  // User data
  setUserData: async (userData: any): Promise<void> => {
    try {
      await AsyncStorage.setItem("user_data", JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to save user data:", error);
      throw error;
    }
  },

  getUserData: async (): Promise<any> => {
    try {
      const data = await AsyncStorage.getItem("user_data");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to load user data:", error);
      throw error;
    }
  },

  removeUserData: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("user_data");
    } catch (error) {
      console.error("Failed to remove user data:", error);
      throw error;
    }
  },

  // Auth token
  setAuthToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem("auth_token", token);
    } catch (error) {
      console.error("Failed to save auth token:", error);
      throw error;
    }
  },

  getAuthToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("auth_token");
    } catch (error) {
      console.error("Failed to load auth token:", error);
      throw error;
    }
  },

  removeAuthToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("auth_token");
    } catch (error) {
      console.error("Failed to remove auth token:", error);
      throw error;
    }
  },

  // Theme preference
  setThemePreference: async (
    theme: "light" | "dark" | "auto"
  ): Promise<void> => {
    try {
      await AsyncStorage.setItem("theme_preference", theme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
      throw error;
    }
  },

  getThemePreference: async (): Promise<"light" | "dark" | "auto" | null> => {
    try {
      return (await AsyncStorage.getItem("theme_preference")) as
        | "light"
        | "dark"
        | "auto"
        | null;
    } catch (error) {
      console.error("Failed to load theme preference:", error);
      throw error;
    }
  },

  // Language preference
  setLanguagePreference: async (language: string): Promise<void> => {
    try {
      await AsyncStorage.setItem("language_preference", language);
    } catch (error) {
      console.error("Failed to save language preference:", error);
      throw error;
    }
  },

  getLanguagePreference: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("language_preference");
    } catch (error) {
      console.error("Failed to load language preference:", error);
      throw error;
    }
  },

  // Clear all storage (for logout)
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([
        "user_data",
        "auth_token",
        "theme_preference",
        "language_preference",
      ]);
    } catch (error) {
      console.error("Failed to clear storage:", error);
      throw error;
    }
  },
};
