/**
 * Axios HTTP Client
 * Configured with interceptors for authentication and error handling
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS, HTTP_STATUS } from '@/config/api';

// API Response Type
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Error Response Type
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Create Axios Instance
 */
const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Request Interceptor
 * Add authentication token to requests
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    // Add token to headers if exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common errors and token refresh
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
      originalRequest._retry = true;

      // Since Laravel Sanctum doesn't use refresh tokens, just clear and redirect
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (error.response?.status === HTTP_STATUS.FORBIDDEN) {
      // Redirect to 403 page
      if (window.location.pathname !== '/403') {
        window.location.href = '/403';
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;

    // Get first validation error (PRIORITY)
    if (axiosError.response?.data?.errors) {
      const errors = axiosError.response.data.errors;
      const firstErrorKey = Object.keys(errors)[0];
      return errors[firstErrorKey][0];
    }

    // Get message from response (FALLBACK)
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    // Network error
    if (axiosError.message === 'Network Error') {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
    }

    // Timeout error
    if (axiosError.code === 'ECONNABORTED') {
      return 'Yêu cầu quá hạn. Vui lòng thử lại.';
    }

    return axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định';
}

/**
 * Extract validation errors from API error
 */
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse>;
    return axiosError.response?.data?.errors || null;
  }
  return null;
}

export default httpClient;
