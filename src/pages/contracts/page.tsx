import React, { useMemo, useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

// =================== Types ===================
interface Contract {
  id: string;
  contractNumber: string;
  tenantName: string;
  room: string;
  building: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  signedDate: string;
  renewalCount: number;
  notes?: string;
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
  building: string;
  monthlyRent: number;
  deposit: number;
  status: 'available' | 'occupied' | 'maintenance';
  area: number;
  type: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'services' | 'utilities' | 'other';
  isActive: boolean;
  usageCount: number;
}

// =================== Mock Data ===================
const mockContracts: Contract[] = [
  // 1) ACTIVE - chưa tới tháng cuối (không hiện nút gia hạn, không "sắp hết hạn")
  {
    id: '1',
    contractNumber: 'HD001',
    tenantName: 'Nguyễn Văn Hưng',
    room: 'A101',
    building: 'Dãy A',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'active',
    signedDate: '2025-01-01',
    renewalCount: 2,
  },
  // 2) ACTIVE - tháng cuối => hiện nút Gia hạn + rơi vào "Sắp hết hạn"
  {
    id: '2',
    contractNumber: 'HD002',
    tenantName: 'Đỗ Thùy Dung',
    room: 'A202',
    building: 'Dãy A',
    startDate: '2025-06-01',
    endDate: '2025-11-30',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'active',
    signedDate: '2025-06-01',
    renewalCount: 1,
  },
  // 3) EXPIRED - đã hết hạn
  {
    id: '3',
    contractNumber: 'HD003',
    tenantName: 'Võ Thị Ngọc Châu',
    room: 'A105',
    building: 'Dãy A',
    startDate: '2025-04-15',
    endDate: '2025-10-15',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'expired',
    signedDate: '2025-04-10',
    renewalCount: 0,
  },
  // 4) TERMINATED - chấm dứt trước hạn
  {
    id: '4',
    contractNumber: 'HD004',
    tenantName: 'Phan Tất Duy',
    room: 'A301',
    building: 'Dãy A',
    startDate: '2025-03-01',
    endDate: '2025-08-10',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'terminated',
    signedDate: '2025-03-01',
    renewalCount: 0,
  },
];

const mockTenants: Tenant[] = [
  { id: '1', name: 'Hoàng Minh Tuấn', phone: '0913456789', email: 'hoangminhtuan@email.com', idCard: '', status: 'available' },
  { id: '2', name: 'Nguyễn Thị Thanh Hải', phone: '0987654321', email: 'nguyenthithanhhai@email.com', idCard: '', status: 'available' },
  { id: '3', name: 'Nguyễn Trọng Yến Linh', phone: '0901122334', email: 'nguyentrongyenlinh@email.com', idCard: '', status: 'available' },
  { id: '4', name: 'Đặng Huỳnh Đức', phone: '0934567890', email: 'dhduc@email.com', idCard: '', status: 'available' },
];

const mockRooms: Room[] = [
  { id: '1', number: 'A106', building: 'Dãy A', monthlyRent: 2600000, deposit: 2600000, status: 'available', area: 25, type: 'Phòng thường' },
  { id: '2', number: 'Kiot B', building: 'Dãy B', monthlyRent: 2700000, deposit: 2700000, status: 'available', area: 25, type: 'Phòng kiot' },
  { id: '3', number: 'A301', building: 'Dãy A', monthlyRent: 2600000, deposit: 2600000, status: 'available', area: 25, type: 'Phòng ban công' },
  { id: '4', number: 'A207', building: 'Dãy A', monthlyRent: 2600000, deposit: 2600000, status: 'available', area: 26, type: 'Phòng góc' },
  { id: '5', number: 'A1', building: 'Dãy A', monthlyRent: 2600000, deposit: 2600000, status: 'available', area: 26, type: 'Phòng trệt' },
  { id: '6', number: 'A406', building: 'Dãy A', monthlyRent: 2500000, deposit: 2500000, status: 'available', area: 26, type: 'Phòng tầng thượng' },
];

const mockServices: Service[] = [
  { id: '1', name: 'Điện', description: 'Dịch vụ điện theo số', price: 3500, unit: 'kWh', category: 'utilities', isActive: true, usageCount: 45 },
  { id: '2', name: 'Nước', description: 'Dịch vụ nước theo người', price: 60000, unit: 'Người/Tháng', category: 'utilities', isActive: true, usageCount: 32 },
  { id: '3', name: 'Internet 1', description: 'Dịch vụ internet chung cơ bản', price: 50000, unit: 'Phòng/Tháng', category: 'services', isActive: true, usageCount: 28 },
  { id: '4', name: 'Internet 2', description: 'Dịch vụ internet riêng tốc độ cao', price: 100000, unit: 'Phòng/Tháng', category: 'services', isActive: true, usageCount: 15 },
  { id: '5', name: 'Rác', description: 'Dịch vụ thu gom rác', price: 40000, unit: 'Phòng/Tháng', category: 'services', isActive: true, usageCount: 8 },
  { id: '6', name: 'Gửi xe', description: 'Dịch vụ giữ xe, xếp xe', price: 100000, unit: 'Phòng/Tháng', category: 'services', isActive: true, usageCount: 8 },
  { id: '7', name: 'Giặt sấy', description: 'Dịch vụ giặt sấy quần áo', price: 7500, unit: 'Kg', category: 'other', isActive: false, usageCount: 8 },
];

// =================== Helpers ===================
const getStatusColor = (status: Contract['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'expired': return 'bg-red-100 text-red-800';
    case 'terminated': return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Contract['status']) => {
  switch (status) {
    case 'active': return 'Đang hiệu lực';
    case 'expired': return 'Hết hạn';
    case 'terminated': return 'Đã chấm dứt';
    default: return 'Không xác định';
  }
};

const getTenantStatusColor = (status: Tenant['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'available': return 'bg-blue-100 text-blue-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getTenantStatusText = (status: Tenant['status']) => {
  switch (status) {
    case 'active': return 'Đang thuê';
    case 'available': return 'Có thể thuê';
    case 'pending': return 'Chờ duyệt';
    default: return 'Không xác định';
  }
};

const getRoomStatusColor = (status: Room['status']) => {
  switch (status) {
    case 'available': return 'bg-green-100 text-green-800';
    case 'occupied': return 'bg-red-100 text-red-800';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoomStatusText = (status: Room['status']) => {
  switch (status) {
    case 'available': return 'Trống';
    case 'occupied': return 'Đã thuê';
    case 'maintenance': return 'Bảo trì';
    default: return 'Không xác định';
  }
};

const getDaysUntilExpiry = (endDate: string) => {
  const today = new Date();
  const expiry = new Date(endDate);
  const todayAt0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffTime = expiry.getTime() - todayAt0.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isInFinalMonth = (endDate: string) => {
  const end = new Date(endDate);
  const now = new Date();
  return end.getFullYear() === now.getFullYear() && end.getMonth() === now.getMonth();
};

const getComputedStatus = (c: Contract): Contract['status'] => {
  if (c.status === 'terminated') return 'terminated';
  const today = new Date();
  const todayAt0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(c.endDate);
  if (end < todayAt0) return 'expired';
  return 'active';
};

// =================== Component ===================
export default function Contracts() {
  const { success, error, warning } = useToast();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Contract['status']>('all');
  const [filterBuilding, setFilterBuilding] = useState<'all' | string>('all');
  const [keyword, setKeyword] = useState('');

  // master lists
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);

  // create modal state
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [tenantSearch, setTenantSearch] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [selectedBuildingForCreate, setSelectedBuildingForCreate] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [newContract, setNewContract] = useState({
    contractNumber: '',
    signedDate: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    customDeposit: 0,
    notes: '',
  });

  // edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editForm, setEditForm] = useState({
    contractNumber: '',
    signedDate: '',
    startDate: '',
    endDate: '',
    customDeposit: 0,
    notes: '',
  });

  // renewal modal state
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [renewalData, setRenewalData] = useState({
    newEndDate: '',
    newMonthlyRent: 0,
    newDeposit: 0,
    notes: '',
  });

  // termination modal state
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminatingContract, setTerminatingContract] = useState<Contract | null>(null);
  const [terminationData, setTerminationData] = useState({
    terminationDate: '',
    reason: '',
    depositRefund: 0,
    notes: '',
  });

  // confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean; title: string; message: string; type: 'danger' | 'warning' | 'info'; onConfirm: () => void;
  }>({ show: false, title: '', message: '', type: 'info', onConfirm: () => { } });

  // ====== derived lists ======
  const computedContracts = useMemo(() => contracts.map(c => ({ ...c, status: getComputedStatus(c) } as Contract)), [contracts]);

  const filteredContracts = useMemo(() => {
    let base = filterStatus === 'all' ? computedContracts : computedContracts.filter(c => c.status === filterStatus);
    if (filterBuilding !== 'all') {
      base = base.filter(c => c.building === filterBuilding);
    }
    const q = keyword.trim().toLowerCase();
    if (!q) return base;
    return base.filter(c =>
      c.contractNumber.toLowerCase().includes(q) ||
      c.tenantName.toLowerCase().includes(q) ||
      c.room.toLowerCase().includes(q) ||
      c.building.toLowerCase().includes(q)
    );
  }, [computedContracts, filterStatus, keyword, filterBuilding]);

  const filteredTenants = useMemo(() => {
    const q = tenantSearch.trim().toLowerCase();
    if (!q) return mockTenants;
    return mockTenants.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      (!!t.idCard && t.idCard.includes(q))
    );
  }, [tenantSearch]);

  const buildings = useMemo(() => Array.from(new Set(mockRooms.map(r => r.building))).sort(), []);
  const availableRooms = useMemo(() => mockRooms.filter(r => r.status === 'available'), []);
  const availableRoomsBySelectedBuilding = useMemo(
    () => availableRooms.filter(r => !selectedBuildingForCreate || r.building === selectedBuildingForCreate),
    [availableRooms, selectedBuildingForCreate]
  );

  // ====== selection handlers ======
  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setTenantSearch(tenant.name);
    setShowTenantDropdown(false);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setNewContract(prev => ({ ...prev, customDeposit: room.deposit }));
    setShowRoomDropdown(false);
  };

  const getDefaultServiceIds = () => {
    const byName = (n: string) => mockServices.find(s => s.name.toLowerCase() === n.toLowerCase() && s.isActive)?.id;
    return [byName('Điện'), byName('Nước'), byName('Rác'), byName('Internet 1'), byName('Gửi xe')].filter(Boolean) as string[];
  };

  const resetContractForm = () => {
    setSelectedTenant(null);
    setSelectedRoom(null);
    setSelectedBuildingForCreate('');
    setTenantSearch('');
    setSelectedServiceIds([]);
    setNewContract({ contractNumber: '', signedDate: new Date().toISOString().split('T')[0], startDate: '', endDate: '', customDeposit: 0, notes: '' });
  };

  // ====== edit ======
  const openEdit = (contract: Contract) => {
    setEditingContract(contract);
    setEditForm({
      contractNumber: contract.contractNumber,
      signedDate: contract.signedDate,
      startDate: contract.startDate,
      endDate: contract.endDate,
      customDeposit: contract.deposit,
      notes: contract.notes || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateContract = () => {
    if (!editingContract || !editForm.contractNumber || !editForm.startDate || !editForm.endDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    const start = new Date(editForm.startDate);
    const end = new Date(editForm.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      error({ title: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Xác nhận cập nhật',
      message: `Cập nhật hợp đồng ${editForm.contractNumber}?`,
      type: 'info',
      onConfirm: () => {
        setContracts(prev => prev.map(c => c.id === editingContract.id ? {
          ...c,
          contractNumber: editForm.contractNumber,
          signedDate: editForm.signedDate,
          startDate: editForm.startDate,
          endDate: editForm.endDate,
          deposit: editForm.customDeposit || c.deposit,
          notes: editForm.notes,
        } : c));
        setShowEditModal(false);
        setEditingContract(null);
        success({ title: 'Cập nhật hợp đồng thành công!' });
      },
    });
  };

  // ====== renew ======
  const openRenewal = (contract: Contract) => {
    setRenewingContract(contract);
    setRenewalData({ newEndDate: '', newMonthlyRent: contract.monthlyRent, newDeposit: contract.deposit, notes: '' });
    setShowRenewalModal(true);
  };

  const confirmRenewal = () => {
    if (!renewalData.newEndDate || !renewingContract) {
      error({ title: 'Vui lòng chọn ngày kết thúc mới!' });
      return;
    }
    const oldEnd = new Date(renewingContract.endDate);
    const newEnd = new Date(renewalData.newEndDate);
    if (isNaN(newEnd.getTime()) || newEnd <= oldEnd) {
      error({ title: 'Ngày kết thúc mới phải lớn hơn ngày hết hạn hiện tại.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Xác nhận gia hạn',
      message: `Gia hạn hợp đồng ${renewingContract.contractNumber} đến ${new Date(renewalData.newEndDate).toLocaleDateString('vi-VN')}?`,
      type: 'info',
      onConfirm: () => {
        setContracts(prev => prev.map(c => c.id === renewingContract.id ? {
          ...c,
          endDate: renewalData.newEndDate,
          monthlyRent: renewalData.newMonthlyRent || c.monthlyRent,
          deposit: renewalData.newDeposit || c.deposit,
          renewalCount: (c.renewalCount || 0) + 1,
        } : c));
        setShowRenewalModal(false);
        setRenewingContract(null);
        setRenewalData({ newEndDate: '', newMonthlyRent: 0, newDeposit: 0, notes: '' });
        success({ title: `Đã gia hạn hợp đồng ${renewingContract.contractNumber}!` });
      },
    });
  };

  // ====== terminate ======
  const openTerminate = (contract: Contract) => {
    setTerminatingContract(contract);
    setTerminationData({ terminationDate: '', reason: '', depositRefund: contract.deposit, notes: '' });
    setShowTerminateModal(true);
  };

  const confirmTermination = () => {
    if (!terminatingContract || !terminationData.terminationDate || !terminationData.reason) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    const s = new Date(terminatingContract.startDate);
    const e = new Date(terminatingContract.endDate);
    const t = new Date(terminationData.terminationDate);
    if (isNaN(t.getTime())) {
      error({ title: 'Ngày chấm dứt không hợp lệ.' });
      return;
    }
    if (t < s) {
      error({ title: 'Ngày chấm dứt không thể trước ngày bắt đầu hợp đồng.' });
      return;
    }
    if (terminationData.depositRefund > terminatingContract.deposit) {
      error({ title: 'Hoàn trả cọc không thể vượt quá tiền cọc hiện tại.' });
      return;
    }
    if (terminationData.depositRefund < 0) {
      error({ title: 'Số tiền hoàn trả không hợp lệ.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận chấm dứt',
      message: `Chấm dứt hợp đồng ${terminatingContract.contractNumber} vào ngày ${new Date(terminationData.terminationDate).toLocaleDateString('vi-VN')}?`,
      type: 'warning',
      onConfirm: () => {
        setContracts(prev => prev.map(c => c.id === terminatingContract.id ? {
          ...c,
          status: 'terminated',
          endDate: terminationData.terminationDate,
        } : c));
        setShowTerminateModal(false);
        setTerminatingContract(null);
        setTerminationData({ terminationDate: '', reason: '', depositRefund: 0, notes: '' });
        warning({ title: `Đã chấm dứt hợp đồng ${terminatingContract.contractNumber}!` });
      },
    });
  };

  // ====== create ======
  const openCreateContract = () => {
    setSelectedServiceIds(getDefaultServiceIds());
    setShowContractModal(true);
  };

  const handleSubmitContract = () => {
    if (!selectedTenant || !selectedRoom || !newContract.contractNumber || !newContract.startDate || !newContract.endDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    const start = new Date(newContract.startDate);
    const end = new Date(newContract.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      error({ title: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo hợp đồng',
      message: `Tạo hợp đồng ${newContract.contractNumber} cho khách thuê "${selectedTenant.name}"?`,
      type: 'info',
      onConfirm: () => {
        const created: Contract = {
          id: Date.now().toString(),
          contractNumber: newContract.contractNumber,
          tenantName: selectedTenant.name,
          room: selectedRoom.number,
          building: selectedRoom.building,
          startDate: newContract.startDate,
          endDate: newContract.endDate,
          monthlyRent: selectedRoom.monthlyRent,
          deposit: newContract.customDeposit || selectedRoom.deposit,
          status: 'active',
          signedDate: newContract.signedDate || new Date().toISOString().split('T')[0],
          renewalCount: 0,
          notes: newContract.notes,
        };
        setContracts(prev => [created, ...prev]);
        setShowContractModal(false);
        resetContractForm();
        success({ title: `Tạo hợp đồng ${created.contractNumber} thành công!` });
      },
    });
  };

  const openDelete = (contract: Contract) => {
    setConfirmDialog({
      show: true,
      title: 'Xác nhận xóa hợp đồng',
      message: `Bạn chắc chắn muốn xóa hợp đồng ${contract.contractNumber} của "${contract.tenantName}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setContracts(prev => prev.filter(c => c.id !== contract.id));
        if (selectedContract?.id === contract.id) setSelectedContract(null);
        success({ title: `Đã xóa hợp đồng ${contract.contractNumber} thành công!` });
      },
    });
  };

  // ====== stats (không bị ảnh hưởng bởi filter/search) ======
  const activeCount = useMemo(() => computedContracts.filter(c => c.status === 'active').length, [computedContracts]);
  const nearlyExpiredCount = useMemo(() => computedContracts.filter(c => c.status === 'active' && getDaysUntilExpiry(c.endDate) <= 30).length, [computedContracts]);
  const expiredCount = useMemo(() => computedContracts.filter(c => c.status === 'expired').length, [computedContracts]);
  const renewedCount = useMemo(() => computedContracts.filter(c => c.renewalCount > 0).length, [computedContracts]);

  // =================== Render ===================
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
              <button onClick={openCreateContract} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer">
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
                    <p className="text-2xl font-bold text-gray-900">{activeCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{nearlyExpiredCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{renewedCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="border border-gray-300 rounded-lg px-3 py-2 pr-8">
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hiệu lực</option>
                  <option value="expired">Hết hạn</option>
                  <option value="terminated">Đã chấm dứt</option>
                </select>
                <select value={filterBuilding} onChange={(e) => setFilterBuilding(e.target.value as any)} className="border border-gray-300 rounded-lg px-3 py-2 pr-8">
                  <option value="all">Tất cả dãy</option>
                  {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hợp đồng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách thuê</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dãy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời hạn</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiền thuê</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.contractNumber}</div>
                            <div className="text-sm text-gray-500">Ký: {new Date(contract.signedDate).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.tenantName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.building}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(contract.startDate).toLocaleDateString('vi-VN')} - {new Date(contract.endDate).toLocaleDateString('vi-VN')}</div>
                          {contract.status === 'active' && getDaysUntilExpiry(contract.endDate) <= 30 && (
                            <div className="text-xs text-red-600">Còn {getDaysUntilExpiry(contract.endDate)} ngày</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">{contract.monthlyRent.toLocaleString('vi-VN')}đ/tháng</div>
                          <div className="text-xs text-gray-500">Cọc: {contract.deposit.toLocaleString('vi-VN')}đ</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                            {getStatusText(contract.status)}
                          </span>
                          {contract.renewalCount > 0 && (
                            <div className="text-xs text-blue-600 mt-1">Đã gia hạn {contract.renewalCount} lần</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => setSelectedContract(contract)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer" title="Xem chi tiết">
                              <i className="ri-eye-line"></i>
                            </button>
                            <button onClick={() => openEdit(contract)} className="text-green-600 hover:text-green-900 cursor-pointer" title="Chỉnh sửa">
                              <i className="ri-edit-line"></i>
                            </button>
                            {contract.status === 'active' && isInFinalMonth(contract.endDate) && (
                              <button onClick={() => openRenewal(contract)} className="text-blue-600 hover:text-blue-900 cursor-pointer" title="Gia hạn hợp đồng">
                                <i className="ri-refresh-line"></i>
                              </button>
                            )}
                            <button onClick={() => openDelete(contract)} className="text-red-600 hover:text-red-900 cursor-pointer" title="Xóa hợp đồng">
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
      {selectedContract ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedContract(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hợp đồng</h2>
                <button onClick={() => setSelectedContract(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin hợp đồng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Số hợp đồng:</span><span className="font-medium">{selectedContract.contractNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Ngày ký:</span><span className="font-medium">{new Date(selectedContract.signedDate).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Ngày bắt đầu:</span><span className="font-medium">{new Date(selectedContract.startDate).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Ngày kết thúc:</span><span className="font-medium">{new Date(selectedContract.endDate).toLocaleDateString('vi-VN')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>{getStatusText(selectedContract.status)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Số lần gia hạn:</span><span className="font-medium">{selectedContract.renewalCount}</span></div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách thuê & phòng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Tên khách thuê:</span><span className="font-medium">{selectedContract.tenantName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Dãy:</span><span className="font-medium">{selectedContract.building}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Phòng:</span><span className="font-medium">{selectedContract.room}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tiền thuê:</span><span className="font-medium text-green-600">{selectedContract.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Tiền cọc:</span><span className="font-medium text-blue-600">{selectedContract.deposit.toLocaleString('vi-VN')}đ</span></div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => openEdit(selectedContract)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Chỉnh sửa</button>

                {selectedContract.status === 'active' && isInFinalMonth(selectedContract.endDate) && (
                  <button onClick={() => openRenewal(selectedContract)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap">Gia hạn</button>
                )}

                {selectedContract.status === 'active' && new Date(selectedContract.endDate) > new Date() && (
                  <button onClick={() => openTerminate(selectedContract)} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer whitespace-nowrap">Chấm dứt</button>
                )}

                <button onClick={() => openDelete(selectedContract)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap">Xóa hợp đồng</button>
                <button onClick={() => setSelectedContract(null)} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create Contract Modal */}
      {showContractModal ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowContractModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo hợp đồng</h2>

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
                      onChange={(e) => { setTenantSearch(e.target.value); setShowTenantDropdown(true); }}
                      onFocus={() => setShowTenantDropdown(true)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Tìm kiếm khách thuê..."
                    />
                    {showTenantDropdown && filteredTenants.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredTenants.map((tenant: Tenant) => (
                          <div key={tenant.id} onClick={() => handleTenantSelect(tenant)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-gray-500">{tenant.phone} • {tenant.email}</div>
                            <div className="flex items-center mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTenantStatusColor(tenant.status)}`}>{getTenantStatusText(tenant.status)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Room Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Building */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                      <select
                        value={selectedBuildingForCreate}
                        onChange={(e) => {
                          setSelectedBuildingForCreate(e.target.value);
                          setSelectedRoom(null); // đổi dãy thì reset phòng
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      >
                        <option value="">Chọn dãy</option>
                        {buildings.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Room (filtered by building) */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                      <button
                        disabled={!selectedBuildingForCreate}
                        onClick={() => selectedBuildingForCreate && setShowRoomDropdown(!showRoomDropdown)}
                        className={`w-full border rounded-lg px-3 py-2 text-left flex justify-between items-center ${selectedBuildingForCreate ? 'border-gray-300' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        title={!selectedBuildingForCreate ? 'Hãy chọn dãy trước' : 'Chọn phòng'}
                      >
                        <span>
                          {selectedRoom
                            ? `${selectedRoom.number} - ${selectedRoom.type}`
                            : selectedBuildingForCreate
                              ? 'Chọn phòng'
                              : 'Chọn dãy trước'}
                        </span>
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      {showRoomDropdown && selectedBuildingForCreate && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                          {availableRoomsBySelectedBuilding.length === 0 && (
                            <div className="p-3 text-sm text-gray-500">Không có phòng trống trong {selectedBuildingForCreate}</div>
                          )}
                          {availableRoomsBySelectedBuilding.map((room: Room) => (
                            <div
                              key={room.id}
                              onClick={() => {
                                handleRoomSelect(room);
                                setShowRoomDropdown(false);
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                              <div className="font-medium">
                                {room.number} - {room.type}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">{room.building}</div>
                              <div className="text-sm text-gray-500">
                                {room.area}m² • {room.monthlyRent.toLocaleString('vi-VN')}đ/tháng
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
                  </div>

                  {/* Room Details */}
                  {selectedRoom && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Dãy:</span><span className="font-medium">{selectedRoom.building}</span></div>
                        <div className="flex justify-between"><span>Tiền thuê:</span><span className="font-medium">{selectedRoom.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span></div>
                        <div className="flex justify-between"><span>Tiền cọc:</span><span className="font-medium">{selectedRoom.deposit.toLocaleString('vi-VN')}đ</span></div>
                        <div className="flex justify-between"><span>Điện:</span><span className="font-medium">{mockServices.find(s => s.name === 'Điện')?.price.toLocaleString('vi-VN')}đ/kWh</span></div>
                        <div className="flex justify-between"><span>Nước:</span><span className="font-medium">{mockServices.find(s => s.name === 'Nước')?.price.toLocaleString('vi-VN')}đ/Người/Tháng</span></div>
                        <div className="flex justify-between"><span>Internet:</span><span className="font-medium">{(() => { const internet = mockServices.find(s => selectedServiceIds.includes(s.id) && s.name.toLowerCase().startsWith('internet')); return internet ? `${internet.price.toLocaleString('vi-VN')}đ/${internet.unit}` : '—'; })()}</span></div>
                        <div className="flex justify-between"><span>Rác:</span><span className="font-medium">{mockServices.find(s => s.name === 'Rác')?.price.toLocaleString('vi-VN')}đ/Phòng/Tháng</span></div>
                        <div className="flex justify-between"><span>Gửi xe:</span><span className="font-medium">{mockServices.find(s => s.name === 'Gửi xe')?.price.toLocaleString('vi-VN')}đ/Phòng/Tháng</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                    <input type="text" value={newContract.contractNumber} onChange={(e) => setNewContract({ ...newContract, contractNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="HD001" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input type="date" value={newContract.signedDate} onChange={(e) => setNewContract({ ...newContract, signedDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input type="date" value={newContract.startDate} onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input type="date" value={newContract.endDate} onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc tùy chỉnh (VNĐ)</label>
                    <input type="number" value={newContract.customDeposit} onChange={(e) => setNewContract({ ...newContract, customDeposit: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Để trống sẽ dùng giá mặc định" />
                  </div>

                  <div>
                    <h4 className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ áp dụng</h4>
                    <div className="space-y-2">
                      {/* Utilities: Điện, Nước */}
                      {mockServices.filter(s => s.isActive && (s.name === 'Điện' || s.name === 'Nước')).map(s => (
                        <label key={s.id} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                          <input type="checkbox" className="mt-1" checked={selectedServiceIds.includes(s.id)} onChange={(e) => setSelectedServiceIds(prev => e.target.checked ? [...prev, s.id] : prev.filter((id: string) => id !== s.id))} />
                          <div className="text-sm">
                            <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                            {s.description && <div className="text-gray-500">{s.description}</div>}
                          </div>
                        </label>
                      ))}

                      {/* Internet: chọn 1 trong 2 */}
                      <div className="p-2 rounded border border-gray-200">
                        <div className="font-medium text-sm mb-1">Internet (chọn 1)</div>
                        {mockServices.filter(s => s.isActive && s.name.toLowerCase().startsWith('internet')).map(s => (
                          <label key={s.id} className="flex items-start gap-3 py-1">
                            <input type="radio" name="internet-plan" checked={selectedServiceIds.includes(s.id)} onChange={() => {
                              const internetIds = mockServices.filter(x => x.name.toLowerCase().startsWith('internet')).map(x => x.id);
                              setSelectedServiceIds(prev => [...prev.filter((id: string) => !internetIds.includes(id)), s.id]);
                            }} />
                            <div className="text-sm">
                              <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                              {s.description && <div className="text-gray-500">{s.description}</div>}
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Services khác */}
                      {mockServices.filter(s => s.isActive && s.name !== 'Điện' && s.name !== 'Nước' && !s.name.toLowerCase().startsWith('internet')).map(s => (
                        <label key={s.id} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                          <input type="checkbox" className="mt-1" checked={selectedServiceIds.includes(s.id)} onChange={(e) => setSelectedServiceIds(prev => e.target.checked ? [...prev, s.id] : prev.filter((id: string) => id !== s.id))} />
                          <div className="text-sm">
                            <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                            {s.description && <div className="text-gray-500">{s.description}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea value={newContract.notes} onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú thêm về hợp đồng..." />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => { setShowContractModal(false); resetContractForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                <button onClick={handleSubmitContract} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Tạo hợp đồng</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Contract Modal */}
      {showEditModal && editingContract ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa hợp đồng</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                  <input type="text" value={editForm.contractNumber} onChange={(e) => setEditForm({ ...editForm, contractNumber: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký</label>
                    <input type="date" value={editForm.signedDate} onChange={(e) => setEditForm({ ...editForm, signedDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                    <input type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                    <input type="date" value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ)</label>
                  <input type="number" value={editForm.customDeposit} onChange={(e) => setEditForm({ ...editForm, customDeposit: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => { setShowEditModal(false); setEditingContract(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                <button onClick={handleUpdateContract} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Cập nhật</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Renewal Modal */}
      {showRenewalModal && renewingContract ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRenewalModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Gia hạn hợp đồng</h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-sm">
                <div>Hợp đồng: <strong>{renewingContract.contractNumber}</strong></div>
                <div>Khách thuê: <strong>{renewingContract.tenantName}</strong></div>
                <div>Hết hạn hiện tại: <strong>{new Date(renewingContract.endDate).toLocaleDateString('vi-VN')}</strong></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc mới *</label>
                  <input type="date" value={renewalData.newEndDate} onChange={(e) => setRenewalData({ ...renewalData, newEndDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thuê mới (VNĐ)</label>
                    <input type="number" value={renewalData.newMonthlyRent} onChange={(e) => setRenewalData({ ...renewalData, newMonthlyRent: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc mới (VNĐ)</label>
                    <input type="number" value={renewalData.newDeposit} onChange={(e) => setRenewalData({ ...renewalData, newDeposit: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú gia hạn</label>
                  <textarea value={renewalData.notes} onChange={(e) => setRenewalData({ ...renewalData, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => { setShowRenewalModal(false); setRenewingContract(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                <button onClick={confirmRenewal} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">Gia hạn</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Termination Modal */}
      {showTerminateModal && terminatingContract ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowTerminateModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chấm dứt hợp đồng</h2>

              <div className="bg-orange-50 p-4 rounded-lg mb-6 text-sm">
                <div>Hợp đồng: <strong>{terminatingContract.contractNumber}</strong></div>
                <div>Khách thuê: <strong>{terminatingContract.tenantName}</strong></div>
                <div>Tiền cọc hiện tại: <strong>{terminatingContract.deposit.toLocaleString('vi-VN')}đ</strong></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày chấm dứt *</label>
                  <input type="date" value={terminationData.terminationDate} onChange={(e) => setTerminationData({ ...terminationData, terminationDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lý do *</label>
                  <select value={terminationData.reason} onChange={(e) => setTerminationData({ ...terminationData, reason: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
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
                  <input type="number" value={terminationData.depositRefund} onChange={(e) => setTerminationData({ ...terminationData, depositRefund: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" max={terminatingContract.deposit} />
                  <p className="text-xs text-gray-500 mt-1">Tối đa: {terminatingContract.deposit.toLocaleString('vi-VN')}đ</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={terminationData.notes} onChange={(e) => setTerminationData({ ...terminationData, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => { setShowTerminateModal(false); setTerminatingContract(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                <button onClick={confirmTermination} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer">Chấm dứt</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, show: false }); }}
        onClose={() => setConfirmDialog({ ...confirmDialog, show: false })}
      />
    </div>
  );
}
