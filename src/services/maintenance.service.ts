import httpClient from '../lib/http-client';
import { type DayTro } from './day-tro.service';
import { type PhongTro } from './phong-tro.service';
import { type NhanVien } from './nhan-vien.service'; // Assuming NhanVien service exists or define interface

// Interfaces matching backend YeuCauBaoTriResource
export interface KhachThueForMaintenance {
    MaKhachThue: number;
    HoTen: string;
    TenPhong?: string;
}

export interface NhanVienPhanCong {
    MaNV: number;
    HoTen: string;
}

export interface YeuCauBaoTri {
    MaYeuCau: number;
    MaKhachThue: number;
    TieuDe: string;
    MoTa: string;
    PhanLoai: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
    MucDoUuTien: 'low' | 'medium' | 'high' | 'urgent';
    TrangThai: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    NgayYeuCau: string;
    NgayPhanCong?: string | null;
    NgayHoanThanh?: string | null;
    GhiChu?: string | null;
    ChiPhiThucTe?: string | null;
    HinhAnhMinhChung?: string[] | null;
    khachThue?: KhachThueForMaintenance;
    nhanVienPhanCong?: NhanVienPhanCong | null;
}

// Payload for creating a new request (Admin)
export type MaintenanceRequestCreate = {
    MaKhachThue: number;
    TieuDe: string;
    MoTa: string;
    PhanLoai: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
    MucDoUuTien: 'low' | 'medium' | 'high' | 'urgent';
    GhiChu?: string;
    ChiPhiThucTe?: number;
    HinhAnhMinhChung?: string[];
};

// Payload for creating a new request (Customer - no MaKhachThue needed)
export type MaintenanceRequestCreateForCustomer = Omit<MaintenanceRequestCreate, 'MaKhachThue'>;

// Payload for updating a request (general update)
export type MaintenanceRequestUpdate = {
    MaKhachThue?: number;
    TieuDe?: string;
    MoTa?: string;
    PhanLoai?: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
    MucDoUuTien?: 'low' | 'medium' | 'high' | 'urgent';
    TrangThai?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    MaNhanVienPhanCong?: number | null;
    NgayPhanCong?: string | null;
    NgayHoanThanh?: string | null;
    GhiChu?: string;
    ChiPhiThucTe?: number;
    HinhAnhMinhChung?: string[];
};

// Payload for assigning a technician
export type MaintenanceRequestAssign = {
    MaNhanVienPhanCong: number;
    GhiChu?: string;
};

// Payload for updating status
export type MaintenanceRequestUpdateStatus = {
    TrangThai: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
    GhiChu?: string;
    ChiPhiThucTe?: number;
    HinhAnhMinhChung?: string[];
};


const MAINTENANCE_API_URL = '/admin/yeu-cau-bao-tri';
const CUSTOMER_MAINTENANCE_API_URL = '/customer/maintenance-requests';

class MaintenanceService {
    // Admin endpoints
    getAll(signal?: AbortSignal) {
        return httpClient.get<{ data: YeuCauBaoTri[] }>(MAINTENANCE_API_URL, { signal });
    }

    getById(id: number, signal?: AbortSignal) {
        return httpClient.get<{ data: YeuCauBaoTri }>(`${MAINTENANCE_API_URL}/${id}`, { signal });
    }

    create(data: MaintenanceRequestCreate) {
        return httpClient.post<{ data: YeuCauBaoTri }>(MAINTENANCE_API_URL, data);
    }

    // Customer endpoints
    getAllForCustomer(signal?: AbortSignal) {
        return httpClient.get<{ data: YeuCauBaoTri[] }>(CUSTOMER_MAINTENANCE_API_URL, { signal });
    }

    createForCustomer(data: MaintenanceRequestCreateForCustomer) {
        return httpClient.post<{ data: YeuCauBaoTri }>(CUSTOMER_MAINTENANCE_API_URL, data);
    }

    update(id: number, data: MaintenanceRequestUpdate) {
        return httpClient.put<{ data: YeuCauBaoTri }>(`${MAINTENANCE_API_URL}/${id}`, data);
    }

    delete(id: number) {
        return httpClient.delete(`${MAINTENANCE_API_URL}/${id}`);
    }

    assign(id: number, data: MaintenanceRequestAssign) {
        return httpClient.put<{ data: YeuCauBaoTri }>(`${MAINTENANCE_API_URL}/${id}/assign`, data);
    }

    updateStatus(id: number, data: MaintenanceRequestUpdateStatus) {
        return httpClient.put<{ data: YeuCauBaoTri }>(`${MAINTENANCE_API_URL}/${id}/status`, data);
    }
}

export default new MaintenanceService();
