
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  room: string;
  block: string;
  checkInDate: string;
  duration: number;
  deposit: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bookingDate: string;
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
  block: string;
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

// Mock data
const mockServices: Service[] = [
  {
    id: '1',
    name: 'Điện',
    description: 'Dịch vụ điện theo số',
    price: 3500,
    unit: 'kWh',
    category: 'utilities',
    isActive: true,
    usageCount: 45
  },
  {
    id: '2',
    name: 'Nước',
    description: 'Dịch vụ nước theo người',
    price: 60000,
    unit: 'Người/Tháng',
    category: 'utilities',
    isActive: true,
    usageCount: 32
  },
  {
    id: '3',
    name: 'Internet 1',
    description: 'Dịch vụ internet chung cơ bản',
    price: 50000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 28
  },
  {
    id: '4',
    name: 'Internet 2',
    description: 'Dịch vụ internet riêng tốc độ cao',
    price: 100000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 15
  },
  {
    id: '5',
    name: 'Rác',
    description: 'Dịch vụ thu gom rác',
    price: 40000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 8
  },
  {
    id: '6',
    name: 'Gửi xe',
    description: 'Dịch vụ giữ xe, xếp xe',
    price: 100000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 8
  },
  {
    id: '7',
    name: 'Giặt sấy',
    description: 'Dịch vụ giặt sấy quần áo',
    price: 7500,
    unit: 'Kg',
    category: 'other',
    isActive: false,
    usageCount: 8
  }
];

const mockBookings: Booking[] = [
  {
    id: '1',
    customerName: 'Hoàng Minh Tuấn',
    phone: '0913456789',
    email: 'hoangminhtuan@email.com',
    room: 'A106',
    block: 'A',
    checkInDate: '2024-04-01',
    duration: 12,
    deposit: 2600000,
    totalAmount: 42000000,
    status: 'pending',
    bookingDate: '2024-03-15',
    notes: 'Khách yêu cầu phòng tầng 1',
  },
  {
    id: '2',
    customerName: 'Nguyễn Thị Thanh Hải',
    phone: '0987654321',
    email: 'nguyenthithanhhai@email.com',
    room: 'A207',
    block: 'A',
    checkInDate: '2024-03-25',
    duration: 6,
    deposit: 2600000,
    totalAmount: 30000000,
    status: 'confirmed',
    bookingDate: '2024-03-10',
  },
  {
    id: '3',
    customerName: 'Nguyễn Trọng Yến Linh',
    phone: '0901122334',
    email: 'nguyentrongyenlinh@email.com',
    room: 'A301',
    block: 'A',
    checkInDate: '2024-03-20',
    duration: 3,
    deposit: 2600000,
    totalAmount: 15000000,
    status: 'completed',
    bookingDate: '2024-03-05',
  },
  {
    id: '4',
    customerName: 'Đặng Huỳnh Đức',
    phone: '0934567890',
    email: 'dhduc@email.com',
    room: 'A406',
    block: 'A',
    checkInDate: '2024-04-15',
    duration: 12,
    deposit: 2500000,
    totalAmount: 43200000,
    status: 'cancelled',
    bookingDate: '2024-03-18',
    notes: 'Khách hủy do thay đổi kế hoạch',
  },
];

const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Hoàng Minh Tuấn',
    phone: '0913456789',
    email: 'hoangminhtuan@email.com',
    idCard: '',
    status: 'available',
  },
  {
    id: '2',
    name: 'Nguyễn Thị Thanh Hải',
    phone: '0987654321',
    email: 'nguyenthithanhhai@email.com',
    idCard: '',
    status: 'available',
  },
  {
    id: '3',
    name: 'Nguyễn Trọng Yến Linh',
    phone: '0901122334',
    email: 'nguyentrongyenlinh@email.com',
    idCard: '',
    status: 'available',
  },
  {
    id: '4',
    name: 'Đặng Huỳnh Đức',
    phone: '0934567890',
    email: 'dhduc@email.com',
    idCard: '',
    status: 'available',
  },
];

const mockRooms: Room[] = [
  {
    id: '1',
    number: 'A106',
    block: 'A',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'available',
    area: 25,
    type: 'Phòng thường'
  },
  {
    id: '2',
    number: 'Kiot B',
    block: 'A',
    monthlyRent: 2700000,
    deposit: 2700000,
    status: 'available',
    area: 25,
    type: 'Phòng kiot'
  },
  {
    id: '3',
    number: 'A301',
    block: 'A',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'available',
    area: 25,
    type: 'Phòng ban công'
  },
  {
    id: '4',
    number: 'A207',
    block: 'A',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'available',
    area: 26,
    type: 'Phòng góc'
  },
  {
    id: '5',
    number: 'A1',
    block: 'A',
    monthlyRent: 2600000,
    deposit: 2600000,
    status: 'available',
    area: 26,
    type: 'Phòng trệt'
  },
  {
    id: '6',
    number: 'A406',
    block: 'A',
    monthlyRent: 2500000,
    deposit: 2500000,
    status: 'available',
    area: 26,
    type: 'Phòng tầng thượng'
  }
];

export default function Bookings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    phone: '',
    email: '',
    room: '',
    block: '',
    checkInDate: '',
    duration: 6,
    deposit: 0,
    notes: ''
  });
  const selectedRoomForNewBooking = mockRooms.find(r => r.number === newBooking.room) || null;

  // Contract creation states
  const [contractBooking, setContractBooking] = useState<Booking | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [tenantSearch, setTenantSearch] = useState('');
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
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

  // Refund states
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  const [refundType, setRefundType] = useState<'quick' | 'full'>('quick');
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [contractBlock, setContractBlock] = useState<string>('');
  const [contractType, setContractType] = useState<string>('');

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => { },
  });

  const { success, error, warning, info } = useToast();

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'cancelled':
        return 'Đã hủy';
      case 'completed':
        return 'Hoàn thành';
      default:
        return status;
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

  const getDefaultServiceIds = () => {
    const byName = (n: string) => mockServices.find(s => s.name.toLowerCase() === n.toLowerCase() && s.isActive)?.id;
    const ids = [
      byName('Điện'),
      byName('Nước'),
      byName('Rác'),
      byName('Internet 1'), // chọn gói mặc định
      byName('Gửi xe'),
    ].filter(Boolean) as string[];
    return ids;
  };

  const filteredBookings =
    filterStatus === 'all'
      ? bookings
      : bookings.filter((booking) => booking.status === filterStatus);

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(tenantSearch.toLowerCase()) ||
    tenant.phone.includes(tenantSearch) ||
    (tenant.idCard && tenant.idCard.includes(tenantSearch))
  );


  const availableRooms = mockRooms.filter(room => room.status === 'available');

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

  const resetContractForm = () => {
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

  const handleCreateBooking = () => {
    if (!newBooking.customerName || !newBooking.phone || !newBooking.block || !newBooking.room || !newBooking.checkInDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo đặt phòng',
      message: `Bạn có chắc chắn muốn tạo đặt phòng cho "${newBooking.customerName}" không?`,
      type: 'info',
      onConfirm: () => {
        const booking: Booking = {
          id: Date.now().toString(),
          ...newBooking,
          totalAmount: newBooking.deposit * newBooking.duration,
          status: 'pending',
          bookingDate: new Date().toISOString().split('T')[0]
        };

        setBookings(prev => [booking, ...prev]);
        setShowAddModal(false);
        setNewBooking({
          customerName: '',
          phone: '',
          email: '',
          room: '',
          block: '',
          checkInDate: '',
          duration: 1,
          deposit: 0,
          notes: ''
        });
        setTenants(prev => {
          const exists = prev.some(t =>
            (booking.phone && t.phone === booking.phone) ||
            (booking.email && t.email === booking.email)
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: `t_${booking.id}`,
              name: booking.customerName,
              phone: booking.phone,
              email: booking.email,
              status: 'pending',
            },
          ];
        });
        success({ title: 'Tạo đặt phòng thành công!' });
      },
    });
  };

  const handleConfirmBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setConfirmDialog({
      show: true,
      title: 'Xác nhận đặt phòng',
      message: `Bạn có chắc chắn muốn xác nhận đặt phòng của "${booking?.customerName}" không?`,
      type: 'info',
      onConfirm: () => {
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'confirmed' } : b
        ));
        success({ title: `Xác nhận đặt phòng của ${booking?.customerName} thành công!` });
      },
    });
  };

  const handleRejectBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setConfirmDialog({
      show: true,
      title: 'Từ chối đặt phòng',
      message: `Bạn có chắc chắn muốn từ chối đặt phòng của "${booking?.customerName}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
        error({ title: `Đã từ chối đặt phòng của ${booking?.customerName}` });
      },
    });
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    setConfirmDialog({
      show: true,
      title: 'Hủy đặt phòng',
      message: `Bạn có chắc chắn muốn hủy đặt phòng của "${booking?.customerName}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setBookings(bookings.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
        error({ title: `Đã hủy đặt phòng của ${booking?.customerName}` });
      },
    });
  };

  const handleCreateContract = (booking: Booking) => {
    setContractBooking(booking);

    // Pre-fill contract data from booking
    const tenant =
      tenants.find(t =>
        (booking.phone && t.phone === booking.phone) ||
        (booking.email && t.email === booking.email) ||
        t.name === booking.customerName
      );

    const room = mockRooms.find(r => r.number === booking.room);
    if (room && !booking.block) {
      booking.block = room.block;
    }
    setContractBlock(booking.block || room?.block || '');
    setContractType(room?.type || '');  // luôn prefill loại phòng
    if (tenant) {
      setSelectedTenant(tenant);
      setTenantSearch(tenant.name);
    } else {
      // Prefill tenant tạm từ booking để hiển thị ngay
      const tempTenant: Tenant = {
        id: `temp_${booking.id}`,
        name: booking.customerName,
        phone: booking.phone,
        email: booking.email,
        status: 'pending',
      };
      setSelectedTenant(tempTenant);
      setTenantSearch(tempTenant.name);
    }

    if (room) {
      setSelectedRoom(room);
      setNewContract({
        contractNumber: `HD${Date.now().toString().slice(-6)}`,
        signedDate: new Date().toISOString().split('T')[0],
        startDate: booking.checkInDate,
        endDate: new Date(new Date(booking.checkInDate).setMonth(new Date(booking.checkInDate).getMonth() + booking.duration)).toISOString().split('T')[0],
        customDeposit: booking.deposit,
        notes: `Hợp đồng được tạo từ đặt phòng #${booking.id}`
      });
    }
    setSelectedServiceIds(getDefaultServiceIds());
    setShowContractModal(true);
  };

  const handleSubmitContract = () => {
    if (!selectedTenant || !selectedRoom || !newContract.contractNumber || !newContract.startDate || !newContract.endDate) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo hợp đồng',
      message: `Bạn có chắc chắn muốn tạo hợp đồng ${newContract.contractNumber} cho khách thuê "${selectedTenant.name}" không?`,
      type: 'info',
      onConfirm: () => {
        console.log('Tạo hợp đồng từ đặt phòng:', {
          booking: contractBooking,
          tenant: selectedTenant,
          room: selectedRoom,
          contract: newContract
        });

        // Update booking status to completed
        if (contractBooking) {
          setBookings(bookings.map(b =>
            b.id === contractBooking.id ? { ...b, status: 'completed' } : b
          ));
        }

        setShowContractModal(false);
        setContractBooking(null);
        resetContractForm();
        success({ title: `Tạo hợp đồng ${newContract.contractNumber} thành công!` });
      },
    });
  };

  // Refund functions
  const handleQuickRefund = (booking: Booking) => {
    setConfirmDialog({
      show: true,
      title: 'Hoàn cọc nhanh',
      message: `Bạn có chắc chắn muốn hoàn cọc nhanh ${booking.deposit.toLocaleString('vi-VN')}đ cho "${booking.customerName}" không?`,
      type: 'warning',
      onConfirm: () => {
        setBookings(bookings.map(b =>
          b.id === booking.id ? { ...b, status: 'cancelled' } : b
        ));
        success({
          title: `Hoàn cọc thành công!`,
          message: `Đã hoàn ${booking.deposit.toLocaleString('vi-VN')}đ cho ${booking.customerName}`
        });
      },
    });
  };

  const handleFullRefund = (booking: Booking) => {
    setRefundBooking(booking);
    setRefundAmount(booking.deposit);
    setRefundType('full');
    setRefundReason('');
    setRefundNotes('');
    setShowRefundModal(true);
  };

  const handleSubmitRefund = () => {
    if (!refundBooking || !refundReason) {
      error({ title: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận hoàn tiền',
      message: `Bạn có chắc chắn muốn hoàn ${refundAmount.toLocaleString('vi-VN')}đ cho "${refundBooking.customerName}" không?`,
      type: 'warning',
      onConfirm: () => {
        setBookings(bookings.map(b =>
          b.id === refundBooking.id ? { ...b, status: 'cancelled' } : b
        ));

        setShowRefundModal(false);
        setRefundBooking(null);

        success({
          title: `Hoàn tiền thành công!`,
          message: `Đã hoàn ${refundAmount.toLocaleString('vi-VN')}đ cho ${refundBooking.customerName}`
        });
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý đặt phòng</h1>
                <p className="text-gray-600">Quản lý đặt phòng và giữ chỗ</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-calendar-check-line mr-2"></i>
                Tạo đặt phòng
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter((b) => b.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter((b) => b.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-check-double-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter((b) => b.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-close-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {bookings.filter((b) => b.status === 'cancelled').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={/* state: filterBlock */ undefined}
                  onChange={() => {/* setFilterBlock */ }}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả dãy</option>
                  {[...new Set(mockRooms.map(r => r.block))].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
                <input type="date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dãy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày nhận phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thời hạn
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiền cọc
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
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                            <div className="text-sm text-gray-500">{booking.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.block}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{booking.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(booking.checkInDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.duration} tháng</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {booking.deposit.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              booking.status,
                            )}`}
                          >
                            {getStatusText(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConfirmBooking(booking.id)}
                                  className="text-green-600 hover:text-green-900 cursor-pointer"
                                  title="Xác nhận"
                                >
                                  <i className="ri-check-line"></i>
                                </button>
                                <button
                                  onClick={() => handleCancelBooking(booking.id)}
                                  className="text-red-600 hover:text-red-900 cursor-pointer"
                                  title="Hủy"
                                >
                                  <i className="ri-close-line"></i>
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => handleCreateContract(booking)}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                  title="Tạo hợp đồng"
                                >
                                  <i className="ri-file-text-line"></i>
                                </button>
                                <button
                                  onClick={() => handleQuickRefund(booking)}
                                  className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                  title="Hoàn cọc nhanh"
                                >
                                  <i className="ri-flashlight-line"></i>
                                </button>
                                <button
                                  onClick={() => handleFullRefund(booking)}
                                  className="text-purple-600 hover:text-purple-900 cursor-pointer"
                                  title="Hoàn tiền đầy đủ"
                                >
                                  <i className="ri-money-dollar-circle-line"></i>
                                </button>
                              </>
                            )}
                            {booking.status === 'pending' && booking.deposit > 0 && (
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleQuickRefund(booking)}
                                  className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                  title="Hoàn cọc nhanh"
                                >
                                  <i className="ri-flashlight-line"></i>
                                </button>
                                <button
                                  onClick={() => handleFullRefund(booking)}
                                  className="text-purple-600 hover:text-purple-900 cursor-pointer"
                                  title="Hoàn tiền đầy đủ"
                                >
                                  <i className="ri-money-dollar-circle-line"></i>
                                </button>
                              </div>
                            )}
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

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedBooking(null)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết đặt phòng</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium">{selectedBooking.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.email}</span>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt phòng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{selectedBooking.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dãy:</span>
                      <span className="font-medium">{selectedBooking.block}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày nhận phòng:</span>
                      <span className="font-medium">
                        {new Date(selectedBooking.checkInDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời hạn:</span>
                      <span className="font-medium">{selectedBooking.duration} tháng</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-medium text-green-600">
                        {selectedBooking.deposit.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirmBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        handleRejectBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-close-line mr-2"></i>
                      Từ chối
                    </button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        handleCreateContract(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-file-text-line mr-2"></i>
                      Tạo hợp đồng
                    </button>
                    <button
                      onClick={() => {
                        handleQuickRefund(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refund-line mr-2"></i>
                      Hoàn cọc nhanh
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-close-line mr-2"></i>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAddModal(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tạo đặt phòng mới</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Họ tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newBooking.customerName}
                        onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập họ tên khách hàng"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số điện thoại <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newBooking.phone}
                        onChange={(e) => setNewBooking({ ...newBooking, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newBooking.email}
                        onChange={(e) => setNewBooking({ ...newBooking, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Nhập email (tùy chọn)"
                      />
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đặt phòng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dãy phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newBooking.block}
                        onChange={(e) => {
                          const block = e.target.value;
                          // Khi đổi dãy: reset phòng & cọc
                          setNewBooking(prev => ({ ...prev, block, room: '', deposit: 0 }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                      >
                        <option value="">Chọn dãy</option>
                        {[...new Set(mockRooms.map(r => r.block))].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newBooking.room}
                        onChange={(e) => {
                          const value = e.target.value;
                          const room = mockRooms.find(r => r.number === value);
                          setNewBooking(prev => ({
                            ...prev,
                            room: value,
                            // auto fill tiền cọc theo phòng
                            deposit: room ? room.deposit : prev.deposit,
                            block: room ? room.block : prev.block,
                          }));
                        }}
                        disabled={!newBooking.block}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                      >
                        <option value="">{newBooking.block ? 'Chọn phòng theo dãy' : 'Chọn dãy trước'}</option>
                        {mockRooms
                          .filter(r => r.status === 'available' && (!!newBooking.block ? r.block === newBooking.block : true))
                          .map(r => (
                            <option key={r.id} value={r.number}>
                              {r.number}
                            </option>
                          ))}
                      </select>

                      {/* Hint thông tin phòng đã chọn */}
                      {selectedRoomForNewBooking && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div>Dãy: <span className="font-medium">{selectedRoomForNewBooking.block}</span></div>
                          <div>Loại phòng: <span className="font-medium">{selectedRoomForNewBooking.type}</span></div>
                          <div>Diện tích: <span className="font-medium">{selectedRoomForNewBooking.area} m²</span></div>
                          <div>Tiền thuê: <span className="font-medium">{selectedRoomForNewBooking.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span></div>
                          <div>Tiền cọc: <span className="font-medium">{selectedRoomForNewBooking.deposit.toLocaleString('vi-VN')}đ</span></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày nhận phòng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newBooking.checkInDate}
                        onChange={(e) => setNewBooking({ ...newBooking, checkInDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thời hạn thuê (tháng)
                      </label>
                      <input
                        type="number"
                        value={newBooking.duration}
                        onChange={(e) => setNewBooking({ ...newBooking, duration: parseInt(e.target.value) || 1 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="1"
                        max="24"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiền cọc (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={newBooking.deposit}
                        onChange={(e) => setNewBooking({ ...newBooking, deposit: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        step="100000"
                        placeholder="0"
                      />
                      {/* Gợi ý: sẽ tự điền khi chọn phòng, vẫn có thể sửa tay nếu cần */}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={newBooking.notes}
                    onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập ghi chú (tùy chọn)"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateBooking}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap cursor-pointer"
                  >
                    Tạo đặt phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractModal && contractBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowContractModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo hợp đồng từ đặt phòng</h2>

              {/* Booking Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium ml-2">{contractBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dãy:</span>
                    <span className="font-medium ml-2">{contractBooking.block}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{contractBooking.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày nhận phòng:</span>
                    <span className="font-medium ml-2">{new Date(contractBooking.checkInDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Thời hạn:</span>
                    <span className="font-medium ml-2">{contractBooking.duration} tháng</span>
                  </div>
                </div>
              </div>

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

                  {/* Room Selection (Dãy trước → Phòng → Loại tự điền) */}
                  <div className="space-y-4">
                    {/* Dãy */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                      <select
                        value={contractBlock}
                        onChange={(e) => {
                          const b = e.target.value;
                          setContractBlock(b);
                          setSelectedRoom(null);               // đổi dãy → bỏ phòng đang chọn
                          setContractType('');                 // loại sẽ tự điền lại theo phòng
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">Chọn dãy</option>
                        {[...new Set(mockRooms.map(r => r.block))].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Phòng */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                      <select
                        value={selectedRoom?.number || ''}
                        onChange={(e) => {
                          const number = e.target.value;
                          const room = mockRooms.find(r => r.number === number);
                          if (room) {
                            setSelectedRoom(room);
                            setContractBlock(room.block);            // đồng bộ dãy theo phòng
                            setContractType(room.type);              // tự điền loại theo phòng
                            setNewContract(prev => ({ ...prev, customDeposit: room.deposit }));
                          } else {
                            setSelectedRoom(null);
                          }
                        }}
                        disabled={!contractBlock}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-50"
                      >
                        <option value="">{contractBlock ? 'Chọn phòng' : 'Chọn dãy trước'}</option>
                        {mockRooms
                          .filter(r => r.status === 'available' && (!contractBlock || r.block === contractBlock))
                          .map(r => (
                            <option key={r.id} value={r.number}>
                              {r.number}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Loại phòng (read-only, tự điền) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                      <input
                        type="text"
                        value={selectedRoom?.type || contractType || ''}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                        placeholder="Tự điền theo phòng"
                      />
                    </div>
                  </div>




                  {/* Room Details */}
                  {selectedRoom && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Dãy:</span>
                          <span className="font-medium">{selectedRoom.block}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loại phòng:</span>
                          <span className="font-medium">{selectedRoom.type}</span>
                        </div>

                        <div className="flex justify-between">
                          <span>Tiền thuê:</span>
                          <span className="font-medium">{selectedRoom.monthlyRent.toLocaleString('vi-VN')}đ/tháng</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền cọc:</span>
                          <span className="font-medium">{selectedRoom.deposit.toLocaleString('vi-VN')}đ</span>
                        </div>

                        {/* Thay thế phần này: dùng mockServices thay vì room.electricityRate/waterRate */}
                        <div className="flex justify-between">
                          <span>Điện:</span>
                          <span className="font-medium">
                            {mockServices.find(s => s.name === 'Điện')?.price.toLocaleString('vi-VN')}đ/kWh
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nước:</span>
                          <span className="font-medium">
                            {mockServices.find(s => s.name === 'Nước')?.price.toLocaleString('vi-VN')}đ/Người/Tháng
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Internet:</span>
                          <span className="font-medium">
                            {(() => {
                              const internet = mockServices.find(s => selectedServiceIds.includes(s.id) && s.name.toLowerCase().startsWith('internet'));
                              return internet ? `${internet.price.toLocaleString('vi-VN')}đ/${internet.unit}` : '—';
                            })()}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span>Rác:</span>
                          <span className="font-medium">
                            {mockServices.find(s => s.name === 'Rác')?.price.toLocaleString('vi-VN')}đ/Phòng/Tháng
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gửi xe:</span>
                          <span className="font-medium">
                            {mockServices.find(s => s.name === 'Gửi xe')?.price.toLocaleString('vi-VN')}đ/Phòng/Tháng
                          </span>
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
                      onChange={(e) => setNewContract({ ...newContract, contractNumber: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="HD001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input
                      type="date"
                      value={newContract.signedDate}
                      onChange={(e) => setNewContract({ ...newContract, signedDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input
                        type="date"
                        value={newContract.startDate}
                        onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input
                        type="date"
                        value={newContract.endDate}
                        onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc tùy chỉnh (VNĐ)</label>
                    <input
                      type="number"
                      value={newContract.customDeposit}
                      onChange={(e) => setNewContract({ ...newContract, customDeposit: parseInt(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Để trống sẽ dùng giá mặc định"
                    />
                  </div>
                  <div>
                    <h4 className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ áp dụng</h4>

                    <div className="space-y-2">
                      {/* 1) Utilities: Điện, Nước */}
                      {mockServices
                        .filter(s => s.isActive && (s.name === 'Điện' || s.name === 'Nước'))
                        .map(s => (
                          <label key={s.id} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedServiceIds.includes(s.id)}
                              onChange={(e) => {
                                setSelectedServiceIds(prev => e.target.checked
                                  ? [...prev, s.id]
                                  : prev.filter(id => id !== s.id)
                                );
                              }}
                            />
                            <div className="text-sm">
                              <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                              {s.description && <div className="text-gray-500">{s.description}</div>}
                            </div>
                          </label>
                        ))
                      }

                      {/* 2) Internet: chọn 1 trong 2 (radio group) */}
                      <div className="p-2 rounded border border-gray-200">
                        <div className="font-medium text-sm mb-1">Internet (chọn 1)</div>
                        {mockServices
                          .filter(s => s.isActive && s.name.toLowerCase().startsWith('internet'))
                          .map(s => (
                            <label key={s.id} className="flex items-start gap-3 py-1">
                              <input
                                type="radio"
                                name="internet-plan"
                                checked={selectedServiceIds.includes(s.id)}
                                onChange={() => {
                                  // bỏ hết Internet X trước khi set cái mới
                                  const internetIds = mockServices
                                    .filter(x => x.name.toLowerCase().startsWith('internet'))
                                    .map(x => x.id);
                                  setSelectedServiceIds(prev => [...prev.filter(id => !internetIds.includes(id)), s.id]);
                                }}
                              />
                              <div className="text-sm">
                                <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                                {s.description && <div className="text-gray-500">{s.description}</div>}
                              </div>
                            </label>
                          ))
                        }
                      </div>

                      {/* 3) Services khác: Rác, Gửi xe, ... */}
                      {mockServices
                        .filter(s =>
                          s.isActive &&
                          s.name !== 'Điện' &&
                          s.name !== 'Nước' &&
                          !s.name.toLowerCase().startsWith('internet')
                        )
                        .map(s => (
                          <label key={s.id} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedServiceIds.includes(s.id)}
                              onChange={(e) => {
                                setSelectedServiceIds(prev => e.target.checked
                                  ? [...prev, s.id]
                                  : prev.filter(id => id !== s.id)
                                );
                              }}
                            />
                            <div className="text-sm">
                              <div className="font-medium">{s.name} <span className="text-gray-500">• {s.price.toLocaleString('vi-VN')}đ/{s.unit}</span></div>
                              {s.description && <div className="text-gray-500">{s.description}</div>}
                            </div>
                          </label>
                        ))
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea
                      value={newContract.notes}
                      onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })}
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
                    setShowContractModal(false);
                    setContractBooking(null);
                    resetContractForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitContract}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Tạo hợp đồng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && refundBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRefundModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Hoàn tiền đầy đủ</h2>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* Booking Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium ml-2">{refundBooking.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{refundBooking.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền cọc gốc:</span>
                    <span className="font-medium ml-2 text-green-600">{refundBooking.deposit.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span className="font-medium ml-2">{new Date(refundBooking.bookingDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                {contractBooking && selectedRoom && selectedRoom.number !== contractBooking.room && (
                  <div className="mt-3 text-xs">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      <i className="ri-information-line mr-1"></i>
                      Bạn đang chọn phòng <b className="mx-1">{selectedRoom.number}</b> khác với phòng đã đặt <b className="mx-1">{contractBooking.room}</b>.
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Refund Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền hoàn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    max={refundBooking.deposit}
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tối đa: {refundBooking.deposit.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                {/* Refund Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hoàn tiền <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                  >
                    <option value="">Chọn lý do</option>
                    <option value="customer_cancel">Khách hàng hủy đặt phòng</option>
                    <option value="room_unavailable">Phòng không còn trống</option>
                    <option value="maintenance_issue">Sự cố bảo trì</option>
                    <option value="policy_violation">Vi phạm chính sách</option>
                    <option value="duplicate_booking">Đặt phòng trùng lặp</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thêm
                  </label>
                  <textarea
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập ghi chú thêm về việc hoàn tiền..."
                  />
                </div>

                {/* Refund Summary */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tóm tắt hoàn tiền</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tiền cọc gốc:</span>
                      <span className="font-medium">{refundBooking.deposit.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số tiền hoàn:</span>
                      <span className="font-medium text-green-600">{refundAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Số tiền giữ lại:</span>
                      <span className="font-medium text-red-600">{(refundBooking.deposit - refundAmount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmitRefund}
                  className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap"
                >
                  Xác nhận hoàn tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, show: false });
        }}
        onClose={() => setConfirmDialog({ ...confirmDialog, show: false })}
      />
    </div>
  );
}
