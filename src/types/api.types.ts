/**
 * Common API Types
 * Shared TypeScript types for API communication
 */

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Pagination metadata
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  links?: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// Common query parameters
export interface QueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

// Common status types
export type Status = 'active' | 'inactive';
export type RoomStatus = 'trong' | 'da_thue' | 'dang_sua_chua' | 'khong_hoat_dong';
export type UserRole = 'admin' | 'nhan_vien' | 'khach_thue';
export type ContractStatus = 'hieu_luc' | 'het_han' | 'huy';
export type PaymentStatus = 'chua_thanh_toan' | 'da_thanh_toan' | 'qua_han';
export type MaintenanceStatus = 'cho_xu_ly' | 'dang_xu_ly' | 'hoan_thanh' | 'huy';

// File upload types
export interface UploadedFile {
  id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  url: string;
}
