/**
 * API Configuration
 * Centralized API endpoints and configuration
 */

// Base API URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// API timeout (30 seconds)
export const API_TIMEOUT = 30000;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Day Tro (Buildings)
  DAY_TRO: '/admin/day-tro',

  // Phong Tro (Rooms)
  PHONG_TRO: '/admin/phong-tro',

  // Loai Phong (Room Types)
  LOAI_PHONG: '/loai-phong',

  // Khach Thue (Tenants)
  KHACH_THUE: '/admin/khach-thue',

  // Nhan Vien (Staff)
  NHAN_VIEN: '/nhan-vien',

  // Hop Dong (Contracts)
  HOP_DONG: '/hop-dong',

  // Hoa Don (Invoices/Bills)
  HOA_DON: '/hoa-don',

  // Dich Vu (Services)
  DICH_VU: '/dich-vu',

  // Dat Coc (Deposits)
  DAT_COC: '/dat-coc',

  // Bao Tri (Maintenance)
  BAO_TRI: '/bao-tri',

  // Thiet Bi (Equipment)
  THIET_BI: '/thiet-bi',

  // Quy Dinh (Rules)
  QUY_DINH: '/quy-dinh',

  // Vi Pham (Violations)
  VI_PHAM: '/vi-pham',

  // Thong Bao (Notifications)
  THONG_BAO: '/thong-bao',

  // Bao Cao (Reports)
  BAO_CAO: '/bao-cao',

  // Profile
  PROFILE: '/profile',

  // Settings
  SETTINGS: '/settings',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LANGUAGE: 'language',
} as const;
