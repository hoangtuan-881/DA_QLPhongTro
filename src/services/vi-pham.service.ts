import httpClient from '../lib/http-client';
import { type NoiQuy } from './noi-quy.service';

// Based on KhachThueResource, PhongTroResource, DayTroResource
interface DayTro {
    MaDay: number;
    TenDay: string;
}

interface PhongTro {
    MaPhong: number;
    TenPhong: string;
    dayTro: DayTro;
}

interface KhachThue {
    MaKhachThue: number;
    HoTen: string;
    phongTro: PhongTro;
}

export interface ViPham {
    MaViPham: number;
    MoTa: string;
    MucDo: 'nhe' | 'vua' | 'nghiem_trong' | 'rat_nghiem_trong';
    TrangThai: 'da_bao_cao' | 'da_canh_cao' | 'da_giai_quyet';
    NgayBaoCao: string;
    NguoiBaoCao: string;
    NgayGiaiQuyet: string | null;
    GhiChu: string | null;
    noiQuy: NoiQuy;
    khachThue: KhachThue;
}

export type ViPhamCreate = Omit<ViPham, 'MaViPham' | 'TrangThai' | 'NgayGiaiQuyet' | 'noiQuy' | 'khachThue'> & {
    MaNoiQuy: number;
    MaKhachThue: number;
};

export type ViPhamUpdate = Pick<ViPham, 'TrangThai' | 'GhiChu' | 'NgayGiaiQuyet'>;


const VIPHAM_API_URL = '/admin/vi-pham';

class ViPhamService {
    getAll(signal?: AbortSignal) {
        return httpClient.get<{ data: ViPham[] }>(VIPHAM_API_URL, { signal });
    }

    create(data: ViPhamCreate) {
        return httpClient.post<ViPham>(VIPHAM_API_URL, data);
    }

    update(id: number, data: ViPhamUpdate) {
        return httpClient.put<ViPham>(`${VIPHAM_API_URL}/${id}`, data);
    }

    delete(id: number) {
        return httpClient.delete(`${VIPHAM_API_URL}/${id}`);
    }
}

export default new ViPhamService();
