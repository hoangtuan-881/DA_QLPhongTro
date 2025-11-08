/**
 * Dich Vu Service (Services Management)
 * Handles service-related API calls
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/http-client';

// Service Type Interface (matching backend DichVuResource)
export interface DichVu {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'services' | 'utilities' | 'other';
  isActive: boolean;
  usageCount: number;
}

// Create/Update payload (matching backend validator)
export interface DichVuCreatePayload {
  name: string;
  description?: string;
  price: number;
  unit?: string;
  category: 'services' | 'utilities' | 'other';
  isActive?: boolean;
}

export interface DichVuUpdatePayload extends Partial<DichVuCreatePayload> {}

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
   * Create new service
   * Maps frontend fields to backend fields
   */
  async createService(data: DichVuCreatePayload): Promise<AxiosResponse<ApiResponse<DichVu>>> {
    return this.create(data);
  }

  /**
   * Update existing service
   * Maps frontend fields to backend fields
   */
  async updateService(id: string | number, data: DichVuUpdatePayload): Promise<AxiosResponse<ApiResponse<DichVu>>> {
    return this.update(id, data);
  }

  /**
   * Delete service
   * Will fail if service is in use (usageCount > 0)
   */
  async deleteService(id: string | number): Promise<AxiosResponse<ApiResponse<void>>> {
    return this.delete(id);
  }
}

// Export singleton instance
export const dichVuService = new DichVuService();
export default dichVuService;
