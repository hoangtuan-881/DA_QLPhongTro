import { useEffect, useState, FormEvent } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/pages/dashboard/components/Sidebar';
import Header from '@/pages/dashboard/components/Header';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';

// TODO: thay bằng service thật nếu bạn đã có
// import nhanVienService, { NhanVien } from '@/services/nhan-vien.service';

interface NhanVien {
    MaNhanVien: number;
    HoTen: string;
    ChucVu: 'Chủ trọ' | 'Quản lý' | 'Nhân viên';
    SoDienThoai: string;
    Email: string;
    TrangThai: 'DANG_LAM' | 'NGHI_VIEC';
    NgayVaoLam: string;
}

interface EmployeeFormState {
    HoTen: string;
    ChucVu: 'Chủ trọ' | 'Quản lý' | 'Nhân viên';
    SoDienThoai: string;
    Email: string;
    TrangThai: 'DANG_LAM' | 'NGHI_VIEC';
    NgayVaoLam: string;
}

export default function EmployeeManagementPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<NhanVien[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] =
        useState<'ALL' | 'DANG_LAM' | 'NGHI_VIEC'>('ALL');

    // modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<NhanVien | null>(null);
    const [formData, setFormData] = useState<EmployeeFormState>({
        HoTen: '',
        ChucVu: 'Nhân viên',
        SoDienThoai: '',
        Email: '',
        TrangThai: 'DANG_LAM',
        NgayVaoLam: '',
    });


    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingEmployee, setDeletingEmployee] = useState<NhanVien | null>(
        null
    );
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailEmployee, setDetailEmployee] = useState<NhanVien | null>(null);
    const toast = useToast();

    useDocumentTitle('Quản lý nhân viên');

    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchEmployees = async () => {
            try {
                setLoading(true);

                // TODO: gọi API thật
                // const res = await nhanVienService.getAll(controller.signal);
                // setEmployees(res.data.data || []);

                // Dữ liệu mẫu (mock)
                const fakeData: NhanVien[] = [
                    {
                        MaNhanVien: 1,
                        HoTen: 'Nguyễn Văn A',
                        ChucVu: 'Quản lý',
                        SoDienThoai: '0901234567',
                        Email: 'a.nguyen@example.com',
                        TrangThai: 'DANG_LAM',
                        NgayVaoLam: '2023-01-10',
                    },
                    {
                        MaNhanVien: 2,
                        HoTen: 'Trần Thị B',
                        ChucVu: 'Nhân viên', // đổi từ "Lễ tân" -> "Nhân viên"
                        SoDienThoai: '0907654321',
                        Email: 'b.tran@example.com',
                        TrangThai: 'NGHI_VIEC',
                        NgayVaoLam: '2022-06-05',
                    },
                ];


                setEmployees(fakeData);
                setLoading(false);
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error({
                        title: 'Lỗi tải danh sách nhân viên',
                        message: error.message || 'Đã xảy ra lỗi, vui lòng thử lại.',
                    });
                    setLoading(false);
                }
            }
        };

        fetchEmployees();

        return () => controller.abort();
    }, []);

    const filteredEmployees = employees.filter((nv) => {
        const matchSearch =
            nv.HoTen.toLowerCase().includes(search.toLowerCase()) ||
            nv.SoDienThoai.includes(search) ||
            nv.Email.toLowerCase().includes(search.toLowerCase());

        const matchStatus =
            statusFilter === 'ALL' ? true : nv.TrangThai === statusFilter;

        return matchSearch && matchStatus;
    });

    const getStatusLabel = (status: NhanVien['TrangThai']) => {
        if (status === 'DANG_LAM') return 'Đang làm';
        return 'Nghỉ việc';
    };

    const getStatusClass = (status: NhanVien['TrangThai']) => {
        if (status === 'DANG_LAM') {
            return 'bg-green-100 text-green-700';
        }
        return 'bg-red-100 text-red-700';
    };
    const openDetailModal = (nv: NhanVien) => {
        setDetailEmployee(nv);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setDetailEmployee(null);
    };
    // ====== HANDLERS - MODAL FORM ======

    const openAddModal = () => {
        setEditingEmployee(null);
        setFormData({
            HoTen: '',
            ChucVu: 'Nhân viên',         // 👈 mặc định
            SoDienThoai: '',
            Email: '',
            TrangThai: 'DANG_LAM',
            NgayVaoLam: getToday(),
        });
        setIsFormOpen(true);
    };

    const openEditModal = (nv: NhanVien) => {
        setEditingEmployee(nv);
        setFormData({
            HoTen: nv.HoTen,
            ChucVu: nv.ChucVu,
            SoDienThoai: nv.SoDienThoai,
            Email: nv.Email,
            TrangThai: nv.TrangThai,
            NgayVaoLam: nv.NgayVaoLam,
        });
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingEmployee(null);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!formData.HoTen.trim()) {
            toast.error({
                title: 'Thông tin chưa hợp lệ',
                message: 'Họ tên không được để trống.',
            });
            return;
        }

        if (!formData.SoDienThoai.trim()) {
            toast.error({
                title: 'Thông tin chưa hợp lệ',
                message: 'Số điện thoại không được để trống.',
            });
            return;
        }

        if (!formData.Email.trim()) {
            toast.error({
                title: 'Thông tin chưa hợp lệ',
                message: 'Email không được để trống.',
            });
            return;
        }

        if (editingEmployee) {
            // Cập nhật
            const updated: NhanVien = {
                ...editingEmployee,
                ...formData,
                TrangThai:
                    formData.TrangThai === 'NGHI_VIEC' ? 'NGHI_VIEC' : 'DANG_LAM',
            };

            setEmployees((prev) =>
                prev.map((e) =>
                    e.MaNhanVien === editingEmployee.MaNhanVien ? updated : e
                )
            );

            toast.success({
                title: 'Cập nhật thành công',
                message: `Đã cập nhật: ${formData.HoTen}`,
            });
        } else {
            // Thêm mới
            const maxId =
                employees.length > 0
                    ? Math.max(...employees.map((e) => e.MaNhanVien))
                    : 0;

            const newEmployee: NhanVien = {
                MaNhanVien: maxId + 1,
                HoTen: formData.HoTen,
                ChucVu: formData.ChucVu,        // 👈 giờ đã là union chuẩn
                SoDienThoai: formData.SoDienThoai,
                Email: formData.Email,
                TrangThai:
                    formData.TrangThai === 'NGHI_VIEC' ? 'NGHI_VIEC' : 'DANG_LAM',
                NgayVaoLam: formData.NgayVaoLam || getToday(),
            };


            setEmployees((prev) => [...prev, newEmployee]);

            toast.success({
                title: 'Thêm nhân viên thành công',
                message: `Đã thêm: ${formData.HoTen}`,
            });
        }

        closeFormModal();
    };

    // ====== HANDLERS - DELETE MODAL ======

    const openDeleteModal = (nv: NhanVien) => {
        setDeletingEmployee(nv);
        setIsDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteOpen(false);
        setDeletingEmployee(null);
    };

    const confirmDelete = () => {
        if (!deletingEmployee) return;

        setEmployees((prev) =>
            prev.filter((e) => e.MaNhanVien !== deletingEmployee.MaNhanVien)
        );

        toast.success({
            title: 'Xóa nhân viên thành công',
            message: `Đã xóa: ${deletingEmployee.HoTen}`,
        });

        closeDeleteModal();
    };

    return (
        <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header onMenuClick={() => setSidebarOpen(true)} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Tiêu đề trang */}
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Quản lý nhân viên
                                    </h1>
                                    <p className="text-gray-600">
                                        Quản lý danh sách nhân viên nội bộ, phân quyền và trạng thái
                                        làm việc.
                                    </p>
                                </div>

                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                                >
                                    <i className="ri-user-add-line mr-2 text-lg" />
                                    Thêm nhân viên
                                </button>
                            </div>

                            {/* Bộ lọc */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="relative w-full md:w-1/2">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <i className="ri-search-line text-gray-400" />
                                        </span>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Tìm theo tên, số điện thoại, email..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Trạng thái:</span>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) =>
                                                setStatusFilter(e.target.value as any)
                                            }
                                            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="ALL">Tất cả</option>
                                            <option value="DANG_LAM">Đang làm</option>
                                            <option value="NGHI_VIEC">Nghỉ việc</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Bảng nhân viên */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="flex justify-center items-center h-48">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                    </div>
                                ) : filteredEmployees.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Không tìm thấy nhân viên nào.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Mã NV
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Họ tên
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Chức vụ
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Số điện thoại
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ngày vào làm
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Trạng thái
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Thao tác
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                                {filteredEmployees.map((nv) => (
                                                    <tr
                                                        key={nv.MaNhanVien}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.MaNhanVien}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                                                            {nv.HoTen}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.ChucVu}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.SoDienThoai}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.Email}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.NgayVaoLam}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span
                                                                className={
                                                                    'inline-flex px-2 py-1 rounded-full text-xs font-medium ' +
                                                                    getStatusClass(nv.TrangThai)
                                                                }
                                                            >
                                                                {getStatusLabel(nv.TrangThai)}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                                                            {/* Xem chi tiết */}
                                                            <button
                                                                onClick={() => openDetailModal(nv)}
                                                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                title="Xem chi tiết"
                                                            >
                                                                <i className="ri-eye-line" />
                                                            </button>

                                                            {/* Sửa */}
                                                            <button
                                                                onClick={() => openEditModal(nv)}
                                                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                                title="Sửa"
                                                            >
                                                                <i className="ri-edit-line" />
                                                            </button>

                                                            {/* Xóa */}
                                                            <button
                                                                onClick={() => openDeleteModal(nv)}
                                                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                                                                title="Xóa"
                                                            >
                                                                <i className="ri-delete-bin-line" />
                                                            </button>
                                                        </td>

                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>
                </div>

                {/* ===== MODAL FORM THÊM / SỬA ===== */}
                {isFormOpen && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingEmployee ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                                </h2>
                                <button
                                    onClick={closeFormModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="px-6 py-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        name="HoTen"
                                        value={formData.HoTen}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="Nhập họ tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Chức vụ
                                    </label>
                                    <select
                                        name="ChucVu"
                                        value={formData.ChucVu}
                                        onChange={handleFormChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="Chủ trọ">Chủ trọ</option>
                                        <option value="Quản lý">Quản lý</option>
                                        <option value="Nhân viên">Nhân viên</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Số điện thoại <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="SoDienThoai"
                                            value={formData.SoDienThoai}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            name="Email"
                                            type="email"
                                            value={formData.Email}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="example@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ngày vào làm
                                        </label>
                                        <input
                                            name="NgayVaoLam"
                                            type="date"
                                            value={formData.NgayVaoLam}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Trạng thái
                                        </label>
                                        <select
                                            name="TrangThai"
                                            value={formData.TrangThai}
                                            onChange={handleFormChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="DANG_LAM">Đang làm</option>
                                            <option value="NGHI_VIEC">Nghỉ việc</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeFormModal}
                                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                                    >
                                        {editingEmployee ? 'Lưu thay đổi' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ===== MODAL XÁC NHẬN XÓA ===== */}
                {isDeleteOpen && deletingEmployee && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Xóa nhân viên
                                </h2>
                                <button
                                    onClick={closeDeleteModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-2">
                                <p className="text-sm text-gray-700">
                                    Bạn có chắc chắn muốn xóa nhân viên{' '}
                                    <span className="font-semibold">
                                        {deletingEmployee.HoTen}
                                    </span>{' '}
                                    (Mã NV: {deletingEmployee.MaNhanVien}) không?
                                </p>
                                <p className="text-xs text-gray-500">
                                    Hành động này chỉ là mock trên giao diện, dữ liệu thật (nếu
                                    có) chưa bị xóa trên server.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeDeleteModal}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ===== MODAL CHI TIẾT NHÂN VIÊN ===== */}
                {isDetailOpen && detailEmployee && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Chi tiết nhân viên
                                </h2>
                                <button
                                    onClick={closeDetailModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            <div className="px-6 py-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Mã nhân viên</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.MaNhanVien}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Họ tên</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.HoTen}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Chức vụ</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.ChucVu}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Trạng thái</p>
                                        <span
                                            className={
                                                'inline-flex mt-1 px-2 py-1 rounded-full text-xs font-medium ' +
                                                getStatusClass(detailEmployee.TrangThai)
                                            }
                                        >
                                            {getStatusLabel(detailEmployee.TrangThai)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Số điện thoại</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.SoDienThoai}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Email</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.Email}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500">Ngày vào làm</p>
                                        <p className="text-sm text-gray-900">
                                            {detailEmployee.NgayVaoLam}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end px-6 py-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeDetailModal}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </ProtectedRoute>
    );
}
