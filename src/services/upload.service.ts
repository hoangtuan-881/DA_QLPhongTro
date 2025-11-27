import httpClient from '../lib/http-client';
import { API_ENDPOINTS } from '../config/api';

export interface UploadResponse {
  url: string;
  path: string;
  filename: string;
}

// Backend wraps response in { message, data }
interface ApiResponse<T> {
  message: string;
  data: T;
}

class UploadService {
  /**
   * Upload hình ảnh
   */
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return httpClient.post<ApiResponse<UploadResponse>>(`${API_ENDPOINTS.UPLOAD}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Xóa hình ảnh
   */
  async deleteImage(path: string): Promise<void> {
    return httpClient.delete(`${API_ENDPOINTS.UPLOAD}/image`, {
      data: { path },
    });
  }
}

export default new UploadService();
