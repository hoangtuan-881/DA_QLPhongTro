import httpClient from '../lib/http-client';

export interface NoiQuy {
  MaNoiQuy: number;
  TieuDe: string;
  NoiDung: string;
  PhanLoai: 'chung' | 'an_toan' | 'tieng_on' | 've_sinh' | 'khach_tham' | 'thanh_toan';
  TrangThai: boolean;
}

export interface NoiQuyQueryParams {
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  signal?: AbortSignal;
}

const NOIQUY_API_URL = '/admin/noi-quy';

class NoiQuyService {
  getAll({ signal, ...params }: NoiQuyQueryParams = {}) {
    return httpClient.get<{ data: NoiQuy[] }>(NOIQUY_API_URL, { params, signal });
  }

  getById(id: number, signal?: AbortSignal) {
    return httpClient.get<NoiQuy>(`${NOIQUY_API_URL}/${id}`, { signal });
  }

  create(data: Omit<NoiQuy, 'MaNoiQuy'>) {
    return httpClient.post<NoiQuy>(NOIQUY_API_URL, data);
  }

  update(id: number, data: Partial<Omit<NoiQuy, 'MaNoiQuy'>>) {
    return httpClient.put<NoiQuy>(`${NOIQUY_API_URL}/${id}`, data);
  }

  delete(id: number) {
    return httpClient.delete(`${NOIQUY_API_URL}/${id}`);
  }
}

export default new NoiQuyService();
