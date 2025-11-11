import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Customer Overview
 * - Quick Actions (Repair request, Payment, Notifications, Violation report)
 * - Detailed last-month invoice breakdown
 */

// ===== Mock helpers & data (replace with API calls) =====
const currency = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// Example: your app may already store selected tenant/room in context
const MOCK_TENANT = {
    name: 'Nguyễn Văn A',
    room: 'A101',
    block: 'Dãy A',
};

// Utilities tariff
const PRICE = {
    electricity: 3500, // đ/kWh
    water: 60000, // đ/Người/Tháng
    internet: 50000, // đ/Phòng/Tháng (gói cơ bản)
    trash: 40000, // đ/Phòng/Tháng
    parking: 100000, // đ/Phòng/Tháng
};

// ===== Component =====
export default function CustomerOverview() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Quick action modals
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);

    const [repairForm, setRepairForm] = useState({
        type: 'routine',
        description: '',
        scheduledDate: '',
        photos: [] as File[],
    });

    const [violationForm, setViolationForm] = useState({
        roomReported: '',
        rule: '',
        when: '',
        description: '',
    });

    // === Last month invoice (computed dynamically) ===
    const today = new Date();
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthDate = new Date(firstOfThisMonth);
    lastMonthDate.setMonth(firstOfThisMonth.getMonth() - 1);

    const invoiceMonthLabel = lastMonthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

    // Example consumption
    const usage = {
        electricity: { start: 1250, end: 1312 }, // kWh index
        water: { people: 2 }, // persons
        internetPlan: 'Internet 1',
        notes: 'Đọc số điện ngày 01, nước tính theo đầu người.',
    };

    const items = useMemo(() => {
        const rent = { key: 'rent', label: 'Tiền thuê phòng', qty: 1, unit: 'tháng', price: 2_600_000, amount: 2_600_000 };
        const elecQty = Math.max(usage.electricity.end - usage.electricity.start, 0);
        const electricity = { key: 'electricity', label: 'Điện', qty: elecQty, unit: 'kWh', price: PRICE.electricity, amount: elecQty * PRICE.electricity };
        const water = { key: 'water', label: 'Nước', qty: usage.water.people, unit: 'Người', price: PRICE.water, amount: usage.water.people * PRICE.water };
        const internet = { key: 'internet', label: 'Internet (gói cơ bản)', qty: 1, unit: 'Phòng', price: PRICE.internet, amount: PRICE.internet };
        const trash = { key: 'trash', label: 'Rác', qty: 1, unit: 'Phòng', price: PRICE.trash, amount: PRICE.trash };
        const parking = { key: 'parking', label: 'Gửi xe', qty: 1, unit: 'Phòng', price: PRICE.parking, amount: PRICE.parking };

        return [rent, electricity, water, internet, trash, parking];
    }, []);

    const totals = useMemo(() => {
        const subtotal = items.reduce((s, i) => s + i.amount, 0);
        const adjustments = { previousBalance: 0, discounts: 0, lateFees: 0 };
        const totalDue = subtotal + adjustments.previousBalance + adjustments.lateFees - adjustments.discounts;
        return { subtotal, ...adjustments, totalDue };
    }, [items]);

    const dueDate = new Date(firstOfThisMonth); // thường hạn thanh toán ngày 05 của tháng hiện tại
    dueDate.setDate(5);

    // ===== Render =====
    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Title */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                                <p className="text-gray-600">Xin chào {MOCK_TENANT.name}! Phòng {MOCK_TENANT.room} • {MOCK_TENANT.block}</p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => setShowRepairModal(true)}
                                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow cursor-pointer text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-indigo-50">
                                        <i className="ri-tools-line text-indigo-600 text-xl" />
                                    </div>
                                    <i className="ri-arrow-right-line text-gray-300 group-hover:text-indigo-500" />
                                </div>
                                <h3 className="mt-3 font-semibold text-gray-900">Yêu cầu sửa chữa</h3>
                                <p className="text-sm text-gray-600">Báo hỏng và đặt lịch kỹ thuật</p>
                            </button>

                            <button
                                onClick={() => setShowPayModal(true)}
                                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow cursor-pointer text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-green-50">
                                        <i className="ri-money-dollar-circle-line text-green-600 text-xl" />
                                    </div>
                                    <i className="ri-arrow-right-line text-gray-300 group-hover:text-green-500" />
                                </div>
                                <h3 className="mt-3 font-semibold text-gray-900">Thanh toán</h3>
                                <p className="text-sm text-gray-600">Xem & thanh toán hóa đơn</p>
                            </button>

                            <Link
                                to="/customer/notifications"
                                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-yellow-50">
                                        <i className="ri-notification-3-line text-yellow-600 text-xl" />
                                    </div>
                                    <i className="ri-arrow-right-line text-gray-300 group-hover:text-yellow-500" />
                                </div>
                                <h3 className="mt-3 font-semibold text-gray-900">Thông báo</h3>
                                <p className="text-sm text-gray-600">Tin mới từ BQL</p>
                            </Link>

                            <button
                                onClick={() => setShowViolationModal(true)}
                                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow cursor-pointer text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="p-2 rounded-lg bg-red-50">
                                        <i className="ri-alert-line text-red-600 text-xl" />
                                    </div>
                                    <i className="ri-arrow-right-line text-gray-300 group-hover:text-red-500" />
                                </div>
                                <h3 className="mt-3 font-semibold text-gray-900">Báo cáo vi phạm</h3>
                                <p className="text-sm text-gray-600">Gửi phản ánh nhanh</p>
                            </button>
                        </section>

                        {/* Last Month Invoice */}
                        <section className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <i className="ri-bill-line text-indigo-600 mr-2" /> Hóa đơn {invoiceMonthLabel}
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Chưa thanh toán</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Hạn thanh toán: {dueDate.toLocaleDateString('vi-VN')}</p>
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
                                            {items.map((i) => (
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

                                {/* Usage notes */}
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="text-gray-600">Chỉ số điện</div>
                                        <div className="font-medium text-gray-900 mt-1">{usage.electricity.start} → {usage.electricity.end} kWh</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="text-gray-600">Số người tính nước</div>
                                        <div className="font-medium text-gray-900 mt-1">{usage.water.people} người</div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="text-gray-600">Gói Internet</div>
                                        <div className="font-medium text-gray-900 mt-1">{usage.internetPlan} ({currency(PRICE.internet)}/tháng)</div>
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="mt-6 flex flex-col items-end">
                                    <div className="w-full md:w-1/2 lg:w-1/3">
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-600">Tạm tính</span>
                                            <span className="text-gray-900">{currency(totals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-600">Công nợ kỳ trước</span>
                                            <span className="text-gray-900">{currency(totals.previousBalance)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-600">Giảm trừ</span>
                                            <span className="text-gray-900">-{currency(totals.discounts)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm py-1">
                                            <span className="text-gray-600">Phí trễ hạn</span>
                                            <span className="text-gray-900">{currency(totals.lateFees)}</span>
                                        </div>
                                        <div className="flex justify-between text-base font-semibold py-2 border-t mt-2">
                                            <span className="text-gray-900">Cần thanh toán</span>
                                            <span className="text-gray-900">{currency(totals.totalDue)}</span>
                                        </div>

                                        <div className="flex gap-3 mt-2">
                                            <button
                                                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                                onClick={() => setShowPayModal(true)}
                                            >
                                                Thanh toán ngay
                                            </button>
                                            <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                                                Tải PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                <p className="text-xs text-gray-500 mt-4">Ghi chú: {usage.notes}</p>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {/* === Repair Modal === */}
            {showRepairModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRepairModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu sửa chữa</h3>
                                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowRepairModal(false)}>
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại yêu cầu</label>
                                    <select
                                        value={repairForm.type}
                                        onChange={(e) => setRepairForm({ ...repairForm, type: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                                    >
                                        <option value="routine">Bảo trì</option>
                                        <option value="repair">Sửa chữa</option>
                                        <option value="replacement">Thay thế</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                                    <textarea
                                        rows={4}
                                        value={repairForm.description}
                                        onChange={(e) => setRepairForm({ ...repairForm, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Mô tả sự cố, vị trí, thời điểm..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mong muốn</label>
                                    <input
                                        type="date"
                                        value={repairForm.scheduledDate}
                                        onChange={(e) => setRepairForm({ ...repairForm, scheduledDate: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-5 pt-4 border-t">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200" onClick={() => setShowRepairModal(false)}>Hủy</button>
                                <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700" onClick={() => { setShowRepairModal(false); alert('Đã gửi yêu cầu sửa chữa!'); }}>Gửi yêu cầu</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === Pay Modal (stub) === */}
            {showPayModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPayModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Thanh toán hóa đơn</h3>
                                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowPayModal(false)}>
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600">Số tiền cần thanh toán: <span className="font-semibold text-gray-900">{currency(totals.totalDue)}</span></p>
                            <div className="mt-3 space-y-3">
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="method" defaultChecked />
                                    <span>Chuyển khoản ngân hàng</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" name="method" />
                                    <span>Tiền mặt tại văn phòng</span>
                                </label>
                            </div>
                            <div className="flex gap-3 mt-5 pt-4 border-t">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200" onClick={() => setShowPayModal(false)}>Đóng</button>
                                <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onClick={() => { setShowPayModal(false); alert('Thanh toán thành công (mô phỏng)!'); }}>Xác nhận</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* === Quick Violation Report === */}
            {showViolationModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowViolationModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Báo cáo vi phạm nhanh</h3>
                                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowViolationModal(false)}>
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng bị báo cáo *</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        value={violationForm.roomReported}
                                        onChange={(e) => setViolationForm({ ...violationForm, roomReported: e.target.value })}
                                        placeholder="VD: A102"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy *</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                                        value={violationForm.rule}
                                        onChange={(e) => setViolationForm({ ...violationForm, rule: e.target.value })}
                                    >
                                        <option value="">Chọn nội quy</option>
                                        <option value="Giờ giấc sinh hoạt">Giờ giấc sinh hoạt</option>
                                        <option value="Vệ sinh chung">Vệ sinh chung</option>
                                        <option value="Khách thăm">Khách thăm</option>
                                        <option value="An toàn cháy nổ">An toàn cháy nổ</option>
                                        <option value="Khác">Khác</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        value={violationForm.when}
                                        onChange={(e) => setViolationForm({ ...violationForm, when: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                                    <textarea
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        value={violationForm.description}
                                        onChange={(e) => setViolationForm({ ...violationForm, description: e.target.value })}
                                        placeholder="Chi tiết hành vi, ảnh hưởng..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-5 pt-4 border-t">
                                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200" onClick={() => setShowViolationModal(false)}>Hủy</button>
                                <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={() => { setShowViolationModal(false); alert('Đã gửi báo cáo vi phạm!'); }}>Gửi báo cáo</button>
                            </div>

                            <p className="text-xs text-gray-500 mt-3">Muốn xem lịch sử/chi tiết? <Link to="/customer/violations" className="text-indigo-600 hover:underline">Mở trang Báo cáo vi phạm</Link></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
