/**
 * Rooms Service (Example)
 * Handles room-related API calls
 */

import { BaseApiService } from './base-api.service';
import { API_ENDPOINTS } from '@/config/api';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '@/lib/http-client';

// Room Type Interface
export interface Room {
  MaPhong: number;
  MaDay: number;
  MaLoaiPhong: number;
  TenPhong: string;
  Tang: number;
  DienTich: number;
  GiaThue: number;
  TrangThai: 'trong' | 'da_thue' | 'dang_sua_chua' | 'khong_hoat_dong';
  MoTa?: string;
  AnhPhong?: string[];

  // Relations (when loaded)
  DayTro?: any;
  LoaiPhong?: any;
  HopDong?: any[];
}

/**
 * Rooms Service Class
 * Extends BaseApiService with room-specific methods
 */
class RoomsService extends BaseApiService<Room> {
  constructor() {
    super(API_ENDPOINTS.PHONG_TRO);
  }

  /**
   * Get available rooms (not rented)
   */
  async getAvailableRooms(): Promise<AxiosResponse<ApiResponse<Room[]>>> {
    return this.customGet('/available');
  }

  /**
   * Get rooms by building ID
   */
  async getRoomsByBuilding(buildingId: number): Promise<AxiosResponse<ApiResponse<Room[]>>> {
    return this.customGet(`/building/${buildingId}`);
  }

  /**
   * Get rooms by floor
   */
  async getRoomsByFloor(buildingId: number, floor: number): Promise<AxiosResponse<ApiResponse<Room[]>>> {
    return this.customGet(`/building/${buildingId}/floor/${floor}`);
  }

  /**
   * Change room status
   */
  async changeStatus(
    roomId: number,
    status: Room['TrangThai']
  ): Promise<AxiosResponse<ApiResponse<Room>>> {
    return this.customPost(`/${roomId}/status`, { TrangThai: status });
  }

  /**
   * Upload room images
   */
  async uploadImages(roomId: number, images: File[]): Promise<AxiosResponse<ApiResponse<Room>>> {
    const formData = new FormData();
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return this.customPost(`/${roomId}/upload-images`, formData);
  }
}

// Export singleton instance
export const roomsService = new RoomsService();
export default roomsService;
