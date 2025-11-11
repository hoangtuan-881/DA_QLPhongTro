/**
 * Dich Vu Service (Services Management)
 * Handles service-related API calls
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/http-client';

// Service Type Interface (matching backend DichVuResource - PascalCase Vietnamese)
export interface DichVu {
  MaDichVu: number;
  TenDichVu: string;
  MoTa: string;
  DonGia: number;
  DonViTinh: string;
  DanhMuc: 'Dịch vụ' | 'Tiện ích' | 'Khác';
  TrangThaiHoatDong: boolean;
  SoLuongSuDung: number;
}

// Create payload (matching backend validator - no MaDichVu, no computed fields)
export type DichVuCreateInput = Omit<DichVu, 'MaDichVu' | 'SoLuongSuDung'>;

// Update payload (partial)
export type DichVuUpdateInput = Partial<DichVuCreateInput>;

/**
 * Dich Vu Service Class
 * Extends BaseApiService with service-specific methods
 */
class DichVuService extends BaseApiService<DichVu> {
  constructor() {
    super(API_ENDPOINTS.DICH_VU);
  }

  /**
   * Get active services only
   */
  async getActiveServices(): Promise<AxiosResponse<ApiResponse<DichVu[]>>> {
    return this.customGet('/active');
  }

  /**
   * Get services by category
   * @param category - 'services', 'utilities', or 'other'
   */
  async getByCategory(category: string): Promise<AxiosResponse<ApiResponse<DichVu[]>>> {
    return this.customGet(`/category/${category}`);
  }

  /**
   * Toggle service status (active/inactive)
   * @param id - Service ID
   */
  async toggleStatus(id: string | number): Promise<AxiosResponse<ApiResponse<DichVu>>> {
    return this.customPost(`/${id}/toggle-status`);
  }

  /**
   * Create new service (no mapping needed)
   */
  async createService(data: DichVuCreateInput): Promise<AxiosResponse<ApiResponse<DichVu>>> {
    return this.create(data);
  }

  /**
   * Update existing service (no mapping needed)
   */
  async updateService(id: string | number, data: DichVuUpdateInput): Promise<AxiosResponse<ApiResponse<DichVu>>> {
    return this.update(id, data);
  }

  /**
   * Delete service
   * Will fail if service is in use (SoLuongSuDung > 0)
   */
  async deleteService(id: string | number): Promise<AxiosResponse<ApiResponse<void>>> {
    return this.delete(id);
  }
}

// Export singleton instance
export const dichVuService = new DichVuService();
export default dichVuService;
