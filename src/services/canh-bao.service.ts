import httpClient from '../lib/http-client';
import { CanhBao } from '../types/canh-bao';

const CANHBAO_API_URL = '/canh-bao';

class CanhBaoService {
  /**
   * Get alerts for current user
   */
  async getMyAlerts(signal?: AbortSignal) {
    return httpClient.get<{ data: CanhBao[] }>(CANHBAO_API_URL, { signal });
  }

  /**
   * Mark a specific alert as read
   */
  async markAsRead(id: number) {
    return httpClient.post(`${CANHBAO_API_URL}/${id}/doc`);
  }

  /**
   * Mark all alerts as read
   */
  async markAllAsRead() {
    return httpClient.post(`${CANHBAO_API_URL}/doc-tat-ca`);
  }
}

export default new CanhBaoService();
