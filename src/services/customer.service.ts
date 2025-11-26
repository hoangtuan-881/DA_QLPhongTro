import httpClient from '../lib/http-client';

// =====================================================
// INTERFACES - Khớp với Backend Resources
// =====================================================

// Thông tin phòng trọ của khách thuê (ChiTietPhongKhachThueResource)
export interface ThongTinPhong {
  MaKhachThue: number;
  HoTen: string;
  CCCD?: string;
  SDT1?: string;
  Email?: string;
  phongTro: {
    MaPhong: number;
    TenPhong: string;
    GiaThue: number;
    DienTich: number;
    SoNguoiToiDa: number;
    TrangThai: string;
    dayTro: {
      MaDay: number;
      TenDay: string;
      DiaChi?: string;
    };
    loaiPhong: {
      MaLoaiPhong: number;
      TenLoaiPhong: string;
    };
  };
}

// Thông tin hợp đồng của khách thuê - ✅ PascalCase khớp Backend
export interface ThongTinHopDong {
  SoHopDong: string;
  TenPhong: string;
  TenKhachThue: string;
  SDT: string;
  TrangThai: string;
  NgayKy: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  TienThueHangThang: number;
  TienCoc: number;
  DichVu: Array<{
    TenDichVu: string;
    DonGiaApDung: number;
    DonViTinh: string;
  }>;
}

// Chi tiết hóa đơn - ✅ PascalCase khớp Backend
export interface ChiTietHoaDonKhachThue {
  MaChiTiet: number;
  MaHoaDon: number;
  NoiDung: string;
  SoLuong: number;
  DonGia: number;
  ThanhTien: number;
}

// Hóa đơn của khách thuê (HoaDonResource)
export interface HoaDonKhachThue {
  MaHoaDon: number;
  MaPhong: number;
  MaHopDong?: number;
  Thang: string;
  NgayLap: string;
  NgayHetHan: string;
  TongTien: number;
  DaThanhToan: number;
  ConLai: number;
  TrangThai: 'moi_tao' | 'da_thanh_toan_mot_phan' | 'da_thanh_toan' | 'qua_han';
  TrangThaiText?: string; // Label từ backend
  TrangThaiColor?: string; // Color từ backend
  GhiChu?: string;
  phongTro?: {
    MaPhong: number;
    TenPhong: string;
    dayTro?: {
      MaDay: number;
      TenDay: string;
    };
  };
  chiTietHoaDon?: ChiTietHoaDonKhachThue[];
  thanhToan?: Array<{
    MaThanhToan: number;
    SoTien: number;
    NgayThanhToan: string;
    PhuongThuc: string;
  }>;
}

// Yêu cầu sửa chữa (YeuCauBaoTriResource)
export interface YeuCauSuaChuaKhachThue {
  MaYeuCau: number;
  MaKhachThue: number;
  TieuDe: string;
  MoTa: string;
  PhanLoai: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
  MucDoUuTien: 'low' | 'medium' | 'high' | 'urgent';
  TrangThai: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  NgayYeuCau: string;
  NgayPhanCong?: string;
  NgayHoanThanh?: string;
  GhiChu?: string;
  ChiPhiThucTe?: number;
  HinhAnhMinhChung?: string[];
  khachThue?: {
    MaKhachThue: number;
    HoTen: string;
    phongTro: {
      MaPhong: number;
      TenPhong: string;
      dayTro: {
        MaDay: number;
        TenDay: string;
      };
    };
  };
  nhanVienPhanCong?: {
    MaNV: number;
    HoTen: string;
  };
}

// Vi phạm (ViPhamResource)
export interface ViPhamKhachThue {
  MaViPham: number;
  MaKhachThue: number;
  MaNoiQuy: number;
  MoTa: string;
  MucDo: 'nhe' | 'vua' | 'nghiem_trong' | 'rat_nghiem_trong';
  TrangThai: 'da_bao_cao' | 'da_canh_cao' | 'da_giai_quyet';
  NgayBaoCao: string;
  NgayGiaiQuyet?: string;
  GhiChu?: string;
  noiQuy?: {
    MaNoiQuy: number;
    TieuDe: string;
    NoiDung?: string;
  };
  khachThue?: {
    MaKhachThue: number;
    HoTen: string;
    phongTro: {
      MaPhong: number;
      TenPhong: string;
      dayTro: {
        MaDay: number;
        TenDay: string;
      };
    };
  };
  nguoiBaoCao?: {
    HoTen: string;
  };
}

// =====================================================
// REQUEST PAYLOADS
// =====================================================

export interface CreateYeuCauSuaChuaRequest {
  MaKhachThue?: number;  // Optional vì customer route có thể tự lấy từ auth user
  TieuDe: string;
  MoTa: string;
  PhanLoai: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
  MucDoUuTien: 'low' | 'medium' | 'high' | 'urgent';
  GhiChu?: string;
  HinhAnhMinhChung?: string[];
}

export interface CreateViPhamRequest {
  MaKhachThue: number;  // Khách thuê vi phạm (bắt buộc)
  MaNoiQuy: number;
  MoTa: string;
  MucDo: 'nhe' | 'vua' | 'nghiem_trong' | 'rat_nghiem_trong';
  NgayBaoCao: string;
}

// =====================================================
// SERVICE CLASS
// =====================================================

const CUSTOMER_API_URL = '/customer';

class CustomerService {
  /**
   * Lấy thông tin phòng của khách thuê hiện tại
   * GET /customer/room
   */
  getRoomInfo(signal?: AbortSignal) {
    return httpClient.get<{ data: ThongTinPhong }>(`${CUSTOMER_API_URL}/room`, { signal });
  }

  /**
   * Lấy thông tin hợp đồng của khách thuê hiện tại
   * GET /customer/contract
   */
  getContractInfo(signal?: AbortSignal) {
    return httpClient.get<{ data: ThongTinHopDong }>(`${CUSTOMER_API_URL}/contract`, { signal });
  }

  /**
   * Lấy danh sách hóa đơn của khách thuê hiện tại
   * GET /customer/invoices
   */
  getInvoices(params?: { page?: number; perPage?: number }, signal?: AbortSignal) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('perPage', params.perPage.toString());

    const url = queryParams.toString()
      ? `${CUSTOMER_API_URL}/invoices?${queryParams}`
      : `${CUSTOMER_API_URL}/invoices`;

    return httpClient.get<{ data: HoaDonKhachThue[] }>(url, { signal });
  }

  /**
   * Lấy hóa đơn mới nhất của khách thuê hiện tại
   * GET /customer/invoices/latest
   */
  getLatestInvoice(signal?: AbortSignal) {
    return httpClient.get<{ data: HoaDonKhachThue }>(`${CUSTOMER_API_URL}/invoices/latest`, { signal });
  }

  /**
   * Lấy danh sách yêu cầu sửa chữa của khách thuê hiện tại
   * GET /customer/maintenance-requests
   */
  getMaintenanceRequests(signal?: AbortSignal) {
    return httpClient.get<{ data: YeuCauSuaChuaKhachThue[] }>(`${CUSTOMER_API_URL}/maintenance-requests`, { signal });
  }

  /**
   * Tạo yêu cầu sửa chữa mới
   * POST /customer/maintenance-requests
   */
  createMaintenanceRequest(data: CreateYeuCauSuaChuaRequest) {
    return httpClient.post<{ data: YeuCauSuaChuaKhachThue }>(`${CUSTOMER_API_URL}/maintenance-requests`, data);
  }

  /**
   * Lấy danh sách vi phạm của khách thuê hiện tại
   * GET /customer/violations
   */
  getViolations(signal?: AbortSignal) {
    return httpClient.get<{ data: ViPhamKhachThue[] }>(`${CUSTOMER_API_URL}/violations`, { signal });
  }

  /**
   * Tạo báo cáo vi phạm mới
   * POST /customer/violations
   */
  createViolation(data: CreateViPhamRequest) {
    return httpClient.post<{ data: ViPhamKhachThue }>(`${CUSTOMER_API_URL}/violations`, data);
  }

  /**
   * Lấy danh sách phòng trong cùng dãy trọ (để báo cáo vi phạm)
   * GET /customer/rooms-in-building
   */
  getRoomsInBuilding(signal?: AbortSignal) {
    return httpClient.get<{
      data: Array<{
        MaPhong: number;
        TenPhong: string;
      }>
    }>(`${CUSTOMER_API_URL}/rooms-in-building`, { signal });
  }

  /**
   * Lấy danh sách khách thuê theo phòng (để báo cáo vi phạm)
   * GET /customer/tenants-by-room/:maPhong
   */
  getTenantsByRoom(maPhong: number, signal?: AbortSignal) {
    return httpClient.get<{
      data: Array<{
        MaKhachThue: number;
        HoTen: string;
      }>
    }>(`${CUSTOMER_API_URL}/tenants-by-room/${maPhong}`, { signal });
  }

  /**
   * Tải PDF hóa đơn
   * GET /customer/invoices/:id/pdf
   */
  async downloadInvoicePdf(maHoaDon: number) {
    const response = await httpClient.get(`${CUSTOMER_API_URL}/invoices/${maHoaDon}/pdf`, {
      responseType: 'blob', // Quan trọng: để nhận binary data
    });
    return response;
  }
}

export default new CustomerService();
