// utils/storage.ts
import * as SecureStore from "expo-secure-store";

// Define storage keys locally
const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_DATA: "user_data",
  APP_SETTINGS: "app_settings",
} as const;

// Define types for better TypeScript support
export interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  phone?: string;
  communityId?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
  lastSync?: string;
  biometricAuth?: boolean;
}

export class StorageError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export const Storage = {
  // Token operations
  async setToken(token: string): Promise<void> {
    try {
      if (!token) {
        throw new StorageError('Token cannot be empty', 'setToken');
      }
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to store token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'setToken'
      );
    }
  },

  async getToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      return token || null;
    } catch (error) {
      throw new StorageError(
        `Failed to retrieve token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getToken'
      );
    }
  },

  async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      throw new StorageError(
        `Failed to remove token: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'removeToken'
      );
    }
  },

  // User data operations
  async setUserData(data: UserData): Promise<void> {
    try {
      if (!data || typeof data !== 'object') {
        throw new StorageError('User data must be a valid object', 'setUserData');
      }
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(data)
      );
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(
        `Failed to store user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'setUserData'
      );
    }
  },

  async getUserData(): Promise<UserData | null> {
    try {
      const result = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      if (!result) return null;

      const parsedData = JSON.parse(result);
      
      // Basic validation
      if (typeof parsedData !== 'object' || !parsedData.id || !parsedData.email) {
        console.warn('Stored user data is invalid, clearing...');
        await this.removeUserData();
        return null;
      }

      return parsedData as UserData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Corrupted JSON, clear the invalid data
        await this.removeUserData();
        return null;
      }
      throw new StorageError(
        `Failed to retrieve user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getUserData'
      );
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      throw new StorageError(
        `Failed to remove user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'removeUserData'
      );
    }
  },

  // App settings operations
  async setAppSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getAppSettings();
      const mergedSettings = { ...currentSettings, ...settings };
      
      await SecureStore.setItemAsync(
        STORAGE_KEYS.APP_SETTINGS,
        JSON.stringify(mergedSettings)
      );
    } catch (error) {
      throw new StorageError(
        `Failed to store app settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'setAppSettings'
      );
    }
  },

  async getAppSettings(): Promise<AppSettings> {
    try {
      const result = await SecureStore.getItemAsync(STORAGE_KEYS.APP_SETTINGS);
      if (!result) {
        // Return default settings if none stored
        return {
          theme: 'auto',
          notifications: true,
          language: 'en',
          biometricAuth: false,
        };
      }

      const parsedSettings = JSON.parse(result);
      return {
        theme: parsedSettings.theme || 'auto',
        notifications: parsedSettings.notifications !== false,
        language: parsedSettings.language || 'en',
        lastSync: parsedSettings.lastSync,
        biometricAuth: parsedSettings.biometricAuth || false,
      };
    } catch (error) {
      if (error instanceof SyntaxError) {
        // Corrupted JSON, clear and return defaults
        await this.removeAppSettings();
        return {
          theme: 'auto',
          notifications: true,
          language: 'en',
          biometricAuth: false,
        };
      }
      throw new StorageError(
        `Failed to retrieve app settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getAppSettings'
      );
    }
  },

  async removeAppSettings(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.APP_SETTINGS);
    } catch (error) {
      throw new StorageError(
        `Failed to remove app settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'removeAppSettings'
      );
    }
  },

  // Utility methods
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.removeToken(),
        this.removeUserData(),
        this.removeAppSettings(),
      ]);
    } catch (error) {
      throw new StorageError(
        `Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'clearAll'
      );
    }
  },

  // Check if user is authenticated (has both token and user data)
  async isAuthenticated(): Promise<boolean> {
    try {
      const [token, userData] = await Promise.all([
        this.getToken(),
        this.getUserData(),
      ]);
      return !!(token && userData);
    } catch (error) {
      console.error('Authentication check failed:', error);
      return false;
    }
  },

  // Get authentication state with details
  async getAuthState(): Promise<{
    isAuthenticated: boolean;
    hasToken: boolean;
    hasUserData: boolean;
    userData: UserData | null;
  }> {
    try {
      const [token, userData] = await Promise.all([
        this.getToken(),
        this.getUserData(),
      ]);

      return {
        isAuthenticated: !!(token && userData),
        hasToken: !!token,
        hasUserData: !!userData,
        userData,
      };
    } catch (error) {
      throw new StorageError(
        `Failed to get auth state: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'getAuthState'
      );
    }
  },

  // Additional utility: Check if specific data exists
  async hasItem(key: keyof typeof STORAGE_KEYS): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(STORAGE_KEYS[key]);
      return value !== null;
    } catch (error) {
      return false;
    }
  },

  // Get all storage keys (for debugging)
  async getStorageStatus(): Promise<{[key: string]: boolean}> {
    const status: {[key: string]: boolean} = {};
    
    for (const [keyName, keyValue] of Object.entries(STORAGE_KEYS)) {
      status[keyName] = await this.hasItem(keyValue as keyof typeof STORAGE_KEYS);
    }
    
    return status;
  }
};