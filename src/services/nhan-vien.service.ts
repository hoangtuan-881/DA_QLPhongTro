import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface TaiKhoanInfo {
  TenDangNhap: string;
  MaQuyen: number;
  TrangThaiTaiKhoan: 'Hoạt động' | 'Bị khóa';
}

export interface NhanVien {
  MaNV: number;
  HoTen: string;
  CCCD: string | null;
  NgayCapCCCD: string | null;
  NoiCapCCCD: string | null;
  SDT: string | null;
  Email: string | null;
  DiaChi: string | null;
  NgaySinh: string | null;
  GioiTinh: 'Nam' | 'Nữ' | 'Khác' | null;
  MaTaiKhoan: number | null;
  TaiKhoan?: TaiKhoanInfo;
}

export interface NhanVienCreateInput {
  HoTen: string;
  CCCD?: string | null;
  NgayCapCCCD?: string | null;
  NoiCapCCCD?: string | null;
  SDT: string;
  Email?: string | null;
  DiaChi?: string | null;
  NgaySinh?: string | null;
  GioiTinh?: 'Nam' | 'Nữ' | 'Khác' | null;
  // Tài khoản
  TenDangNhap: string;
  password: string;
  MaQuyen: number;
  TrangThaiTaiKhoan?: 'Hoạt động' | 'Bị khóa';
}

export interface NhanVienUpdateInput {
  HoTen?: string;
  CCCD?: string | null;
  NgayCapCCCD?: string | null;
  NoiCapCCCD?: string | null;
  SDT?: string;
  Email?: string | null;
  DiaChi?: string | null;
  NgaySinh?: string | null;
  GioiTinh?: 'Nam' | 'Nữ' | 'Khác' | null;
  // Tài khoản (optional khi update)
  TenDangNhap?: string;
  password?: string;
  MaQuyen?: number;
  TrangThaiTaiKhoan?: 'Hoạt động' | 'Bị khóa';
}

class NhanVienService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: NhanVien[] }>(API_ENDPOINTS.NHAN_VIEN, { signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<NhanVien>(`${API_ENDPOINTS.NHAN_VIEN}/${id}`, {
      signal,
    });
  }

  async create(data: NhanVienCreateInput) {
    return httpClient.post<NhanVien>(API_ENDPOINTS.NHAN_VIEN, data);
  }

  async update(id: number, data: NhanVienUpdateInput) {
    return httpClient.put<NhanVien>(
      `${API_ENDPOINTS.NHAN_VIEN}/${id}`,
      data
    );
  }

  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.NHAN_VIEN}/${id}`);
  }
}

export default new NhanVienService();
