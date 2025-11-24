/**
 * CanhBao Types - Personal Alerts
 * Match 100% với Backend Resource (QuanLyPhongTroBE/app/Http/Resources/CanhBaoResource.php)
 */

// ✅ ĐÚNG - Vietnamese PascalCase keys giống Backend (KHÔNG mapping)
export interface CanhBao {
  MaCanhBao: number;
  NoiDung: string;
  LoaiCanhBao: 'HOA_DON' | 'HOP_DONG' | 'VI_PHAM' | 'BAO_TRI' | 'YEU_CAU_MOI' | 'KHAC';
  TrangThai: 'CHUA_DOC' | 'DA_DOC';
  LienKet: string | null;
  ThoiGianGui: string; // Human readable from backend (e.g., "5 minutes ago")
}
