import httpClient from '../lib/http-client';

export interface SoDien {
  MaSoDien: number;
  MaPhong: number;
  Thang: string;
  ChiSoCu: number;
  ChiSoMoi: number;
  SoKwh: number;
  NgayGhi: string;
  GhiChu?: string;
}

export interface CreateSoDienRequest {
  MaPhong: number;
  Thang: string;
  ChiSoCu: number;
  ChiSoMoi: number;
  NgayGhi: string;
  GhiChu?: string;
}

const SODIEN_API_URL = '/admin/so-dien';

class SoDienService {
  getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: SoDien[] }>(SODIEN_API_URL, { signal });
  }

  getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: SoDien }>(`${SODIEN_API_URL}/${id}`, { signal });
  }

  create(data: CreateSoDienRequest) {
    return httpClient.post<{ data: SoDien }>(SODIEN_API_URL, data);
  }

  update(id: number, data: Partial<CreateSoDienRequest>) {
    return httpClient.put<{ data: SoDien }>(`${SODIEN_API_URL}/${id}`, data);
  }

  delete(id: number) {
    return httpClient.delete(`${SODIEN_API_URL}/${id}`);
  }
}

export default new SoDienService();
