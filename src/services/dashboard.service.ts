/**
 * Dashboard Service
 * Handles dashboard analytics and statistics API calls
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/http-client';

// Stats Interface (for StatsCards)
export interface DashboardStats {
  TongSoPhong: number;
  PhongDaThue: number;
  ThayDoiPhongThue: number;
  PhongTrong: number;
  ThayDoiPhongTrong: number;
  DoanhThuThang: number;
  ThayDoiDoanhThu: number; // % change
}

// Room Status by Building Interface (for RoomChart)
export interface DayTroStatus {
  MaDay: number;
  TenDay: string;
  TongSoPhong: number;
  SoPhongDaThue: number;
  SoPhongTrong: number;
}

export interface RoomStatusByBuilding {
  DanhSachDay: DayTroStatus[];
  TyLeLapDay: number;
}

// Recent Activity Interface (for RecentActivities)
export interface RecentActivity {
  LoaiHoatDong: 'payment' | 'booking' | 'maintenance' | 'contract' | 'violation';
  TieuDe: string;
  MoTa: string;
  ThoiGian: string; // ISO date string
  ThoiGianHienThi: string; // Relative time like "2 giờ trước"
  Icon: string;
  Color: string;
}

/**
 * Dashboard Service Class
 * Extends BaseApiService with dashboard-specific methods
 */
class DashboardService extends BaseApiService<any> {
  constructor() {
    super(API_ENDPOINTS.DASHBOARD);
  }

  /**
   * Get dashboard statistics (stats cards)
   * @param signal - AbortSignal for request cancellation
   */
  async getStats(signal?: AbortSignal): Promise<AxiosResponse<ApiResponse<DashboardStats>>> {
    return this.customGet('/stats', { signal });
  }

  /**
   * Get room status by building (room chart)
   * @param signal - AbortSignal for request cancellation
   */
  async getRoomStatusByBuilding(
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<RoomStatusByBuilding>>> {
    return this.customGet('/room-status', { signal });
  }

  /**
   * Get recent activities
   * @param limit - Number of activities to fetch (default: 5)
   * @param signal - AbortSignal for request cancellation
   */
  async getRecentActivities(
    limit: number = 5,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<RecentActivity[]>>> {
    return this.customGet('/recent-activities', { limit, signal });
  }
}

// Export singleton instance
export const dashboardService = new DashboardService();
export default dashboardService;
