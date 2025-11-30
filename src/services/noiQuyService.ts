import httpClient from '../lib/http-client';

// ✅ Interface khớp 100% với Backend NoiQuyResource - PascalCase Vietnamese
export interface NoiQuy {
  MaNoiQuy: number;
  TieuDe: string;
  NoiDung: string;
  PhanLoai: string;
  TrangThai: string;
}

export interface NoiQuyResponse {
  success: boolean;
  message: string;
  data: NoiQuy[];
}

class NoiQuyService {
  private endpoint = '/admin/noi-quy';

  /**
   * Lấy danh sách nội quy
   */
  async getAll(signal?: AbortSignal) {
    return httpClient.get<NoiQuyResponse>(this.endpoint, { signal });
  }

  /**
   * Lấy chi tiết một nội quy
   */
  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ success: boolean; message: string; data: NoiQuy }>(
      `${this.endpoint}/${id}`,
      { signal }
    );
  }
}

export default new NoiQuyService();
