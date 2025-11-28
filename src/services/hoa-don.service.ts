import httpClient from '../lib/http-client';
import { PhongTro } from './phong-tro.service';
import { HopDong } from './hop-dong.service';
import { NhanVien } from './nhan-vien.service';

// Interface cho Chi tiết hóa đơn
export interface ChiTietHoaDon {
  MaChiTiet: number;
  MaHoaDon: number;
  NoiDung: string;
  SoLuong: string;
  DonGia: string;
  ThanhTien: string;
}

// Interface cho Thanh toán
export interface ThanhToan {
  MaThanhToan: number;
  MaHoaDon: number;
  SoTien: string;
  NgayThanhToan: string;
  PhuongThuc: string;
  GhiChu?: string | null;
}

// Interface chính cho Hóa đơn - KHỚP VỚI BACKEND
export interface HoaDon {
  MaHoaDon: number;
  MaPhong: number;
  MaHopDong?: number;
  MaNV?: number;
  Thang: string;
  NgayLap: string;
  NgayHetHan: string;
  TongTien: string;  // Backend trả về string
  DaThanhToan: string;  // Backend trả về string
  ConLai: string;  // Backend trả về string
  TrangThai: string;
  GhiChu?: string | null;

  // Relations - KHỚP VỚI BACKEND
  phongTro?: PhongTro;
  hopDong?: HopDong;
  nhanVien?: NhanVien;
  chiTietHoaDon?: ChiTietHoaDon[];
  thanhToan?: ThanhToan[];
}

export interface CreateHoaDonRequest {
  MaPhong: number;
  MaHopDong?: number;
  Thang: string;
  NgayLap: string;
  NgayHetHan: string;
  TongTien: number;
  DaThanhToan?: number;
  ConLai: number;
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

export interface HoaDonStatistics {
  TongTien: number;
  DaThanhToan: number;
  ConLai: number;
  TongSoHoaDon: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const HOADON_API_URL = '/admin/hoa-don';

class HoaDonService {
  getAll(params?: { page?: number; perPage?: number }, signal?: AbortSignal) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());

    const url = queryParams.toString() ? `${HOADON_API_URL}?${queryParams}` : HOADON_API_URL;
    return httpClient.get<{ data: PaginatedResponse<HoaDon> }>(url, { signal });
  }

  // Fetch all hóa đơn without pagination (for duplicate checking)
  getAllNoPagination(signal?: AbortSignal) {
    return httpClient.get<{ data: PaginatedResponse<HoaDon> }>(`${HOADON_API_URL}?perPage=1000`, { signal });
  }

  getStatistics(signal?: AbortSignal) {
    return httpClient.get<{ data: HoaDonStatistics }>(`${HOADON_API_URL}/statistics`, { signal });
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
