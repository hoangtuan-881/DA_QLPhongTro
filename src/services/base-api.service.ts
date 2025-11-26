/**
 * Base API Service
 * Generic CRUD operations for all API services
 */

import httpClient from '@/lib/http-client';
import type { ApiResponse } from '@/lib/http-client';
import type { AxiosResponse } from 'axios';

export interface PaginationParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  signal?: AbortSignal;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/**
 * Base API Service Class
 * Provides generic CRUD operations
 */
export class BaseApiService<T = any> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Get all items (with optional pagination and filters)
   */
  async getAll(params?: PaginationParams): Promise<AxiosResponse<ApiResponse<T[] | PaginatedResponse<T>>>> {
    const { signal, ...queryParams } = params || {};
    const config: any = { params: queryParams };
    if (signal) {
      config.signal = signal;
    }
    return httpClient.get(this.endpoint, config);
  }

  /**
   * Get single item by ID
   */
  async getById(id: string | number): Promise<AxiosResponse<ApiResponse<T>>> {
    return httpClient.get(`${this.endpoint}/${id}`);
  }

  /**
   * Create new item
   */
  async create(data: Partial<T>): Promise<AxiosResponse<ApiResponse<T>>> {
    return httpClient.post(this.endpoint, data);
  }

  /**
   * Update existing item
   */
  async update(id: string | number, data: Partial<T>): Promise<AxiosResponse<ApiResponse<T>>> {
    return httpClient.put(`${this.endpoint}/${id}`, data);
  }

  /**
   * Partially update existing item
   */
  async patch(id: string | number, data: Partial<T>): Promise<AxiosResponse<ApiResponse<T>>> {
    return httpClient.patch(`${this.endpoint}/${id}`, data);
  }

  /**
   * Delete item by ID
   */
  async delete(id: string | number): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.delete(`${this.endpoint}/${id}`);
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(ids: (string | number)[]): Promise<AxiosResponse<ApiResponse<void>>> {
    return httpClient.post(`${this.endpoint}/bulk-delete`, { ids });
  }

  /**
   * Custom GET request to a specific path
   */
  async customGet<R = any>(path: string, params?: any): Promise<AxiosResponse<ApiResponse<R>>> {
    const { signal, ...queryParams } = params || {};
    const config: any = { params: queryParams };
    if (signal) {
      config.signal = signal;
    }
    return httpClient.get(`${this.endpoint}${path}`, config);
  }

  /**
   * Custom POST request to a specific path
   */
  async customPost<R = any>(path: string, data?: any, signal?: AbortSignal): Promise<AxiosResponse<ApiResponse<R>>> {
    const config: any = {};
    if (signal) {
      config.signal = signal;
    }
    return httpClient.post(`${this.endpoint}${path}`, data, config);
  }

  /**
   * Custom PUT request to a specific path
   */
  async customPut<R = any>(path: string, data?: any): Promise<AxiosResponse<ApiResponse<R>>> {
    return httpClient.put(`${this.endpoint}${path}`, data);
  }

  /**
   * Custom DELETE request to a specific path
   */
  async customDelete<R = any>(path: string): Promise<AxiosResponse<ApiResponse<R>>> {
    return httpClient.delete(`${this.endpoint}${path}`);
  }

  /**
   * Upload file
   */
  async uploadFile(
    id: string | number,
    file: File,
    fieldName: string = 'file'
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return httpClient.post(`${this.endpoint}/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Download file
   */
  async downloadFile(id: string | number, fileName: string = 'download'): Promise<void> {
    const response = await httpClient.get(`${this.endpoint}/${id}/download`, {
      responseType: 'blob',
    });

    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export default BaseApiService;
