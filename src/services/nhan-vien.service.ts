import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface NhanVien {
  MaNV: number;
  HoTen: string;
  SDT: string | null;
  Email: string | null;
  MaTaiKhoan: number | null;
}

export type NhanVienListItem = Pick<NhanVien, 'MaNV' | 'HoTen' | 'SDT' | 'Email'>;

export type NhanVienCreateInput = Omit<NhanVien, 'MaNV'>;

export type NhanVienUpdateInput = Partial<Omit<NhanVien, 'MaNV'>>;

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
