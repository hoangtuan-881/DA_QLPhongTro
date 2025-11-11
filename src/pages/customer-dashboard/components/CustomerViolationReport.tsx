// Tên file: src/pages/customer-dashboard/components/CustomerViolationReport.tsx
import { useState } from 'react';

// --- Dữ liệu mẫu ---

// 1. Các nội quy chung (ví dụ)
const mockRules = [
    { id: '1', title: 'Giờ giấc sinh hoạt', description: 'Không gây tiếng ồn sau 22:00 và trước 6:00 hàng ngày.' },
    { id: '2', title: 'Vệ sinh chung', description: 'Giữ gìn vệ sinh khu vực chung, không vứt rác bừa bãi.' },
    { id: '3', title: 'Khách thăm', description: 'Khách thăm phải đăng ký và không được ở qua đêm.' },
    { id: '4', title: 'An toàn cháy nổ', description: 'Không nấu ăn trong phòng, không sử dụng thiết bị dễ cháy nổ.' },
    { id: '5', title: 'Khác', description: 'Các vấn đề khác không thuộc danh mục trên.' }, // Thêm mô tả cho mục "Khác"
];

// 2. Lịch sử vi phạm của khách thuê này
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

// --- Các hàm helper (tương tự trang admin) ---
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


// --- Component ---
export default function CustomerViolationReport() {
    const [violations] = useState(mockViolations);
    const [rules] = useState(mockRules);

    // --- STATE VÀ LOGIC CHO MODAL (ĐÃ DI CHUYỂN VÀO ĐÂY) ---
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportedRoom, setReportedRoom] = useState('');
    const [ruleId, setRuleId] = useState('');
    const [description, setDescription] = useState('');
    const [incidentTime, setIncidentTime] = useState('');

    const resetForm = () => {
        setReportedRoom('');
        setRuleId('');
        setDescription('');
        setIncidentTime('');
    };

    const handleSubmitReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportedRoom || !ruleId || !description) {
            alert('Vui lòng điền đủ thông tin: Phòng, Nội quy và Mô tả.');
            return;
        }

        const reportData = {
            reportedRoom,
            ruleTitle: rules.find(r => r.id === ruleId)?.title,
            description,
            incidentTime,
        };

        console.log('Gửi báo cáo:', reportData);
        // (Trong ứng dụng thật, bạn sẽ gọi API ở đây)

        // Đóng modal và hiển thị thông báo (demo)
        setShowReportModal(false);
        alert(`Đã gửi báo cáo cho phòng ${reportData.reportedRoom} về hành vi "${reportData.ruleTitle}".`);
        resetForm();
    };
    // --- KẾT THÚC LOGIC MODAL ---


    return (
        <>
            <div className="space-y-6">
                {/* 1. Lịch sử vi phạm */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <i className="ri-history-line text-indigo-600 mr-2"></i>
                            Lịch sử vi phạm của bạn
                        </h3>
                        {/* Cập nhật onClick */}
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

                {/* 2. Danh sách nội quy chung */}
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

            {/* --- JSX CỦA MODAL (ĐÃ DI CHUYỂN VÀO ĐÂY) --- */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={() => setShowReportModal(false)}
                        ></div>

                        {/* Nội dung Modal */}
                        <div className="relative bg-white rounded-lg max-w-lg w-full p-6 z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Báo cáo vi phạm</h2>
                                <button
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <i className="ri-close-line text-xl"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitReport} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phòng bị báo cáo *
                                    </label>
                                    <input
                                        type="text"
                                        value={reportedRoom}
                                        onChange={(e) => setReportedRoom(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="VD: A102 (Phòng bạn nghe thấy ồn ào)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nội quy bị vi phạm *
                                    </label>
                                    <select
                                        value={ruleId}
                                        onChange={(e) => setRuleId(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                                    >
                                        <option value="">Chọn nội quy</option>
                                        {rules.map(rule => (
                                            <option key={rule.id} value={rule.id}>{rule.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Thời gian xảy ra (Nếu có)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={incidentTime}
                                        onChange={(e) => setIncidentTime(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả chi tiết *
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Mô tả rõ hành vi, thời gian, và mức độ ảnh hưởng..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowReportModal(false)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                                    >
                                        Gửi báo cáo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
            {/* --- KẾT THÚC JSX MODAL --- */}
        </>
    );
}