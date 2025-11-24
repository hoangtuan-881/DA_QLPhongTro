import httpClient from '../lib/http-client';
import { ChiTietThongBao } from '../types/thong-bao';

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
const USER_THONGBAO_API_URL = '/thong-bao';

class ThongBaoService {
  // Admin APIs
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

  // User APIs - Notifications for current user
  getUserNotifications(signal?: AbortSignal) {
    return httpClient.get<{ data: ChiTietThongBao[] }>(USER_THONGBAO_API_URL, { signal });
  }

  markAsRead(id: number) {
    return httpClient.post<{ data: ChiTietThongBao }>(`${USER_THONGBAO_API_URL}/${id}/mark-as-read`);
  }

  markAllAsRead() {
    return httpClient.post(`${USER_THONGBAO_API_URL}/mark-all-as-read`);
  }
}

export default new ThongBaoService();
