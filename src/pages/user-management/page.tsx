import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import taiKhoanService, { TaiKhoan, TaiKhoanCreateInput, TaiKhoanUpdateInput } from '../../services/tai-khoan.service';
import { getErrorMessage } from '../../lib/http-client';

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success, error, warning } = useToast();
  const [taiKhoans, setTaiKhoans] = useState<TaiKhoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTaiKhoan, setSelectedTaiKhoan] = useState<TaiKhoan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'danger' | 'warning' | 'info',
    onConfirm: () => { }
  });

  const roles = [
    { value: 0, label: 'Chủ trọ' },
    { value: 1, label: 'Quản lý' },
    { value: 2, label: 'Nhân viên' },
    { value: 3, label: 'Khách thuê' }
  ];

  // Fetch data from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await taiKhoanService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setTaiKhoans(response.data.data || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(err) });
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const filteredTaiKhoans = taiKhoans.filter(tk => {
    const profile = tk.nhanVien || tk.khachThue;
    const hoTen = profile?.HoTen || '';
    const email = profile?.Email || '';
    const sdt = profile?.SDT || '';

    const matchesSearch =
      hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tk.TenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sdt.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || tk.MaQuyen === parseInt(roleFilter);
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (formData: any) => {
    if (!formData.TenDangNhap || !formData.Email || !formData.HoTen || !formData.SDT || !formData.password) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Tạo tài khoản mới',
      message: `Bạn có chắc chắn muốn tạo tài khoản mới cho "${formData.HoTen}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await taiKhoanService.create(formData as TaiKhoanCreateInput);
          setShowAddModal(false);
          success({ title: `Đã tạo tài khoản cho ${formData.HoTen} thành công!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi tạo tài khoản', message: getErrorMessage(err) });
        }
      }
    });
  };

  const handleUpdateUser = async (formData: any) => {
    if (!selectedTaiKhoan || !formData.TenDangNhap || !formData.Email || !formData.HoTen || !formData.SDT) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Cập nhật tài khoản',
      message: `Bạn có chắc chắn muốn lưu thay đổi thông tin của "${formData.HoTen}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await taiKhoanService.update(selectedTaiKhoan.MaTaiKhoan, formData as TaiKhoanUpdateInput);
          setShowEditModal(false);
          setSelectedTaiKhoan(null);
          success({ title: `Đã cập nhật thông tin tài khoản ${formData.HoTen} thành công!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi cập nhật tài khoản', message: getErrorMessage(err) });
        }
      }
    });
  };

  const handleDeleteUser = (maTaiKhoan: number) => {
    const tk = taiKhoans.find(t => t.MaTaiKhoan === maTaiKhoan);
    if (!tk) return;

    const profile = tk.nhanVien || tk.khachThue;
    const hoTen = profile?.HoTen || tk.TenDangNhap;

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa tài khoản',
      message: `Bạn có chắc chắn muốn xóa tài khoản của "${hoTen}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await taiKhoanService.delete(maTaiKhoan);
          error({ title: `Đã xóa tài khoản ${hoTen}!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi xóa tài khoản', message: getErrorMessage(err) });
        }
      }
    });
  };

  const handleStatusChange = (maTaiKhoan: number, newStatus: 'Hoạt động' | 'Tạm khóa') => {
    const tk = taiKhoans.find(t => t.MaTaiKhoan === maTaiKhoan);
    if (!tk) return;

    const profile = tk.nhanVien || tk.khachThue;
    const hoTen = profile?.HoTen || tk.TenDangNhap;
    const statusText = newStatus === 'Hoạt động' ? 'kích hoạt' : 'vô hiệu hóa';

    setConfirmDialog({
      isOpen: true,
      title: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} tài khoản`,
      message: `Bạn có chắc chắn muốn ${statusText} tài khoản của "${hoTen}" không?`,
      type: newStatus === 'Hoạt động' ? 'info' : 'warning',
      onConfirm: async () => {
        try {
          await taiKhoanService.update(maTaiKhoan, { TrangThaiTaiKhoan: newStatus });
          if (newStatus === 'Hoạt động') {
            success({ title: `Đã kích hoạt tài khoản ${hoTen} thành công!` });
          } else {
            warning({ title: `Đã vô hiệu hóa tài khoản ${hoTen}!` });
          }
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi cập nhật trạng thái', message: getErrorMessage(err) });
        }
      }
    });
  };

  const handleResetPassword = (maTaiKhoan: number) => {
    const tk = taiKhoans.find(t => t.MaTaiKhoan === maTaiKhoan);
    if (!tk) return;

    const profile = tk.nhanVien || tk.khachThue;
    const hoTen = profile?.HoTen || tk.TenDangNhap;

    setConfirmDialog({
      isOpen: true,
      title: 'Đặt lại mật khẩu',
      message: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản của "${hoTen}" không? Mật khẩu mới sẽ được gửi qua email.`,
      type: 'warning',
      onConfirm: () => {
        // TODO: Implement reset password API
        warning({ title: `Đã đặt lại mật khẩu cho ${hoTen} và gửi email thông báo!` });
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Quản lý tài khoản</h1>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Thêm tài khoản
              </button>
            </div>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tên, username, email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    <option value="all">Tất cả vai trò</option>
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {!loading && filteredTaiKhoans.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-user-line text-4xl text-gray-400 mb-2"></i>
                  <p className="text-gray-500">Không có tài khoản nào</p>
                </div>
              )}

              {!loading && filteredTaiKhoans.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tài khoản
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vai trò
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTaiKhoans.map((tk) => {
                        const profile = tk.nhanVien || tk.khachThue;
                        const hoTen = profile?.HoTen || tk.TenDangNhap;
                        const email = profile?.Email || '';
                        const sdt = profile?.SDT || '';

                        return (
                          <tr key={tk.MaTaiKhoan} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{hoTen}</div>
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Tên đăng nhập:</span> {tk.TenDangNhap}
                              </div>
                              {email && (
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">Email:</span> {email}
                                </div>
                              )}
                              {sdt && (
                                <div className="text-sm text-gray-500">
                                  <span className="font-medium">SĐT:</span> {sdt}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                tk.MaQuyen === 0 ? 'bg-purple-100 text-purple-800' :
                                tk.MaQuyen === 1 ? 'bg-blue-100 text-blue-800' :
                                tk.MaQuyen === 2 ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {tk.TenQuyen}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => handleStatusChange(tk.MaTaiKhoan, tk.TrangThaiTaiKhoan === 'Hoạt động' ? 'Tạm khóa' : 'Hoạt động')}
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${
                                  tk.TrangThaiTaiKhoan === 'Hoạt động' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {tk.TrangThaiTaiKhoan}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedTaiKhoan(tk);
                                    setShowEditModal(true);
                                  }}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Chỉnh sửa"
                                >
                                  <i className="ri-edit-line"></i>
                                </button>
                                <button
                                  onClick={() => handleResetPassword(tk.MaTaiKhoan)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Đặt lại mật khẩu"
                                >
                                  <i className="ri-key-line"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(tk.MaTaiKhoan)}
                                  className="text-red-600 hover:text-red-900 cursor-pointer"
                                  title="Xóa"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Add User Modal */}
        {showAddModal && (
          <UserModal
            title="Thêm tài khoản mới"
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateUser}
            roles={roles}
          />
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedTaiKhoan && (
          <UserModal
            title="Chỉnh sửa tài khoản"
            taiKhoan={selectedTaiKhoan}
            onClose={() => {
              setShowEditModal(false);
              setSelectedTaiKhoan(null);
            }}
            onSubmit={handleUpdateUser}
            roles={roles}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }}
          onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
}

interface UserModalProps {
  title: string;
  taiKhoan?: TaiKhoan;
  onClose: () => void;
  onSubmit: (data: any) => void;
  roles: { value: number; label: string }[];
}

function UserModal({ title, taiKhoan, onClose, onSubmit, roles }: UserModalProps) {
  const profile = taiKhoan?.nhanVien || taiKhoan?.khachThue;

  const [formData, setFormData] = useState({
    HoTen: profile?.HoTen || '',
    TenDangNhap: taiKhoan?.TenDangNhap || '',
    Email: profile?.Email || '',
    SDT: profile?.SDT || '',
    MaQuyen: taiKhoan?.MaQuyen ?? 3,
    TrangThaiTaiKhoan: taiKhoan?.TrangThaiTaiKhoan || 'Hoạt động',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={formData.HoTen}
                onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập *
              </label>
              <input
                type="text"
                required
                value={formData.TenDangNhap}
                onChange={(e) => setFormData({ ...formData, TenDangNhap: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập tên đăng nhập"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.Email}
                onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={formData.SDT}
                onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò *
              </label>
              <select
                required
                value={formData.MaQuyen}
                onChange={(e) => setFormData({ ...formData, MaQuyen: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            {taiKhoan && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.TrangThaiTaiKhoan}
                  onChange={(e) => setFormData({ ...formData, TrangThaiTaiKhoan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm khóa">Tạm khóa</option>
                </select>
              </div>
            )}

            {!taiKhoan && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                {taiKhoan ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
