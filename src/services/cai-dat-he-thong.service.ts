/**
 * Cai Dat He Thong Service (System Settings Management)
 * Handles system configuration settings API calls
 */

import httpClient from '@/lib/http-client';
import type { ApiResponse } from '@/lib/http-client';
import { API_ENDPOINTS } from '@/config/api';
import type { AxiosResponse } from 'axios';

// System Setting Interface (matching backend CaiDatHeThong model - PascalCase Vietnamese)
export interface CaiDatHeThong {
  MaCaiDat: number;
  KeyCaiDat: string;
  GiaTri: string;
  MoTa: string | null;
  created_at?: string;
  updated_at?: string;
}

// Update single setting payload
export interface UpdateSettingInput {
  value: string;
}

// Bulk update payload
export interface BulkUpdateInput {
  settings: Array<{
    key: string;
    value: string;
  }>;
}

/**
 * Cai Dat He Thong Service Class
 */
class CaiDatHeThongService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = API_ENDPOINTS.CAI_DAT_HE_THONG;
  }

  /**
   * Get all settings
   * @param signal - AbortSignal for request cancellation
   */
  async getAll(signal?: AbortSignal): Promise<AxiosResponse<ApiResponse<CaiDatHeThong[]>>> {
    return httpClient.get<ApiResponse<CaiDatHeThong[]>>(this.baseUrl, { signal });
  }

  /**
   * Get a specific setting by key
   * @param key - Setting key (e.g., 'gia_dien', 'gia_nuoc_nguoi')
   * @param signal - AbortSignal for request cancellation
   */
  async getByKey(
    key: string,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<{ key: string; value: string }>>> {
    return httpClient.get<ApiResponse<{ key: string; value: string }>>(
      `${this.baseUrl}/${key}`,
      { signal }
    );
  }

  /**
   * Update a setting
   * @param key - Setting key
   * @param value - New value
   * @param signal - AbortSignal for request cancellation
   */
  async update(
    key: string,
    value: string,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<{ key: string; value: string }>>> {
    return httpClient.put<ApiResponse<{ key: string; value: string }>>(
      `${this.baseUrl}/${key}`,
      { value },
      { signal }
    );
  }

  /**
   * Update multiple settings at once
   * @param settings - Array of key-value pairs
   * @param signal - AbortSignal for request cancellation
   */
  async updateBulk(
    settings: Array<{ key: string; value: string }>,
    signal?: AbortSignal
  ): Promise<AxiosResponse<ApiResponse<Array<{ key: string; value: string }>>>> {
    return httpClient.post<ApiResponse<Array<{ key: string; value: string }>>>(
      `${this.baseUrl}/bulk`,
      { settings },
      { signal }
    );
  }

  /**
   * Clear settings cache
   */
  async clearCache(): Promise<AxiosResponse<ApiResponse<string>>> {
    return httpClient.post<ApiResponse<string>>(`${this.baseUrl}/clear-cache`);
  }

  /**
   * Helper: Get electricity rate
   */
  async getElectricityRate(signal?: AbortSignal): Promise<number> {
    const response = await this.getByKey('gia_dien', signal);
    return parseFloat(response.data.data.value);
  }

  /**
   * Helper: Get water rate per person
   */
  async getWaterRate(signal?: AbortSignal): Promise<number> {
    const response = await this.getByKey('gia_nuoc_nguoi', signal);
    return parseFloat(response.data.data.value);
  }

  /**
   * Helper: Update electricity rate
   */
  async updateElectricityRate(rate: number): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.update('gia_dien', rate.toString());
  }

  /**
   * Helper: Update water rate
   */
  async updateWaterRate(rate: number): Promise<AxiosResponse<ApiResponse<any>>> {
    return this.update('gia_nuoc_nguoi', rate.toString());
  }
}

// Export singleton instance
export const caiDatHeThongService = new CaiDatHeThongService();
export default caiDatHeThongService;
