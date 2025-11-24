import httpClient from '../lib/http-client';
import { ThongBaoHeThong, ThongBaoHeThongCreateInput, ThongBaoHeThongUpdateInput } from '../types/thong-bao';

class ThongBaoHeThongService {
  private endpoint = '/admin/thong-bao-he-thong';

  async getAll(signal?: AbortSignal) {
    return httpClient.get<{ data: ThongBaoHeThong[] }>(this.endpoint, { signal });
  }

  async getById(id: number, signal?: AbortSignal) {
    return httpClient.get<{ data: ThongBaoHeThong }>(`${this.endpoint}/${id}`, { signal });
  }

  async create(data: ThongBaoHeThongCreateInput) {
    return httpClient.post<{ data: ThongBaoHeThong }>(this.endpoint, data);
  }

  async update(id: number, data: ThongBaoHeThongUpdateInput) {
    return httpClient.put<{ data: ThongBaoHeThong }>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: number) {
    return httpClient.delete(`${this.endpoint}/${id}`);
  }
}

export default new ThongBaoHeThongService();
