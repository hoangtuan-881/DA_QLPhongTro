import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CustomerInvoices
 * - Hiển thị hóa đơn mới nhất chi tiết ở trên (tổng quan)
 * - Danh sách các hóa đơn cũ hơn ở dưới dạng thẻ/danh sách
 *
 * Ghi chú: dữ liệu đang MOCK. Khi tích hợp API, thay phần mockInvoices bằng dữ liệu thực.
 */

// ===== Helpers =====
const currency = (n: number) => `${(n ?? 0).toLocaleString('vi-VN')}đ`;

type InvoiceItem = {
    key: string;
    label: string;
    qty: number;
    unit: string;
    price: number; // đơn giá
    amount: number; // thành tiền (qty * price)
};

type Invoice = {
    id: string;
    monthLabel: string; // ví dụ: "Tháng 11, 2025"
    issueDate: string;  // ISO string
    dueDate: string;    // ISO string
    status: 'unpaid' | 'paid' | 'overdue' | 'processing';
    note?: string;
    items: InvoiceItem[];
    adjustments?: { previousBalance?: number; discounts?: number; lateFees?: number };
};

// ===== Mock data (replace with API) =====
const mockInvoices: Invoice[] = [
    // Hóa đơn tháng hiện tại - 1 (mới nhất)
    {
        id: 'inv-2025-10',
        monthLabel: 'Tháng 10, 2025',
        issueDate: '2025-11-01',
        dueDate: '2025-11-05',
        status: 'unpaid',
        note: 'Đọc số điện nước ngày 01 hàng tháng.',
        items: [
            { key: 'rent', label: 'Tiền thuê phòng', qty: 1, unit: 'tháng', price: 2_600_000, amount: 2_600_000 },
            { key: 'electricity', label: 'Điện', qty: 85, unit: 'kWh', price: 3_500, amount: 85 * 3_500 },
            { key: 'water', label: 'Nước', qty: 2, unit: 'Người', price: 60_000, amount: 2 * 60_000 },
            { key: 'internet', label: 'Internet (gói cơ bản)', qty: 1, unit: 'Phòng', price: 50_000, amount: 50_000 },
            { key: 'trash', label: 'Rác', qty: 1, unit: 'Phòng', price: 40_000, amount: 40_000 },
            { key: 'parking', label: 'Gửi xe', qty: 1, unit: 'Phòng', price: 100_000, amount: 100_000 },
        ],
        adjustments: { previousBalance: 0, discounts: 0, lateFees: 0 }
    },
    // Hóa đơn cũ hơn
    {
        id: 'inv-2025-09',
        monthLabel: 'Tháng 9, 2025',
        issueDate: '2025-10-01',
        dueDate: '2025-10-05',
        status: 'paid',
        items: [
            { key: 'rent', label: 'Tiền thuê phòng', qty: 1, unit: 'tháng', price: 2_600_000, amount: 2_600_000 },
            { key: 'electricity', label: 'Điện', qty: 78, unit: 'kWh', price: 3_500, amount: 78 * 3_500 },
            { key: 'water', label: 'Nước', qty: 2, unit: 'Người', price: 60_000, amount: 2 * 60_000 },
            { key: 'internet', label: 'Internet (gói cơ bản)', qty: 1, unit: 'Phòng', price: 50_000, amount: 50_000 },
            { key: 'trash', label: 'Rác', qty: 1, unit: 'Phòng', price: 40_000, amount: 40_000 },
            { key: 'parking', label: 'Gửi xe', qty: 1, unit: 'Phòng', price: 100_000, amount: 100_000 },
        ],
        adjustments: { previousBalance: 0, discounts: 0, lateFees: 0 }
    },
    {
        id: 'inv-2025-08',
        monthLabel: 'Tháng 8, 2025',
        issueDate: '2025-09-01',
        dueDate: '2025-09-05',
        status: 'paid',
        items: [
            { key: 'rent', label: 'Tiền thuê phòng', qty: 1, unit: 'tháng', price: 2_600_000, amount: 2_600_000 },
            { key: 'electricity', label: 'Điện', qty: 80, unit: 'kWh', price: 3_500, amount: 80 * 3_500 },
            { key: 'water', label: 'Nước', qty: 2, unit: 'Người', price: 60_000, amount: 2 * 60_000 },
            { key: 'internet', label: 'Internet (gói cơ bản)', qty: 1, unit: 'Phòng', price: 50_000, amount: 50_000 },
            { key: 'trash', label: 'Rác', qty: 1, unit: 'Phòng', price: 40_000, amount: 40_000 },
            { key: 'parking', label: 'Gửi xe', qty: 1, unit: 'Phòng', price: 100_000, amount: 100_000 },
        ],
        adjustments: { previousBalance: 0, discounts: 0, lateFees: 0 }
    },
];

function calcTotals(inv: Invoice) {
    const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
    const prev = inv.adjustments?.previousBalance ?? 0;
    const disc = inv.adjustments?.discounts ?? 0;
    const late = inv.adjustments?.lateFees ?? 0;
    const total = subtotal + prev + late - disc;
    return { subtotal, prev, disc, late, total };
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
    const map: Record<Invoice['status'], string> = {
        unpaid: 'bg-yellow-100 text-yellow-800',
        paid: 'bg-green-100 text-green-800',
        overdue: 'bg-red-100 text-red-800',
        processing: 'bg-blue-100 text-blue-800',
    };
    const label: Record<Invoice['status'], string> = {
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
    const navigate = useNavigate();
    const [invoices] = useState<Invoice[]>(() =>
        [...mockInvoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    );

    const latest = invoices[0];
    const older = useMemo(() => invoices.slice(1), [invoices]);
    const latestTotals = useMemo(() => calcTotals(latest), [latest]);

    const payNow = () => {
        // Ở bản thật, mở modal/đi đến cổng thanh toán
        alert('Mô phỏng: Thanh toán thành công!');
    };

    const downloadPdf = (inv: Invoice) => {
        // Tạo/tải PDF thật sự tuỳ backend. Ở đây chỉ mô phỏng.
        alert(`Mô phỏng: Tải PDF cho ${inv.monthLabel}`);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* ===== Hóa đơn mới nhất (tổng quan) ===== */}
            <section className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="ri-bill-line text-indigo-600 mr-2" /> Hóa đơn {latest.monthLabel}
                        </h2>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={latest.status} />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Ngày lập: {new Date(latest.issueDate).toLocaleDateString('vi-VN')} · Hạn thanh toán: {new Date(latest.dueDate).toLocaleDateString('vi-VN')}
                    </p>
                    {latest.note && (
                        <p className="text-xs text-gray-500 mt-1">Ghi chú: {latest.note}</p>
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
                                {latest.items.map((i) => (
                                    <tr key={i.key} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{i.label}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{i.qty}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{i.unit}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right">{currency(i.price)}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{currency(i.amount)}</td>
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
                                <span className="text-gray-900">{currency(latestTotals.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Công nợ kỳ trước</span>
                                <span className="text-gray-900">{currency(latestTotals.prev)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Giảm trừ</span>
                                <span className="text-gray-900">-{currency(latestTotals.disc)}</span>
                            </div>
                            <div className="flex justify-between text-sm py-1">
                                <span className="text-gray-600">Phí trễ hạn</span>
                                <span className="text-gray-900">{currency(latestTotals.late)}</span>
                            </div>
                            <div className="flex justify-between text-base font-semibold py-2 border-t mt-2">
                                <span className="text-gray-900">Cần thanh toán</span>
                                <span className="text-gray-900">{currency(latestTotals.total)}</span>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onClick={payNow}>
                                    Thanh toán ngay
                                </button>
                                <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => downloadPdf(latest)}>
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
                                    <div key={inv.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{inv.monthLabel}</h3>
                                                    <StatusBadge status={inv.status} />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    Ngày lập: {new Date(inv.issueDate).toLocaleDateString('vi-VN')} · Hạn thanh toán: {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-600">Tổng tiền</div>
                                                <div className="text-base font-semibold text-gray-900">{currency(t.total)}</div>
                                            </div>
                                        </div>

                                        {/* Hành động */}
                                        <div className="flex gap-2 mt-3">
                                            <button className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100" onClick={() => downloadPdf(inv)}>
                                                <i className="ri-file-download-line mr-1" />Tải PDF
                                            </button>
                                            {inv.status !== 'paid' && (
                                                <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={payNow}>
                                                    <i className="ri-money-dollar-circle-line mr-1" />Thanh toán
                                                </button>
                                            )}
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
