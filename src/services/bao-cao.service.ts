/**
 * Bao Cao (Reports) Service
 * Handles reports and analytics API calls
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/http-client';

// KPI Metrics Interface
export interface BaoCaoKpi {
  TongSoPhong: number;
  TyLeLapDay: number;
  DoanhThuThangHienTai: number;
  DoanhThuNam: number;
}

// Monthly Revenue Interface
export interface DoanhThuThang {
  Thang: number;
  DoanhThu: number;
}

// Top Revenue Rooms Interface
export interface TopDoanhThuPhong {
  TenPhong: string;
  TongDoanhThu: number;
  TenKhachThue: string;
}

// Recent Payments Interface
export interface ThanhToanGanDay {
  id: number;
  MaPhong: number;
  TenPhong: string;
  SoTien: number;
  NgayThanhToan: string;
  PhuongThuc?: string;
  GhiChu?: string;
}

// Overall Report Interface
export interface BaoCaoTongQuan {
  Kpi: BaoCaoKpi;
  DoanhThu12Thang: DoanhThuThang[];
  TopDoanhThuPhong: TopDoanhThuPhong[];
  ThanhToanGanDay: ThanhToanGanDay[];
}

// Monthly Comparison Interface
export interface BaoCaoSoSanhThang {
  Thang: string;
  DoanhThu: number;
  TyLeLapDay: number;
  SoPhongDaThue: number;
  TongSoPhong: number;
  SoKhachMoi: number;
  SoHopDongKetThuc: number;
}

/**
 * Bao Cao Service Class
 * Extends BaseApiService with report-specific methods
 */
class BaoCaoService extends BaseApiService<BaoCaoTongQuan> {
  constructor() {
    super(API_ENDPOINTS.BAO_CAO);
  }

  /**
   * Get overall report (Tong Quan)
   * @param year - Year to get report for
   * @param signal - AbortSignal for request cancellation
   */
  async getTongQuan(year: number, signal?: AbortSignal): Promise<AxiosResponse<ApiResponse<BaoCaoTongQuan>>> {
    return this.customGet('/tong-quan', { year, signal });
  }

  /**
   * Get monthly comparison report
   * @param month - Month in YYYY-MM format
   * @param history - Number of months to compare (default: 6)
   * @param signal - AbortSignal for request cancellation
   */
  async getSoSanhThang(
    month: string,
    history: number = 6,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<BaoCaoSoSanhThang[]>>> {
    return this.customGet('/so-sanh-thang', { month, history, signal });
  }

  /**
   * Get revenue report by date range
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param signal - AbortSignal for request cancellation
   */
  async getDoanhThuTheoKhoang(
    startDate: string,
    endDate: string,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.customGet('/doanh-thu', { start_date: startDate, end_date: endDate, signal });
  }

  /**
   * Export report to Excel/PDF
   * @param type - Export type ('excel' | 'pdf')
   * @param year - Year to export
   */
  async exportReport(type: 'excel' | 'pdf', year: number): Promise<Blob> {
    const response = await this.customGet(`/export/${type}`, { year });
    return response.data as any;
  }
}

// Export singleton instance
export const baoCaoService = new BaoCaoService();
export default baoCaoService;
