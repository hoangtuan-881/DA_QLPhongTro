
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';

interface Contract {
  id: string;
  contractNumber: string;
  tenantName: string;
  room: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  electricityRate: number;
  waterRate: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  signedDate: string;
  renewalCount: number;
}

interface Tenant {
  id: string;
  name: string;
  phone: string;
  email: string;
  idCard?: string;
  status: 'active' | 'available' | 'pending';
}

interface Room {
  id: string;
  number: string;
  floor: number;
  monthlyRent: number;
  deposit: number;
  electricityRate: number;
  waterRate: number;
  serviceRate: number;
  status: 'available' | 'occupied' | 'maintenance';
  area: number;
  type: string;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    contractNumber: 'HD001',
    tenantName: 'Nguyễn Văn A',
    room: 'P101',
    startDate: '2024-01-15',
    endDate: '2024-12-15',
    monthlyRent: 3500000,
    deposit: 7000000,
    electricityRate: 3500,
    waterRate: 25000,
    status: 'active',
    signedDate: '2024-01-10',
    renewalCount: 0
  },
  {
    id: '2',
    contractNumber: 'HD002',
    tenantName: 'Trần Thị B',
    room: 'P202',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    monthlyRent: 3800000,
    deposit: 7600000,
    electricityRate: 3500,
    waterRate: 25000,
    status: 'active',
    signedDate: '2024-01-28',
    renewalCount: 1
  },
  {
    id: '3',
    contractNumber: 'HD003',
    tenantName: 'Lê Văn C',
    room: 'P105',
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    monthlyRent: 3000000,
    deposit: 6000000,
    electricityRate: 3500,
    waterRate: 25000,
    status: 'expired',
    signedDate: '2023-11-25',
    renewalCount: 0
  },
  {
    id: '4',
    contractNumber: 'HD004',
    tenantName: 'Phạm Thị D',
    room: 'P301',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    monthlyRent: 4800000,
    deposit: 9600000,
    electricityRate: 3500,
    waterRate: 25000,
    status: 'pending',
    signedDate: '2024-03-25',
    renewalCount: 0
  }
];

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'nguyenvana@email.com',
    idCard: '123456789',
    status: 'active'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    phone: '0907654321',
    email: 'tranthib@email.com',
    idCard: '987654321',
    status: 'active'
  },
  {
    id: '3',
    name: 'Lê Văn C',
    phone: '0912345678',
    email: 'levanc@email.com',
    idCard: '456789123',
    status: 'available'
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    phone: '0908765432',
    email: 'phamthid@email.com',
    idCard: '789123456',
    status: 'pending'
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    phone: '0923456789',
    email: 'hoangvane@email.com',
    idCard: '321654987',
    status: 'available'
  },
  {
    id: '6',
    name: 'Nguyễn Thị F',
    phone: '0934567890',
    email: 'nguyenthif@email.com',
    idCard: '654987321',
    status: 'available'
  },
  {
    id: '7',
    name: 'Trần Văn G',
    phone: '0945678901',
    email: 'tranvang@email.com',
    idCard: '147258369',
    status: 'available'
  }
];

const mockRooms: Room[] = [
  {
    id: '1',
    number: 'P101',
    floor: 1,
    monthlyRent: 3500000,
    deposit: 7000000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 150000,
    status: 'occupied',
    area: 25,
    type: 'Phòng đơn'
  },
  {
    id: '2',
    number: 'P102',
    floor: 1,
    monthlyRent: 3800000,
    deposit: 7600000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 150000,
    status: 'available',
    area: 28,
    type: 'Phòng đơn có ban công'
  },
  {
    id: '3',
    number: 'P103',
    floor: 1,
    monthlyRent: 4200000,
    deposit: 8400000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 200000,
    status: 'available',
    area: 32,
    type: 'Phòng đôi'
  },
  {
    id: '4',
    number: 'P201',
    floor: 2,
    monthlyRent: 3600000,
    deposit: 7200000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 150000,
    status: 'available',
    area: 26,
    type: 'Phòng đơn'
  },
  {
    id: '5',
    number: 'P202',
    floor: 2,
    monthlyRent: 3900000,
    deposit: 7800000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 150000,
    status: 'occupied',
    area: 29,
    type: 'Phòng đơn có ban công'
  },
  {
    id: '6',
    number: 'P301',
    floor: 3,
    monthlyRent: 4800000,
    deposit: 9600000,
    electricityRate: 3500,
    waterRate: 25000,
    serviceRate: 250000,
    status: 'available',
    area: 35,
    type: 'Phòng VIP'
  }
];

export default function Contracts() {
  const { success, error, warning } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [deletingContract, setDeletingContract] = useState<Contract | null>(null);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [terminatingContract, setTerminatingContract] = useState<Contract | null>(null);
  
  // New contract form states
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [tenantSearch, setTenantSearch] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [newContract, setNewContract] = useState({
    contractNumber: '',
    signedDate: '',
    startDate: '',
    endDate: '',
    customDeposit: 0,
    notes: ''
  });

  // Renewal form states
  const [renewalData, setRenewalData] = useState({
    newEndDate: '',
    newMonthlyRent: 0,
    newDeposit: 0,
    notes: ''
  });

  // Termination form states
  const [terminationData, setTerminationData] = useState({
    terminationDate: '',
    reason: '',
    depositRefund: 0,
    notes: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang hiệu lực';
      case 'expired': return 'Hết hạn';
      case 'terminated': return 'Đã chấm dứt';
      case 'pending': return 'Chờ ký';
      default: return status;
    }
  };

  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'available': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTenantStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Đang thuê';
      case 'available': return 'Có thể thuê';
      case 'pending': return 'Chờ duyệt';
      default: return status;
    }
  };

  const getRoomStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Trống';
      case 'occupied': return 'Đã thuê';
      case 'maintenance': return 'Bảo trì';
      default: return status;
    }
  };

  const filteredContracts = filterStatus === 'all' 
    ? mockContracts 
    : mockContracts.filter(contract => contract.status === filterStatus);

  const filteredTenants = mockTenants.filter(tenant => 
    tenant.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    tenant.phone.includes(tenantSearch) ||
    (tenant.idCard && tenant.idCard.includes(tenantSearch))
  );

  const availableRooms = mockRooms.filter(room => room.status === 'available');

  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantSearch(tenant.name);
    setShowTenantDropdown(false);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setNewContract({
      ...newContract,
      customDeposit: room.deposit
    });
    setShowRoomDropdown(false);
  };

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setNewContract({
      contractNumber: contract.contractNumber,
      signedDate: contract.signedDate,
      startDate: contract.startDate,
      endDate: contract.endDate,
      customDeposit: contract.deposit,
      notes: ''
    });
    // Find and set tenant and room
    const tenant = mockTenants.find(t => t.name === contract.tenantName);
    const room = mockRooms.find(r => r.number === contract.room);
    setSelectedTenant(tenant || null);
    setSelectedRoom(room || null);
    setTenantSearch(contract.tenantName);
    setShowEditModal(true);
  };

  const handleDelete = (contract: Contract) => {
    setDeletingContract(contract);
    setShowDeleteModal(true);
  };

  const handleRenewal = (contract: Contract) => {
    setRenewingContract(contract);
    setRenewalData({
      newEndDate: '',
      newMonthlyRent: contract.monthlyRent,
      newDeposit: contract.deposit,
      notes: ''
    });
    setShowRenewalModal(true);
  };

  const handleTerminate = (contract: Contract) => {
    setTerminatingContract(contract);
    setTerminationData({
      terminationDate: '',
      reason: '',
      depositRefund: contract.deposit,
      notes: ''
    });
    setShowTerminateModal(true);
  };

  const resetForm = () => {
    setSelectedTenant(null);
    setSelectedRoom(null);
    setTenantSearch('');
    setNewContract({
      contractNumber: '',
      signedDate: '',
      startDate: '',
      endDate: '',
      customDeposit: 0,
      notes: ''
    });
  };

  // Updated function implementations
  const handleCreateContract = () => {
    if (!selectedTenant || !selectedRoom || !newContract.contractNumber || !newContract.startDate || !newContract.endDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log('Tạo hợp đồng:', {
      tenant: selectedTenant,
      room: selectedRoom,
      contract: newContract
    });

    setShowAddModal(false);
    resetForm();
    success({ title: 'Tạo hợp đồng thành công!' });
  };

  const handleUpdateContract = () => {
    if (!selectedTenant || !selectedRoom || !newContract.contractNumber || !newContract.startDate || !newContract.endDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log('Cập nhật hợp đồng:', editingContract?.id, {
      tenant: selectedTenant,
      room: selectedRoom,
      contract: newContract
    });

    setShowEditModal(false);
    setEditingContract(null);
    resetForm();
    success({ title: 'Cập nhật hợp đồng thành công!' });
  };

  const confirmDelete = () => {
    console.log('Xóa hợp đồng:', deletingContract?.id);
    setShowDeleteModal(false);
    setDeletingContract(null);
    success({ title: `Đã xóa hợp đồng ${deletingContract?.contractNumber} thành công!` });
  };

  const confirmRenewal = () => {
    if (!renewalData.newEndDate) {
      error({ title: 'Vui lòng chọn ngày kết thúc mới!' });
      return;
    }

    console.log('Gia hạn hợp đồng:', renewingContract?.id, renewalData);
    setShowRenewalModal(false);
    setRenewingContract(null);
    setRenewalData({
      newEndDate: '',
      newMonthlyRent: 0,
      newDeposit: 0,
      notes: ''
    });
    success({ title: `Đã gia hạn hợp đồng ${renewingContract?.contractNumber} thành công!` });
  };

  const confirmTermination = () => {
    if (!terminationData.terminationDate || !terminationData.reason) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log('Chấm dứt hợp đồng:', terminatingContract?.id, terminationData);
    setShowTerminateModal(false);
    setTerminatingContract(null);
    setTerminationData({
      terminationDate: '',
      reason: '',
      depositRefund: 0,
      notes: ''
    });
    warning({ title: `Đã chấm dứt hợp đồng ${terminatingContract?.contractNumber} thành công!` });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý hợp đồng</h1>
                <p className="text-gray-600">Quản lý hợp đồng thuê phòng trọ</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-file-add-line mr-2"></i>
                Tạo hợp đồng mới
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-file-check-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đang hiệu lực</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockContracts.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-file-warning-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sắp hết hạn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockContracts.filter(c => c.status === 'active' && getDaysUntilExpiry(c.endDate) <= 30).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-file-forbid-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hết hạn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockContracts.filter(c => c.status === 'expired').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-refresh-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã gia hạn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockContracts.filter(c => c.renewalCount > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hiệu lực</option>
                  <option value="pending">Chờ ký</option>
                  <option value="expired">Hết hạn</option>
                  <option value="terminated">Đã chấm dứt</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số hợp đồng, tên khách thuê..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Contracts Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hợp đồng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách thuê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiền thuê
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
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                            <div className="text-sm text-gray-500">
                              Ký: {new Date(contract.signedDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.tenantName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                          </div>
                          {contract.status === 'active' && getDaysUntilExpiry(contract.endDate) <= 30 && (
                            <div className="text-xs text-red-600">
                              Còn {getDaysUntilExpiry(contract.endDate)} ngày
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {contract.monthlyRent.toLocaleString('vi-VN')}đ/tháng
                          </div>
                          <div className="text-xs text-gray-500">
                            Cọc: {contract.deposit.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                          {contract.renewalCount > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              Đã gia hạn {contract.renewalCount} lần
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedContract(contract)}
                              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(contract)}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            {contract.status === 'active' && (
                              <button
                                onClick={() => handleRenewal(contract)}
                                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                title="Gia hạn hợp đồng"
                              >
                                <i className="ri-refresh-line"></i>
                              </button>
                            )}
                            {(contract.status === 'active' || contract.status === 'pending') && (
                              <button
                                onClick={() => handleTerminate(contract)}
                                className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                title="Chấm dứt hợp đồng"
                              >
                                <i className="ri-close-circle-line"></i>
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(contract)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Xóa hợp đồng"
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
      </div>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedContract(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hợp đồng</h2>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin hợp đồng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số hợp đồng:</span>
                      <span className="font-medium">{selectedContract.contractNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày ký:</span>
                      <span className="font-medium">{new Date(selectedContract.signedDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày bắt đầu:</span>
                      <span className="font-medium">{new Date(selectedContract.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày kết thúc:</span>
                      <span className="font-medium">{new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                        {getStatusText(selectedContract.status)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số lần gia hạn:</span>
                      <span className="font-medium">{selectedContract.renewalCount}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách thuê & phòng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên khách thuê:</span>
                      <span className="font-medium">{selectedContract.tenantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{selectedContract.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền thuê:</span>
                      <span className="font-medium text-green-600">
                        {selectedContract.monthlyRent.toLocaleString('vi-VN')}đ/tháng
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-medium text-blue-600">
                        {selectedContract.deposit.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá điện:</span>
                      <span className="font-medium">{selectedContract.electricityRate.toLocaleString('vi-VN')}đ/kWh</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá nước:</span>
                      <span className="font-medium">{selectedContract.waterRate.toLocaleString('vi-VN')}đ/m³</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => handleEdit(selectedContract)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Chỉnh sửa
                </button>
                {selectedContract.status === 'active' && (
                  <button 
                    onClick={() => handleRenewal(selectedContract)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Gia hạn
                  </button>
                )}
                {(selectedContract.status === 'active' || selectedContract.status === 'pending') && (
                  <button 
                    onClick={() => handleTerminate(selectedContract)}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                  >
                    Chấm dứt
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(selectedContract)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa hợp đồng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo hợp đồng mới</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Tenant & Room Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin khách thuê & phòng</h3>
                  
                  {/* Tenant Selection */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê *</label>
                    <input
                      type="text"
                      value={tenantSearch}
                      onChange={(e) => {
                        setTenantSearch(e.target.value);
                        setShowTenantDropdown(true);
                      }}
                      onFocus={() => setShowTenantDropdown(true)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Tìm kiếm khách thuê..."
                    />
                    {showTenantDropdown && filteredTenants.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredTenants.map((tenant) => (
                          <div
                            key={tenant.id}
                            onClick={() => handleTenantSelect(tenant)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.phone} • {tenant.email}</div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTenantStatusColor(tenant.status)}`}>
                                {getTenantStatusText(tenant.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Selection */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <button
                      onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left flex justify-between items-center"
                    >
                      <span>{selectedRoom ? `${selectedRoom.number} - ${selectedRoom.type}` : 'Chọn phòng'}</span>
                      <i className="ri-arrow-down-s-line"></i>
                    </button>
                    {showRoomDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {availableRooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium">{room.number} - {room.type}</div>
                            <div className="text-sm text-gray-500">
                              Tầng {room.floor} • {room.area}m² • {room.monthlyRent.toLocaleString('vi-VN')}đ/tháng
                            </div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                                {getRoomStatusText(room.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  {selectedRoom && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tiền thuê:</span>
                          <span className="font-medium">{selectedRoom.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền cọc:</span>
                          <span className="font-medium">{selectedRoom.deposit.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá điện:</span>
                          <span className="font-medium">{selectedRoom.electricityRate.toLocaleString('vi-VN')}đ/kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá nước:</span>
                          <span className="font-medium">{selectedRoom.waterRate.toLocaleString('vi-VN')}đ/m³</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                    <input
                      type="text"
                      value={newContract.contractNumber}
                      onChange={(e) => setNewContract({...newContract, contractNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="HD001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input
                      type="date"
                      value={newContract.signedDate}
                      onChange={(e) => setNewContract({...newContract, signedDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        value={newContract.startDate}
                        onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input
                        type="date"
                        value={newContract.endDate}
                        onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc tùy chỉnh (VNĐ)</label>
                    <input
                      type="number"
                      value={newContract.customDeposit}
                      onChange={(e) => setNewContract({...newContract, customDeposit: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Để trống sẽ dùng giá mặc định"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={newContract.notes}
                      onChange={(e) => setNewContract({...newContract, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Ghi chú thêm về hợp đồng..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateContract}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Tạo hợp đồng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Contract Modal */}
      {showEditModal && editingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa hợp đồng</h2>
              
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Tenant & Room Selection */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin khách thuê & phòng</h3>
                  
                  {/* Tenant Selection */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê *</label>
                    <input
                      type="text"
                      value={tenantSearch}
                      onChange={(e) => {
                        setTenantSearch(e.target.value);
                        setShowTenantDropdown(true);
                      }}
                      onFocus={() => setShowTenantDropdown(true)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Tìm kiếm khách thuê..."
                    />
                    {showTenantDropdown && filteredTenants.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredTenants.map((tenant) => (
                          <div
                            key={tenant.id}
                            onClick={() => handleTenantSelect(tenant)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.phone} • {tenant.email}</div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTenantStatusColor(tenant.status)}`}>
                                {getTenantStatusText(tenant.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Selection */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <button
                      onClick={() => setShowRoomDropdown(!showRoomDropdown)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left flex justify-between items-center"
                    >
                      <span>{selectedRoom ? `${selectedRoom.number} - ${selectedRoom.type}` : 'Chọn phòng'}</span>
                      <i className="ri-arrow-down-s-line"></i>
                    </button>
                    {showRoomDropdown && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {mockRooms.map((room) => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="font-medium">{room.number} - {room.type}</div>
                            <div className="text-sm text-gray-500">
                              Tầng {room.floor} • {room.area}m² • {room.monthlyRent.toLocaleString('vi-VN')}đ/tháng
                            </div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(room.status)}`}>
                                {getRoomStatusText(room.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
                  {selectedRoom && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tiền thuê:</span>
                          <span className="font-medium">{selectedRoom.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền cọc:</span>
                          <span className="font-medium">{selectedRoom.deposit.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá điện:</span>
                          <span className="font-medium">{selectedRoom.electricityRate.toLocaleString('vi-VN')}đ/kWh</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá nước:</span>
                          <span className="font-medium">{selectedRoom.waterRate.toLocaleString('vi-VN')}đ/m³</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                    <input
                      type="text"
                      value={newContract.contractNumber}
                      onChange={(e) => setNewContract({...newContract, contractNumber: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="HD001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input
                      type="date"
                      value={newContract.signedDate}
                      onChange={(e) => setNewContract({...newContract, signedDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        value={newContract.startDate}
                        onChange={(e) => setNewContract({...newContract, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input
                        type="date"
                        value={newContract.endDate}
                        onChange={(e) => setNewContract({...newContract, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc tùy chỉnh (VNĐ)</label>
                    <input
                      type="number"
                      value={newContract.customDeposit}
                      onChange={(e) => setNewContract({...newContract, customDeposit: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Để trống sẽ dùng giá mặc định"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={newContract.notes}
                      onChange={(e) => setNewContract({...newContract, notes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={3}
                      placeholder="Ghi chú thêm về hợp đồng..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingContract(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateContract}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mr-4">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa hợp đồng</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa hợp đồng <strong>{deletingContract.contractNumber}</strong> của khách thuê <strong>{deletingContract.tenantName}</strong> không?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tất cả dữ liệu liên quan đến hợp đồng này sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingContract(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa hợp đồng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewalModal && renewingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRenewalModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gia hạn hợp đồng</h2>
              
              {/* Contract Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin hợp đồng hiện tại</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Số hợp đồng:</span>
                    <span className="font-medium ml-2">{renewingContract.contractNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách thuê:</span>
                    <span className="font-medium ml-2">{renewingContract.tenantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{renewingContract.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hết hạn:</span>
                    <span className="font-medium ml-2">{new Date(renewingContract.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc mới *</label>
                  <input
                    type="date"
                    value={renewalData.newEndDate}
                    onChange={(e) => setRenewalData({...renewalData, newEndDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thuê mới (VNĐ)</label>
                    <input
                      type="number"
                      value={renewalData.newMonthlyRent}
                      onChange={(e) => setRenewalData({...renewalData, newMonthlyRent: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Để trống giữ nguyên giá cũ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc mới (VNĐ)</label>
                    <input
                      type="number"
                      value={renewalData.newDeposit}
                      onChange={(e) => setRenewalData({...renewalData, newDeposit: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Để trống giữ nguyên cọc cũ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú gia hạn</label>
                  <textarea
                    value={renewalData.notes}
                    onChange={(e) => setRenewalData({...renewalData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Ghi chú về việc gia hạn hợp đồng..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRenewalModal(false);
                      setRenewingContract(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={confirmRenewal}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Gia hạn hợp đồng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Termination Modal */}
      {showTerminateModal && terminatingContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowTerminateModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chấm dứt hợp đồng</h2>
              
              {/* Contract Info */}
              <div className="bg-orange-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin hợp đồng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Số hợp đồng:</span>
                    <span className="font-medium ml-2">{terminatingContract.contractNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Khách thuê:</span>
                    <span className="font-medium ml-2">{terminatingContract.tenantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{terminatingContract.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền cọc hiện tại:</span>
                    <span className="font-medium ml-2">{terminatingContract.deposit.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày chấm dứt *</label>
                  <input
                    type="date"
                    value={terminationData.terminationDate}
                    onChange={(e) => setTerminationData({...terminationData, terminationDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chấm dứt *</label>
                  <select
                    value={terminationData.reason}
                    onChange={(e) => setTerminationData({...terminationData, reason: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="">Chọn lý do</option>
                    <option value="tenant_request">Khách thuê yêu cầu</option>
                    <option value="contract_violation">Vi phạm hợp đồng</option>
                    <option value="late_payment">Chậm thanh toán</option>
                    <option value="property_damage">Làm hỏng tài sản</option>
                    <option value="owner_request">Chủ nhà yêu cầu</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền cọc hoàn trả (VNĐ)</label>
                  <input
                    type="number"
                    value={terminationData.depositRefund}
                    onChange={(e) => setTerminationData({...terminationData, depositRefund: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    max={terminatingContract.deposit}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tối đa: {terminatingContract.deposit.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú chi tiết</label>
                  <textarea
                    value={terminationData.notes}
                    onChange={(e) => setTerminationData({...terminationData, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Ghi chú chi tiết về việc chấm dứt hợp đồng..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTerminateModal(false);
                      setTerminatingContract(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={confirmTermination}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                  >
                    Chấm dứt hợp đồng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
