import httpClient from '../lib/http-client';

// ✅ Interfaces khớp 100% với Backend Resource
export interface ChiTietHoaDon {
  MaChiTiet: number;
  MaHoaDon: number;
  NoiDung: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

export interface ThanhToan {
  MaThanhToan: number;
  MaHoaDon: number;
  SoTien: number;
  NgayThanhToan: string;
  PhuongThuc: 'tien_mat' | 'chuyen_khoan';
  GhiChu?: string;
}

export interface HoaDon {
  MaHoaDon: number;
  MaPhong: number;
  MaHopDong?: number;
  Thang: string; // YYYY-MM format
  NgayLap: string; // ISO date
  NgayHetHan: string;
  TongTien: number;
  DaThanhToan: number;
  ConLai: number;
  TrangThai: 'moi_tao' | 'da_thanh_toan_mot_phan' | 'da_thanh_toan' | 'qua_han';
  GhiChu?: string;
  chiTietHoaDon?: ChiTietHoaDon[];
  thanhToan?: ThanhToan[];
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: any[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface HoaDonDetailResponse {
  success: boolean;
  data: HoaDon;
}

class HoaDonService {
  private endpoint = '/customer/invoices';

  async getAll(signal?: AbortSignal) {
    return httpClient.get<PaginatedResponse<HoaDon>>(this.endpoint, { signal });
  }

  async getLatest(signal?: AbortSignal) {
    return httpClient.get<HoaDonDetailResponse>(`${this.endpoint}/latest`, { signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<HoaDonDetailResponse>(`${this.endpoint}/${id}`, { signal });
  }

  async downloadPdf(id: number) {
    return httpClient.get(`${this.endpoint}/${id}/pdf`, {
      responseType: 'blob',
    });
  }
}

export default new HoaDonService();
