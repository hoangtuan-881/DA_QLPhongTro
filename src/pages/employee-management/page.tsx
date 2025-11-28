import { useEffect, useState, FormEvent } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/pages/dashboard/components/Sidebar';
import Header from '@/pages/dashboard/components/Header';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import nhanVienService, { NhanVien, NhanVienCreateInput, NhanVienUpdateInput } from '@/services/nhan-vien.service';
import { getErrorMessage } from '@/lib/http-client';

interface EmployeeFormState {
    // Thông tin cá nhân
    HoTen: string;
    SDT: string;
    Email: string;
    CCCD: string;
    NgayCapCCCD: string;
    NoiCapCCCD: string;
    DiaChi: string;
    NgaySinh: string;
    GioiTinh: 'Nam' | 'Nữ' | 'Khác' | '';
    // Thông tin tài khoản
    TenDangNhap: string;
    password: string;
    MaQuyen: number;
    TrangThaiTaiKhoan: 'Hoạt động' | 'Bị khóa';
}

export default function EmployeeManagementPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [nhanViens, setNhanViens] = useState<NhanVien[]>([]);
    const [search, setSearch] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    // modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingNhanVien, setEditingNhanVien] = useState<NhanVien | null>(null);
    const [formTab, setFormTab] = useState<'personal' | 'account'>('personal');
    const [formData, setFormData] = useState<EmployeeFormState>({
        HoTen: '',
        SDT: '',
        Email: '',
        CCCD: '',
        NgayCapCCCD: '',
        NoiCapCCCD: '',
        DiaChi: '',
        NgaySinh: '',
        GioiTinh: '',
        TenDangNhap: '',
        password: '',
        MaQuyen: 2, // Default: Nhân viên
        TrangThaiTaiKhoan: 'Hoạt động',
    });

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deletingNhanVien, setDeletingNhanVien] = useState<NhanVien | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailNhanVien, setDetailNhanVien] = useState<NhanVien | null>(null);
    const toast = useToast();

    useDocumentTitle('Quản lý nhân viên');

    useEffect(() => {
        const controller = new AbortController();

        const fetchNhanViens = async () => {
            try {
                const response = await nhanVienService.getAll(controller.signal);
                if (!controller.signal.aborted) {
                    setNhanViens(response.data.data || []);
                    setLoading(false);
                }
            } catch (error: any) {
                if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
                    toast.error({
                        title: 'Lỗi tải danh sách nhân viên',
                        message: getErrorMessage(error),
                    });
                    setLoading(false);
                }
            }
        };

        fetchNhanViens();

        return () => controller.abort();
    }, [refreshKey]);

    const refreshData = () => {
        setLoading(true);
        setRefreshKey(prev => prev + 1);
    };

    const filteredNhanViens = nhanViens.filter((nv) => {
        const matchSearch =
            nv.HoTen.toLowerCase().includes(search.toLowerCase()) ||
            (nv.SDT && nv.SDT.includes(search)) ||
            (nv.Email && nv.Email.toLowerCase().includes(search.toLowerCase()));

        return matchSearch;
    });

    const openDetailModal = (nv: NhanVien) => {
        setDetailNhanVien(nv);
        setIsDetailOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailOpen(false);
        setDetailNhanVien(null);
    };
    // ====== HANDLERS - MODAL FORM ======

    const openAddModal = () => {
        setEditingNhanVien(null);
        setFormTab('personal');
        setFormData({
            HoTen: '',
            SDT: '',
            Email: '',
            CCCD: '',
            NgayCapCCCD: '',
            NoiCapCCCD: '',
            DiaChi: '',
            NgaySinh: '',
            GioiTinh: '',
            TenDangNhap: '',
            password: '',
            MaQuyen: 2,
            TrangThaiTaiKhoan: 'Hoạt động',
        });
        setIsFormOpen(true);
    };

    const openEditModal = (nv: NhanVien) => {
        setEditingNhanVien(nv);
        setFormTab('personal');
        setFormData({
            HoTen: nv.HoTen,
            SDT: nv.SDT || '',
            Email: nv.Email || '',
            CCCD: nv.CCCD || '',
            NgayCapCCCD: nv.NgayCapCCCD || '',
            NoiCapCCCD: nv.NoiCapCCCD || '',
            DiaChi: nv.DiaChi || '',
            NgaySinh: nv.NgaySinh || '',
            GioiTinh: nv.GioiTinh || '',
            TenDangNhap: nv.TaiKhoan?.TenDangNhap || '',
            password: '',
            MaQuyen: nv.TaiKhoan?.MaQuyen || 2,
            TrangThaiTaiKhoan: nv.TaiKhoan?.TrangThaiTaiKhoan || 'Hoạt động',
        });
        setIsFormOpen(true);
    };

    const closeFormModal = () => {
        setIsFormOpen(false);
        setEditingNhanVien(null);
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

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.HoTen.trim()) {
            toast.error({ title: 'Thông tin chưa hợp lệ', message: 'Họ tên không được để trống.' });
            return;
        }
        if (!formData.SDT.trim()) {
            toast.error({ title: 'Thông tin chưa hợp lệ', message: 'Số điện thoại không được để trống.' });
            return;
        }

        // Khi thêm mới, phải có thông tin tài khoản
        if (!editingNhanVien) {
            if (!formData.TenDangNhap.trim()) {
                toast.error({ title: 'Thông tin chưa hợp lệ', message: 'Tên đăng nhập không được để trống.' });
                return;
            }
            if (!formData.password.trim()) {
                toast.error({ title: 'Thông tin chưa hợp lệ', message: 'Mật khẩu không được để trống.' });
                return;
            }
            if (formData.password.length < 6) {
                toast.error({ title: 'Thông tin chưa hợp lệ', message: 'Mật khẩu phải có ít nhất 6 ký tự.' });
                return;
            }
        }

        try {
            if (editingNhanVien) {
                // Cập nhật
                const updateData: NhanVienUpdateInput = {
                    HoTen: formData.HoTen,
                    SDT: formData.SDT,
                    Email: formData.Email || null,
                    DiaChi: formData.DiaChi || null,
                    NgaySinh: formData.NgaySinh || null,
                    GioiTinh: formData.GioiTinh || null,
                };

                // Chỉ update account info nếu có thay đổi
                if (formData.TenDangNhap) updateData.TenDangNhap = formData.TenDangNhap;
                if (formData.password) updateData.password = formData.password;
                if (formData.MaQuyen) updateData.MaQuyen = formData.MaQuyen;
                if (formData.TrangThaiTaiKhoan) updateData.TrangThaiTaiKhoan = formData.TrangThaiTaiKhoan;

                await nhanVienService.update(editingNhanVien.MaNV, updateData);
                toast.success({ title: 'Cập nhật thành công', message: `Đã cập nhật: ${formData.HoTen}` });
            } else {
                // Thêm mới
                const createData: NhanVienCreateInput = {
                    HoTen: formData.HoTen,
                    SDT: formData.SDT,
                    Email: formData.Email || null,
                    DiaChi: formData.DiaChi || null,
                    NgaySinh: formData.NgaySinh || null,
                    GioiTinh: formData.GioiTinh || null,
                    TenDangNhap: formData.TenDangNhap,
                    password: formData.password,
                    MaQuyen: formData.MaQuyen,
                    TrangThaiTaiKhoan: formData.TrangThaiTaiKhoan,
                };

                await nhanVienService.create(createData);
                toast.success({ title: 'Thêm nhân viên thành công', message: `Đã thêm: ${formData.HoTen}` });
            }

            closeFormModal();
            refreshData();
        } catch (error) {
            toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
    };

    // ====== HANDLERS - DELETE MODAL ======

    const openDeleteModal = (nv: NhanVien) => {
        setDeletingNhanVien(nv);
        setIsDeleteOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteOpen(false);
        setDeletingNhanVien(null);
    };

    const confirmDelete = async () => {
        if (!deletingNhanVien) return;

        try {
            await nhanVienService.delete(deletingNhanVien.MaNV);

            toast.success({
                title: 'Xóa nhân viên thành công',
                message: `Đã xóa: ${deletingNhanVien.HoTen}`,
            });

            closeDeleteModal();
            refreshData();
        } catch (error) {
            toast.error({
                title: 'Lỗi xóa nhân viên',
                message: getErrorMessage(error),
            });
        }
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
                                <div className="relative w-full">
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
                            </div>

                            {/* Bảng nhân viên */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {loading ? (
                                    <div className="flex justify-center items-center h-48">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                    </div>
                                ) : filteredNhanViens.length === 0 ? (
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
                                                        Số điện thoại
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Email
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ngày sinh
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Giới tính
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Tên đăng nhập
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Phân quyền
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
                                                {filteredNhanViens.map((nv) => (
                                                    <tr
                                                        key={nv.MaNV}
                                                        className="hover:bg-gray-50"
                                                    >
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.MaNV}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-900 font-medium">
                                                            {nv.HoTen}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.SDT || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.Email || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.NgaySinh || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.GioiTinh || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                                            {nv.TaiKhoan?.TenDangNhap || '-'}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {nv.TaiKhoan?.MaQuyen === 1 ? (
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                                    Quản lý
                                                                </span>
                                                            ) : nv.TaiKhoan?.MaQuyen === 2 ? (
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                                    Nhân viên
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {nv.TaiKhoan?.TrangThaiTaiKhoan === 'Hoạt động' ? (
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                                    Hoạt động
                                                                </span>
                                                            ) : nv.TaiKhoan?.TrangThaiTaiKhoan === 'Bị khóa' ? (
                                                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                                    Bị khóa
                                                                </span>
                                                            ) : (
                                                                '-'
                                                            )}
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
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingNhanVien ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
                                </h2>
                                <button onClick={closeFormModal} className="text-gray-400 hover:text-gray-600">
                                    <i className="ri-close-line text-xl" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b">
                                <button
                                    type="button"
                                    onClick={() => setFormTab('personal')}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        formTab === 'personal'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <i className="ri-user-line mr-2" />
                                    Thông tin cá nhân
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormTab('account')}
                                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        formTab === 'account'
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    <i className="ri-shield-user-line mr-2" />
                                    Thông tin tài khoản
                                </button>
                            </div>

                            <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
                                <div className="flex-1 overflow-y-auto px-6 py-4">
                                    {/* Tab: Thông tin cá nhân */}
                                    {formTab === 'personal' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Họ tên <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    name="HoTen"
                                                    value={formData.HoTen}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Nhập họ tên"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Số điện thoại <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        name="SDT"
                                                        value={formData.SDT}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                        placeholder="0901234567"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        name="Email"
                                                        type="email"
                                                        value={formData.Email}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                        placeholder="example@gmail.com"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                                                    <input
                                                        name="NgaySinh"
                                                        type="date"
                                                        value={formData.NgaySinh}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                                                    <select
                                                        name="GioiTinh"
                                                        value={formData.GioiTinh}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="">-- Chọn giới tính --</option>
                                                        <option value="Nam">Nam</option>
                                                        <option value="Nữ">Nữ</option>
                                                        <option value="Khác">Khác</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                                                <input
                                                    name="DiaChi"
                                                    value={formData.DiaChi}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="Nhập địa chỉ"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: Thông tin tài khoản */}
                                    {formTab === 'account' && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tên đăng nhập {!editingNhanVien && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    name="TenDangNhap"
                                                    value={formData.TenDangNhap}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="username"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mật khẩu {!editingNhanVien && <span className="text-red-500">*</span>}
                                                    {editingNhanVien && <span className="text-gray-500 text-xs ml-2">(Để trống nếu không đổi)</span>}
                                                </label>
                                                <input
                                                    name="password"
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={handleFormChange}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    placeholder="••••••"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Phân quyền <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        name="MaQuyen"
                                                        value={formData.MaQuyen}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value={1}>Quản lý</option>
                                                        <option value={2}>Nhân viên</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái tài khoản</label>
                                                    <select
                                                        name="TrangThaiTaiKhoan"
                                                        value={formData.TrangThaiTaiKhoan}
                                                        onChange={handleFormChange}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                                                    >
                                                        <option value="Hoạt động">Hoạt động</option>
                                                        <option value="Bị khóa">Bị khóa</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {!editingNhanVien && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                                                    <i className="ri-information-line mr-1" />
                                                    Thông tin tài khoản sẽ được tạo tự động cho nhân viên.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 px-6 py-4 border-t">
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
                                        {editingNhanVien ? 'Lưu thay đổi' : 'Thêm mới'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ===== MODAL XÁC NHẬN XÓA ===== */}
                {isDeleteOpen && deletingNhanVien && (
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
                                        {deletingNhanVien.HoTen}
                                    </span>{' '}
                                    (Mã NV: {deletingNhanVien.MaNV}) không?
                                </p>
                                <p className="text-xs text-gray-500">
                                    Hành động này không thể hoàn tác.
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
                {isDetailOpen && detailNhanVien && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
                        <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
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

                            <div className="px-6 py-6 space-y-6">
                                {/* Thông tin cơ bản */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                        <i className="ri-user-line mr-2 text-indigo-600" />
                                        Thông tin cá nhân
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Mã nhân viên</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.MaNV}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Họ tên</p>
                                            <p className="text-sm text-gray-900 font-medium">{detailNhanVien.HoTen}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Số điện thoại</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.SDT || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Email</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.Email || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Ngày sinh</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.NgaySinh || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Giới tính</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.GioiTinh || '-'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <p className="text-xs font-semibold text-gray-500 mb-1">Địa chỉ</p>
                                            <p className="text-sm text-gray-900">{detailNhanVien.DiaChi || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin tài khoản */}
                                {detailNhanVien.TaiKhoan && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                                            <i className="ri-shield-user-line mr-2 text-indigo-600" />
                                            Thông tin tài khoản
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Tên đăng nhập</p>
                                                <p className="text-sm text-gray-900 font-medium">{detailNhanVien.TaiKhoan.TenDangNhap}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Phân quyền</p>
                                                {detailNhanVien.TaiKhoan.MaQuyen === 1 ? (
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                        Quản lý
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                        Nhân viên
                                                    </span>
                                                )}
                                            </div>
                                            <div className="md:col-span-2">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Trạng thái tài khoản</p>
                                                {detailNhanVien.TaiKhoan.TrangThaiTaiKhoan === 'Hoạt động' ? (
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                        <i className="ri-checkbox-circle-line mr-1" />
                                                        Hoạt động
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                                        <i className="ri-close-circle-line mr-1" />
                                                        Bị khóa
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 px-6 py-4 border-t sticky bottom-0 bg-white">
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeDetailModal();
                                        openEditModal(detailNhanVien);
                                    }}
                                    className="px-4 py-2 text-sm font-medium rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <i className="ri-edit-line mr-1" />
                                    Chỉnh sửa
                                </button>
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
