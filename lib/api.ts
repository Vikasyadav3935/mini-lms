import * as SecureStore from "expo-secure-store";
import { ApiResponse } from "@/types";

const BASE_URL = "https://api.freeapi.app";
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;

export type ApiError = {
  readonly _tag: "ApiError";
  readonly statusCode: number;
  readonly message: string;
  readonly isNetworkError: boolean;
};

export const createApiError = (
  statusCode: number,
  message: string,
  isNetworkError = false
): ApiError => ({ _tag: "ApiError", statusCode, message, isNetworkError });

export const isApiError = (error: unknown): error is ApiError =>
  typeof error === "object" &&
  error !== null &&
  (error as ApiError)._tag === "ApiError";

async function refreshTokens(): Promise<boolean> {
  try {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/api/v1/users/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const { data } = await res.json();
    await SecureStore.setItemAsync("accessToken", data.accessToken);
    await SecureStore.setItemAsync("refreshToken", data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  let lastError = createApiError(0, "Request failed", true);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }

    try {
      const token = await SecureStore.getItemAsync("accessToken");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers as Record<string, string>),
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.status === 401 && token) {
        const refreshed = await refreshTokens();
        if (refreshed) continue;
        throw createApiError(401, "Session expired. Please login again.");
      }

      const data = await res.json();

      if (!res.ok) {
        throw createApiError(res.status, data.message || "Something went wrong");
      }

      return data as ApiResponse<T>;
    } catch (err) {
      if (isApiError(err)) throw err;

      if (err instanceof Error && err.name === "AbortError") {
        throw createApiError(0, "Request timed out. Please try again.", true);
      }

      lastError = createApiError(0, "Network error. Check your connection.", true);
    }
  }

  throw lastError;
}

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: "DELETE" }),
};
