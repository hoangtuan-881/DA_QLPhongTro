import React, { useMemo, useState, useEffect } from 'react';
import hoaDonService, { HoaDon } from '@/services/hoaDonService';
import { getErrorMessage } from '@/lib/http-client';
import { formatCurrency, formatMonthYear } from '@/lib/format-utils';

/**
 * CustomerInvoices
 * - Hiển thị hóa đơn mới nhất chi tiết ở trên (tổng quan)
 * - Danh sách các hóa đơn cũ hơn ở dưới dạng thẻ/danh sách
 */

// Map TrangThai Backend sang display status
type DisplayStatus = 'unpaid' | 'paid' | 'overdue' | 'processing';
const mapTrangThai = (status: HoaDon['TrangThai']): DisplayStatus => {
    const map: Record<HoaDon['TrangThai'], DisplayStatus> = {
        'moi_tao': 'unpaid',
        'da_thanh_toan': 'paid',
        'da_thanh_toan_mot_phan': 'processing',
        'qua_han': 'overdue'
    };
    return map[status];
};

function calcTotals(hd: HoaDon) {
    const subtotal = hd.chiTietHoaDon?.reduce((s, i) => s + i.ThanhTien, 0) || 0;
    const total = hd.TongTien;
    const paid = hd.DaThanhToan;
    const remaining = hd.ConLai;

    return {
        subtotal,
        total,
        paid,
        remaining,
        // For display compatibility with old design
        prev: 0,
        disc: 0,
        late: 0
    };
}

function StatusBadge({ status }: { status: DisplayStatus }) {
    const map: Record<DisplayStatus, string> = {
        unpaid: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800',
        processing: 'bg-blue-100 text-blue-800',
    };
    const label: Record<DisplayStatus, string> = {
        unpaid: 'Chưa thanh toán',
        paid: 'Đã thanh toán',
        overdue: 'Quá hạn',
        processing: 'Đang xử lý',
    };
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${map[status]}`}>
            {label[status]}
        </span>
    );
}

export default function CustomerInvoices() {
    const [hoaDons, setHoaDons] = useState<HoaDon[]>([]);
    const [loading, setLoading] = useState(true); // ✅ Initial TRUE

    // ✅ Fetch với AbortController
    useEffect(() => {
        const controller = new AbortController();

        const fetchHoaDons = async () => {
            try {
                const response = await hoaDonService.getAll(controller.signal);
                if (!controller.signal.aborted) {
                    // Paginated response - extract data array
                    setHoaDons(response.data.data || []);
                    setLoading(false);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    console.error('Lỗi tải hóa đơn:', getErrorMessage(error));
                    setLoading(false);
                }
            }
        };

        fetchHoaDons();
        return () => controller.abort(); // ✅ Cleanup
    }, []);

    // ✅ useMemo PHẢI gọi trước early returns
    const latest = hoaDons[0];
    const older = useMemo(() => hoaDons.slice(1), [hoaDons]);
    const latestTotals = useMemo(() => latest ? calcTotals(latest) : null, [latest]);

    // ✅ Download PDF thật
    const handleDownloadPdf = async (hoaDon: HoaDon) => {
        try {
            const response = await hoaDonService.downloadPdf(hoaDon.MaHoaDon);
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `HoaDon_${hoaDon.Thang}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Lỗi tải PDF: ${getErrorMessage(error)}`);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">Đang tải hóa đơn...</div>
            </div>
        );
    }

    // Empty state
    if (hoaDons.length === 0) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-gray-600">Chưa có hóa đơn nào</div>
            </div>
        );
    }

    // latest và latestTotals đã được tính ở trên

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Hóa đơn</h1>
                <p className="text-gray-600">Quản lý và thanh toán hóa đơn hàng tháng</p>
            </div>

            {/* ===== Hóa đơn mới nhất (tổng quan) ===== */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="ri-bill-line text-indigo-600 mr-2" /> Hóa đơn {formatMonthYear(latest.Thang)}
                        </h2>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={mapTrangThai(latest.TrangThai)} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Ngày lập: {new Date(latest.NgayLap).toLocaleDateString('vi-VN')} · Hạn thanh toán: {new Date(latest.NgayHetHan).toLocaleDateString('vi-VN')}
                    </p>
                    {latest.GhiChu && (
                        <p className="text-xs text-gray-500 mt-1">Ghi chú: {latest.GhiChu}</p>
                    )}
                </div>

                <div className="p-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạng mục</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SL</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {latest.chiTietHoaDon?.map((item) => (
                                    <tr key={item.MaChiTiet} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{item.NoiDung}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{item.SoLuong}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">-</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatCurrency(item.DonGia)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{formatCurrency(item.ThanhTien)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="mt-6 flex flex-col items-end">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="text-gray-900">{formatCurrency(latestTotals?.subtotal || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Đã thanh toán</span>
                                <span className="text-gray-900">{formatCurrency(latestTotals?.paid || 0)}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold py-2 border-t mt-2">
                                <span className="text-gray-900">Còn lại</span>
                                <span className="text-gray-900">{formatCurrency(latestTotals?.remaining || 0)}</span>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button
                                    className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                    onClick={() => handleDownloadPdf(latest)}
                                >
                                    Tải PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== Danh sách hóa đơn cũ hơn ===== */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                        <i className="ri-time-line text-indigo-600 mr-2" /> Hóa đơn các tháng trước
                    </h2>
                </div>

                <div className="p-6">
                    {older.length === 0 ? (
                        <p className="text-gray-600">Không có hóa đơn cũ.</p>
                    ) : (
                        <div className="space-y-4">
                            {older.map((inv) => {
                                const t = calcTotals(inv);
                                return (
                                    <div key={inv.MaHoaDon} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{formatMonthYear(inv.Thang)}</h3>
                                                    <StatusBadge status={mapTrangThai(inv.TrangThai)} />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    Ngày lập: {new Date(inv.NgayLap).toLocaleDateString('vi-VN')} · Hạn thanh toán: {new Date(inv.NgayHetHan).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Tổng tiền</div>
                                                <div className="text-base font-semibold text-gray-900">{formatCurrency(t.total)}</div>
                                            </div>
                                        </div>

                                        {/* Hành động */}
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                                onClick={() => handleDownloadPdf(inv)}
                                            >
                                                <i className="ri-file-download-line mr-1" />Tải PDF
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
