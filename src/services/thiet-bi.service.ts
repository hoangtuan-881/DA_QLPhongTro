import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

// Interface với Vietnamese keys (giống backend)
export interface ThietBi {
  MaThietBi: number;
  TenThietBi: string;
  MaThietBi_Code: string;
  LoaiThietBi: 'NoiThat' | 'ThietBiDien' | 'DienTu' | 'AnToan' | 'Khac';
  MaDay: number | null;
  MaPhong: number | null;
  TinhTrang: 'Tot' | 'Binh_Thuong' | 'Kem' | 'Hu_Hong';
  GiaMua: number | null;
  NgayMua: string | null;
  HangSanXuat: string | null;
  GhiChu: string | null; // Changed from MoTa to GhiChu
  // Nested relationships
  dayTro?: {
    MaDay: number;
    TenDay: string;
  };
  phongTro?: {
    MaPhong: number;
    TenPhong: string;
  };
}

// Type cho create (không có MaThietBi và computed fields)
export type ThietBiCreateInput = Omit<ThietBi, 'MaThietBi' | 'dayTro' | 'phongTro'>;

// Type cho update (partial)
export type ThietBiUpdateInput = Partial<ThietBiCreateInput>;

class ThietBiService {
  /**
   * Lấy danh sách tất cả thiết bị
   */
  async getAll(signal?: AbortSignal) {
    return httpClient.get<ThietBi[]>(API_ENDPOINTS.THIET_BI, { signal });
  }

  /**
   * Lấy thiết bị theo phòng
   */
  async getByPhong(maPhong: number, signal?: AbortSignal) {
    return httpClient.get<ThietBi[]>(`${API_ENDPOINTS.PHONG_TRO}/${maPhong}/thiet-bi`, { signal });
  }

  /**
   * Lấy chi tiết thiết bị theo ID
   */
  async getById(id: number) {
    return httpClient.get<ThietBi>(`${API_ENDPOINTS.THIET_BI}/${id}`);
  }

  /**
   * Tạo thiết bị mới
   */
  async create(data: ThietBiCreateInput) {
    return httpClient.post<ThietBi>(API_ENDPOINTS.THIET_BI, data);
  }

  /**
   * Cập nhật thiết bị
   */
  async update(id: number, data: ThietBiUpdateInput) {
    return httpClient.put<ThietBi>(`${API_ENDPOINTS.THIET_BI}/${id}`, data);
  }

  /**
   * Xóa thiết bị
   */
  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.THIET_BI}/${id}`);
  }
}

export default new ThietBiService();
