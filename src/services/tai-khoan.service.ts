import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';
import { NhanVien } from './nhan-vien.service';

export interface TaiKhoan {
  MaTaiKhoan: number;
  TenDangNhap: string;
  MaQuyen: number;
  TenQuyen: string;
  TrangThaiTaiKhoan: string;
  nhanVien?: NhanVien;
  khachThue?: {
    MaKhachThue: number;
    HoTen: string;
    SDT: string | null;
    Email: string | null;
    MaTaiKhoan: number | null;
  };
}

export type TaiKhoanCreateInput = {
  TenDangNhap: string;
  Email: string;
  password: string;
  MaQuyen: number;
  HoTen: string;
  SDT: string;
};

export type TaiKhoanUpdateInput = {
  TenDangNhap?: string;
  Email?: string;
  password?: string;
  MaQuyen?: number;
  TrangThaiTaiKhoan?: string;
  HoTen?: string;
  SDT?: string;
};

class TaiKhoanService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: TaiKhoan[] }>(API_ENDPOINTS.TAI_KHOAN, { signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<TaiKhoan>(`${API_ENDPOINTS.TAI_KHOAN}/${id}`, {
      signal,
    });
  }

  async create(data: TaiKhoanCreateInput) {
    return httpClient.post<TaiKhoan>(API_ENDPOINTS.TAI_KHOAN, data);
  }

  async update(id: number, data: TaiKhoanUpdateInput) {
    return httpClient.put<TaiKhoan>(
      `${API_ENDPOINTS.TAI_KHOAN}/${id}`,
      data
    );
  }

  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.TAI_KHOAN}/${id}`);
  }
}

export default new TaiKhoanService();
