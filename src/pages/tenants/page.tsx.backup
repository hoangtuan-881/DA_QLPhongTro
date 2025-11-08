
import { useState } from 'react';
import Header from '../dashboard/components/Header';
import Sidebar from '../dashboard/components/Sidebar';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

interface Tenant {
  id: string;
  name: string;
  phone: string;
  phone2?: string;
  email: string;
  room: string;
  status: 'active' | 'expired';
  avatar?: string;
  idCard?: string;
  idCardDate?: string;
  idCardPlace?: string;
  address?: string;
  birthDate?: string;
  birthPlace?: string;
  vehicleNumber?: string;
  notes?: string;
  currentBuildingAddress?: string;
}

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    phone2: '0987654321',
    email: 'nguyenvana@email.com',
    room: 'A101',
    status: 'active',
    idCard: '123456789',
    idCardDate: '2020-01-15',
    idCardPlace: 'CA Hà Nội',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    birthDate: '1995-05-20',
    birthPlace: 'Hà Nội',
    vehicleNumber: '29A1-12345',
    notes: 'Khách hàng thân thiết'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0907654321',
    phone2: '0976543210',
    email: 'tranthib@email.com',
    room: 'B202',
    status: 'active',
    idCard: '987654321',
    idCardDate: '2019-08-10',
    idCardPlace: 'CA TP.HCM',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    birthDate: '1992-12-10',
    birthPlace: 'TP.HCM',
    vehicleNumber: '51F1-67890',
    notes: 'Có thú cưng'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    phone: '0912345678',
    email: 'levanc@email.com',
    room: 'A105',
    status: 'expired',
    idCard: '456789123',
    idCardDate: '2018-05-20',
    idCardPlace: 'CA Đà Nẵng',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    birthDate: '1990-03-15',
    birthPlace: 'Đà Nẵng',
    vehicleNumber: '43A1-11111'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    phone: '0908765432',
    phone2: '0954321098',
    email: 'phamthid@email.com',
    room: 'C301',
    status: 'expired',
    idCard: '789123456',
    idCardDate: '2021-12-05',
    idCardPlace: 'CA Hải Phòng',
    address: '321 Đường GHI, Quận 7, TP.HCM',
    birthDate: '1988-07-25',
    birthPlace: 'Hải Phòng',
    vehicleNumber: '15A1-44444',
    notes: 'Làm việc ca đêm'
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    phone: '0923456789',
    email: 'hoangvane@email.com',
    room: 'D402',
    status: 'active',
    idCard: '321654987',
    idCardDate: '2022-01-10',
    idCardPlace: 'CA Cần Thơ',
    address: '654 Đường JKL, Quận 10, TP.HCM',
    birthDate: '1993-11-08',
    birthPlace: 'Cần Thơ',
    vehicleNumber: '65A1-55555'
  }
];

export default function TenantsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [newTenant, setNewTenant] = useState({
    name: '',
    phone: '',
    phone2: '',
    email: '',
    room: '',
    status: 'active' as const,
    idCard: '',
    idCardDate: '',
    idCardPlace: '',
    address: '',
    birthDate: '',
    birthPlace: '',
    vehicleNumber: '',
    notes: ''
  });

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'info' as 'danger' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: () => { },
    loading: false
  });

  const toast = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang trọ';
      case 'expired':
        return 'Không trọ';
      default:
        return status;
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const matchesStatus = filterStatus === 'all' || tenant.status === filterStatus;
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.includes(searchTerm) ||
      tenant.room.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant({ ...tenant });
    setShowEditModal(true);
  };

  const handleDeleteTenant = (tenant: any) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Xác nhận xóa khách thuê',
      message: `Bạn có chắc chắn muốn xóa khách thuê "${tenant.name}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => confirmDeleteTenant(tenant),
      loading: false
    });
  };

  const confirmDeleteTenant = async (tenant: any) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTenants(prev => prev.filter(t => t.id !== tenant.id));
    setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
    toast.success({
      title: 'Xóa thành công',
      message: `Đã xóa khách thuê "${tenant.name}" khỏi hệ thống`
    });
  };

  const handleAddTenant = (formData: Omit<Tenant, 'id'>) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận thêm khách thuê',
      message: `Bạn có chắc chắn muốn thêm khách thuê "${formData.name}" không?`,
      onConfirm: () => confirmAddTenant(formData),
      loading: false
    });
  }

  const confirmAddTenant = async (formData: Omit<Tenant, 'id'>) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTenantData: Tenant = {
      id: (tenants.length + 1).toString(),
      ...formData
    };
    setTenants(prev => [...prev, newTenantData]);
    setShowAddModal(false);
    setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
    toast.success({ title: 'Thêm thành công', message: `Đã thêm khách thuê "${formData.name}" vào hệ thống` });
  };

  const handleEditTenantConfirm = (formData: any) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận cập nhật thông tin',
      message: `Bạn có chắc chắn muốn lưu thay đổi thông tin của "${formData.name}" không?`,
      onConfirm: () => confirmEditTenant(formData),
      loading: false
    });
  };

  const confirmEditTenant = async (formData: any) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTenants(prev =>
      prev.map(tenant => (tenant.id === editingTenant?.id ? { ...tenant, ...formData } : tenant))
    );
    setShowEditModal(false);
    setEditingTenant(null);
    setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
    toast.success({
      title: 'Cập nhật thành công',
      message: `Đã cập nhật thông tin của "${formData.name}"`
    });
  };

  const handleStatusChange = (tenant: Tenant, newStatus: 'active' | 'expired') => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận thay đổi trạng thái',
      message: `Bạn có chắc chắn muốn chuyển trạng thái của "${tenant.name}" sang "${getStatusText(newStatus)}" không?`,
      onConfirm: () => confirmStatusChange(tenant, newStatus),
      loading: false
    });
  };


  const confirmStatusChange = async (tenant: Tenant, newStatus: 'active' | 'expired') => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTenants(prev => prev.map(t => (t.id === tenant.id ? { ...t, status: newStatus } : t)));
    setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
    toast.success({
      title: 'Cập nhật trạng thái thành công',
      message: `Đã chuyển trạng thái của "${tenant.name}" sang "${getStatusText(newStatus)}"`
    });
  };

  const closeConfirmDialog = () => {
    if (!confirmDialog.loading) {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSaveTenant = () => {
    if (!editingTenant) return;
    setTenants(prev =>
      prev.map(t => (t.id === editingTenant.id ? editingTenant : t))
    );
    toast.success({
      title: 'Cập nhật thông tin thành công',
      message: `Thông tin của ${editingTenant.name} đã được cập nhật`
    });
    setShowEditModal(false);
    setEditingTenant(null);
  };

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.phone || !newTenant.email || !newTenant.room) {
      toast.error({
        title: 'Lỗi thêm khách thuê',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }
    handleAddTenant(newTenant);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách thuê</h1>
                <p className="text-gray-600">Quản lý thông tin khách thuê phòng trọ</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-add-line mr-2"></i>
                Thêm khách thuê
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang trọ</option>
                  <option value="expired">Không trọ</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, số điện thoại, phòng..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line mr-1"></i>
                  Đặt lại
                </button>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách thuê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Liên hệ &amp; Địa chỉ thường trú
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng đã ở
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trống
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
                    {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="hover:bg-gray-50">
                        {/* 1) Khách thuê */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {tenant.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                              {tenant.idCard && (
                                <div className="text-xs text-gray-500">CCCD: {tenant.idCard}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2) Liên hệ & Địa chỉ thường trú */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {tenant.phone}
                            {tenant.phone2 && <span> • {tenant.phone2}</span>}
                          </div>
                          <div className="text-sm text-gray-500">{tenant.email}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium"></span>{' '}
                            {tenant.address || '-'}
                          </div>
                        </td>

                        {/* 3) Phòng đã ở (dòng phụ đổi label) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{tenant.room}</div>
                          <div className="text-xs text-gray-500 max-w-56 truncate">
                            <span className="font-medium">Dãy ??</span>{' '}
                            {tenant.currentBuildingAddress || '-'}
                          </div>
                        </td>

                        {/* 4) Trống thêm thông tin khác sau */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                          </div>
                        </td>

                        {/* 5) Trạng thái (2 giá trị) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              tenant.status
                            )}`}
                          >
                            {getStatusText(tenant.status)}
                          </span>
                        </td>

                        {/* 6) Thao tác */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => {
                                setEditingTenant(tenant);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteTenant(tenant)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {filteredTenants.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Không tìm thấy khách thuê nào phù hợp với bộ lọc</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Tenant Detail Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedTenant(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết khách thuê - {selectedTenant.name}
                </h2>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">{selectedTenant.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày sinh:</span>
                      <span className="font-medium">
                        {selectedTenant.birthDate
                          ? new Date(selectedTenant.birthDate).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nơi sinh:</span>
                      <span className="font-medium">{selectedTenant.birthPlace || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CMND/CCCD:</span>
                      <span className="font-medium">{selectedTenant.idCard || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày cấp:</span>
                      <span className="font-medium">
                        {selectedTenant.idCardDate
                          ? new Date(selectedTenant.idCardDate).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nơi cấp:</span>
                      <span className="font-medium">{selectedTenant.idCardPlace || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                  <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điện thoại 1:</span>
                      <span className="font-medium">{selectedTenant.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điện thoại 2:</span>
                      <span className="font-medium">{selectedTenant.phone2 || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedTenant.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa chỉ thường trú:</span>
                      <span className="font-medium text-right">{selectedTenant.address || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số xe:</span>
                      <span className="font-medium">{selectedTenant.vehicleNumber || '-'}</span>
                    </div>
                    {selectedTenant.notes && (
                      <div>
                        <span className="text-gray-600">Ghi chú:</span>
                        <p className="font-medium mt-1">{selectedTenant.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    setEditingTenant(selectedTenant);
                    setShowEditModal(true);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Chỉnh sửa
                </button>
                <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center justify-center">
                  <i className="ri-close-circle-line mr-2"></i>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {showEditModal && editingTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin khách thuê</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={editingTenant.name}
                        onChange={e => setEditingTenant({ ...editingTenant, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={editingTenant.birthDate || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, birthDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi sinh
                      </label>
                      <input
                        type="text"
                        value={editingTenant.birthPlace || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, birthPlace: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CMND/CCCD
                      </label>
                      <input
                        type="text"
                        value={editingTenant.idCard || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, idCard: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        value={editingTenant.idCardDate || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, idCardDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi cấp
                      </label>
                      <input
                        type="text"
                        value={editingTenant.idCardPlace || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, idCardPlace: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="CA Hà Nội"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 1 *
                      </label>
                      <input
                        type="tel"
                        value={editingTenant.phone}
                        onChange={e => setEditingTenant({ ...editingTenant, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 2
                      </label>
                      <input
                        type="tel"
                        value={editingTenant.phone2 || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, phone2: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={editingTenant.email}
                        onChange={e => setEditingTenant({ ...editingTenant, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ thường trú
                      </label>
                      <textarea
                        value={editingTenant.address || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số xe
                      </label>
                      <input
                        type="text"
                        value={editingTenant.vehicleNumber || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, vehicleNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="29A1-12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú khác
                      </label>
                      <textarea
                        value={editingTenant.notes || ''}
                        onChange={e => setEditingTenant({ ...editingTenant, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Thông tin bổ sung..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveTenant}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm khách thuê mới</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={newTenant.name}
                        onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={newTenant.birthDate}
                        onChange={e => setNewTenant({ ...newTenant, birthDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi sinh
                      </label>
                      <input
                        type="text"
                        value={newTenant.birthPlace}
                        onChange={e => setNewTenant({ ...newTenant, birthPlace: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CMND/CCCD
                      </label>
                      <input
                        type="text"
                        value={newTenant.idCard}
                        onChange={e => setNewTenant({ ...newTenant, idCard: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        value={newTenant.idCardDate}
                        onChange={e => setNewTenant({ ...newTenant, idCardDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi cấp
                      </label>
                      <input
                        type="text"
                        value={newTenant.idCardPlace}
                        onChange={e => setNewTenant({ ...newTenant, idCardPlace: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="CA Hà Nội"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 1 *
                      </label>
                      <input
                        type="tel"
                        value={newTenant.phone}
                        onChange={e => setNewTenant({ ...newTenant, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0901234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 2
                      </label>
                      <input
                        type="tel"
                        value={newTenant.phone2}
                        onChange={e => setNewTenant({ ...newTenant, phone2: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newTenant.email}
                        onChange={e => setNewTenant({ ...newTenant, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ thường trú
                      </label>
                      <textarea
                        value={newTenant.address}
                        onChange={e => setNewTenant({ ...newTenant, address: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số xe
                      </label>
                      <input
                        type="text"
                        value={newTenant.vehicleNumber}
                        onChange={e => setNewTenant({ ...newTenant, vehicleNumber: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="29A1-12345"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú khác
                      </label>
                      <textarea
                        value={newTenant.notes}
                        onChange={e => setNewTenant({ ...newTenant, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Thông tin bổ sung..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTenant}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-user-add-line mr-2"></i>
                    Thêm khách thuê
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
