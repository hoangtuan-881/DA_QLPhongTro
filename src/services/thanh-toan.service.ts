import httpClient from '../lib/http-client';

export interface ThanhToan {
  MaThanhToan: number;
  MaHoaDon: number;
  SoTien: number;
  NgayThanhToan: string;
  PhuongThuc: 'tien_mat' | 'chuyen_khoan';
  GhiChu: string | null;
  hoaDon?: {
    MaHoaDon: number;
    MaPhong: number;
    Thang: string;
    TongTien: number;
    DaThanhToan: number;
    ConLai: number;
    TrangThai: string;
  };
}

const THANHTOAN_API_URL = '/admin/thanh-toan';

class ThanhToanService {
  getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: ThanhToan[] }>(THANHTOAN_API_URL, { signal });
  }

  getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: ThanhToan }>(`${THANHTOAN_API_URL}/${id}`, { signal });
  }

  create(data: Omit<ThanhToan, 'MaThanhToan' | 'hoaDon'>) {
    return httpClient.post<{ data: ThanhToan }>(THANHTOAN_API_URL, data);
  }

  update(id: number, data: Partial<Omit<ThanhToan, 'MaThanhToan' | 'hoaDon'>>) {
    return httpClient.put<{ data: ThanhToan }>(`${THANHTOAN_API_URL}/${id}`, data);
  }

  delete(id: number) {
    return httpClient.delete(`${THANHTOAN_API_URL}/${id}`);
  }
}

export default new ThanhToanService();
