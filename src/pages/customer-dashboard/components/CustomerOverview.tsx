import React, { useMemo, useState, useEffect } from 'react';
import { useToast } from '../../../hooks/useToast';
import customerService, {
    type ThongTinPhong,
    type HoaDonKhachThue,
    type CreateYeuCauSuaChuaRequest,
    type CreateViPhamRequest
} from '@/services/customer.service';
import { getErrorMessage } from '@/lib/http-client';


// ===== Helpers =====
const currency = (n: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(n);
};

// ===== VietQR Config =====
const VIETQR_CONFIG = {
    BANK_ID: 'MB',                    // Mã ngân hàng (MB=MBBank, VCB=Vietcombank, TCB=Techcombank, etc.)
    ACCOUNT_NO: '0987654321',         // Số tài khoản nhận tiền
    ACCOUNT_NAME: 'NGUYEN VAN A',     // Tên chủ tài khoản
    TEMPLATE: 'compact'               // compact, compact2, qr_only, print
};

/**
 * Tạo URL ảnh QR VietQR động
 * @param amount Số tiền cần thanh toán
 * @param addInfo Nội dung chuyển khoản (VD: "HD-2024-001" hoặc mã hóa đơn)
 * @returns URL ảnh QR code
 */
const generateVietQRUrl = (amount: number, addInfo: string): string => {
    const baseUrl = 'https://img.vietqr.io/image';
    const { BANK_ID, ACCOUNT_NO, ACCOUNT_NAME, TEMPLATE } = VIETQR_CONFIG;

    const params = new URLSearchParams({
        amount: amount.toString(),
        addInfo: addInfo,
        accountName: ACCOUNT_NAME
    });

    return `${baseUrl}/${BANK_ID}-${ACCOUNT_NO}-${TEMPLATE}.png?${params.toString()}`;
};

type Severity = 'minor' | 'moderate' | 'serious' | 'critical';

const RULE_OPTIONS = [
    { id: '1', title: 'Giờ giấc sinh hoạt' },
    { id: '2', title: 'Vệ sinh chung' },
    { id: '3', title: 'Khách thăm' },
    { id: '4', title: 'An toàn cháy nổ' },
    { id: '5', title: 'Thanh toán tiền thuê' },
];

// ===== Component =====
export default function CustomerOverview() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // API Data
    const [tenantInfo, setTenantInfo] = useState<ThongTinPhong | null>(null);
    const [latestInvoice, setLatestInvoice] = useState<HoaDonKhachThue | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    // Quick action modals
    const [showRepairModal, setShowRepairModal] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [showViolationModal, setShowViolationModal] = useState(false);
    const toast = useToast();

    // ===== Violation Form States =====
    const [violationForm, setViolationForm] = useState({
        MaPhong: 0,           // Phòng vi phạm (chọn từ dropdown)
        MaKhachThue: 0,       // Khách thuê vi phạm (chọn sau khi chọn phòng)
        building: '',         // Tên dãy trọ (hiển thị)
        ruleTitle: '',
        description: '',
        severity: 'minor' as Severity,
        reportDate: new Date().toISOString().slice(0, 10),
        reportedBy: '',
    });

    // Danh sách phòng trong cùng dãy trọ
    const [availableRooms, setAvailableRooms] = useState<Array<{
        MaPhong: number;
        TenPhong: string;
    }>>([]);

    // Danh sách khách thuê trong phòng được chọn
    const [tenantsByRoom, setTenantsByRoom] = useState<Array<{
        MaKhachThue: number;
        HoTen: string;
    }>>([]);

    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingTenants, setLoadingTenants] = useState(false);

    // ===== Repair Form States =====
    const [repairForm, setRepairForm] = useState({
        title: '',
        category: '',
        description: '',
        priority: 'Trung bình' as 'Cao' | 'Trung bình' | 'Thấp',
        scheduledDate: '',
        notes: '',
        photos: [] as File[],
    });

    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info' as 'info' | 'warning' | 'danger' | 'success',
        onConfirm: () => { },
    });

    // Fetch tenant info and latest invoice
    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                // Fetch room info (required)
                const roomRes = await customerService.getRoomInfo(controller.signal);

                if (!controller.signal.aborted) {
                    setTenantInfo(roomRes.data.data);
                }

                // Fetch latest invoice (optional - may not exist)
                try {
                    const invoiceRes = await customerService.getLatestInvoice(controller.signal);
                    if (!controller.signal.aborted) {
                        setLatestInvoice(invoiceRes.data.data);
                    }
                } catch (invoiceError: any) {
                    // Invoice not found is OK - tenant may not have invoice yet
                    if (invoiceError.response?.status !== 404) {
                        console.warn('Error fetching invoice:', getErrorMessage(invoiceError));
                    }
                }

                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    // 404 = không có phòng (empty state sẽ xử lý) - không hiển thị toast
                    if (error.response?.status === 404) {
                        setLoading(false);
                        return;
                    }

                    // Chỉ hiển thị toast cho lỗi thực sự (500, network, etc.)
                    toast.error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(error) });
                    setLoading(false);
                }
            }
        };

        fetchData();
        return () => controller.abort();
    }, [refreshKey]);

    // Load danh sách phòng khi mở modal
    useEffect(() => {
        if (!showViolationModal) return;

        const controller = new AbortController();

        const fetchRooms = async () => {
            setLoadingRooms(true);
            try {
                const response = await customerService.getRoomsInBuilding(controller.signal);
                if (!controller.signal.aborted) {
                    setAvailableRooms(response.data.data || []);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error({ title: 'Lỗi tải danh sách phòng', message: getErrorMessage(error) });
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingRooms(false);
                }
            }
        };

        // Set thông tin người báo cáo
        if (tenantInfo) {
            setViolationForm(v => ({
                ...v,
                building: tenantInfo.phongTro.dayTro.TenDay,
                reportedBy: tenantInfo.HoTen,
            }));
        }

        fetchRooms();
        return () => controller.abort();
    }, [showViolationModal, tenantInfo]);

    // Load danh sách khách thuê khi chọn phòng
    useEffect(() => {
        if (!violationForm.MaPhong) {
            setTenantsByRoom([]);
            return;
        }

        const controller = new AbortController();

        const fetchTenants = async () => {
            setLoadingTenants(true);
            try {
                const response = await customerService.getTenantsByRoom(violationForm.MaPhong, controller.signal);
                if (!controller.signal.aborted) {
                    const tenants = response.data.data || [];
                    setTenantsByRoom(tenants);

                    // Auto-select khách thuê đầu tiên (chủ phòng)
                    if (tenants.length > 0) {
                        setViolationForm(v => ({
                            ...v,
                            MaKhachThue: tenants[0].MaKhachThue
                        }));
                    }
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error({ title: 'Lỗi tải khách thuê', message: getErrorMessage(error) });
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoadingTenants(false);
                }
            }
        };

        fetchTenants();
        return () => controller.abort();
    }, [violationForm.MaPhong]);

    // Invoice month label from API data
    const invoiceMonthLabel = latestInvoice?.Thang || 'N/A';

    // Invoice items from API
    const items = latestInvoice?.chiTietHoaDon || [];

    // Totals from API
    const totals = {
        subtotal: latestInvoice?.TongTien || 0,
        previousBalance: 0,
        discounts: 0,
        lateFees: 0,
        totalDue: latestInvoice?.ConLai || 0
    };

    // Due date from API
    const dueDate = latestInvoice?.NgayHetHan ? new Date(latestInvoice.NgayHetHan) : new Date();

    // Generate VietQR URL
    const qrCodeUrl = useMemo(() => {
        if (!latestInvoice) return '';

        // Tạo nội dung chuyển khoản từ mã hóa đơn hoặc tháng
        const addInfo = latestInvoice.MaHoaDon
            ? `HD${latestInvoice.MaHoaDon}`
            : `HD-${latestInvoice.Thang}`;

        return generateVietQRUrl(totals.totalDue, addInfo);
    }, [latestInvoice, totals.totalDue]);

    // Refresh data function
    const refreshData = () => {
        setLoading(true);
        setRefreshKey(prev => prev + 1);
    };

    const handleRepairFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRepairForm((f) => ({ ...f, photos: e.target.files ? Array.from(e.target.files) : [] }));
    };

    const resetRepairForm = () => {
        setRepairForm({
            title: '',
            category: '',
            description: '',
            priority: 'Trung bình',
            scheduledDate: '',
            notes: '',
            photos: [],
        });
    };

    const doSubmitRepair = async () => {
        try {
            // Map UI values to API enum values
            const categoryMap: Record<string, 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other'> = {
                'Điện': 'electrical',
                'Hệ thống nước': 'plumbing',
                'Điện lạnh': 'appliance',
                'Nội thất': 'furniture',
                'Khác': 'other'
            };

            const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'urgent'> = {
                'Thấp': 'low',
                'Trung bình': 'medium',
                'Cao': 'high',
                'Khẩn cấp': 'urgent'
            };

            const requestData: CreateYeuCauSuaChuaRequest = {
                MaKhachThue: tenantInfo?.MaKhachThue,  // Gửi MaKhachThue từ thông tin user hiện tại
                TieuDe: repairForm.title,
                MoTa: repairForm.description,
                PhanLoai: categoryMap[repairForm.category] || 'other',
                MucDoUuTien: priorityMap[repairForm.priority] || 'medium',
                GhiChu: repairForm.notes || undefined,
                HinhAnhMinhChung: [] // TODO: Upload photos first if needed
            };

            await customerService.createMaintenanceRequest(requestData);

            setShowRepairModal(false);
            resetRepairForm();
            toast.success({ title: 'Thành công', message: 'Đã gửi yêu cầu sửa chữa!' });
            refreshData();
        } catch (error) {
            toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
    };

    const handleSubmitRepair = (e: React.FormEvent) => {
        e.preventDefault();

        if (!repairForm.title || !repairForm.category || !repairForm.description) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng điền Tiêu đề, Danh mục và Mô tả.' });
            return;
        }

        // Giống Violation: bật confirm dialog trước khi gửi
        setConfirmDialog({
            isOpen: true,
            title: 'Xác nhận gửi yêu cầu',
            message: `Gửi yêu cầu sửa chữa: "${repairForm.title}"?`,
            type: 'info',
            onConfirm: () => {
                doSubmitRepair();
                setConfirmDialog((d) => ({ ...d, isOpen: false }));
            },
        });
    };

    const submitAddViolation = async () => {
        // Validate required fields
        if (!violationForm.MaPhong || violationForm.MaPhong === 0) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Phòng vi phạm.' });
            return;
        }
        if (!violationForm.MaKhachThue || violationForm.MaKhachThue === 0) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Khách thuê vi phạm.' });
            return;
        }
        if (!violationForm.ruleTitle || !violationForm.description) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Nội quy và nhập Mô tả.' });
            return;
        }

        try {
            // Map ruleTitle to MaNoiQuy (find from RULE_OPTIONS)
            const ruleOption = RULE_OPTIONS.find(r => r.title === violationForm.ruleTitle);
            if (!ruleOption) {
                toast.error({ title: 'Lỗi', message: 'Không tìm thấy nội quy được chọn' });
                return;
            }

            // Map severity values (UI uses Vietnamese keys)
            const severityMap: Record<string, 'nhe' | 'vua' | 'nghiem_trong' | 'rat_nghiem_trong'> = {
                'minor': 'nhe',
                'moderate': 'vua',
                'serious': 'nghiem_trong',
                'critical': 'rat_nghiem_trong'
            };

            const requestData: CreateViPhamRequest = {
                MaKhachThue: violationForm.MaKhachThue,
                MaNoiQuy: parseInt(ruleOption.id),
                MoTa: violationForm.description,
                MucDo: severityMap[violationForm.severity] || 'nhe',
                NgayBaoCao: violationForm.reportDate
            };

            await customerService.createViolation(requestData);

            setShowViolationModal(false);
            // Reset form
            setViolationForm(v => ({
                ...v,
                MaPhong: 0,
                MaKhachThue: 0,
                ruleTitle: '',
                description: '',
                severity: 'minor',
                reportDate: new Date().toISOString().slice(0, 10),
            }));
            setAvailableRooms([]);
            setTenantsByRoom([]);
            toast.success({ title: 'Thành công', message: 'Đã gửi báo cáo vi phạm!' });
            refreshData();
        } catch (error) {
            toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
    };

    // ===== Render =====
    return (
        <div className="flex h-screen bg-gray-50">
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <i className="ri-loader-4-line animate-spin text-4xl text-indigo-600"></i>
                                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        </div>
                    ) : (
                    <div className="max-w-7xl mx-auto space-y-6">
                        {!tenantInfo ? (
                            /* Empty State - Chưa có phòng */
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center mb-8">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                                            <i className="ri-home-smile-line text-3xl text-blue-600"></i>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            Chưa có thông tin phòng
                                        </h3>
                                        <p className="text-gray-600">
                                            Bạn chưa được phân phòng hoặc chưa có hợp đồng thuê hiện tại.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        {/* Hướng dẫn */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <i className="ri-roadmap-line text-green-600 text-xl mr-3 mt-0.5"></i>
                                                <div>
                                                    <h4 className="font-medium text-green-900 mb-2">Các bước tiếp theo</h4>
                                                    <ol className="text-sm text-green-800 space-y-1.5 list-decimal list-inside">
                                                        <li>Liên hệ ban quản lý để xem phòng</li>
                                                        <li>Chọn phòng phù hợp với nhu cầu</li>
                                                        <li>Chuẩn bị giấy tờ và ký hợp đồng</li>
                                                        <li>Đóng tiền cọc và nhận phòng</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Thông tin liên hệ */}
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex items-start">
                                                <i className="ri-customer-service-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                                                <div>
                                                    <h4 className="font-medium text-blue-900 mb-2">Liên hệ hỗ trợ</h4>
                                                    <ul className="text-sm text-blue-800 space-y-1.5">
                                                        <li className="flex items-center">
                                                            <i className="ri-phone-line mr-2"></i>
                                                            Hotline: <strong className="ml-1">1900 xxxx</strong>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <i className="ri-mail-line mr-2"></i>
                                                            Email: <strong className="ml-1">support@phongtro.com</strong>
                                                        </li>
                                                        <li className="flex items-center">
                                                            <i className="ri-time-line mr-2"></i>
                                                            Giờ làm việc: 8:00 - 17:00 (T2-T6)
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thông tin hữu ích */}
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                        <div className="flex items-start">
                                            <i className="ri-lightbulb-line text-amber-600 text-xl mr-3 mt-0.5"></i>
                                            <div>
                                                <h4 className="font-medium text-amber-900 mb-2">Lưu ý quan trọng</h4>
                                                <ul className="text-sm text-amber-800 space-y-1">
                                                    <li>• Chuẩn bị CCCD/CMND và giấy tờ cá nhân</li>
                                                    <li>• Đọc kỹ nội quy và điều khoản hợp đồng</li>
                                                    <li>• Kiểm tra tình trạng phòng trước khi nhận</li>
                                                    <li>• Giữ liên lạc với ban quản lý qua hệ thống này</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center">
                                        <button
                                            onClick={refreshData}
                                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center"
                                        >
                                            <i className="ri-refresh-line mr-2"></i>
                                            Tải lại thông tin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang cá nhân</h1>
                            <p className="text-gray-600">Quản lý thông tin phòng trọ của bạn</p>
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
                                        <i className="ri-bill-line text-indigo-600 mr-2" />
                                        {latestInvoice ? `Hóa đơn ${invoiceMonthLabel}` : 'Hóa đơn'}
                                    </h2>
                                    {latestInvoice && (
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                {latestInvoice.TrangThai || 'Chưa thanh toán'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {latestInvoice && (
                                    <p className="text-sm text-gray-600 mt-1">
                                        Hạn thanh toán: {dueDate.toLocaleDateString('vi-VN')}
                                    </p>
                                )}
                            </div>

                            <div className="p-6">
                                {!latestInvoice ? (
                                    <div className="text-center py-12">
                                        <i className="ri-bill-line text-6xl text-gray-300"></i>
                                        <p className="mt-4 text-gray-600">Chưa có hóa đơn nào</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Hóa đơn sẽ được tạo vào đầu tháng
                                        </p>
                                    </div>
                                ) : (
                                <div>
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
                                            {items.map((item) => (
                                                <tr key={item.MaChiTiet} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-sm text-gray-900">{item.NoiDung}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">{item.SoLuong}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-700">-</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 text-right">{currency(Number(item.DonGia))}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{currency(Number(item.ThanhTien))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Invoice notes */}
                                {latestInvoice?.GhiChu && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-800">
                                            <i className="ri-information-line mr-2"></i>
                                            {latestInvoice.GhiChu}
                                        </p>
                                    </div>
                                )}

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
                                </div>
                                )}
                            </div>
                        </section>
                        </>
                        )}
                    </div>
                    )}
                </main>
            </div>

            {/* === Repair Modal === */}
            {/* === Repair Modal (giống phong cách Violation) === */}
            {showRepairModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowRepairModal(false)} />
                        <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu sửa chữa</h3>
                                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowRepairModal(false)}>
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmitRepair}>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Tiêu đề *</label>
                                        <input
                                            type="text"
                                            value={repairForm.title}
                                            onChange={(e) => setRepairForm({ ...repairForm, title: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            placeholder="VD: Máy lạnh tầng 3 kém lạnh"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Danh mục *</label>
                                        <select
                                            value={repairForm.category}
                                            onChange={(e) => setRepairForm({ ...repairForm, category: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn danh mục</option>
                                            <option value="Điện">Điện</option>
                                            <option value="Hệ thống nước">Hệ thống nước</option>
                                            <option value="Điện lạnh">Điện lạnh</option>
                                            <option value="Nội thất">Nội thất</option>
                                            <option value="Khác">Khác</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả chi tiết *</label>
                                    <textarea
                                        rows={4}
                                        value={repairForm.description}
                                        onChange={(e) => setRepairForm({ ...repairForm, description: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Trình bày rõ tình trạng, tần suất, vị trí..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Mức độ *</label>
                                        <select
                                            value={repairForm.priority}
                                            onChange={(e) =>
                                                setRepairForm({ ...repairForm, priority: e.target.value as 'Cao' | 'Trung bình' | 'Thấp' })
                                            }
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="Thấp">Thấp</option>
                                            <option value="Trung bình">Trung bình</option>
                                            <option value="Cao">Cao</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Ngày mong muốn</label>
                                        <input
                                            type="date"
                                            value={repairForm.scheduledDate}
                                            onChange={(e) => setRepairForm({ ...repairForm, scheduledDate: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Hình ảnh minh họa</label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleRepairFileChange}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Bạn có thể chọn nhiều ảnh</p>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-gray-700">Ghi chú</label>
                                        <textarea
                                            rows={2}
                                            value={repairForm.notes}
                                            onChange={(e) => setRepairForm({ ...repairForm, notes: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Thông tin bổ sung (không bắt buộc)"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
                                            onClick={() => setShowRepairModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                        >
                                            Gửi yêu cầu
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            {showPayModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black/50" onClick={() => setShowPayModal(false)} />
                        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Quét mã QR để thanh toán</h3>
                                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowPayModal(false)}>
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                Số tiền cần thanh toán:&nbsp;
                                <span className="font-semibold text-gray-900">{currency(totals.totalDue)}</span>
                            </p>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                {qrCodeUrl ? (
                                    <img
                                        src={qrCodeUrl}
                                        alt="QR thanh toán VietQR"
                                        className="w-full h-auto rounded-md"
                                        onError={(e) => {
                                            // Fallback nếu VietQR không load được
                                            (e.target as HTMLImageElement).src = '/qr-payment.png';
                                        }}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-gray-400">
                                        <div className="text-center">
                                            <i className="ri-qr-code-line text-6xl"></i>
                                            <p className="mt-2 text-sm">Chưa có hóa đơn</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <ul className="mt-4 text-xs text-gray-500 space-y-1">
                                <li>• Mở app ngân hàng bất kỳ và quét mã QR.</li>
                                <li>• Kiểm tra số tiền & nội dung chuyển khoản trước khi xác nhận.</li>
                            </ul>

                            <div className="flex gap-3 mt-5 pt-4 border-t">
                                <button
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                                    onClick={() => setShowPayModal(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                                    onClick={() => {
                                        setShowPayModal(false);
                                        toast.success({
                                            title: 'Đã ghi nhận!',
                                            message: 'Vui lòng chờ BQL xác nhận giao dịch.'
                                        });
                                    }}
                                >
                                    Đã chuyển khoản
                                </button>
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
                        <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo vi phạm</h2>

                            {loadingRooms ? (
                                <div className="text-center p-8">Đang tải danh sách phòng...</div>
                            ) : (
                            <form
                                className="space-y-4"
                                onSubmit={(e) => { e.preventDefault(); submitAddViolation(); }}
                            >
                                {/* Chọn phòng và khách thuê */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Dropdown chọn phòng vi phạm */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phòng vi phạm *
                                        </label>
                                        <select
                                            value={violationForm.MaPhong}
                                            onChange={(e) => {
                                                const maPhong = Number(e.target.value);
                                                setViolationForm(v => ({
                                                    ...v,
                                                    MaPhong: maPhong,
                                                    MaKhachThue: 0  // Reset khách thuê khi đổi phòng
                                                }));
                                            }}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value={0}>Chọn phòng</option>
                                            {availableRooms.map((room) => (
                                                <option key={room.MaPhong} value={room.MaPhong}>
                                                    {room.TenPhong}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Dropdown chọn khách thuê */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Khách thuê vi phạm *
                                        </label>
                                        <select
                                            value={violationForm.MaKhachThue}
                                            onChange={(e) => setViolationForm(v => ({ ...v, MaKhachThue: Number(e.target.value) }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            disabled={!violationForm.MaPhong || loadingTenants}
                                            required
                                        >
                                            <option value={0}>
                                                {!violationForm.MaPhong ? 'Chọn phòng trước' : loadingTenants ? 'Đang tải...' : 'Chọn khách thuê'}
                                            </option>
                                            {tenantsByRoom.map((tenant) => (
                                                <option key={tenant.MaKhachThue} value={tenant.MaKhachThue}>
                                                    {tenant.HoTen}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Nội quy vi phạm */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy vi phạm *</label>
                                        <select
                                            value={violationForm.ruleTitle}
                                            onChange={e => setViolationForm(v => ({ ...v, ruleTitle: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn nội quy</option>
                                            {RULE_OPTIONS.map((r) => <option key={r.id} value={r.title}>{r.title}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* Tùy chọn: mức độ & ngày */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                                        <select
                                            value={violationForm.severity}
                                            onChange={e => setViolationForm(v => ({ ...v, severity: e.target.value as Severity }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                                        >
                                            <option value="minor">Nhẹ</option>
                                            <option value="moderate">Vừa</option>
                                            <option value="serious">Nghiêm trọng</option>
                                            <option value="critical">Rất nghiêm trọng</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vi phạm</label>
                                        <input
                                            type="date"
                                            value={violationForm.reportDate}
                                            onChange={e => setViolationForm(v => ({ ...v, reportDate: e.target.value }))}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Mô tả bắt buộc */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả vi phạm *</label>
                                    <textarea
                                        value={violationForm.description}
                                        onChange={e => setViolationForm(v => ({ ...v, description: e.target.value }))}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Mô tả chi tiết hành vi vi phạm..."
                                        required
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowViolationModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                                    >
                                        Gửi báo cáo
                                    </button>
                                </div>
                            </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* === Confirm Dialog === */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-[60] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setConfirmDialog(d => ({ ...d, isOpen: false }))} />
                        <div className="relative bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmDialog.title}</h3>
                            <p className="text-sm text-gray-600 mb-6">{confirmDialog.message}</p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmDialog(d => ({ ...d, isOpen: false }))}
                                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDialog.onConfirm}
                                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
