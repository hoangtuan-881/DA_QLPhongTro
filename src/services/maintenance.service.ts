import httpClient from '../lib/http-client';
import { type DayTro } from './day-tro.service';
import { type PhongTro } from './phong-tro.service';
import { type NhanVien } from './nhan-vien.service'; // Assuming NhanVien service exists or define interface

// Interfaces matching backend YeuCauBaoTriResource
export interface KhachThueForMaintenance {
    MaKhachThue: number;
    HoTen: string;
    phongTro: {
        MaPhong: number;
        TenPhong: string;
        dayTro: DayTro;
    };
}

export interface MaintenanceRequest {
    id: number; // MaYeuCau
    tenantName: string; // khachThue.HoTen
    building: string; // khachThue.phongTro.dayTro.TenDay
    room: string; // khachThue.phongTro.TenPhong
    title: string; // TieuDe
    description: string; // MoTa
    category: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other'; // PhanLoai
    priority: 'low' | 'medium' | 'high' | 'urgent'; // MucDoUuTien
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'; // TrangThai
    requestDate: string; // NgayYeuCau (ISO string)
    assignedTo?: string; // nhanVienPhanCong.HoTen
    scheduledDate?: string; // NgayPhanCong (ISO string)
    completedDate?: string; // NgayHoanThanh (ISO string)
    notes?: string; // GhiChu
    actualCost?: number; // ChiPhiThucTe
    images?: string[]; // HinhAnhMinhChung
}

// Payload for creating a new request
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

class MaintenanceService {
    getAll(signal?: AbortSignal) {
        return httpClient.get<{ data: MaintenanceRequest[] }>(MAINTENANCE_API_URL, { signal });
    }

    getById(id: number, signal?: AbortSignal) {
        return httpClient.get<{ data: MaintenanceRequest }>(`${MAINTENANCE_API_URL}/${id}`, { signal });
    }

    create(data: MaintenanceRequestCreate) {
        return httpClient.post<{ data: MaintenanceRequest }>(MAINTENANCE_API_URL, data);
    }

    update(id: number, data: MaintenanceRequestUpdate) {
        return httpClient.put<{ data: MaintenanceRequest }>(`${MAINTENANCE_API_URL}/${id}`, data);
    }

    delete(id: number) {
        return httpClient.delete(`${MAINTENANCE_API_URL}/${id}`);
    }

    assign(id: number, data: MaintenanceRequestAssign) {
        return httpClient.put<{ data: MaintenanceRequest }>(`${MAINTENANCE_API_URL}/${id}/assign`, data);
    }

    updateStatus(id: number, data: MaintenanceRequestUpdateStatus) {
        return httpClient.put<{ data: MaintenanceRequest }>(`${MAINTENANCE_API_URL}/${id}/status`, data);
    }
}

export default new MaintenanceService();
