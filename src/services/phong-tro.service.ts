import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface PhongTro {
  MaPhong: number;
  MaDay: number;
  MaLoaiPhong: number;
  TenPhong: string;
  DonGiaCoBan: number;
  GiaThueHienTai: number | null;
  DienTich: number | null;
  TrangThai: string;  // 'Trống' | 'Đã cho thuê' | 'Bảo trì'
  MoTa: string | null;
  HinhAnh: string | null;
  TienNghi: string[];

  // Computed
  TenDay?: string;
  TenLoaiPhong?: string;

  // Relationships
  dayTro?: {
    MaDay: number;
    TenDay: string;
    DiaChi: string;
  };
  loaiPhong?: {
    MaLoaiPhong: number;
    TenLoaiPhong: string;
  };
  khachThue?: any[];
  dichVuDangKy?: any[];
}

export type PhongTroCreateInput = Omit<PhongTro,
  'MaPhong' | 'TenDay' | 'TenLoaiPhong' | 'dayTro' | 'loaiPhong' | 'khachThue' | 'dichVuDangKy'
>;

export type PhongTroUpdateInput = Partial<PhongTroCreateInput>;

class PhongTroService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get<PhongTro[]>(API_ENDPOINTS.PHONG_TRO, { signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<PhongTro>(`${API_ENDPOINTS.PHONG_TRO}/${id}`, { signal });
  }

  async create(data: PhongTroCreateInput) {
    return httpClient.post<PhongTro>(API_ENDPOINTS.PHONG_TRO, data);
  }

  async update(id: number, data: PhongTroUpdateInput) {
    return httpClient.put<PhongTro>(`${API_ENDPOINTS.PHONG_TRO}/${id}`, data);
  }

  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.PHONG_TRO}/${id}`);
  }
}

export default new PhongTroService();

// Helper functions
export function mapTrangThaiToStatus(trangThai: string): 'available' | 'occupied' | 'maintenance' {
  const map: Record<string, 'available' | 'occupied' | 'maintenance'> = {
    'Trống': 'available',
    'Đã cho thuê': 'occupied',
    'Bảo trì': 'maintenance',
  };
  return map[trangThai] || 'available';
}

export function mapStatusToTrangThai(status: 'available' | 'occupied' | 'maintenance'): string {
  const map: Record<string, string> = {
    'available': 'Trống',
    'occupied': 'Đã cho thuê',
    'maintenance': 'Bảo trì',
  };
  return map[status];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'available': 'bg-green-100 text-green-800',
    'occupied': 'bg-blue-100 text-blue-800',
    'maintenance': 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'available': 'Trống',
    'occupied': 'Đã thuê',
    'maintenance': 'Bảo trì',
  };
  return texts[status] || status;
}
