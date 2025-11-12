/**
 * Authentication Service
 * Handles user authentication and authorization
 */

import httpClient, { ApiResponse } from '@/lib/http-client';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/config/api';
import { AxiosResponse } from 'axios';

// User Type
export interface User {
  MaTaiKhoan: number;
  TenDangNhap: string;
  MaQuyen: number;
  TenQuyen: string;
  TrangThaiTaiKhoan: string;
  phanQuyen?: any;
  // Support both camelCase and snake_case from backend
  nhanVien?: {
    MaNhanVien: number;
    HoTen: string;
    SDT: string;
    Email?: string;
    ChucVu?: string;
  };
  nhan_vien?: {
    MaNhanVien: number;
    HoTen: string;
    SDT: string;
    Email?: string;
    ChucVu?: string;
  };
  khachThue?: {
    MaKhachThue: number;
    HoTen: string;
    SDT1: string;
    Email?: string;
  };
  khach_thue?: {
    MaKhachThue: number;
    HoTen: string;
    SDT1: string;
    Email?: string;
  };
}

// Login Request
export interface LoginRequest {
  TenDangNhap: string;
  password: string;
  remember?: boolean;
}

// Login Response
export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

// Register Request
export interface RegisterRequest {
  TenDangNhap: string;
  HoTen: string;
  SDT: string;
  Email?: string;
  password: string;
  password_confirmation: string;
}

// Forgot Password Request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset Password Request
export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

/**
 * Authentication Service Class
 */
class AuthService {
  /**
   * Login with TenDangNhap and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await httpClient.post(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        TenDangNhap: credentials.TenDangNhap,
        password: credentials.password
      }
    );

    const loginData = response.data.data!;
    const { access_token, user } = loginData;

    // Save token and user to localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<User> {
    const response: AxiosResponse<ApiResponse<LoginResponse>> = await httpClient.post(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    const loginData = response.data.data!;
    const { access_token, user } = loginData;

    // Save token and user to localStorage
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear all auth data from localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(signal?: AbortSignal): Promise<User> {
    const response: AxiosResponse<any> = await httpClient.get('/user', { signal });

    // Handle both wrapped and non-wrapped responses
    let user: User;
    if (response.data.data) {
      // Wrapped response: { "data": { "MaTaiKhoan": ... } }
      user = response.data.data;
    } else if (response.data.MaTaiKhoan) {
      // Non-wrapped response: { "MaTaiKhoan": ... }
      user = response.data;
    } else {
      throw new Error('Invalid response structure from /user endpoint');
    }

    // Update user in localStorage
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    return user;
  }

  /**
   * Forgot password - send reset link to email
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    await httpClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await httpClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Check if user has specific role by MaQuyen
   */
  hasRole(maQuyen: number): boolean {
    const user = this.getStoredUser();
    return user?.MaQuyen === maQuyen;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(maQuyens: number[]): boolean {
    const user = this.getStoredUser();
    return user ? maQuyens.includes(user.MaQuyen) : false;
  }

  /**
   * Check if user is admin (MaQuyen = 1)
   */
  isAdmin(): boolean {
    return this.hasRole(1);
  }

  /**
   * Check if user is staff (MaQuyen = 2)
   */
  isStaff(): boolean {
    return this.hasRole(2);
  }

  /**
   * Check if user is tenant (MaQuyen = 3)
   */
  isTenant(): boolean {
    return this.hasRole(3);
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
