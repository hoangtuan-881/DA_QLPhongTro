import { useState, useEffect } from 'react';
import customerService, {
    type ViPhamKhachThue,
    type CreateViPhamRequest
} from '../../../services/customer.service';
import { getErrorMessage } from '../../../lib/http-client';
import { useToast } from '../../../hooks/useToast';

type Severity = 'minor' | 'moderate' | 'serious' | 'critical';

// Danh sách nội quy hardcoded (giống CustomerOverview)
const RULE_OPTIONS = [
    { id: '1', title: 'Giờ giấc sinh hoạt', description: 'Không gây tiếng ồn sau 22:00 và trước 6:00 hàng ngày.' },
    { id: '2', title: 'Vệ sinh chung', description: 'Giữ gìn vệ sinh khu vực chung, không vứt rác bừa bãi.' },
    { id: '3', title: 'Khách thăm', description: 'Khách thăm phải đăng ký và không được ở qua đêm.' },
    { id: '4', title: 'An toàn cháy nổ', description: 'Không nấu ăn trong phòng, không sử dụng thiết bị dễ cháy nổ.' },
    { id: '5', title: 'Thanh toán tiền thuê', description: 'Thanh toán tiền thuê đúng hạn vào đầu tháng.' },
];

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'minor':
        case 'nhe': return 'bg-green-100 text-green-800';
        case 'moderate':
        case 'vua': return 'bg-yellow-100 text-yellow-800';
        case 'serious':
        case 'nghiem_trong': return 'bg-orange-100 text-orange-800';
        case 'critical':
        case 'rat_nghiem_trong': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getSeverityText = (severity: string) => {
    switch (severity) {
        case 'minor':
        case 'nhe': return 'Nhẹ';
        case 'moderate':
        case 'vua': return 'Vừa';
        case 'serious':
        case 'nghiem_trong': return 'Nghiêm trọng';
        case 'critical':
        case 'rat_nghiem_trong': return 'Rất nghiêm trọng';
        default: return severity;
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'reported':
        case 'da_bao_cao': return 'bg-yellow-100 text-yellow-800';
        case 'warned':
        case 'da_canh_cao': return 'bg-blue-100 text-blue-800';
        case 'resolved':
        case 'da_giai_quyet': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'reported':
        case 'da_bao_cao': return 'Đã báo cáo';
        case 'warned':
        case 'da_canh_cao': return 'Đã cảnh báo';
        case 'resolved':
        case 'da_giai_quyet': return 'Đã giải quyết';
        default: return status;
    }
};

export default function CustomerViolationReport() {
    const toast = useToast();

    // Data states
    const [violations, setViolations] = useState<ViPhamKhachThue[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Array<{ MaPhong: number; TenPhong: string }>>([]);
    const [tenantsByRoom, setTenantsByRoom] = useState<Array<{ MaKhachThue: number; HoTen: string }>>([]);

    // Loading states
    const [loadingViolations, setLoadingViolations] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [loadingTenants, setLoadingTenants] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modal state
    const [showReportModal, setShowReportModal] = useState(false);

    // Form inputs
    const [selectedPhong, setSelectedPhong] = useState<number>(0);
    const [selectedKhachThue, setSelectedKhachThue] = useState<number>(0);
    const [selectedRuleTitle, setSelectedRuleTitle] = useState('');
    const [moTa, setMoTa] = useState('');
    const [mucDo, setMucDo] = useState<Severity>('minor');

    // Refresh key
    const [refreshKey, setRefreshKey] = useState(0);

    // Fetch violations
    useEffect(() => {
        const controller = new AbortController();

        const fetchViolations = async () => {
            try {
                const response = await customerService.getViolations(controller.signal);
                if (!controller.signal.aborted) {
                    setViolations(response.data.data || []);
                    setLoadingViolations(false);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error({ title: 'Lỗi tải dữ liệu vi phạm', message: getErrorMessage(error) });
                    setLoadingViolations(false);
                }
            }
        };

        fetchViolations();
        return () => controller.abort();
    }, [refreshKey]);

    // Fetch phòng trong dãy khi mở modal
    useEffect(() => {
        if (!showReportModal) return;

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

        fetchRooms();
        return () => controller.abort();
    }, [showReportModal]);

    // Fetch khách thuê khi chọn phòng
    useEffect(() => {
        if (!selectedPhong) {
            setTenantsByRoom([]);
            setSelectedKhachThue(0);
            return;
        }

        const controller = new AbortController();

        const fetchTenants = async () => {
            setLoadingTenants(true);
            try {
                const response = await customerService.getTenantsByRoom(selectedPhong, controller.signal);
                if (!controller.signal.aborted) {
                    const tenants = response.data.data || [];
                    setTenantsByRoom(tenants);

                    // Auto-select khách thuê đầu tiên
                    if (tenants.length > 0) {
                        setSelectedKhachThue(tenants[0].MaKhachThue);
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
    }, [selectedPhong]);

    const submitAddViolation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validate inputs
        if (!selectedPhong || selectedPhong === 0) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Phòng vi phạm.' });
            return;
        }
        if (!selectedKhachThue || selectedKhachThue === 0) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Khách thuê vi phạm.' });
            return;
        }
        if (!selectedRuleTitle || !moTa) {
            toast.warning({ title: 'Cảnh báo', message: 'Vui lòng chọn Nội quy và nhập Mô tả.' });
            return;
        }

        try {
            // Map ruleTitle to MaNoiQuy
            const ruleOption = RULE_OPTIONS.find(r => r.title === selectedRuleTitle);
            if (!ruleOption) {
                toast.error({ title: 'Lỗi', message: 'Không tìm thấy nội quy được chọn' });
                return;
            }

            // Map severity values
            const severityMap: Record<Severity, 'nhe' | 'vua' | 'nghiem_trong' | 'rat_nghiem_trong'> = {
                'minor': 'nhe',
                'moderate': 'vua',
                'serious': 'nghiem_trong',
                'critical': 'rat_nghiem_trong'
            };

            const requestData: CreateViPhamRequest = {
                MaKhachThue: selectedKhachThue,
                MaNoiQuy: parseInt(ruleOption.id),
                MoTa: moTa,
                MucDo: severityMap[mucDo],
                NgayBaoCao: new Date().toISOString().slice(0, 10)
            };

            setSubmitting(true);
            await customerService.createViolation(requestData);

            toast.success({ title: 'Thành công', message: 'Đã gửi báo cáo vi phạm!' });
            setShowReportModal(false);

            // Reset form
            setSelectedPhong(0);
            setSelectedKhachThue(0);
            setSelectedRuleTitle('');
            setMoTa('');
            setMucDo('minor');
            setAvailableRooms([]);
            setTenantsByRoom([]);

            // Refresh violations list
            setLoadingViolations(true);
            setRefreshKey(prev => prev + 1);
        } catch (error) {
            toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Vi phạm nội quy</h1>
                    <p className="text-gray-600">Lịch sử vi phạm và báo cáo mới</p>
                </div>

                {/* Lịch sử vi phạm */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="ri-history-line text-indigo-600 mr-2"></i>
                            Lịch sử vi phạm của bạn
                        </h3>
                        <button
                            onClick={() => setShowReportModal(true)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center"
                        >
                            <i className="ri-add-line mr-1"></i>
                            Báo cáo mới
                        </button>
                    </div>

    {loadingViolations ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : violations.length === 0 ? (
                        <p className="text-gray-600">Bạn không có vi phạm nào. Hãy tiếp tục phát huy!</p>
                    ) : (
                        <div className="space-y-4">
                            {violations.map((v) => (
                                <div key={v.MaViPham} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{v.noiQuy?.TieuDe || 'N/A'}</h4>
                                            <p className="text-sm text-gray-600">{v.MoTa}</p>
                                            {v.khachThue && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Phòng: {v.khachThue.phongTro.TenPhong} - {v.khachThue.HoTen}
                                                </p>
                                            )}
                                        </div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(v.TrangThai)}`}>
                                            {getStatusText(v.TrangThai)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-sm">
                                        <div>
                                            <span className="text-gray-500">Mức độ: </span>
                                            <span className={`font-medium ${getSeverityColor(v.MucDo).split(' ')[1]}`}>
                                                {getSeverityText(v.MucDo)}
                                            </span>
                                        </div>
                                        <span className="text-gray-500">Ngày báo cáo: {new Date(v.NgayBaoCao).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    {v.GhiChu && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-sm text-gray-600"><span className="font-medium">Ghi chú từ BQL:</span> {v.GhiChu}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Nội quy chung */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <i className="ri-file-list-3-line text-indigo-600 mr-2"></i>
                        Nội quy chung của khu trọ
                    </h3>
                    <ul className="list-decimal list-inside text-gray-700 space-y-2">
                        {RULE_OPTIONS.map((rule) => (
                            <li key={rule.id}>
                                <span className="font-medium text-gray-800">{rule.title}:</span> {rule.description}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Modal – style giống Overview */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div
                            className="fixed inset-0 bg-black/50"
                            onClick={() => setShowReportModal(false)}
                        />

                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="violation-modal-title"
                            className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 id="violation-modal-title" className="text-xl font-bold text-gray-900">
                                    Báo cáo vi phạm
                                </h2>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                    aria-label="Đóng"
                                    title="Đóng"
                                >
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            {loadingRooms ? (
                                <div className="text-center p-8">Đang tải danh sách phòng...</div>
                            ) : (
                            <form onSubmit={submitAddViolation} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Phòng vi phạm */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phòng vi phạm *</label>
                                        <select
                                            value={selectedPhong}
                                            onChange={(e) => {
                                                const maPhong = Number(e.target.value);
                                                setSelectedPhong(maPhong);
                                                setSelectedKhachThue(0); // Reset khách thuê khi đổi phòng
                                            }}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value={0}>Chọn phòng</option>
                                            {availableRooms.map(room => (
                                                <option key={room.MaPhong} value={room.MaPhong}>
                                                    {room.TenPhong}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Khách thuê vi phạm */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê vi phạm *</label>
                                        <select
                                            value={selectedKhachThue}
                                            onChange={(e) => setSelectedKhachThue(Number(e.target.value))}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            disabled={!selectedPhong || loadingTenants}
                                            required
                                        >
                                            <option value={0}>
                                                {!selectedPhong ? 'Chọn phòng trước' : loadingTenants ? 'Đang tải...' : 'Chọn khách thuê'}
                                            </option>
                                            {tenantsByRoom.map(tenant => (
                                                <option key={tenant.MaKhachThue} value={tenant.MaKhachThue}>
                                                    {tenant.HoTen}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Nội quy vi phạm */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy bị vi phạm *</label>
                                        <select
                                            value={selectedRuleTitle}
                                            onChange={(e) => setSelectedRuleTitle(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn nội quy</option>
                                            {RULE_OPTIONS.map(rule => (
                                                <option key={rule.id} value={rule.title}>{rule.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mức độ */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ</label>
                                        <select
                                            value={mucDo}
                                            onChange={(e) => setMucDo(e.target.value as Severity)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="minor">Nhẹ</option>
                                            <option value="moderate">Vừa</option>
                                            <option value="serious">Nghiêm trọng</option>
                                            <option value="critical">Rất nghiêm trọng</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                                    <textarea
                                        value={moTa}
                                        onChange={(e) => setMoTa(e.target.value)}
                                        rows={4}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Mô tả rõ hành vi, thời gian, mức độ ảnh hưởng..."
                                        required
                                    />
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowReportModal(false)}
                                            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200"
                                            disabled={submitting}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
