
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface Payment {
  id: string;
  tenantName: string;
  room: string;
  month: string;
  rentAmount: number;
  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  serviceAmount: number;
  additionalCharges?: AdditionalCharge[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  paymentMethod?: string;
}

interface NewInvoice {
  tenantName: string;
  room: string;
  month: string;
  rentAmount: number;
  electricityUsage: number;
  waterUsage: number;
  serviceAmount: number;
  additionalCharges: AdditionalCharge[];
  dueDate: string;
  notes: string;
}

interface ElectricReading {
  id: string;
  building: string;
  room: string;
  tenantName: string;
  oldReading: number;
  newReading: number;
  usage: number;
}

interface BulkInvoiceRoom {
  id: string;
  room: string;
  tenantName: string;
  rentAmount: number;
  electricityUsage: number;
  waterUsage: number;
  building: string;
  selected: boolean;
}

interface CommonCharge {
  id: string;
  description: string;
  amount: number;
  selected: boolean;
}

const mockPayments: Payment[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    room: 'P101',
    month: '2024-03',
    rentAmount: 3500000,
    electricityUsage: 120,
    electricityAmount: 420000,
    waterUsage: 8,
    waterAmount: 200000,
    serviceAmount: 175000,
    additionalCharges: [
      { id: '1', description: 'Sửa chữa điều hòa', amount: 300000, date: '2024-03-10' },
      { id: '2', description: 'Phí vệ sinh thêm', amount: 100000, date: '2024-03-15' }
    ],
    totalAmount: 4695000,
    paidAmount: 4695000,
    remainingAmount: 0,
    dueDate: '2024-03-05',
    paidDate: '2024-03-03',
    status: 'paid',
    paymentMethod: 'Chuyển khoản'
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    room: 'P202',
    month: '2024-03',
    rentAmount: 3800000,
    electricityUsage: 95,
    electricityAmount: 332500,
    waterUsage: 6,
    waterAmount: 150000,
    serviceAmount: 150000,
    additionalCharges: [
      { id: '3', description: 'Phí gửi xe thêm', amount: 50000, date: '2024-03-12' }
    ],
    totalAmount: 4482500,
    paidAmount: 3800000,
    remainingAmount: 682500,
    dueDate: '2024-03-05',
    status: 'partial'
  },
  {
    id: '3',
    tenantName: 'Phạm Thị D',
    room: 'P301',
    month: '2024-03',
    rentAmount: 4800000,
    electricityUsage: 140,
    electricityAmount: 490000,
    waterUsage: 10,
    waterAmount: 250000,
    serviceAmount: 200000,
    totalAmount: 5740000,
    paidAmount: 0,
    remainingAmount: 5740000,
    dueDate: '2024-03-05',
    status: 'overdue'
  },
  {
    id: '4',
    tenantName: 'Lê Văn C',
    room: 'P105',
    month: '2024-04',
    rentAmount: 3000000,
    electricityUsage: 85,
    electricityAmount: 297500,
    waterUsage: 5,
    waterAmount: 125000,
    serviceAmount: 100000,
    additionalCharges: [
      { id: '4', description: 'Thay bóng đèn', amount: 80000, date: '2024-04-02' }
    ],
    totalAmount: 3602500,
    paidAmount: 0,
    remainingAmount: 3602500,
    dueDate: '2024-04-05',
    status: 'pending'
  }
];

const mockElectricReadings: ElectricReading[] = [
  {
    id: '1',
    building: 'Dãy A',
    room: 'P101',
    tenantName: 'Nguyễn Văn A',
    oldReading: 150,
    newReading: 270,
    usage: 120
  },
  {
    id: '2',
    building: 'Dãy A',
    room: 'P102',
    tenantName: 'Trần Thị B',
    oldReading: 200,
    newReading: 295,
    usage: 95
  },
  {
    id: '3',
    building: 'Dãy B',
    room: 'P201',
    tenantName: 'Phạm Thị D',
    oldReading: 180,
    newReading: 320,
    usage: 140
  },
  {
    id: '4',
    building: 'Dãy B',
    room: 'P202',
    tenantName: 'Lê Văn C',
    oldReading: 120,
    newReading: 205,
    usage: 85
  },
  {
    id: '5',
    building: 'Dãy C',
    room: 'P301',
    tenantName: 'Hoàng Thị E',
    oldReading: 160,
    newReading: 240,
    usage: 80
  },
  {
    id: '6',
    building: 'Dãy C',
    room: 'P302',
    tenantName: 'Vũ Văn F',
    oldReading: 190,
    newReading: 285,
    usage: 95
  }
];

const mockBulkRooms: BulkInvoiceRoom[] = [
  { id: '1', room: 'P101', tenantName: 'Nguyễn Văn A', rentAmount: 3500000, electricityUsage: 120, waterUsage: 8, building: 'Dãy A', selected: false },
  { id: '2', room: 'P102', tenantName: 'Trần Thị B', rentAmount: 3800000, electricityUsage: 95, waterUsage: 6, building: 'Dãy A', selected: false },
  { id: '3', room: 'P103', tenantName: 'Lê Văn C', rentAmount: 3000000, electricityUsage: 85, waterUsage: 5, building: 'Dãy A', selected: false },
  { id: '4', room: 'P201', tenantName: 'Phạm Thị D', rentAmount: 4800000, electricityUsage: 140, waterUsage: 10, building: 'Dãy B', selected: false },
  { id: '5', room: 'P202', tenantName: 'Hoàng Thị E', rentAmount: 4200000, electricityUsage: 110, waterUsage: 7, building: 'Dãy B', selected: false },
  { id: '6', room: 'P203', tenantName: 'Vũ Văn F', rentAmount: 5000000, electricityUsage: 130, waterUsage: 9, building: 'Dãy B', selected: false },
  { id: '7', room: 'P301', tenantName: 'Nguyễn Thị G', rentAmount: 4500000, electricityUsage: 115, waterUsage: 8, building: 'Dãy C', selected: false },
  { id: '8', room: 'P302', tenantName: 'Trần Văn H', rentAmount: 4000000, electricityUsage: 100, waterUsage: 6, building: 'Dãy C', selected: false }
];

const mockCommonCharges: CommonCharge[] = [
  { id: '1', description: 'Phí vệ sinh chung', amount: 50000, selected: false },
  { id: '2', description: 'Phí bảo trì thang máy', amount: 30000, selected: false },
  { id: '3', description: 'Phí an ninh', amount: 100000, selected: false },
  { id: '4', description: 'Phí internet chung', amount: 80000, selected: false },
  { id: '5', description: 'Phí quản lý chung cư', amount: 150000, selected: false }
];

const mockTenants = [
  { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', room: 'P101' },
  { id: '2', name: 'Trần Thị B', phone: '0901234568', room: 'P102' },
  { id: '3', name: 'Lê Văn C', phone: '0901234569', room: 'P103' },
  { id: '4', name: 'Phạm Thị D', phone: '0901234570', room: 'P201' },
  { id: '5', name: 'Hoàng Thị E', phone: '0901234571', room: 'P202' },
  { id: '6', name: 'Vũ Văn F', phone: '0901234572', room: 'P301' }
];

const mockRooms = [
  { id: '1', number: 'P101', rent: 3500000, electricityRate: 3500, waterRate: 25000, serviceCharge: 150000 },
  { id: '2', number: 'P102', rent: 3800000, electricityRate: 3500, waterRate: 25000, serviceCharge: 150000 },
  { id: '3', number: 'P103', rent: 3000000, electricityRate: 3500, waterRate: 25000, serviceCharge: 100000 },
  { id: '4', number: 'P201', rent: 4800000, electricityRate: 3500, waterRate: 25000, serviceCharge: 200000 },
  { id: '5', number: 'P202', rent: 4200000, electricityRate: 3500, waterRate: 25000, serviceCharge: 175000 },
  { id: '6', number: 'P301', rent: 5000000, electricityRate: 3500, waterRate: 25000, serviceCharge: 200000 }
];

export default function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showElectricModal, setShowElectricModal] = useState(false);
  const [showAdditionalChargesModal, setShowAdditionalChargesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [electricReadings, setElectricReadings] = useState<ElectricReading[]>(mockElectricReadings);
  const [editingReading, setEditingReading] = useState<string | null>(null);
  const [selectedPaymentForCharges, setSelectedPaymentForCharges] = useState<Payment | null>(null);
  const [newCharge, setNewCharge] = useState({ description: '', amount: 0 });
  const [selectedPaymentForPayment, setSelectedPaymentForPayment] = useState<Payment | null>(null);
  const [selectedPaymentForNotification, setSelectedPaymentForNotification] = useState<Payment | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);
  const [searchTenant, setSearchTenant] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [tempCharge, setTempCharge] = useState({ description: '', amount: 0 });

  // New invoice states
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    tenantName: '',
    room: '',
    month: new Date().toISOString().slice(0, 7),
    rentAmount: 0,
    electricityUsage: 0,
    waterUsage: 0,
    serviceAmount: 0,
    additionalCharges: [],
    dueDate: '',
    notes: ''
  });

  // Bulk invoice states
  const [bulkRooms, setBulkRooms] = useState<BulkInvoiceRoom[]>(mockBulkRooms);
  const [commonCharges, setCommonCharges] = useState<CommonCharge[]>(mockCommonCharges);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [bulkSettings, setBulkSettings] = useState({
    month: new Date().toISOString().slice(0, 7),
    electricityRate: 3500,
    waterRate: 25000,
    serviceAmount: 150000,
    dueDate: ''
  });

  // Payment modal states
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'cash',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Notification modal states
  const [notificationData, setNotificationData] = useState({
    title: '',
    content: '',
    type: 'payment' as const,
    sendMethod: 'app' as 'app' | 'sms' | 'both'
  });

  const { success, error, warning } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'partial': return 'Thanh toán một phần';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return status;
    }
  };

  const showConfirm = (action: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onConfirm();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleUpdateReading = (id: string, field: 'oldReading' | 'newReading', value: number) => {
    setElectricReadings(prev => prev.map(reading => {
      if (reading.id === id) {
        const updated = { ...reading, [field]: value };
        updated.usage = updated.newReading - updated.oldReading;
        return updated;
      }
      return reading;
    }));
  };

  const handleSaveReading = (id: string) => {
    setEditingReading(null);
    success({
      title: 'Lưu chỉ số điện thành công',
      message: 'Đã cập nhật chỉ số điện cho phòng'
    });
  };

  const handleAddAdditionalCharge = (payment: Payment) => {
    setSelectedPaymentForCharges(payment);
    setShowAdditionalChargesModal(true);
  };

  const handleSaveAdditionalCharge = () => {
    if (!newCharge.description || newCharge.amount <= 0) {
      error({
        title: 'Lỗi thêm phát sinh',
        message: 'Vui lòng điền đầy đủ mô tả và số tiền phát sinh!'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận thêm chi phí phát sinh',
      message: `Bạn có chắc chắn muốn thêm chi phí phát sinh "${newCharge.description}" với số tiền ${newCharge.amount.toLocaleString('vi-VN')}đ không?`,
      onConfirm: () => {
        success({
          title: 'Thêm phát sinh thành công',
          message: `Đã thêm ${newCharge.description} - ${newCharge.amount.toLocaleString('vi-VN')}đ`
        });
        setShowAdditionalChargesModal(false);
        setNewCharge({ description: '', amount: 0 });
        setSelectedPaymentForCharges(null);
      }
    });
  };

  const handleDeleteAdditionalCharge = (chargeId: string) => {
    showConfirm({
      title: 'Xác nhận xóa phát sinh',
      message: 'Bạn có chắc chắn muốn xóa khoản phát sinh này không? Hành động này không thể hoàn tác.',
      onConfirm: () => {
        success({
          title: 'Xóa phát sinh thành công',
          message: 'Đã xóa khoản phát sinh khỏi hóa đơn'
        });
      },
      type: 'danger'
    });
  };

  const handleCollectPayment = (payment: Payment) => {
    setSelectedPaymentForPayment(payment);
    setPaymentData({
      amount: payment.remainingAmount,
      method: 'cash',
      note: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowPaymentModal(true);
  };

  const handleSavePayment = () => {
    if (paymentData.amount <= 0) {
      error({
        title: 'Lỗi thu tiền',
        message: 'Số tiền thu phải lớn hơn 0'
      });
      return;
    }

    if (selectedPaymentForPayment && paymentData.amount > selectedPaymentForPayment.remainingAmount) {
      error({
        title: 'Lỗi thu tiền',
        message: 'Số tiền thu không được vượt quá số tiền còn lại'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận thu tiền',
      message: `Bạn có chắc chắn muốn thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ "${selectedPaymentForPayment?.tenantName}" không?`,
      onConfirm: () => {
        success({
          title: 'Thu tiền thành công',
          message: `Đã thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ ${selectedPaymentForPayment?.tenantName}`
        });

        setShowPaymentModal(false);
        setSelectedPaymentForPayment(null);
        setPaymentData({
          amount: 0,
          method: 'cash',
          note: '',
          date: new Date().toISOString().split('T')[0]
        });
      }
    });
  };

  const handleSendPaymentNotification = (payment: Payment) => {
    setSelectedPaymentForNotification(payment);
    setNotificationData({
      title: `Nhắc nhở thanh toán - Phòng ${payment.room}`,
      content: `Kính gửi ${payment.tenantName},\n\nBạn có hóa đơn tháng ${new Date(payment.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })} chưa thanh toán với số tiền ${payment.remainingAmount.toLocaleString('vi-VN')}đ.\n\nHạn thanh toán: ${new Date(payment.dueDate).toLocaleDateString('vi-VN')}\n\nVui lòng thanh toán sớm để tránh phát sinh phí phạt.\n\nTrân trọng,\nBan quản lý`,
      type: 'payment',
      sendMethod: 'app'
    });
    setShowNotificationModal(true);
  };

  const handleSendNotification = () => {
    if (!notificationData.title || !notificationData.content) {
      error({
        title: 'Lỗi gửi thông báo',
        message: 'Vui lòng điền đầy đủ tiêu đề và nội dung'
      });
      return;
    }

    const methodText = notificationData.sendMethod === 'app' ? 'qua ứng dụng' : 
                     notificationData.sendMethod === 'sms' ? 'qua SMS' : 'qua ứng dụng và SMS';

    showConfirm({
      title: 'Xác nhận gửi thông báo',
      message: `Bạn có chắc chắn muốn gửi thông báo ${methodText} cho "${selectedPaymentForNotification?.tenantName}" không?`,
      onConfirm: () => {
        success({
          title: 'Gửi thông báo thành công',
          message: `Đã gửi thông báo ${methodText} cho ${selectedPaymentForNotification?.tenantName}`
        });

        setShowNotificationModal(false);
        setSelectedPaymentForNotification(null);
        setNotificationData({
          title: '',
          content: '',
          type: 'payment',
          sendMethod: 'app'
        });
      }
    });
  };

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailModal(true);
  };

  const handleSelectRoom = (roomId: string) => {
    setBulkRooms(prev => prev.map(room => 
      room.id === roomId ? { ...room, selected: !room.selected } : room
    ));
  };

  const handleSelectAllRooms = () => {
    const filteredRooms = getFilteredRooms();
    const allFilteredSelected = filteredRooms.every(room => room.selected);
    setBulkRooms(prev => prev.map(room => {
      if (selectedBuilding === 'all' || room.building === selectedBuilding) {
        return { ...room, selected: !allFilteredSelected };
      }
      return room;
    }));
  };

  const handleSelectCommonCharge = (chargeId: string) => {
    setCommonCharges(prev => prev.map(charge => 
      charge.id === chargeId ? { ...charge, selected: !charge.selected } : charge
    ));
  };

  const getFilteredRooms = () => {
    if (selectedBuilding === 'all') {
      return bulkRooms;
    }
    return bulkRooms.filter(room => room.building === selectedBuilding);
  };

  const getBuildings = () => {
    const buildings = [...new Set(bulkRooms.map(room => room.building))];
    return buildings.sort();
  };

  const calculateBulkTotal = () => {
    const selectedRooms = bulkRooms.filter(room => room.selected);
    const selectedCharges = commonCharges.filter(charge => charge.selected);
    
    return selectedRooms.reduce((total, room) => {
      const electricityAmount = room.electricityUsage * bulkSettings.electricityRate;
      const waterAmount = room.waterUsage * bulkSettings.waterRate;
      const chargesAmount = selectedCharges.reduce((sum, charge) => sum + charge.amount, 0);
      
      return total + room.rentAmount + electricityAmount + waterAmount + bulkSettings.serviceAmount + chargesAmount;
    }, 0);
  };

  const handleCreateBulkInvoices = () => {
    const selectedRooms = bulkRooms.filter(room => room.selected);
    
    if (selectedRooms.length === 0) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn ít nhất một phòng để tạo hóa đơn!'
      });
      return;
    }

    if (!bulkSettings.dueDate) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn hạn thanh toán!'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận tạo hóa đơn hàng loạt',
      message: `Bạn có chắc chắn muốn tạo ${selectedRooms.length} hóa đơn hàng loạt không?`,
      onConfirm: () => {
        const invoiceCount = selectedRooms.length;
        const totalAmount = calculateBulkTotal();
        
        success({
          title: 'Tạo hóa đơn hàng loạt thành công',
          message: `Đã tạo thành công ${invoiceCount} hóa đơn với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}đ`
        });
        setShowBulkModal(false);
        
        // Reset selections
        setBulkRooms(prev => prev.map(room => ({ ...room, selected: false })));
        setCommonCharges(prev => prev.map(charge => ({ ...charge, selected: false })));
      }
    });
  };

  const handleCreateNewInvoice = () => {
    if (!newInvoice.tenantName || !newInvoice.room || !newInvoice.dueDate) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận tạo hóa đơn',
      message: `Bạn có chắc chắn muốn tạo hóa đơn cho "${newInvoice.tenantName}" - Phòng ${newInvoice.room} không?`,
      onConfirm: () => {
        const totalAmount = calculateNewInvoiceTotal();

        success({
          title: 'Tạo hóa đơn thành công',
          message: `Hóa đơn cho ${newInvoice.tenantName} - ${newInvoice.room} đã được tạo với tổng tiền ${totalAmount.toLocaleString('vi-VN')}đ`
        });

        setShowAddModal(false);
        setNewInvoice({
          tenantName: '',
          room: '',
          month: new Date().toISOString().slice(0, 7),
          rentAmount: 0,
          electricityUsage: 0,
          waterUsage: 0,
          serviceAmount: 0,
          additionalCharges: [],
          dueDate: '',
          notes: ''
        });
        setSearchTenant('');
      }
    });
  };

  const calculateNewInvoiceTotal = () => {
    const electricityAmount = newInvoice.electricityUsage * 3500;
    const waterAmount = newInvoice.waterUsage * 25000;
    const additionalAmount = newInvoice.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    return newInvoice.rentAmount + electricityAmount + waterAmount + newInvoice.serviceAmount + additionalAmount;
  };

  const filteredTenants = mockTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTenant.toLowerCase()) ||
    tenant.phone.includes(searchTenant) ||
    tenant.room.toLowerCase().includes(searchTenant.toLowerCase())
  );

  const filteredPayments = filterStatus === 'all' 
    ? mockPayments 
    : mockPayments.filter(payment => payment.status === filterStatus);

  const totalRevenue = mockPayments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const totalPending = mockPayments.reduce((sum, payment) => sum + payment.remainingAmount, 0);

  const handleUpdatePayment = (paymentId: string, newStatus: string) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    const statusText = newStatus === 'paid' ? 'đã thanh toán' :
                      newStatus === 'overdue' ? 'quá hạn' :
                      newStatus === 'cancelled' ? 'đã hủy' : newStatus;
    
    showConfirm({
      title: 'Xác nhận cập nhật trạng thái',
      message: `Bạn có chắc chắn muốn cập nhật trạng thái hóa đơn của "${payment?.tenantName}" thành "${statusText}" không?`,
      onConfirm: () => {
        success({
          title: 'Cập nhật trạng thái thành công',
          message: `Đã cập nhật trạng thái hóa đơn của ${payment?.tenantName} thành ${statusText}`
        });
      }
    });
  };

  const handleDeletePayment = (paymentId: string) => {
    const payment = mockPayments.find(p => p.id === paymentId);
    
    showConfirm({
      title: 'Xác nhận xóa hóa đơn',
      message: `Bạn có chắc chắn muốn xóa hóa đơn của "${payment?.tenantName}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        success({
          title: 'Xóa hóa đơn thành công',
          message: `Đã xóa hóa đơn của ${payment?.tenantName} thành công`
        });
      },
      type: 'danger'
    });
  };

  const handleSelectTenant = (tenant: any) => {
    const room = mockRooms.find(r => r.number === tenant.room);
    setNewInvoice({
      ...newInvoice,
      tenantName: tenant.name,
      room: tenant.room,
      rentAmount: room?.rent || 0,
      serviceAmount: room?.serviceCharge || 0
    });
    setSearchTenant(`${tenant.name} - ${tenant.room}`);
    setShowTenantDropdown(false);
  };

  const handleAddTempCharge = () => {
    if (!tempCharge.description || tempCharge.amount <= 0) {
      error({
        title: 'Lỗi thêm chi phí',
        message: 'Vui lòng điền đầy đủ mô tả và số tiền!'
      });
      return;
    }

    const newChargeItem: AdditionalCharge = {
      id: Date.now().toString(),
      description: tempCharge.description,
      amount: tempCharge.amount,
      date: new Date().toISOString().split('T')[0]
    };

    setNewInvoice({
      ...newInvoice,
      additionalCharges: [...newInvoice.additionalCharges, newChargeItem]
    });

    setTempCharge({ description: '', amount: 0 });
    
    success({
      title: 'Thêm chi phí thành công',
      message: `Đã thêm ${newChargeItem.description} - ${newChargeItem.amount.toLocaleString('vi-VN')}đ`
    });
  };

  const handleRemoveTempCharge = (chargeId: string) => {
    setNewInvoice({
      ...newInvoice,
      additionalCharges: newInvoice.additionalCharges.filter(charge => charge.id !== chargeId)
    });
    
    success({
      title: 'Xóa chi phí thành công',
      message: 'Đã xóa chi phí phát sinh khỏi hóa đơn'
    });
  };

  const handleBulkPaymentAction = (action: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      error({
        title: 'Lỗi thao tác hàng loạt',
        message: 'Vui lòng chọn ít nhất một hóa đơn!'
      });
      return;
    }

    const actionText = action === 'send_notification' ? 'gửi thông báo cho' :
                     action === 'mark_paid' ? 'đánh dấu đã thanh toán cho' :
                     action === 'export' ? 'xuất báo cáo' : action;

    showConfirm({
      title: `Xác nhận ${actionText} hàng loạt`,
      message: `Bạn có chắc chắn muốn ${actionText} ${selectedIds.length} hóa đơn đã chọn không?`,
      onConfirm: () => {
        console.log(`${actionText} hàng loạt:`, selectedIds);
        
        if (action === 'send_notification') {
          success({
            title: 'Gửi thông báo hàng loạt thành công',
            message: `Đã gửi thông báo cho ${selectedIds.length} khách thuê`
          });
        } else if (action === 'mark_paid') {
          success({
            title: 'Cập nhật trạng thái hàng loạt thành công',
            message: `Đã đánh dấu ${selectedIds.length} hóa đơn là đã thanh toán`
          });
        } else if (action === 'export') {
          success({
            title: 'Xuất báo cáo thành công',
            message: `Đã xuất báo cáo cho ${selectedIds.length} hóa đơn`
          });
        }
      }
    });
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thanh toán</h1>
                <p className="text-gray-600">Quản lý thanh toán tiền thuê và dịch vụ</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowElectricModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-flashlight-line mr-2"></i>
                  Nhập chỉ số điện
                </button>
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-file-list-3-line mr-2"></i>
                  Tạo hóa đơn hàng loạt
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Tạo hóa đơn
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã thu</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalRevenue.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-time-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chưa thu</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalPending.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-error-warning-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockPayments.filter(p => p.status === 'overdue').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-file-list-3-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPayments.length}</p>
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
                  <option value="paid">Đã thanh toán</option>
                  <option value="partial">Thanh toán một phần</option>
                  <option value="pending">Chờ thanh toán</option>
                  <option value="overdue">Quá hạn</option>
                </select>
                <input
                  type="month"
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  defaultValue="2024-03"
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách thuê..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách thuê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tháng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiền thuê
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điện/Nước
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng tiền
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đã thanh toán
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
                    {filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.tenantName}</div>
                            <div className="text-sm text-gray-500">{payment.room}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.month).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' })}
                          </div>
                          <div className="text-xs text-gray-500">
                            Hạn: {new Date(payment.dueDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.rentAmount.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Điện: {payment.electricityUsage}kWh - {payment.electricityAmount.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-sm text-gray-500">
                            Nước: {payment.waterUsage}m³ - {payment.waterAmount.toLocaleString('vi-VN')}đ
                          </div>
                          {payment.additionalCharges && payment.additionalCharges.length > 0 && (
                            <div className="text-sm text-orange-600">
                              Phát sinh: {payment.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.totalAmount.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            {payment.paidAmount.toLocaleString('vi-VN')}đ
                          </div>
                          {payment.remainingAmount > 0 && (
                            <div className="text-xs text-red-600">
                              Còn lại: {payment.remainingAmount.toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetail(payment)}
                              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleAddAdditionalCharge(payment)}
                              className="text-orange-600 hover:text-orange-900 cursor-pointer"
                              title="Thêm phát sinh"
                            >
                              <i className="ri-add-circle-line"></i>
                            </button>
                            {payment.status !== 'paid' && (
                              <>
                                <button
                                  onClick={() => handleCollectPayment(payment)}
                                  className="text-green-600 hover:text-green-900 cursor-pointer"
                                  title="Thu tiền"
                                >
                                  <i className="ri-money-dollar-circle-line"></i>
                                </button>
                                <button
                                  onClick={() => handleSendPaymentNotification(payment)}
                                  className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                  title="Gửi thông báo"
                                >
                                  <i className="ri-notification-line"></i>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeletePayment(payment.id)}
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

            {/* Electric Reading Modal */}
            {showElectricModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowElectricModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-6xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Nhập chỉ số điện</h2>
                      <button
                        onClick={() => setShowElectricModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center">
                        <i className="ri-information-line text-blue-600 text-xl mr-3"></i>
                        <div>
                          <h3 className="font-semibold text-blue-900">Hướng dẫn nhập chỉ số điện</h3>
                          <p className="text-blue-700 text-sm">Click "Sửa" để nhập chỉ số mới cho từng phòng. Hệ thống sẽ tự động tính toán mức tiêu thụ.</p>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dãy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách thuê</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chỉ số cũ</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chỉ số mới</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiêu thụ (kWh)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {electricReadings.map((reading) => (
                            <tr key={reading.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.building}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reading.room}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.tenantName}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingReading === reading.id ? (
                                  <input
                                    type="number"
                                    value={reading.oldReading}
                                    onChange={(e) => handleUpdateReading(reading.id, 'oldReading', parseInt(e.target.value) || 0)}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-900">{reading.oldReading}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {editingReading === reading.id ? (
                                  <input
                                    type="number"
                                    value={reading.newReading}
                                    onChange={(e) => handleUpdateReading(reading.id, 'newReading', parseInt(e.target.value) || 0)}
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                  />
                                ) : (
                                  <span className="text-sm text-gray-900">{reading.newReading}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${reading.usage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {reading.usage}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {editingReading === reading.id ? (
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleSaveReading(reading.id)}
                                      className="text-green-600 hover:text-green-900 cursor-pointer"
                                    >
                                      <i className="ri-check-line"></i> Lưu
                                    </button>
                                    <button
                                      onClick={() => setEditingReading(null)}
                                      className="text-gray-600 hover:text-gray-900 cursor-pointer"
                                    >
                                      <i className="ri-close-line"></i> Hủy
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingReading(reading.id)}
                                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                  >
                                    <i className="ri-edit-line"></i> Sửa
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowElectricModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() => {
                          success({
                            title: 'Lưu chỉ số điện thành công',
                            message: 'Đã cập nhật chỉ số điện cho tất cả các phòng'
                          });
                          setShowElectricModal(false);
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-save-line mr-2"></i>
                        Lưu tất cả
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Invoice Modal */}
            {showBulkModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBulkModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-7xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Tạo hóa đơn hàng loạt</h2>
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Settings */}
                      <div className="lg:col-span-1">
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Cài đặt chung</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tháng hóa đơn</label>
                              <input
                                type="month"
                                value={bulkSettings.month}
                                onChange={(e) => setBulkSettings({...bulkSettings, month: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Giá điện (VNĐ/kWh)</label>
                              <input
                                type="number"
                                value={bulkSettings.electricityRate}
                                onChange={(e) => setBulkSettings({...bulkSettings, electricityRate: parseInt(e.target.value) || 0})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Giá nước (VNĐ/m³)</label>
                              <input
                                type="number"
                                value={bulkSettings.waterRate}
                                onChange={(e) => setBulkSettings({...bulkSettings, waterRate: parseInt(e.target.value) || 0})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phí dịch vụ (VNĐ)</label>
                              <input
                                type="number"
                                value={bulkSettings.serviceAmount}
                                onChange={(e) => setBulkSettings({...bulkSettings, serviceAmount: parseInt(e.target.value) || 0})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</label>
                              <input
                                type="date"
                                value={bulkSettings.dueDate}
                                onChange={(e) => setBulkSettings({...bulkSettings, dueDate: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Common Charges */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Phí chung</h3>
                          <div className="space-y-2">
                            {commonCharges.map((charge) => (
                              <label key={charge.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={charge.selected}
                                  onChange={() => handleSelectCommonCharge(charge.id)}
                                  className="text-orange-600"
                                />
                                <span className="text-sm flex-1">{charge.description}</span>
                                <span className="text-sm font-medium">{charge.amount.toLocaleString('vi-VN')}đ</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Room Selection */}
                      <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold text-gray-900 mb-4">Chọn phòng tạo hóa đơn</h3>
                          <div className="flex gap-2">
                            <select
                              value={selectedBuilding}
                              onChange={(e) => setSelectedBuilding(e.target.value)}
                              className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                            >
                              <option value="all">Tất cả dãy</option>
                              {getBuildings().map((building) => (
                                <option key={building} value={building}>{building}</option>
                              ))}
                            </select>
                            <button
                              onClick={handleSelectAllRooms}
                              className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                            >
                              Chọn tất cả
                            </button>
                          </div>
                        </div>

                        <div className="bg-white border rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-96">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left">
                                    <input
                                      type="checkbox"
                                      checked={getFilteredRooms().length > 0 && getFilteredRooms().every(room => room.selected)}
                                      onChange={handleSelectAllRooms}
                                      className="text-blue-600"
                                    />
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dãy</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách thuê</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiền thuê</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện (kWh)</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nước (m³)</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {getFilteredRooms().map((room) => (
                                  <tr key={room.id} className={`hover:bg-gray-50 ${room.selected ? 'bg-blue-50' : ''}`}>
                                    <td className="px-4 py-3">
                                      <input
                                        type="checkbox"
                                        checked={room.selected}
                                        onChange={() => handleSelectRoom(room.id)}
                                        className="text-blue-600"
                                      />
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{room.building}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{room.room}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{room.tenantName}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{room.rentAmount.toLocaleString('vi-VN')}đ</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{room.electricityUsage}</td>
                                    <td className="px-4 py-3 text-sm text-gray-900">{room.waterUsage}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-green-50 p-4 rounded-lg mt-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Tổng kết</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Số phòng được chọn:</span>
                              <span className="font-medium ml-2">{bulkRooms.filter(room => room.selected).length}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tổng giá trị hóa đơn:</span>
                              <span className="font-bold ml-2 text-green-600">{calculateBulkTotal().toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleCreateBulkInvoices}
                        disabled={bulkRooms.filter(room => room.selected).length === 0}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-file-list-3-line mr-2"></i>
                        Tạo {bulkRooms.filter(room => room.selected).length} hóa đơn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Add New Invoice Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-6xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Tạo hóa đơn mới</h2>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Basic Info */}
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tháng hóa đơn <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="month"
                                value={newInvoice.month}
                                onChange={(e) => setNewInvoice({...newInvoice, month: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hạn thanh toán <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="date"
                                value={newInvoice.dueDate}
                                onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tenant Selection */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chọn khách thuê</h3>
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tìm kiếm khách thuê <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={searchTenant}
                              onChange={(e) => {
                                setSearchTenant(e.target.value);
                                setShowTenantDropdown(true);
                              }}
                              onFocus={() => setShowTenantDropdown(true)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Nhập tên, số điện thoại hoặc phòng..."
                            />
                            {showTenantDropdown && filteredTenants.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredTenants.map((tenant) => (
                                  <div
                                    key={tenant.id}
                                    onClick={() => handleSelectTenant(tenant)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{tenant.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {tenant.phone} • Phòng {tenant.room}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          {newInvoice.tenantName && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="font-medium text-gray-900">{newInvoice.tenantName}</div>
                              <div className="text-sm text-gray-600">Phòng {newInvoice.room}</div>
                            </div>
                          )}
                        </div>

                        {/* Usage Input */}
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Mức tiêu thụ</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Điện (kWh)</label>
                              <input
                                type="number"
                                value={newInvoice.electricityUsage}
                                onChange={(e) => setNewInvoice({...newInvoice, electricityUsage: parseInt(e.target.value) || 0})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nước (m³)</label>
                              <input
                                type="number"
                                value={newInvoice.waterUsage}
                                onChange={(e) => setNewInvoice({...newInvoice, waterUsage: parseInt(e.target.value) || 0})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Ghi chú</h3>
                          <textarea
                            value={newInvoice.notes}
                            onChange={(e) => setNewInvoice({...newInvoice, notes: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            rows={3}
                            placeholder="Ghi chú thêm về hóa đơn..."
                          />
                        </div>
                      </div>

                      {/* Right Column - Cost Details */}
                      <div className="space-y-6">
                        {/* Cost Breakdown */}
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chi tiết chi phí</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tiền thuê phòng:</span>
                              <span className="font-medium">{newInvoice.rentAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tiền điện ({newInvoice.electricityUsage} kWh):</span>
                              <span className="font-medium">{(newInvoice.electricityUsage * 3500).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tiền nước ({newInvoice.waterUsage} m³):</span>
                              <span className="font-medium">{(newInvoice.waterUsage * 25000).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phí dịch vụ:</span>
                              <span className="font-medium">{newInvoice.serviceAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {newInvoice.additionalCharges.length > 0 && (
                              <div className="border-t pt-3">
                                <div className="text-sm font-medium text-gray-700 mb-2">Chi phí phát sinh:</div>
                                {newInvoice.additionalCharges.map((charge) => (
                                  <div key={charge.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{charge.description}:</span>
                                    <span className="font-medium">{charge.amount.toLocaleString('vi-VN')}đ</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="border-t pt-3">
                              <div className="flex justify-between text-lg font-bold">
                                <span>Tổng cộng:</span>
                                <span className="text-purple-600">{calculateNewInvoiceTotal().toLocaleString('vi-VN')}đ</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Additional Charges */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chi phí phát sinh</h3>
                          
                          {/* Current Additional Charges */}
                          {newInvoice.additionalCharges.length > 0 && (
                            <div className="mb-4">
                              <div className="space-y-2">
                                {newInvoice.additionalCharges.map((charge) => (
                                  <div key={charge.id} className="flex justify-between items-center bg-white p-2 rounded">
                                    <div>
                                      <div className="font-medium text-sm">{charge.description}</div>
                                      <div className="text-xs text-gray-500">{charge.amount.toLocaleString('vi-VN')}đ</div>
                                    </div>
                                    <button
                                      onClick={() => handleRemoveTempCharge(charge.id)}
                                      className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add New Additional Charge */}
                          <div className="space-y-3">
                            <div>
                              <input
                                type="text"
                                value={tempCharge.description}
                                onChange={(e) => setTempCharge({...tempCharge, description: e.target.value})}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Mô tả chi phí phát sinh..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={tempCharge.amount}
                                onChange={(e) => setTempCharge({...tempCharge, amount: parseInt(e.target.value) || 0})}
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Số tiền"
                              />
                              <button
                                onClick={handleAddTempCharge}
                                disabled={!tempCharge.description || tempCharge.amount <= 0}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                              >
                                <i className="ri-add-line"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleCreateNewInvoice}
                        disabled={!newInvoice.tenantName || !newInvoice.room || !newInvoice.dueDate}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-add-line mr-2"></i>
                        Tạo hóa đơn
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Detail Modal */}
            {showDetailModal && selectedPayment && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Chi tiết hóa đơn - {selectedPayment.tenantName}
                      </h2>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Khách thuê:</span>
                            <span className="font-medium">{selectedPayment.tenantName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phòng:</span>
                            <span className="font-medium">{selectedPayment.room}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tháng:</span>
                            <span className="font-medium">
                              {new Date(selectedPayment.month).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hạn thanh toán:</span>
                            <span className={`font-medium ${new Date(selectedPayment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(selectedPayment.dueDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.status)}`}>
                              {getStatusText(selectedPayment.status)}
                            </span>
                          </div>
                          {selectedPayment.paidDate && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ngày thanh toán:</span>
                              <span className="font-medium text-green-600">{selectedPayment.paidDate}</span>
                            </div>
                          )}
                          {selectedPayment.paymentMethod && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phương thức:</span>
                              <span className="font-medium">{selectedPayment.paymentMethod}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền thuê phòng:</span>
                            <span className="font-medium">{selectedPayment.rentAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền điện ({selectedPayment.electricityUsage} kWh):</span>
                            <span className="font-medium">{selectedPayment.electricityAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tiền nước ({selectedPayment.waterUsage} m³):</span>
                            <span className="font-medium">{selectedPayment.waterAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phí dịch vụ:</span>
                            <span className="font-medium">{selectedPayment.serviceAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          {selectedPayment.additionalCharges && selectedPayment.additionalCharges.length > 0 && (
                            <div className="border-t pt-3">
                              <div className="text-sm font-medium text-gray-700 mb-2">Chi phí phát sinh:</div>
                              {selectedPayment.additionalCharges.map((charge) => (
                                <div key={charge.id} className="flex justify-between text-sm">
                                  <span className="text-gray-600">{charge.description}:</span>
                                  <span className="font-medium">{charge.amount.toLocaleString('vi-VN')}đ</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="border-t pt-3">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Tổng cộng:</span>
                              <span className="text-green-600">{selectedPayment.totalAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                              <span>Đã thanh toán:</span>
                              <span>{selectedPayment.paidAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {selectedPayment.remainingAmount > 0 && (
                              <div className="flex justify-between text-sm font-medium text-red-600 mt-1">
                                <span>Còn lại:</span>
                                <span>{selectedPayment.remainingAmount.toLocaleString('vi-VN')}đ</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Đóng
                      </button>
                      {selectedPayment.status !== 'paid' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleCollectPayment(selectedPayment);
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-money-dollar-circle-line mr-2"></i>
                            Thu tiền
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleSendPaymentNotification(selectedPayment);
                            }}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-notification-line mr-2"></i>
                            Gửi thông báo
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Collection Modal */}
            {showPaymentModal && selectedPaymentForPayment && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPaymentModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Thu tiền - {selectedPaymentForPayment.tenantName}
                      </h2>
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin hóa đơn</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Phòng:</span>
                          <span className="font-medium ml-2">{selectedPaymentForPayment.room}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedPaymentForPayment.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-medium ml-2">{selectedPaymentForPayment.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Đã thanh toán:</span>
                          <span className="font-medium ml-2 text-green-600">{selectedPaymentForPayment.paidAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Còn lại:</span>
                          <span className="font-bold ml-2 text-red-600 text-lg">{selectedPaymentForPayment.remainingAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tiền thu <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={paymentData.amount}
                          onChange={(e) => setPaymentData({...paymentData, amount: parseInt(e.target.value) || 0})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập số tiền thu"
                          max={selectedPaymentForPayment.remainingAmount}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setPaymentData({...paymentData, amount: selectedPaymentForPayment.remainingAmount})}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                          >
                            Thu toàn bộ
                          </button>
                          <button
                            onClick={() => setPaymentData({...paymentData, amount: Math.floor(selectedPaymentForPayment.remainingAmount / 2)})}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                          >
                            Thu một nửa
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
                        <select
                          value={paymentData.method}
                          onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="cash">Tiền mặt</option>
                          <option value="transfer">Chuyển khoản</option>
                          <option value="card">Thẻ</option>
                          <option value="momo">MoMo</option>
                          <option value="zalopay">ZaloPay</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thanh toán</label>
                        <input
                          type="date"
                          value={paymentData.date}
                          onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea
                          value={paymentData.note}
                          onChange={(e) => setPaymentData({...paymentData, note: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={3}
                          placeholder="Ghi chú thêm về việc thanh toán..."
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSavePayment}
                        disabled={paymentData.amount <= 0}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-money-dollar-circle-line mr-2"></i>
                        Thu tiền
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Notification Modal */}
            {showNotificationModal && selectedPaymentForNotification && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNotificationModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Gửi thông báo thu tiền - {selectedPaymentForNotification.tenantName}
                      </h2>
                      <button
                        onClick={() => setShowNotificationModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin hóa đơn</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Phòng:</span>
                          <span className="font-medium ml-2">{selectedPaymentForNotification.room}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedPaymentForNotification.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Số tiền cần thu:</span>
                          <span className="font-bold ml-2 text-red-600">{selectedPaymentForNotification.remainingAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hạn thanh toán:</span>
                          <span className={`font-medium ml-2 ${new Date(selectedPaymentForNotification.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(selectedPaymentForNotification.dueDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiêu đề thông báo <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={notificationData.title}
                          onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập tiêu đề thông báo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nội dung thông báo <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={notificationData.content}
                          onChange={(e) => setNotificationData({...notificationData, content: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={6}
                          placeholder="Nhập nội dung thông báo..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức gửi</label>
                        <select
                          value={notificationData.sendMethod}
                          onChange={(e) => setNotificationData({...notificationData, sendMethod: e.target.value as 'app' | 'sms' | 'both'})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="app">Qua ứng dụng</option>
                          <option value="sms">Qua SMS</option>
                          <option value="both">Cả hai</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowNotificationModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSendNotification}
                        disabled={!notificationData.title || !notificationData.content}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-send-plane-line mr-2"></i>
                        Gửi thông báo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Charges Modal */}
            {showAdditionalChargesModal && selectedPaymentForCharges && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAdditionalChargesModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Thêm chi phí phát sinh - {selectedPaymentForCharges.tenantName}
                      </h2>
                      <button
                        onClick={() => setShowAdditionalChargesModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin hóa đơn</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Phòng:</span>
                          <span className="font-medium ml-2">{selectedPaymentForCharges.room}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">
                            {new Date(selectedPaymentForCharges.month).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền hiện tại:</span>
                          <span className="font-medium ml-2">{selectedPaymentForCharges.totalAmount.toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả chi phí <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newCharge.description}
                          onChange={(e) => setNewCharge({...newCharge, description: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập mô tả chi phí phát sinh"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tiền <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={newCharge.amount}
                          onChange={(e) => setNewCharge({...newCharge, amount: parseInt(e.target.value) || 0})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập số tiền"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowAdditionalChargesModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveAdditionalCharge}
                        disabled={!newCharge.description || newCharge.amount <= 0}
                        className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-add-line mr-2"></i>
                        Thêm chi phí
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
        type={confirmAction?.type}
      />
    </div>
  );
}
