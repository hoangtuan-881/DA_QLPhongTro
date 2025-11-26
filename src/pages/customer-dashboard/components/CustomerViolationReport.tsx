import { useState, useEffect } from 'react';

const mockRules = [
    { id: '1', title: 'Giờ giấc sinh hoạt', description: 'Không gây tiếng ồn sau 22:00 và trước 6:00 hàng ngày.' },
    { id: '2', title: 'Vệ sinh chung', description: 'Giữ gìn vệ sinh khu vực chung, không vứt rác bừa bãi.' },
    { id: '3', title: 'Khách thăm', description: 'Khách thăm phải đăng ký và không được ở qua đêm.' },
    { id: '4', title: 'An toàn cháy nổ', description: 'Không nấu ăn trong phòng, không sử dụng thiết bị dễ cháy nổ.' },
    { id: '5', title: 'Khác', description: 'Các vấn đề khác không thuộc danh mục trên.' },
];

const mockViolations = [
    {
        id: 'v1',
        ruleTitle: 'Giờ giấc sinh hoạt',
        description: 'Mở nhạc to sau 23:00, ảnh hưởng đến phòng bên cạnh.',
        severity: 'moderate',
        status: 'warned',
        reportDate: '2024-03-15',
        notes: 'Đã nhắc nhở, khách thuê cam kết không tái phạm.'
    },
    {
        id: 'v2',
        ruleTitle: 'Vệ sinh chung',
        description: 'Để rác ngoài hành lang 2 ngày.',
        severity: 'minor',
        status: 'resolved',
        reportDate: '2024-02-10',
        resolvedDate: '2024-02-11'
    },
];

type Severity = 'minor' | 'moderate' | 'serious' | 'critical';

const CURRENT_TENANT = {
    tenantName: 'Nguyễn Văn A',
    room: 'A101',
    building: 'Dãy A',
};

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'minor': return 'bg-green-100 text-green-800';
        case 'moderate': return 'bg-yellow-100 text-yellow-800';
        case 'serious': return 'bg-orange-100 text-orange-800';
        case 'critical': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
const getSeverityText = (severity: string) => {
    switch (severity) {
        case 'minor': return 'Nhẹ';
        case 'moderate': return 'Vừa';
        case 'serious': return 'Nghiêm trọng';
        case 'critical': return 'Rất nghiêm trọng';
        default: return severity;
    }
};
const getStatusColor = (status: string) => {
    switch (status) {
        case 'reported': return 'bg-yellow-100 text-yellow-800';
        case 'warned': return 'bg-blue-100 text-blue-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};
const getStatusText = (status: string) => {
    switch (status) {
        case 'reported': return 'Chờ xử lý';
        case 'warned': return 'Đã cảnh báo';
        case 'resolved': return 'Đã giải quyết';
        default: return status;
    }
};

export default function CustomerViolationReport() {
    const [violations] = useState(mockViolations);
    const [rules] = useState(mockRules);

    // Modal state
    const [showReportModal, setShowReportModal] = useState(false);

    // Form “giống Overview – phía khách”
    const [reportedRoom, setReportedRoom] = useState('');
    const [ruleId, setRuleId] = useState('');
    const [description, setDescription] = useState('');
    const [incidentTime, setIncidentTime] = useState('');

    // Form “gửi lên” (tự prefill thông tin khách)
    const [violationForm, setViolationForm] = useState({
        tenantName: '',
        room: '',
        building: '',
        ruleTitle: '',
        severity: 'minor' as Severity,
        reportDate: new Date().toISOString().slice(0, 10),
        description: '',
    });

    useEffect(() => {
        setViolationForm(v => ({
            ...v,
            tenantName: CURRENT_TENANT.tenantName,
            room: CURRENT_TENANT.room,
            building: CURRENT_TENANT.building,
        }));
    }, []);

    const submitAddViolation = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // sync rule + description từ các input ở modal
        const pickedRuleTitle = rules.find(r => r.id === ruleId)?.title || '';
        const mergedForm = {
            ...violationForm,
            ruleTitle: pickedRuleTitle,
            description,
            // incidentTime có thể gửi kèm nếu backend nhận
            incidentTime,
            // reportedRoom là phòng bị bạn report (khác phòng bạn)
            reportedRoom,
        };

        if (!mergedForm.ruleTitle || !mergedForm.description || !reportedRoom) {
            alert('Vui lòng nhập: Phòng bị báo cáo, Nội quy và Mô tả.');
            return;
        }

        const ok = confirm(`Xác nhận gửi báo cáo vi phạm cho phòng ${reportedRoom}?`);
        if (!ok) return;

        // TODO: gọi API thật
        // await api.createCustomerViolation(mergedForm);

        setShowReportModal(false); // ✅ đúng state
        alert('Đã gửi báo cáo vi phạm!');

        // reset input người dùng (giữ info khách)
        setRuleId('');
        setDescription('');
        setIncidentTime('');
        setReportedRoom('');
        setViolationForm(v => ({
            ...v,
            ruleTitle: '',
            severity: 'minor',
            reportDate: new Date().toISOString().slice(0, 10),
            description: '',
        }));
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

                    {violations.length === 0 ? (
                        <p className="text-gray-600">Bạn không có vi phạm nào. Hãy tiếp tục phát huy!</p>
                    ) : (
                        <div className="space-y-4">
                            {violations.map((v) => (
                                <div key={v.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">{v.ruleTitle}</h4>
                                            <p className="text-sm text-gray-600">{v.description}</p>
                                        </div>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(v.status)}`}>
                                            {getStatusText(v.status)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end text-sm">
                                        <div>
                                            <span className="text-gray-500">Mức độ: </span>
                                            <span className={`font-medium ${getSeverityColor(v.severity).split(' ')[1]}`}>
                                                {getSeverityText(v.severity)}
                                            </span>
                                        </div>
                                        <span className="text-gray-500">Ngày báo cáo: {v.reportDate}</span>
                                    </div>
                                    {v.notes && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-sm text-gray-600"><span className="font-medium">Ghi chú từ BQL:</span> {v.notes}</p>
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
                        {rules.map((rule) => (
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

                            <form onSubmit={submitAddViolation} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Thông tin KHÁCH – hiển thị chỉ đọc */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={violationForm.tenantName}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={violationForm.room}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dãy trọ</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={violationForm.building}
                                            className="w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-700 px-3 py-2"
                                        />
                                    </div>

                                    {/* Phòng bị báo cáo – khách nhập */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phòng bị báo cáo *</label>
                                        <input
                                            type="text"
                                            value={reportedRoom}
                                            onChange={(e) => setReportedRoom(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            placeholder="VD: A102 (phòng vi phạm)"
                                            required
                                        />
                                    </div>

                                    {/* Nội quy vi phạm – khách chọn */}
                                    <div className="col-span-2 sm:col-span-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy bị vi phạm *</label>
                                        <select
                                            value={ruleId}
                                            onChange={(e) => setRuleId(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Chọn nội quy</option>
                                            {rules.map(rule => (
                                                <option key={rule.id} value={rule.id}>{rule.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Thời gian */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian xảy ra (nếu có)</label>
                                    <input
                                        type="datetime-local"
                                        value={incidentTime}
                                        onChange={(e) => setIncidentTime(e.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Mô tả */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
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
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                        >
                                            Gửi báo cáo
                                        </button>
                                    </div>
                                </div>
                            </form>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
