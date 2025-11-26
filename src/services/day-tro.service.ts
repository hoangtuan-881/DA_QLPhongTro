/**
 * Day Tro Service (Buildings Management)
 * Handles API calls for building/day tro management
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '@/lib/http-client';

// DayTro Interface (matching backend DayTroResource - PascalCase Vietnamese)
export interface DayTro {
  MaDay: number;
  TenDay: string;
  DiaChi: string | null;
  SoLuongPhong?: number; // Computed field from backend
}

// Create payload (không có MaDay và computed fields)
export type DayTroCreateInput = Omit<DayTro, 'MaDay' | 'SoLuongPhong'>;

// Update payload (partial)
export type DayTroUpdateInput = Partial<DayTroCreateInput>;

/**
 * Day Tro Service Class
 * Extends BaseApiService with building-specific methods
 */
class DayTroService extends BaseApiService<DayTro> {
  constructor() {
    super(API_ENDPOINTS.DAY_TRO);
  }

  /**
   * Create new building
   */
  async createDayTro(data: DayTroCreateInput): Promise<AxiosResponse<ApiResponse<DayTro>>> {
    return this.create(data);
  }

  /**
   * Update existing building
   */
  async updateDayTro(id: string | number, data: DayTroUpdateInput): Promise<AxiosResponse<ApiResponse<DayTro>>> {
    return this.update(id, data);
  }

  /**
   * Delete building
   * Will fail if building has rooms (SoLuongPhong > 0)
   */
  async deleteDayTro(id: string | number): Promise<AxiosResponse<ApiResponse<void>>> {
    return this.delete(id);
  }

  /**
   * Get building with room details
   */
  async getDayTroWithRooms(id: string | number): Promise<AxiosResponse<ApiResponse<DayTro>>> {
    return this.getById(id);
  }
}

// Export singleton instance
export const dayTroService = new DayTroService();
export default dayTroService;
