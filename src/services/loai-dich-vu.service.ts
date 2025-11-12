import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface LoaiDichVu {
  MaLoaiDV: number;
  MaNhomDV: number;
  TenDichVu: string;
  DonViTinh: string | null;
  DonGiaMacDinh: number | null;
}

class LoaiDichVuService {
  async getAll(signal?: AbortSignal) {
    return httpClient.get<LoaiDichVu[]>(`${API_ENDPOINTS.DICH_VU.replace('dich-vu', 'loai-dich-vu')}`, { signal });
  }
}

export default new LoaiDichVuService();
