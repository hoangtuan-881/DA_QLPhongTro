import httpClient, { getErrorMessage } from '../lib/http-client';
import { PhongTro } from './phong-tro.service';
import { KhachThue } from './khach-thue.service';
import { DichVu } from './dich-vu.service';

// =================== INTERFACES ===================
// Interface cho dịch vụ trong hợp đồng (pivot table)
export interface HopDongDichVu {
  MaHopDongDichVu: number;
  MaDichVu: number;
  TenDichVu: string;
  DonViTinh: string;
  GiaApDung: string;
  SoLuong: number;
}

// Interface này dựa trên HopDongResource của Laravel
export interface HopDong {
  MaHopDong: number;
  SoHopDong: string;
  MaPhong: number;
  MaKhachThue: number;
  NgayBatDau: string; // 'DD/MM/YYYY'
  NgayKetThuc: string; // 'DD/MM/YYYY'
  NgayKy: string; // 'DD/MM/YYYY'
  TienCoc: string | null; // Backend returns string
  TienThueHangThang: string | null; // Backend returns string
  TrangThai: string; // Backend returns enum value string like 'DangHieuLuc'
  SoLanGiaHan: number;
  GhiChu?: string | null;

  // Dữ liệu từ các quan hệ (eager-loaded) - KHỚP VỚI BACKEND
  phongTro?: PhongTro;
  khachThue?: KhachThue;
  hopDongDichVus?: HopDongDichVu[];

  // Các trường được làm phẳng để tiện sử dụng
  TenKhachThue: string;
  TenPhong: string;
  TenDay: string;
}

// Input types cho Create
export interface HopDongCreateInput {
  SoHopDong: string;
  MaPhong: number;
  MaKhachThue?: number;
  NgayKy: string; // YYYY-MM-DD
  NgayBatDau: string; // YYYY-MM-DD
  NgayKetThuc: string; // YYYY-MM-DD
  TienCoc: number;
  TienThueHangThang: number;
  GhiChu?: string;
  DichVuIds?: number[];
}

// Input types cho Update (all fields optional)
export interface HopDongUpdateInput {
  SoHopDong?: string;
  MaPhong?: number;
  MaKhachThue?: number;
  NgayKy?: string; // YYYY-MM-DD
  NgayBatDau?: string; // YYYY-MM-DD
  NgayKetThuc?: string; // YYYY-MM-DD
  TienCoc?: number;
  GhiChu?: string;
  DichVuIds?: number[];
}

// Input for Renew
export interface HopDongRenewInput {
  NgayKetThuc: string; // YYYY-MM-DD
}

// Input for Terminate
export interface HopDongTerminateInput {
  GhiChu?: string;
}

// Response for data needed for contract creation
export interface DataForContractResponse {
  phongTros: PhongTro[];
  khachThues: KhachThue[];
  dichVus: DichVu[];
}

// =================== SERVICE CLASS ===================
export interface HopDongQueryParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  search?: string;
  signal?: AbortSignal;
  [key: string]: any;
}

class HopDongService {
  private endpoint = '/admin/hop-dong';

  // Get all contracts
  async getAll(params?: HopDongQueryParams) {
    const { signal, ...queryParams } = params || {};
    const config: any = { params: queryParams };
    if (signal) {
      config.signal = signal;
    }
    return httpClient.get<{ data: HopDong[] }>(this.endpoint, config);
  }

  // Get single contract by ID
  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: HopDong }>(`${this.endpoint}/${id}`, { signal });
  }

  // Get data needed for contract creation (rooms, tenants, services)
  async getDataForContract(signal?: AbortSignal) {
    return httpClient.get<{ data: DataForContractResponse }>('/admin/data-for-contract', { signal });
  }

  // Create new contract
  async create(data: HopDongCreateInput) {
    return httpClient.post<{ data: HopDong }>(this.endpoint, data);
  }

  // Update existing contract
  async update(id: number, data: HopDongUpdateInput) {
    return httpClient.put<{ data: HopDong }>(`${this.endpoint}/${id}`, data);
  }

  // Delete contract
  async delete(id: number) {
    return httpClient.delete(`${this.endpoint}/${id}`);
  }

  // Renew contract
  async renew(id: number, data: HopDongRenewInput) {
    return httpClient.post<{ data: HopDong }>(`${this.endpoint}/${id}/renew`, data);
  }

  // Terminate contract
  async terminate(id: number, data: HopDongTerminateInput) {
    return httpClient.post<{ data: HopDong }>(`${this.endpoint}/${id}/terminate`, data);
  }
}

const hopDongService = new HopDongService();
export default hopDongService;
