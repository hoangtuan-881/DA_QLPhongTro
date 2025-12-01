import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface Xe {
  MaXe: number;
  MaKhachThue: number;
  BienSoXe: string;
  GhiChu: string | null;
}

export interface TaiKhoan {
  MaTaiKhoan: number;
  TenDangNhap: string;
  MaQuyen: number;
  TenQuyen: string;
  TrangThaiTaiKhoan: string;
}

export interface PhongTro {
  MaPhong: number;
  TenPhong: string;
  MaDay: number;
}

export interface KhachThue {
  MaKhachThue: number;
  HoTen: string;
  CCCD: string | null;
  NgayCapCCCD: string | null;
  NoiCapCCCD: string | null;
  SDT1: string;
  SDT2: string | null;
  Email: string | null;
  DiaChiThuongTru: string | null;
  NgaySinh: string | null;
  NoiSinh: string | null;
  VaiTro: string;
  GhiChu: string | null;
  MaPhong: number | null;
  MaTaiKhoan: number | null;
  HinhAnh: string | null;

  // Computed attributes
  TenPhong?: string;
  DiaChiDay?: string;

  // Relations from backend
  xes?: Xe[];
  taiKhoan?: TaiKhoan;
  phongTro?: PhongTro;
}

export type KhachThueListItem = Pick<KhachThue, 'MaKhachThue' | 'HoTen' | 'SDT1' | 'Email' | 'MaPhong' | 'TenPhong'>;

export type KhachThueCreateInput = Omit<
  KhachThue,
  'MaKhachThue' | 'TenPhong' | 'DiaChiDay'
> & {
  TenDangNhap: string;
  password: string;
  TrangThaiTaiKhoan?: string;
};

export type KhachThueUpdateInput = Partial<
  Omit<KhachThue, 'MaKhachThue' | 'TenPhong' | 'DiaChiDay'>
>;

export interface KhachThueQueryParams {
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  signal?: AbortSignal;
}

class KhachThueService {
  async getAll({ signal, ...params }: KhachThueQueryParams = {}) {
    return httpClient.get<{ data: KhachThue[] }>(API_ENDPOINTS.KHACH_THUE, { params, signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<KhachThue>(`${API_ENDPOINTS.KHACH_THUE}/${id}`, {
      signal,
    });
  }

  async create(data: KhachThueCreateInput) {
    return httpClient.post<KhachThue>(API_ENDPOINTS.KHACH_THUE, data);
  }

  async update(id: number, data: KhachThueUpdateInput) {
    return httpClient.put<KhachThue>(
      `${API_ENDPOINTS.KHACH_THUE}/${id}`,
      data
    );
  }

  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.KHACH_THUE}/${id}`);
  }
}

export default new KhachThueService();

// Helper functions cho UI
export function getVaiTroColor(vaiTro: string): string {
  const colors: Record<string, string> = {
    KHACH_CHINH: 'bg-blue-100 text-blue-800',
    THANH_VIEN: 'bg-green-100 text-green-800',
    TIEM_NANG: 'bg-yellow-100 text-yellow-800',
    DA_DON_DI: 'bg-red-100 text-red-800',
  };
  return colors[vaiTro] || 'bg-gray-100 text-gray-800';
}

export function getVaiTroText(vaiTro: string): string {
  const texts: Record<string, string> = {
    KHACH_CHINH: 'Khách chính',
    THANH_VIEN: 'Thành viên',
    TIEM_NANG: 'Tiềm năng',
    DA_DON_DI: 'Đã dọn đi',
  };
  return texts[vaiTro] || vaiTro;
}
