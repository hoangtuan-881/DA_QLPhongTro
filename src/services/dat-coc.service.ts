import { API_ENDPOINTS } from '../config/api';
import { BaseApiService } from './base-api.service';
import { ApiResponse } from '../types/api.types';

export interface PhieuDatCocCreateInput {
  MaPhong: number;
  HoTenNguoiDat: string;
  SoDienThoaiNguoiDat: string;
  EmailNguoiDat?: string;
  NgayDuKienVaoO: string; // yyyy-mm-dd
  TienDatCoc: number;
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

class DatCocService extends BaseApiService {
  constructor() {
    // The endpoint is public, so we don't need to use a specific prefix from the config
    super('');
  }

  public async create(data: PhieuDatCocCreateInput, signal?: AbortSignal) {
    return this.customPost<PhieuDatCoc>('/public/dat-coc', data, signal);
  }
}

const datCocService = new DatCocService();
export default datCocService;
