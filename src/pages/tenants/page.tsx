import { useState, useEffect } from 'react';
import Header from '../dashboard/components/Header';
import Sidebar from '../dashboard/components/Sidebar';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import khachThueService, {
  KhachThue,
  KhachThueCreateInput,
  getVaiTroColor,
  getVaiTroText,
} from '../../services/khach-thue.service';
import { getErrorMessage } from '../../lib/http-client';

export default function TenantsPage() {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [tenants, setTenants] = useState<KhachThue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<KhachThue | null>(null);
  const [editingTenant, setEditingTenant] = useState<KhachThue | null>(null);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Confirm dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'info' as 'danger' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: () => {},
    loading: false,
  });

  const toast = useToast();

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await khachThueService.getAll(controller.signal);

        if (!controller.signal.aborted) {
          setTenants(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (
          error.name !== 'CanceledError' &&
          error.code !== 'ERR_CANCELED'
        ) {
          console.error('Error fetching tenants:', error);
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error),
          });
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [refreshKey]);

  // Handlers
  const refreshData = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  const handleAddTenant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: KhachThueCreateInput = {
      TenDangNhap: formData.get('TenDangNhap') as string,
      password: formData.get('password') as string,
      HoTen: formData.get('HoTen') as string,
      SDT1: formData.get('SDT1') as string,
      SDT2: (formData.get('SDT2') as string) || null,
      Email: (formData.get('Email') as string) || null,
      CCCD: (formData.get('CCCD') as string) || null,
      NgayCapCCCD: (formData.get('NgayCapCCCD') as string) || null,
      NoiCapCCCD: (formData.get('NoiCapCCCD') as string) || null,
      DiaChiThuongTru: (formData.get('DiaChiThuongTru') as string) || null,
      NgaySinh: (formData.get('NgaySinh') as string) || null,
      NoiSinh: (formData.get('NoiSinh') as string) || null,
      VaiTro: (formData.get('VaiTro') as string) || 'KHACH_CHINH',
      BienSoXe: (formData.get('BienSoXe') as string) || null,
      GhiChu: (formData.get('GhiChu') as string) || null,
      SoXe: 0,
      MaPhong: null,
      MaLoaiXe: null,
      MaTaiKhoan: null,
      HinhAnh: null,
    };

    try {
      await khachThueService.create(data);
      toast.success({
        title: 'Thành công',
        message: 'Đã thêm khách thuê mới',
      });
      setShowAddModal(false);
      refreshData();
    } catch (error) {
      toast.error({
        title: 'Lỗi thêm khách thuê',
        message: getErrorMessage(error),
      });
    }
  };

  const handleUpdateTenant = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!editingTenant) return;

    const formData = new FormData(e.currentTarget);

    const data: any = {};
    const fields = [
      'HoTen',
      'SDT1',
      'SDT2',
      'Email',
      'CCCD',
      'NgayCapCCCD',
      'NoiCapCCCD',
      'DiaChiThuongTru',
      'NgaySinh',
      'NoiSinh',
      'VaiTro',
      'BienSoXe',
      'GhiChu',
    ];

    fields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        data[field] = value;
      }
    });

    try {
      await khachThueService.update(editingTenant.MaKhachThue, data);
      toast.success({
        title: 'Thành công',
        message: 'Đã cập nhật khách thuê',
      });
      setShowEditModal(false);
      setEditingTenant(null);
      refreshData();
    } catch (error) {
      toast.error({
        title: 'Lỗi cập nhật',
        message: getErrorMessage(error),
      });
    }
  };

  const confirmDelete = (tenant: KhachThue) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Xác nhận xóa',
      message: `Bạn có chắc muốn xóa khách thuê "${tenant.HoTen}"?`,
      onConfirm: () => handleDeleteTenant(tenant.MaKhachThue),
      loading: false,
    });
  };

  const handleDeleteTenant = async (id: number) => {
    setConfirmDialog((prev) => ({ ...prev, loading: true }));

    try {
      await khachThueService.delete(id);
      toast.success({
        title: 'Thành công',
        message: 'Đã xóa khách thuê',
      });
      setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      refreshData();
    } catch (error) {
      toast.error({
        title: 'Lỗi xóa khách thuê',
        message: getErrorMessage(error),
      });
    } finally {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  // Filter & Search
  const filteredTenants = tenants.filter((tenant) => {
    const matchesStatus =
      filterStatus === 'all' || tenant.VaiTro === filterStatus;
    const matchesSearch =
      tenant.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.SDT1.includes(searchTerm) ||
      (tenant.Email &&
        tenant.Email.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: tenants.length,
    active: tenants.filter(
      (t) =>
        t.VaiTro === 'KHACH_CHINH' ||
        t.VaiTro === 'THANH_VIEN' ||
        t.VaiTro === 'TIEM_NANG'
    ).length,
    expired: tenants.filter((t) => t.VaiTro === 'DA_DON_DI').length,
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Quản lý khách thuê
            </h1>
            <p className="text-gray-600">
              Quản lý thông tin khách thuê và hợp đồng
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Tổng khách thuê
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Đang thuê
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Đã dọn đi
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.expired}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Actions */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, số điện thoại..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="KHACH_CHINH">Khách chính</option>
                  <option value="THANH_VIEN">Thành viên</option>
                  <option value="TIEM_NANG">Tiềm năng</option>
                  <option value="DA_DON_DI">Đã dọn đi</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                + Thêm khách thuê
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Chưa có khách thuê nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Họ tên
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điện thoại
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biển số xe
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTenants.map((tenant) => (
                      <tr key={tenant.MaKhachThue} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium">
                                  {tenant.HoTen.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {tenant.HoTen}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tenant.SDT1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.Email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {tenant.TenPhong || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVaiTroColor(
                              tenant.VaiTro
                            )}`}
                          >
                            {getVaiTroText(tenant.VaiTro)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {tenant.BienSoXe || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => {
                              setSelectedTenant(tenant);
                              setShowDetailModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            Xem
                          </button>
                          <button
                            onClick={() => {
                              setEditingTenant(tenant);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => confirmDelete(tenant)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => setShowAddModal(false)}
            />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-bold mb-4">Thêm khách thuê mới</h3>
              <form onSubmit={handleAddTenant}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tên đăng nhập *
                    </label>
                    <input
                      name="TenDangNhap"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ tên *
                    </label>
                    <input
                      name="HoTen"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      name="SDT1"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SĐT 2
                    </label>
                    <input
                      name="SDT2"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      name="Email"
                      type="email"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      CCCD
                    </label>
                    <input
                      name="CCCD"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ngày cấp CCCD
                    </label>
                    <input
                      name="NgayCapCCCD"
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nơi cấp CCCD
                    </label>
                    <input
                      name="NoiCapCCCD"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Ngày sinh
                    </label>
                    <input
                      name="NgaySinh"
                      type="date"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nơi sinh
                    </label>
                    <input
                      name="NoiSinh"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vai trò
                    </label>
                    <select
                      name="VaiTro"
                      className="w-full px-3 py-2 border rounded-lg"
                      defaultValue="KHACH_CHINH"
                    >
                      <option value="KHACH_CHINH">Khách chính</option>
                      <option value="THANH_VIEN">Thành viên</option>
                      <option value="TIEM_NANG">Tiềm năng</option>
                      <option value="DA_DON_DI">Đã dọn đi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Biển số xe
                    </label>
                    <input
                      name="BienSoXe"
                      placeholder="29A1-12345"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Địa chỉ thường trú
                    </label>
                    <input
                      name="DiaChiThuongTru"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="GhiChu"
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => {
                setShowEditModal(false);
                setEditingTenant(null);
              }}
            />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-bold mb-4">
                Chỉnh sửa khách thuê
              </h3>
              <form onSubmit={handleUpdateTenant}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ tên
                    </label>
                    <input
                      name="HoTen"
                      defaultValue={editingTenant.HoTen}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số điện thoại
                    </label>
                    <input
                      name="SDT1"
                      defaultValue={editingTenant.SDT1}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SĐT 2
                    </label>
                    <input
                      name="SDT2"
                      defaultValue={editingTenant.SDT2 || ''}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      name="Email"
                      defaultValue={editingTenant.Email || ''}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Vai trò
                    </label>
                    <select
                      name="VaiTro"
                      defaultValue={editingTenant.VaiTro}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="KHACH_CHINH">Khách chính</option>
                      <option value="THANH_VIEN">Thành viên</option>
                      <option value="TIEM_NANG">Tiềm năng</option>
                      <option value="DA_DON_DI">Đã dọn đi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Biển số xe
                    </label>
                    <input
                      name="BienSoXe"
                      defaultValue={editingTenant.BienSoXe || ''}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Ghi chú
                    </label>
                    <textarea
                      name="GhiChu"
                      defaultValue={editingTenant.GhiChu || ''}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingTenant(null);
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75"
              onClick={() => {
                setShowDetailModal(false);
                setSelectedTenant(null);
              }}
            />
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-lg font-bold mb-4">
                Chi tiết khách thuê
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium">{selectedTenant.HoTen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{selectedTenant.SDT1}</p>
                  </div>
                  {selectedTenant.SDT2 && (
                    <div>
                      <p className="text-sm text-gray-500">SĐT 2</p>
                      <p className="font-medium">{selectedTenant.SDT2}</p>
                    </div>
                  )}
                  {selectedTenant.Email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedTenant.Email}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500">Vai trò</p>
                    <span
                      className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getVaiTroColor(
                        selectedTenant.VaiTro
                      )}`}
                    >
                      {getVaiTroText(selectedTenant.VaiTro)}
                    </span>
                  </div>
                  {selectedTenant.TenPhong && (
                    <div>
                      <p className="text-sm text-gray-500">Phòng</p>
                      <p className="font-medium">{selectedTenant.TenPhong}</p>
                    </div>
                  )}
                  {selectedTenant.BienSoXe && (
                    <div>
                      <p className="text-sm text-gray-500">Biển số xe</p>
                      <p className="font-medium">{selectedTenant.BienSoXe}</p>
                    </div>
                  )}
                  {selectedTenant.CCCD && (
                    <div>
                      <p className="text-sm text-gray-500">CCCD</p>
                      <p className="font-medium">{selectedTenant.CCCD}</p>
                    </div>
                  )}
                  {selectedTenant.GhiChu && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Ghi chú</p>
                      <p className="font-medium">{selectedTenant.GhiChu}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedTenant(null);
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        loading={confirmDialog.loading}
      />
    </div>
  );
}
