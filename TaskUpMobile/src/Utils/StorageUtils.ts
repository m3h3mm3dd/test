import AsyncStorage from '@react-native-async-storage/async-storage';

export class StorageUtils {
  private static readonly TOKEN_KEY = '@TaskUp:token';
  private static readonly USER_KEY = '@TaskUp:user';
  private static readonly THEME_KEY = '@TaskUp:theme';
  private static readonly ONBOARDING_KEY = '@TaskUp:onboarding';
  private static readonly NOTIFICATION_SETTINGS_KEY = '@TaskUp:notificationSettings';

  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing token', error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving token', error);
      return null;
    }
  }

  static async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token', error);
    }
  }

  static async setUser(user: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error storing user', error);
    }
  }

  static async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error retrieving user', error);
      return null;
    }
  }

  static async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user', error);
    }
  }

  static async setThemeMode(mode: 'dark' | 'light'): Promise<void> {
    try {
      await AsyncStorage.setItem(this.THEME_KEY, mode);
    } catch (error) {
      console.error('Error storing theme mode', error);
    }
  }

  static async getThemeMode(): Promise<'dark' | 'light' | null> {
    try {
      return await AsyncStorage.getItem(this.THEME_KEY) as 'dark' | 'light' | null;
    } catch (error) {
      console.error('Error retrieving theme mode', error);
      return null;
    }
  }

  static async setOnboardingStatus(completed: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.ONBOARDING_KEY, completed.toString());
    } catch (error) {
      console.error('Error storing onboarding status', error);
    }
  }

  static async getOnboardingStatus(): Promise<boolean> {
    try {
      const status = await AsyncStorage.getItem(this.ONBOARDING_KEY);
      return status === 'true';
    } catch (error) {
      console.error('Error retrieving onboarding status', error);
      return false;
    }
  }

  static async setNotificationSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error storing notification settings', error);
    }
  }

  static async getNotificationSettings(): Promise<any | null> {
    try {
      const settings = await AsyncStorage.getItem(this.NOTIFICATION_SETTINGS_KEY);
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error retrieving notification settings', error);
      return null;
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  }

  // Generic methods for storing and retrieving data
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error storing ${key}`, error);
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error retrieving ${key}`, error);
      return null;
    }
  }

  static async setObject(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error storing object at ${key}`, error);
    }
  }

  static async getObject(key: string): Promise<any | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error retrieving object at ${key}`, error);
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}`, error);
    }
  }
}