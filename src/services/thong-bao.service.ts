import httpClient from '../lib/http-client';

export interface ThongBao {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  LoaiThongBao: string;
  NgayGui: string;
  NguoiGui: number;
}

export interface CreateThongBaoRequest {
  TieuDe: string;
  NoiDung: string;
  LoaiThongBao: string;
  NguoiNhan: number[];
}

const THONGBAO_API_URL = '/admin/thong-bao';

class ThongBaoService {
  getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: ThongBao[] }>(THONGBAO_API_URL, { signal });
  }

  getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: ThongBao }>(`${THONGBAO_API_URL}/${id}`, { signal });
  }

  create(data: CreateThongBaoRequest) {
    return httpClient.post<{ data: ThongBao }>(THONGBAO_API_URL, data);
  }

  delete(id: number) {
    return httpClient.delete(`${THONGBAO_API_URL}/${id}`);
  }
}

export default new ThongBaoService();
