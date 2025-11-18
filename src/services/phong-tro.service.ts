import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

// TODO Backend: Add ThietBiPhong interface when API is ready
export interface ThietBiPhong {
  MaThietBi: number;
  TenThietBi: string;
  MaThietBi_Code: string;
  LoaiThietBi: 'NoiThat' | 'ThietBiDien' | 'DienTu' | 'AnToan' | 'Khac';
  SoLuong: number;
  GhiChu?: string;
}

export interface PhongTro {
  MaPhong: number;
  MaDay: number;
  MaLoaiPhong: number;
  TenPhong: string;
  DonGiaCoBan: number;
  GiaThueHienTai: number | null;
  DienTich: number | null;
  TrangThai: string;  // 'Trống' | 'DaThue' | 'BaoTri' | 'DaCoc'
  MoTa: string | null;
  HinhAnh: string | null;
  TienNghi: string[];

  // Computed attributes from backend
  TenDay: string;
  TenLoaiPhong: string;
  LoaiPhong: string; // Alias
  GiaThue: number; // Computed: GiaThueHienTai ?? DonGiaCoBan
  TienCoc: number; // Computed: 1 month rent

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
  thietBis?: ThietBiPhong[];
}

export type PhongTroCreateInput = Omit<PhongTro,
  'MaPhong' | 'TenDay' | 'TenLoaiPhong' | 'dayTro' | 'loaiPhong' | 'khachThue' | 'dichVuDangKy' | 'thietBis'
>;

export type PhongTroUpdateInput = Partial<PhongTroCreateInput>;

class PhongTroService {
  async getAll(signal?: AbortSignal) {
    const config: any = {};
    if (signal) config.signal = signal;
    return httpClient.get<PhongTro[]>(API_ENDPOINTS.PHONG_TRO, config);
  }

  async getById(id: number, signal?: AbortSignal) {
    const config: any = {};
    if (signal) config.signal = signal;
    return httpClient.get<PhongTro>(`${API_ENDPOINTS.PHONG_TRO}/${id}`, config);
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

  async capNhatDayDu(id: number, data: PhongTroUpdateInput) {
    return httpClient.put<PhongTro>(`${API_ENDPOINTS.PHONG_TRO}/${id}/cap-nhat-day-du`, data);
  }

  async getByTrangThai(trangThai: string, signal?: AbortSignal) {
    const config: any = {};
    if (signal) config.signal = signal;
    return httpClient.get<PhongTro[]>(`${API_ENDPOINTS.PHONG_TRO}/trang-thai/${trangThai}`, config);
  }

  // PUBLIC API - Không cần đăng nhập
  async getPublicPhongTrong(signal?: AbortSignal) {
    const config: any = {};
    if (signal) config.signal = signal;
    return httpClient.get<PhongTro[]>('/public/phong-trong', config);
  }

  async getPublicPhongDetail(id: number, signal?: AbortSignal) {
    const config: any = {};
    if (signal) config.signal = signal;
    return httpClient.get<PhongTro>(`/public/phong-tro/${id}`, config);
  }
}

export default new PhongTroService();

// Helper functions
export function mapTrangThaiToStatus(trangThai: string): 'available' | 'occupied' | 'maintenance' | 'reserved' {
  const map: Record<string, 'available' | 'occupied' | 'maintenance' | 'reserved'> = {
    'Trống': 'available',
    'Đã thuê': 'occupied',
    'Bảo trì': 'maintenance',
    'Đã cọc': 'reserved',
  };
  return map[trangThai] || 'available';
}

export function mapStatusToTrangThai(status: 'available' | 'occupied' | 'maintenance' | 'reserved'): string {
  const map: Record<string, string> = {
    'available': 'Trống',
    'occupied': 'Đã thuê',
    'maintenance': 'Bảo trì',
    'reserved': 'Đã cọc',
  };
  return map[status];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'available': 'bg-green-100 text-green-800',
    'occupied': 'bg-blue-100 text-blue-800',
    'maintenance': 'bg-yellow-100 text-yellow-800',
    'reserved': 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    'available': 'Trống',
    'occupied': 'Đã thuê',
    'maintenance': 'Bảo trì',
    'reserved': 'Đã cọc',
  };
  return texts[status] || status;
}
