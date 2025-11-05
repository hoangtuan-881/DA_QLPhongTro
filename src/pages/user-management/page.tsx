
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin: string;
}

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success, error, warning } = useToast();
  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      fullName: 'Nguyễn Văn Admin',
      email: 'admin@tro.com',
      phone: '0901234567',
      role: 'Admin',
      status: 'active',
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20 09:30'
    },
    {
      id: 2,
      fullName: 'Trần Thị Quản Lý',
      email: 'manager@tro.com',
      phone: '0912345678',
      role: 'Quản lý',
      status: 'active',
      createdAt: '2024-01-16',
      lastLogin: '2024-01-20 08:15'
    },
    {
      id: 3,
      fullName: 'Lê Văn Khách',
      email: 'khach@email.com',
      phone: '0923456789',
      role: 'Khách hàng',
      status: 'active',
      createdAt: '2024-01-17',
      lastLogin: '2024-01-19 20:45'
    },
    {
      id: 4,
      fullName: 'Phạm Thị Nhân Viên',
      email: 'staff@tro.com',
      phone: '0934567890',
      role: 'Nhân viên',
      status: 'inactive',
      createdAt: '2024-01-18',
      lastLogin: '2024-01-18 17:30'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger' as 'danger' | 'warning' | 'info',
    onConfirm: () => { }
  });

  const roles = ['Admin', 'Quản lý', 'Nhân viên', 'Khách hàng'];

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = (formData: any) => {
    if (!formData.email || !formData.fullName || !formData.phone || !formData.password) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Tạo tài khoản mới',
      message: `Bạn có chắc chắn muốn tạo tài khoản mới cho "${formData.fullName}" không?`,
      type: 'info',
      onConfirm: () => {
        const user: User = {
          id: Date.now(),
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
          lastLogin: ''
        };
        setUsers([...users, user]);
        setShowAddModal(false);
        success({ title: `Đã tạo tài khoản cho ${formData.fullName} thành công!` });
      }
    });
  };

  const handleUpdateUser = (formData: any) => {
    if (!selectedUser || !formData.email || !formData.fullName || !formData.phone) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Cập nhật tài khoản',
      message: `Bạn có chắc chắn muốn lưu thay đổi thông tin của "${selectedUser.fullName}" không?`,
      type: 'info',
      onConfirm: () => {
        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, fullName: formData.fullName, email: formData.email, phone: formData.phone, role: formData.role, status: formData.status }
            : u
        ));
        setShowEditModal(false);
        setSelectedUser(null);
        success({ title: `Đã cập nhật thông tin tài khoản ${selectedUser.fullName} thành công!` });
      }
    });
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xóa tài khoản',
      message: `Bạn có chắc chắn muốn xóa tài khoản của "${user.fullName}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setUsers(users.filter(u => u.id !== userId));
        error({ title: `Đã xóa tài khoản ${user.fullName}!` });
      }
    });
  };

  const handleStatusChange = (userId: number, newStatus: 'active' | 'inactive') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const statusText = newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';

    setConfirmDialog({
      isOpen: true,
      title: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} tài khoản`,
      message: `Bạn có chắc chắn muốn ${statusText} tài khoản của "${user.fullName}" không?`,
      type: newStatus === 'active' ? 'info' : 'warning',
      onConfirm: () => {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        if (newStatus === 'active') {
          success({ title: `Đã kích hoạt tài khoản ${user.fullName} thành công!` });
        } else {
          warning({ title: `Đã vô hiệu hóa tài khoản ${user.fullName}!` });
        }
      }
    });
  };

  const handleResetPassword = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Đặt lại mật khẩu',
      message: `Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản của "${user.fullName}" không? Mật khẩu mới sẽ được gửi qua email.`,
      type: 'warning',
      onConfirm: () => {
        console.log('Reset password for user:', userId);
        warning({ title: `Đã đặt lại mật khẩu cho ${user.fullName} và gửi email thông báo!` });
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
                      <option key={role} value={role}>{role}</option>
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
                        Lần đăng nhập cuối
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'Quản lý' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'Nhân viên' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'inactive' : 'active')}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full cursor-pointer hover:opacity-80 ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {user.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleResetPassword(user.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Đặt lại mật khẩu"
                            >
                              <i className="ri-key-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Xóa"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        {showEditModal && selectedUser && (
          <UserModal
            title="Chỉnh sửa tài khoản"
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
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
  user?: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
  roles: string[];
}

function UserModal({ title, user, onClose, onSubmit, roles }: UserModalProps) {
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'Khách hàng',
    status: user?.status || 'active',
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
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Tạm khóa</option>
              </select>
            </div>

            {!user && (
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
                {user ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
