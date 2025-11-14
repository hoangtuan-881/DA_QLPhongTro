import { API_ENDPOINTS } from '../config/api';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../types/api.types';
import httpClient from '@/lib/http-client';
import { AxiosResponse } from 'axios';

export interface PhieuDatCocCreateInput {
  MaPhong: number;
  HoTenNguoiDat: string;
  SoDienThoaiNguoiDat: string;
  EmailNguoiDat?: string;
  NgayDuKienVaoO: string; // yyyy-mm-dd
  TienDatCoc: number;
  GhiChu?: string;
}

export interface PhieuDatCocUpdateInput {
  MaPhong?: number;
  HoTenNguoiDat?: string;
  SoDienThoaiNguoiDat?: string;
  EmailNguoiDat?: string;
  NgayDuKienVaoO?: string; // yyyy-mm-dd
  TienDatCoc?: number;
  TrangThai?: string;
  GhiChu?: string;
}

// This interface should match the PhieuDatCocResource from the backend
export interface PhieuDatCoc {
  MaPhieuDatCoc: number;
  MaPhong: number;
  HoTenNguoiDat: string;
  SoDienThoaiNguoiDat: string;
  EmailNguoiDat?: string;
  NgayDuKienVaoO: string; // d/m/Y
  TienDatCoc: number;
  TrangThai: string; // Should match TrangThaiPhieuDatCocEnum values
  GhiChu?: string;
}

class DatCocService extends BaseApiService<PhieuDatCoc> {
  constructor() {
    super('/admin/phieu-dat-coc');
  }

  // Public endpoint for creating booking (no auth)
  public async createPublic(
    data: PhieuDatCocCreateInput,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<PhieuDatCoc>>> {
    const config: any = {};
    if (signal) {
      config.signal = signal;
    }
    // Call httpClient directly to bypass the service's base endpoint
    return httpClient.post('/public/dat-coc', data, config);
  }

  // Tạo hợp đồng từ phiếu đặt cọc
  public async taoHopDongTuPhieuDatCoc(maPhieuDatCoc: number, duLieuHopDong: any) {
    return this.customPost(`/${maPhieuDatCoc}/tao-hop-dong`, duLieuHopDong);
  }
}

const datCocService = new DatCocService();
export default datCocService;
