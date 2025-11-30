import httpClient from '../lib/http-client';

// ✅ Interfaces khớp 100% với Backend ViPhamResource - PascalCase Vietnamese
export interface ViPham {
  MaViPham: number;
  MaKhachThue: number;
  MaNoiQuy: number;
  MoTa: string;
  MucDo: 'minor' | 'moderate' | 'serious' | 'critical';
  TrangThai: 'reported' | 'warned' | 'resolved';
  NgayBaoCao: string;
  NgayGiaiQuyet?: string;
  GhiChu?: string;
  noiQuy?: {
    MaNoiQuy: number;
    TieuDe: string;
    NoiDung: string;
  };
  khachThue?: {
    MaKhachThue: number;
    HoTen: string;
  };
  nguoiBaoCao?: {
    HoTen: string;
  };
}

export interface CreateViPhamData {
  MaKhachThue: number;
  MaNoiQuy: number;
  MoTa: string;
  MucDo?: 'minor' | 'moderate' | 'serious' | 'critical';
  ThoiGianXayRa?: string;
}

// Laravel ResourceCollection returns { data: [...] }
export interface ViPhamCollectionResponse {
  data: ViPham[] | { data: ViPham[] };
}

export interface ViPhamSingleResponse {
  success: boolean;
  message: string;
  data: ViPham;
}

export interface PhongTrong {
  MaPhong: number;
  TenPhong: string;
  TenDayTro: string;
}

export interface KhachThueInfo {
  MaKhachThue: number;
  HoTen: string;
  SDT1: string;
}

class ViPhamService {
  private endpoint = '/customer';

  /**
   * Lấy danh sách vi phạm của khách thuê hiện tại
   */
  async getViolations(signal?: AbortSignal) {
    return httpClient.get<ViPhamCollectionResponse>(`${this.endpoint}/violations`, { signal });
  }

  /**
   * Báo cáo vi phạm mới
   */
  async create(data: CreateViPhamData, signal?: AbortSignal) {
    return httpClient.post<ViPhamSingleResponse>(`${this.endpoint}/violations`, data, { signal });
  }

  /**
   * Lấy danh sách phòng trong cùng dãy (để báo cáo)
   */
  async getRoomsInBuilding(signal?: AbortSignal) {
    return httpClient.get<{ success: boolean; data: PhongTrong[] }>(
      `${this.endpoint}/rooms-in-building`,
      { signal }
    );
  }

  /**
   * Lấy danh sách khách thuê theo phòng
   */
  async getTenantsByRoom(maPhong: number, signal?: AbortSignal) {
    return httpClient.get<{ success: boolean; data: KhachThueInfo[] }>(
      `${this.endpoint}/tenants-by-room/${maPhong}`,
      { signal }
    );
  }
}

export default new ViPhamService();
