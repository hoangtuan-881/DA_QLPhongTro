import { useState, useEffect, useCallback } from 'react';
import { thongBaoHeThongService } from '@/services/thongBaoHeThongService';
import { ThongBaoHeThong, ThongBaoHeThongCreateInput, ThongBaoHeThongUpdateInput } from '@/types/thong-bao';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/http-client';

export function useThongBaoHeThong() {
    const [thongBaos, setThongBaos] = useState<ThongBaoHeThong[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const toast = useToast();

    const refresh = useCallback(() => {
        setLoading(true);
        setRefreshKey(prev => prev + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const fetchData = async () => {
            try {
                const response = await thongBaoHeThongService.getAll(controller.signal);
                if (!controller.signal.aborted) {
                    setThongBaos(response.data.data || []);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError') {
                    toast.error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(error) });
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => controller.abort();
    }, [refreshKey, toast]);

    const createThongBao = async (data: ThongBaoHeThongCreateInput) => {
        try {
            await thongBaoHeThongService.create(data);
            toast.success({ title: 'Tạo thông báo thành công' });
            refresh();
        } catch (error) {
            toast.error({ title: 'Lỗi tạo thông báo', message: getErrorMessage(error) });
            throw error;
        }
    };

    const updateThongBao = async (id: number, data: ThongBaoHeThongUpdateInput) => {
        try {
            await thongBaoHeThongService.update(id, data);
            toast.success({ title: 'Cập nhật thông báo thành công' });
            refresh();
        } catch (error) {
            toast.error({ title: 'Lỗi cập nhật thông báo', message: getErrorMessage(error) });
            throw error;
        }
    };

    const deleteThongBao = async (id: number) => {
        try {
            await thongBaoHeThongService.delete(id);
            toast.success({ title: 'Xóa thông báo thành công' });
            refresh();
        } catch (error) {
            toast.error({ title: 'Lỗi xóa thông báo', message: getErrorMessage(error) });
            throw error;
        }
    };

    return {
        thongBaos,
        loading,
        refresh,
        createThongBao,
        updateThongBao,
        deleteThongBao,
    };
}
