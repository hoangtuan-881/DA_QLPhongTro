/**
 * Profile Service
 * Handles user profile operations
 */

import httpClient from '@/lib/http-client';
import type { ApiResponse } from '@/lib/http-client';
import { API_ENDPOINTS } from '@/config/api';
import type { AxiosResponse } from 'axios';

// Account Info
export interface TaiKhoan {
  MaTaiKhoan: number;
  TenDangNhap: string;
  MaQuyen: number;
  TenQuyen: string;
  TrangThaiTaiKhoan: string;
}

// Nhan Vien Profile (Admin/Staff)
export interface NhanVienProfile {
  MaNhanVien: number;
  HoTen: string;
  SDT: string;
  Email?: string;
  CCCD?: string;
  NgayCapCCCD?: string;
  NoiCapCCCD?: string;
  DiaChi?: string;
  NgaySinh?: string;
  GioiTinh?: string;
  MaTaiKhoan: number;
  taiKhoan: TaiKhoan;
}

// Khach Thue Profile (Tenant)
export interface KhachThueProfile {
  MaKhachThue: number;
  HoTen: string;
  CCCD?: string;
  NgayCapCCCD?: string;
  NoiCapCCCD?: string;
  SDT1: string;
  SDT2?: string;
  Email?: string;
  DiaChiThuongTru?: string;
  NgaySinh?: string;
  NoiSinh?: string;
  HinhAnh?: string;
  MaTaiKhoan: number;
  MaPhong?: number;
  VaiTro?: string;
  SoXe?: number;
  MaLoaiXe?: number;
  taiKhoan: TaiKhoan;
}

// Update Profile Request
export interface UpdateNhanVienRequest {
  HoTen?: string;
  SDT?: string;
  Email?: string;
  CCCD?: string;
  NgayCapCCCD?: string;
  NoiCapCCCD?: string;
  DiaChi?: string;
  NgaySinh?: string;
  GioiTinh?: string;
}

export interface UpdateKhachThueRequest {
  HoTen?: string;
  CCCD?: string;
  NgayCapCCCD?: string;
  NoiCapCCCD?: string;
  SDT1?: string;
  SDT2?: string;
  Email?: string;
  DiaChiThuongTru?: string;
  NgaySinh?: string;
  NoiSinh?: string;
  SoXe?: number;
  MaLoaiXe?: number;
}

// Change Password Request
export interface ChangePasswordRequest {
  password_hien_tai: string;
  password_moi: string;
  password_moi_confirmation: string;
}

/**
 * Profile Service Class
 */
class ProfileService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<NhanVienProfile | KhachThueProfile> {
    const response: AxiosResponse<ApiResponse<NhanVienProfile | KhachThueProfile>> = await httpClient.get(
      API_ENDPOINTS.PROFILE
    );
    return response.data.data!;
  }

  /**
   * Update profile
   */
  async updateProfile(
    data: UpdateNhanVienRequest | UpdateKhachThueRequest
  ): Promise<NhanVienProfile | KhachThueProfile> {
    const response: AxiosResponse<ApiResponse<NhanVienProfile | KhachThueProfile>> = await httpClient.put(
      API_ENDPOINTS.PROFILE,
      data
    );
    return response.data.data!;
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await httpClient.put(`${API_ENDPOINTS.PROFILE}/change-password`, data);
  }

  /**
   * Delete account
   */
  async deleteAccount(password: string): Promise<void> {
    await httpClient.delete(`${API_ENDPOINTS.PROFILE}/account`, {
      data: { password }
    });
  }

  /**
   * Check if profile is NhanVien
   */
  isNhanVienProfile(profile: any): profile is NhanVienProfile {
    return 'MaNhanVien' in profile;
  }

  /**
   * Check if profile is KhachThue
   */
  isKhachThueProfile(profile: any): profile is KhachThueProfile {
    return 'MaKhachThue' in profile;
  }
}

// Export singleton instance
export const profileService = new ProfileService();
export default profileService;
