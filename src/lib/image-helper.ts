/**
 * Helper để xử lý image URLs
 */

import { API_BASE_URL } from '@/config/api';

/**
 * Chuyển relative URL thành absolute URL
 * @param imagePath - Đường dẫn hình ảnh (có thể là relative hoặc absolute)
 * @returns Absolute URL hoặc null nếu không có hình
 */
export function getImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;

  // Nếu đã là absolute URL (http:// hoặc https://), return luôn
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Nếu là relative URL, thêm base URL của backend
  // Loại bỏ '/api' từ API_BASE_URL vì storage không nằm trong /api
  const baseUrl = API_BASE_URL.replace('/api', '');
  
  // Đảm bảo path bắt đầu với /
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${path}`;
}
