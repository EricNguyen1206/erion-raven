/**
 * Centralized Axios Client Configuration
 * 
 * Security approach:
 * - Uses httpOnly cookies for JWT tokens (set by backend)
 * - No token storage in frontend memory or localStorage
 * - withCredentials: true ensures cookies are sent with requests
 * - Automatic token refresh via httpOnly refresh token cookie
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { apiUrl, isDev } from "./config";

// API base URL from config
const API_BASE_URL = apiUrl;

// Create axios instance with secure defaults
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Send httpOnly cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Queue for failed requests while refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - cookies are automatically sent, no manual token handling needed
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log requests in development
    if (isDev) {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("🚨 Axios Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh for auth endpoints and profile endpoint to prevent infinite loops
    const isAuthEndpoint = originalRequest.url?.includes('/auth/signin') ||
      originalRequest.url?.includes('/auth/signup') ||
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/signout') ||
      originalRequest.url?.includes('/users/profile');

    // If error is 401 (Unauthorized) and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token using httpOnly refresh token cookie
        await apiClient.post("/auth/refresh");

        // Process queued requests
        processQueue(null, null);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, process queue with error
        processQueue(refreshError, null);

        // Redirect to login if in browser
        if (typeof window !== "undefined") {
          // Clear any client-side state here if needed
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log errors in development
    if (isDev) {
      console.error("🚨 Axios Response Error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Generic API request helper
 * Returns the response data directly
 */
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response: AxiosResponse<T> = await apiClient.request<T>(config);
  return response.data;
};

// Export default instance for backward compatibility
export default apiClient;
