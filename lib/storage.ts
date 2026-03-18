import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  BOOKMARKS: "bookmarks",
  USER_PREFERENCES: "user_preferences",
  ENROLLED_COURSES: "enrolled_courses",
  LAST_ACTIVE: "last_active",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

// SecureStore for sensitive data
export const secureStorage = {
  setTokens: async (accessToken: string, refreshToken: string) => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  getAccessToken: () => SecureStore.getItemAsync(KEYS.ACCESS_TOKEN),
  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH_TOKEN),

  clearTokens: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    ]);
  },
};

// AsyncStorage for app data
export const appStorage = {
  getBookmarks: async (): Promise<string[]> => {
    const data = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },

  setBookmarks: async (bookmarks: string[]) => {
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  getEnrolledCourses: async (): Promise<string[]> => {
    const data = await AsyncStorage.getItem(KEYS.ENROLLED_COURSES);
    return data ? JSON.parse(data) : [];
  },

  setEnrolledCourses: async (courses: string[]) => {
    await AsyncStorage.setItem(KEYS.ENROLLED_COURSES, JSON.stringify(courses));
  },

  getLastActive: async (): Promise<string | null> => {
    return AsyncStorage.getItem(KEYS.LAST_ACTIVE);
  },

  setLastActive: async () => {
    await AsyncStorage.setItem(KEYS.LAST_ACTIVE, new Date().toISOString());
  },

  getUserPreferences: async (): Promise<Record<string, unknown>> => {
    const data = await AsyncStorage.getItem(KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {};
  },

  setUserPreferences: async (prefs: Record<string, unknown>) => {
    await AsyncStorage.setItem(KEYS.USER_PREFERENCES, JSON.stringify(prefs));
  },

  clearAll: async () => {
    await AsyncStorage.multiRemove([
      KEYS.BOOKMARKS,
      KEYS.USER_PREFERENCES,
      KEYS.ENROLLED_COURSES,
    ]);
  },
};

export { KEYS };
