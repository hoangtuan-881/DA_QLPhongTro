import httpClient from '../lib/http-client';
import { getErrorMessage } from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

// Interface với Vietnamese keys (giống backend)
export interface LoaiPhong {
  MaLoaiPhong: number;
  TenLoaiPhong: string;
  MoTa: string;
  DonGiaCoBan: number;
  DienTich: number | null;
  TienNghi: string[];
  TongSoPhong: number;
  SoPhongTrong: number;
  SoPhongDaThue: number;
  SoPhongBaoTri: number;
}

// Type cho create (không có id và computed fields)
export type LoaiPhongCreateInput = Omit<LoaiPhong, 'MaLoaiPhong' | 'TongSoPhong' | 'SoPhongTrong' | 'SoPhongDaThue' | 'SoPhongBaoTri'>;

// Type cho update (partial)
export type LoaiPhongUpdateInput = Partial<LoaiPhongCreateInput>;

class LoaiPhongService {
  /**
   * Lấy danh sách tất cả loại phòng
   */
  async getAll(signal?: AbortSignal) {
    return httpClient.get<LoaiPhong[]>(API_ENDPOINTS.LOAI_PHONG, { signal });
  }

  /**
   * Lấy chi tiết loại phòng theo ID
   */
  async getById(id: number) {
    return httpClient.get<LoaiPhong>(`${API_ENDPOINTS.LOAI_PHONG}/${id}`);
  }

  /**
   * Tạo loại phòng mới
   */
  async create(data: LoaiPhongCreateInput) {
    return httpClient.post<LoaiPhong>(API_ENDPOINTS.LOAI_PHONG, data);
  }

  /**
   * Cập nhật loại phòng
   */
  async update(id: number, data: LoaiPhongUpdateInput) {
    return httpClient.put<LoaiPhong>(`${API_ENDPOINTS.LOAI_PHONG}/${id}`, data);
  }

  /**
   * Xóa loại phòng
   */
  async delete(id: number) {
    return httpClient.delete(`${API_ENDPOINTS.LOAI_PHONG}/${id}`);
  }
}

export default new LoaiPhongService();
