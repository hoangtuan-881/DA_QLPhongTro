/**
 * ThongBaoHeThong Types
 * Match 100% với Backend Resource (QuanLyPhongTroBE/app/Http/Resources/ThongBaoHeThongResource.php)
 */

// ✅ ĐÚNG - Vietnamese keys giống Backend (KHÔNG mapping)
export interface ThongBaoHeThong {
  MaThongBao: number;
  TieuDe: string;
  NoiDung: string;
  LoaiThongBao: 'general' | 'urgent' | 'maintenance' | 'payment';
  DoiTuongNhan: 'all' | 'specific';
  CacPhongNhan: number[] | null; // Array MaPhong
  TrangThai: 'draft' | 'sent' | 'scheduled';
  ThoiGianGui: string | null; // Format: 'd/m/Y H:i'
  ThoiGianHenGio: string | null; // Format: 'd/m/Y H:i'
  ThoiGianTao: string; // Format: 'd/m/Y H:i'
  SoNguoiDoc: number;
  TongSoNguoiNhan: number;
  MaNguoiGui: number;
}

// Request types
export interface ThongBaoHeThongCreateInput {
  TieuDe: string;
  NoiDung: string;
  LoaiThongBao: 'general' | 'urgent' | 'maintenance' | 'payment';
  DoiTuongNhan: 'all' | 'specific';
  CacPhongNhan?: number[]; // Required khi DoiTuongNhan = 'specific'
  TrangThai: 'draft' | 'sent' | 'scheduled';
  ThoiGianHenGio?: string; // Required khi TrangThai = 'scheduled'
}

export interface ThongBaoHeThongUpdateInput {
  TieuDe?: string;
  NoiDung?: string;
  LoaiThongBao?: 'general' | 'urgent' | 'maintenance' | 'payment';
  DoiTuongNhan?: 'all' | 'specific';
  CacPhongNhan?: number[];
  TrangThai?: 'draft' | 'sent' | 'scheduled';
  ThoiGianHenGio?: string;
}

/**
 * ChiTietThongBao Types - User Notifications
 * Match 100% với Backend Resource (QuanLyPhongTroBE/app/Http/Resources/ChiTietThongBaoResource.php)
 */

// ✅ ĐÚNG - Vietnamese PascalCase keys giống Backend (KHÔNG mapping)
export interface ChiTietThongBao {
  MaChiTiet: number;
  TrangThaiDoc: 'chua_doc' | 'da_doc';
  ThoiGianDoc: string | null;
  ThongBao: {
    MaThongBao: number;
    TieuDe: string;
    NoiDung: string;
    Loai: string;
    ThoiGianGuiThucTe: string | null;
  };
}
