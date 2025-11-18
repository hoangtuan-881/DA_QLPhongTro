import httpClient from '../lib/http-client';

export interface HoaDon {
  MaHoaDon: number;
  MaPhong: number;
  MaHopDong?: number;
  Thang: string;
  NgayLap: string;
  NgayHetHan: string;
  TongTien: number;
  DaThanhToan: number;
  ConLai: number;
  TrangThai: string;
  GhiChu?: string;

  // Relations (nếu Backend trả về)
  phongTro?: {
    MaPhong: number;
    TenPhong: string;
    MaDay?: number;
    DayTro?: {
      MaDay: number;
      TenDay: string;
    };
  };
  hopDong?: {
    MaHopDong: number;
    TenKhach: string;
  };
  chiTietHoaDon?: ChiTietHoaDon[];
  thanhToan?: any[];
}

export interface ChiTietHoaDon {
  NoiDung: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

export interface CreateHoaDonRequest {
  MaPhong: number;
  MaHopDong?: number;
  Thang: string;
  NgayLap: string;
  NgayHetHan: string;
  TongTien: number;
  DaThanhToan?: number;
  TrangThai?: string;
  GhiChu?: string;
  chiTietHoaDon: ChiTietHoaDon[];
}

export interface CreateBulkHoaDonRequest {
  Thang: string;
  roomIds: number[];
  commonCharges?: Array<{
    description: string;
    amount: number;
  }>;
}

export interface AddAdditionalChargeRequest {
  description: string;
  amount: number;
}

const HOADON_API_URL = '/admin/hoa-don';

class HoaDonService {
  getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: HoaDon[] }>(HOADON_API_URL, { signal });
  }

  getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: HoaDon }>(`${HOADON_API_URL}/${id}`, { signal });
  }

  create(data: CreateHoaDonRequest) {
    return httpClient.post<{ data: HoaDon }>(HOADON_API_URL, data);
  }

  createBulk(data: CreateBulkHoaDonRequest) {
    return httpClient.post<{ data: HoaDon[] }>(`${HOADON_API_URL}/bulk`, data);
  }

  addAdditionalCharge(id: number, data: AddAdditionalChargeRequest) {
    return httpClient.post<{ data: HoaDon }>(`${HOADON_API_URL}/${id}/phat-sinh`, data);
  }

  delete(id: number) {
    return httpClient.delete(`${HOADON_API_URL}/${id}`);
  }
}

export default new HoaDonService();
