import httpClient from '../lib/http-client';

// ✅ Interfaces khớp 100% với Backend Resource - PascalCase Vietnamese
// KHÔNG mapping gì hết!

export interface ThongTinPhong {
  MaPhong: number;
  TenPhong: string;
  Tang: string;
  DienTich: number;
  TenLoaiPhong: string;
  GiaThue: number;
  TrangThai: string;
  TenDayTro: string;
  DiaChiDayTro: string;
}

export interface ThongTinHopDong {
  MaHopDong: number;
  SoHopDong: string;
  NgayKy: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  TienThueHangThang: number;
  TienCoc: number;
  TrangThai: string;
  GhiChu?: string;
}

export interface NguoiThue {
  MaKhachThue: number;
  HoTen: string;
  SDT1: string;
  Email: string;
  VaiTro: 'KHÁCH_CHÍNH' | 'THÀNH_VIÊN';
  NgaySinh?: string;
  CCCD: string;
  HinhAnh?: string;
}

export interface ThietBi {
  MaThietBi: number;
  TenThietBi: string;
  SoLuong: number;
  TinhTrang: string;
}

export interface DichVuDangKy {
  MaDichVu: number;
  TenDichVu: string;
  DonGiaApDung: number;
  DonViTinh: string;
  SoLuong?: number;
  MoTa?: string;
}

// ✅ Main Response Interface
export interface RoomStatusResponse {
  success: boolean;
  data: {
    ThongTinPhong: ThongTinPhong;
    ThongTinHopDong?: ThongTinHopDong;
    DanhSachNguoiThue: NguoiThue[];
    ThietBi: ThietBi[];
    DichVuDangKy: DichVuDangKy[];
  };
}

class RoomStatusService {
  private endpoint = '/customer/room-status';

  /**
   * Get full room status in ONE API call
   * Returns: Room info, contract, roommates, equipment, services
   */
  async getRoomStatus(signal?: AbortSignal) {
    return httpClient.get<RoomStatusResponse>(this.endpoint, { signal });
  }
}

export default new RoomStatusService();
