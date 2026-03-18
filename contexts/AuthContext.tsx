import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api, isApiError } from "@/lib/api";
import { secureStorage } from "@/lib/storage";
import { ApiResponse, AuthTokens, User } from "@/types";

interface LoginData {
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const setPartialState = (partial: Partial<AuthState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await secureStorage.getAccessToken();
      if (!token) {
        setPartialState({ isLoading: false });
        return;
      }

      const response = await api.get<User>("/api/v1/users/current-user");
      setPartialState({
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await secureStorage.clearTokens();
      setPartialState({ isLoading: false });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    setPartialState({ isLoading: true, error: null });
    try {
      const response = await api.post<LoginData["data"]>(
        "/api/v1/users/login",
        { email, password }
      );
      const { user, accessToken, refreshToken } = response.data;
      await secureStorage.setTokens(accessToken, refreshToken);
      setPartialState({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      const msg =
        isApiError(error) ? error.message : "Login failed. Try again.";
      setPartialState({ error: msg, isLoading: false });
      throw error;
    }
  }, []);

  const register = useCallback(
    async (email: string, username: string, password: string) => {
      setPartialState({ isLoading: true, error: null });
      try {
        await api.post("/api/v1/users/register", { email, username, password });
        await login(email, password);
      } catch (error) {
        const msg =
          isApiError(error)
            ? error.message
            : "Registration failed. Try again.";
        setPartialState({ error: msg, isLoading: false });
        throw error;
      }
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/api/v1/users/logout", {});
    } catch {
      // best-effort logout
    } finally {
      await secureStorage.clearTokens();
      setPartialState({ user: null, isAuthenticated: false });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<User>("/api/v1/users/current-user");
      setPartialState({ user: response.data });
    } catch {
      // silently fail
    }
  }, []);

  const clearError = useCallback(() => {
    setPartialState({ error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, clearError, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
