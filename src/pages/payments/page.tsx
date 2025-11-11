
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
type InternetPlan = 1 | 2;

interface Payment {
  id: string;
  tenantName: string;
  room: string;
  building: string;
  month: string;
  rentAmount: number;
  electricityUsage: number;
  electricityAmount: number;
  waterUsage: number;
  waterAmount: number;
  internetPlan: InternetPlan;
  internetAmount: number;
  trashAmount: number;
  parkingCount: number;
  parkingAmount: number;
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
  internetPlan: InternetPlan;
  internetAmount: number;
  trashAmount: number;
  parkingCount: number;
  parkingAmount: number;

  additionalCharges: AdditionalCharge[];
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
  internetPlan?: InternetPlan;
  parkingCount?: number;
  trashIncluded?: boolean;
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
    room: 'A101',
    building: 'Dãy A',
    month: '2025-10',
    rentAmount: 3500000,
    electricityUsage: 100,
    electricityAmount: 350000,
    waterUsage: 2,
    waterAmount: 120000,

    // Dịch vụ tách
    internetPlan: 1,            // 50k
    internetAmount: 50000,
    trashAmount: 40000,         // 40k/phòng
    parkingCount: 2,            // 2 xe
    parkingAmount: 200000,      // 100k/xe

    additionalCharges: [
      { id: '1', description: 'Sửa vòi nước', amount: 150000, date: '2025-10-10' }
    ],

    totalAmount: 4410000,       // 3.5M + 350k + 120k + (50k+40k+200k) + 150k
    paidAmount: 4410000,
    remainingAmount: 0,

    dueDate: '2025-11-05',
    paidDate: '2025-11-03',
    status: 'paid',
    paymentMethod: 'Chuyển khoản'
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    room: 'A102',
    building: 'Dãy A',
    month: '2025-10',
    rentAmount: 3200000,

    electricityUsage: 80,
    electricityAmount: 280000,

    waterUsage: 1,
    waterAmount: 60000,

    // Dịch vụ tách
    internetPlan: 2,            // 100k
    internetAmount: 100000,
    trashAmount: 40000,
    parkingCount: 1,
    parkingAmount: 100000,

    additionalCharges: [],

    totalAmount: 3780000,       // 3.2M + 280k + 60k + (100k+40k+100k)
    paidAmount: 3200000,        // Mới trả tiền nhà
    remainingAmount: 580000,

    dueDate: '2025-11-05',
    paidDate: '2025-11-05',
    status: 'partial',
    paymentMethod: 'Tiền mặt'
  },
  {
    id: '3',
    tenantName: 'Lê Văn C',
    room: 'B201',
    building: 'Dãy B',
    month: '2025-10',
    rentAmount: 4000000,
    electricityUsage: 150,
    electricityAmount: 525000,

    waterUsage: 3,
    waterAmount: 180000,

    // Dịch vụ tách
    internetPlan: 2,            // 100k
    internetAmount: 100000,
    trashAmount: 40000,
    parkingCount: 2,
    parkingAmount: 200000,

    additionalCharges: [],

    totalAmount: 5045000,       // 4M + 525k + 180k + (100k+40k+200k)
    paidAmount: 0,
    remainingAmount: 5045000,

    dueDate: '2025-11-05',
    status: 'overdue',
    paymentMethod: undefined
  },
  {
    id: '4',
    tenantName: 'Phạm Hoàng D',
    room: 'B202',
    building: 'Dãy B',
    month: '2025-11',
    rentAmount: 3800000,

    electricityUsage: 110,
    electricityAmount: 385000,

    waterUsage: 2,
    waterAmount: 120000,

    // Dịch vụ tách
    internetPlan: 1,            // 50k
    internetAmount: 50000,
    trashAmount: 40000,
    parkingCount: 1,
    parkingAmount: 100000,

    additionalCharges: [],

    totalAmount: 4495000,       // 3.8M + 385k + 120k + (50k+40k+100k)
    paidAmount: 0,
    remainingAmount: 4495000,

    dueDate: '2025-12-05',
    status: 'pending',
    paymentMethod: undefined
  },
  {
    id: '5',
    tenantName: 'Nguyễn Văn A',
    room: 'A101',
    building: 'Dãy C',
    month: '2025-09',
    rentAmount: 3500000,

    electricityUsage: 90,
    electricityAmount: 315000,

    waterUsage: 2,
    waterAmount: 120000,

    // Dịch vụ tách
    internetPlan: 1,            // 50k
    internetAmount: 50000,
    trashAmount: 40000,
    parkingCount: 2,
    parkingAmount: 200000,

    additionalCharges: [],

    totalAmount: 4225000,       // 3.5M + 315k + 120k + (50k+40k+200k)
    paidAmount: 4225000,
    remainingAmount: 0,

    dueDate: '2025-10-05',
    paidDate: '2025-10-01',
    status: 'paid',
    paymentMethod: 'Chuyển khoản'
  },
  {
    id: '6',
    tenantName: 'Vũ Đình E',
    room: 'C301',
    building: 'Dãy C',
    month: '2025-11',
    rentAmount: 4500000,

    electricityUsage: 130,
    electricityAmount: 455000,

    waterUsage: 2,
    waterAmount: 120000,

    // Dịch vụ tách
    internetPlan: 2,            // 100k
    internetAmount: 100000,
    trashAmount: 40000,
    parkingCount: 0,
    parkingAmount: 0,

    additionalCharges: [
      { id: '2', description: 'Phí làm thêm chìa khóa', amount: 80000, date: '2025-11-02' }
    ],

    totalAmount: 5295000,       // 4.5M + 455k + 120k + (100k+40k+0) + 80k
    paidAmount: 0,
    remainingAmount: 5295000,

    dueDate: '2025-12-05',
    status: 'pending',
    paymentMethod: undefined
  }
];

const mockElectricReadings: ElectricReading[] = [
  {
    id: '1',
    building: 'Dãy A',
    room: 'A101', // Cập nhật
    tenantName: 'Nguyễn Văn A',
    oldReading: 150,
    newReading: 250,
    usage: 100 // Cập nhật (khớp Payment ID 1)
  },
  {
    id: '2',
    building: 'Dãy A',
    room: 'A102', // Cập nhật
    tenantName: 'Trần Thị B',
    oldReading: 200,
    newReading: 280,
    usage: 80 // Cập nhật (khớp Payment ID 2)
  },
  {
    id: '3',
    building: 'Dãy B',
    room: 'B201', // Cập nhật
    tenantName: 'Lê Văn C', // Cập nhật
    oldReading: 180,
    newReading: 330,
    usage: 150 // Cập nhật (khớp Payment ID 3)
  },
  {
    id: '4',
    building: 'Dãy B',
    room: 'B202', // Cập nhật
    tenantName: 'Phạm Hoàng D', // Cập nhật
    oldReading: 120,
    newReading: 230,
    usage: 110 // Cập nhật (khớp Payment ID 4)
  },
  {
    id: '5',
    building: 'Dãy C',
    room: 'C301', // Cập nhật
    tenantName: 'Vũ Đình E', // Cập nhật
    oldReading: 160,
    newReading: 290,
    usage: 130 // Cập nhật (khớp Payment ID 6)
  },
  {
    id: '6',
    building: 'Dãy C',
    room: 'C302', // Phòng này chưa có hóa đơn
    tenantName: 'Trần Văn F',
    oldReading: 190,
    newReading: 285,
    usage: 95
  }
];

const mockBulkRooms: BulkInvoiceRoom[] = [
  {
    id: '1',
    room: 'A101',
    tenantName: 'Nguyễn Văn A',
    rentAmount: 3500000,
    electricityUsage: 100,
    waterUsage: 2,
    building: 'Dãy A',
    selected: false,
    internetPlan: 1,    // 50k
    parkingCount: 2,    // 2 xe
    trashIncluded: true // tính rác như bình thường (hoặc bỏ field)
  },
  {
    id: '2',
    room: 'A102',
    tenantName: 'Trần Thị B',
    rentAmount: 3200000,
    electricityUsage: 80,
    waterUsage: 1,
    building: 'Dãy A',
    selected: false,
    internetPlan: 2,  // 100k
    parkingCount: 1
  },
  {
    id: '3',
    room: 'B201',
    tenantName: 'Lê Văn C',
    rentAmount: 4000000,
    electricityUsage: 150,
    waterUsage: 3,
    building: 'Dãy B',
    selected: false,
    internetPlan: 2,
    parkingCount: 2
  },
  {
    id: '4',
    room: 'B202',
    tenantName: 'Phạm Hoàng D',
    rentAmount: 3800000,
    electricityUsage: 110,
    waterUsage: 2,
    building: 'Dãy B',
    selected: false,
    internetPlan: 1,
    parkingCount: 1
  },
  {
    id: '5',
    room: 'C301',
    tenantName: 'Vũ Đình E',
    rentAmount: 4500000,
    electricityUsage: 130,
    waterUsage: 2,
    building: 'Dãy C',
    selected: false,
    internetPlan: 2,
    parkingCount: 0
  },
  {
    id: '6',
    room: 'C302',
    tenantName: 'Trần Văn F',
    rentAmount: 4100000,
    electricityUsage: 95,
    waterUsage: 2,
    building: 'Dãy C',
    selected: false,
    internetPlan: 1,
    parkingCount: 0
  }
];


const defaultCommonCharges: CommonCharge[] = [
  { id: '1', description: 'Rác tháng Tết', amount: 40000, selected: true },
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
  const [searchRoomQuery, setSearchRoomQuery] = useState('');
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [tempCharge, setTempCharge] = useState({ description: '', amount: 0 });
  const [newCommonCharge, setNewCommonCharge] = useState({ description: '', amount: 0 })
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    tenantName: '',
    room: '',
    month: new Date().toISOString().slice(0, 7),
    rentAmount: 0,
    electricityUsage: 0,
    waterUsage: 0,
    internetPlan: 1,
    internetAmount: 0,
    trashAmount: 0,
    parkingCount: 0,
    parkingAmount: 0,

    additionalCharges: [],
    notes: ''
  });
  const [selectedBuildingForInvoice, setSelectedBuildingForInvoice] = useState<string>('');
  const roomsBySelectedBuilding: BulkInvoiceRoom[] = selectedBuildingForInvoice
    ? mockBulkRooms.filter(r => r.building === selectedBuildingForInvoice)
    : [];
  const [bulkRooms, setBulkRooms] = useState<BulkInvoiceRoom[]>(mockBulkRooms);
  const [commonCharges, setCommonCharges] = useState<CommonCharge[]>(
    defaultCommonCharges.map(c => ({ ...c, selected: false }))
  );
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [bulkSettings, setBulkSettings] = useState({
    month: new Date().toISOString().slice(0, 7),
    electricityRate: 3500,   // đ/kWh
    waterRate: 60000,        // đ/người
    internetPricePlan1: 50000,  // đ/phòng
    internetPricePlan2: 100000, // đ/phòng
    trashPrice: 40000,          // đ/phòng
    parkingPerVehicle: 100000,  // đ/xe
    defaultInternetPlan: 1 as InternetPlan,
    defaultParkingCount: 0
  })

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
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
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

    if (!selectedPaymentForCharges) return; // Kiểm tra an toàn

    showConfirm({
      title: 'Xác nhận thêm chi phí phát sinh',
      message: `Bạn có chắc chắn muốn thêm chi phí phát sinh "${newCharge.description}" với số tiền ${newCharge.amount.toLocaleString('vi-VN')}đ không?`,
      onConfirm: () => {
        const chargeToAdd: AdditionalCharge = {
          id: `charge-${Date.now()}`,
          description: newCharge.description,
          amount: newCharge.amount,
          date: new Date().toISOString().split('T')[0]
        };

        setPayments(prevPayments =>
          prevPayments.map(payment => {
            if (payment.id === selectedPaymentForCharges.id) {
              const newAdditionalCharges = [...(payment.additionalCharges || []), chargeToAdd];
              const newTotalAmount = payment.totalAmount + chargeToAdd.amount;
              const newRemainingAmount = payment.remainingAmount + chargeToAdd.amount;
              const newStatus = payment.status === 'paid' ? 'partial' : payment.status;

              return {
                ...payment,
                additionalCharges: newAdditionalCharges,
                totalAmount: newTotalAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus
              };
            }
            return payment;
          })
        );

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

    if (!selectedPaymentForPayment) return;

    if (paymentData.amount > selectedPaymentForPayment.remainingAmount) {
      error({
        title: 'Lỗi thu tiền',
        message: 'Số tiền thu không được vượt quá số tiền còn lại'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận thu tiền',
      message: `Bạn có chắc chắn muốn thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ "${selectedPaymentForPayment.tenantName}" không?`,
      onConfirm: () => {
        setPayments(prevPayments =>
          prevPayments.map(payment => {
            if (payment.id === selectedPaymentForPayment.id) {
              const newPaidAmount = payment.paidAmount + paymentData.amount;
              const newRemainingAmount = payment.totalAmount - newPaidAmount;
              const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

              return {
                ...payment,
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus,
                paidDate: paymentData.date,
                paymentMethod: paymentData.method
              };
            }
            return payment;
          })
        );

        success({
          title: 'Thu tiền thành công',
          message: `Đã thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ ${selectedPaymentForPayment.tenantName}`
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

  const handleAddCustomCommonCharge = () => {
    if (!newCommonCharge.description || newCommonCharge.amount <= 0) {
      error({
        title: 'Lỗi thêm phí phát sinh',
        message: 'Vui lòng nhập mô tả và số tiền hợp lệ!'
      });
      return;
    }

    const charge: CommonCharge = {
      id: `cc-${Date.now()}`,
      description: newCommonCharge.description.trim(),
      amount: newCommonCharge.amount,
      selected: true, // mặc định chọn sẵn vì bạn “chọn thêm”
    };

    setCommonCharges(prev => [...prev, charge]);

    success({
      title: 'Đã thêm phí phát sinh',
      message: `${charge.description} - ${charge.amount.toLocaleString('vi-VN')}đ`
    });

    setNewCommonCharge({ description: '', amount: 0 });
  };

  const handleRemoveCommonCharge = (chargeId: string) => {
    setCommonCharges(prev => prev.filter(c => c.id !== chargeId));
    success({
      title: 'Đã xoá phí phát sinh',
      message: 'Mục phí đã được xoá khỏi danh sách'
    });
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
    const planPrice = (plan: InternetPlan) =>
      plan === 1 ? bulkSettings.internetPricePlan1 : bulkSettings.internetPricePlan2;

    const selectedRooms = bulkRooms.filter(r => r.selected);
    const selectedCharges = commonCharges.filter(c => c.selected);
    const addOn = selectedCharges.reduce((s, c) => s + c.amount, 0);

    return selectedRooms.reduce((total, room) => {
      const electricityAmount = room.electricityUsage * bulkSettings.electricityRate;
      const waterAmount = room.waterUsage * bulkSettings.waterRate;

      const internetPlan = room.internetPlan ?? bulkSettings.defaultInternetPlan;
      const internetAmount = planPrice(internetPlan);

      const trashAmount = room.trashIncluded === false ? 0 : bulkSettings.trashPrice;

      const parkingCount = room.parkingCount ?? bulkSettings.defaultParkingCount;
      const parkingAmount = parkingCount * bulkSettings.parkingPerVehicle;

      const serviceTotal = internetAmount + trashAmount + parkingAmount;
      return total + room.rentAmount + electricityAmount + waterAmount + serviceTotal + addOn;
    }, 0);
  };


  const handleCreateBulkInvoices = () => {
    const selectedRooms = bulkRooms.filter(room => room.selected);
    setCommonCharges(defaultCommonCharges.map(c => ({ ...c, selected: false })));

    if (selectedRooms.length === 0) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn ít nhất một phòng để tạo hóa đơn!'
      });
      return;
    }

    const [year, month] = bulkSettings.month.split('-').map(Number);
    const dueDate = new Date(year, month, 5).toISOString().split('T')[0];
    const dueDateString = new Date(dueDate).toLocaleDateString('vi-VN');

    showConfirm({
      title: 'Xác nhận tạo hóa đơn hàng loạt',
      message: `Bạn có chắc chắn muốn tạo ${selectedRooms.length} hóa đơn (Hạn nộp: ${dueDateString}) không?`,
      onConfirm: () => {
        const planPrice = (plan: InternetPlan) =>
          plan === 1 ? bulkSettings.internetPricePlan1 : bulkSettings.internetPricePlan2;
        const selectedCharges: CommonCharge[] = commonCharges.filter(c => c.selected);

        const newPayments: Payment[] = selectedRooms.map((room, index) => {
          const electricityAmount = room.electricityUsage * bulkSettings.electricityRate;
          const waterAmount = room.waterUsage * bulkSettings.waterRate;

          const internetPlan = room.internetPlan ?? bulkSettings.defaultInternetPlan;
          const internetAmount = planPrice(internetPlan);

          const trashAmount = room.trashIncluded === false ? 0 : bulkSettings.trashPrice;

          const parkingCount = room.parkingCount ?? bulkSettings.defaultParkingCount;
          const parkingAmount = parkingCount * bulkSettings.parkingPerVehicle;

          const newAdditionalCharges: AdditionalCharge[] = selectedCharges.map((c: CommonCharge, i: number) => ({
            id: `bc-${room.id}-${i}`,
            description: c.description,
            amount: c.amount,
            date: new Date().toISOString().split('T')[0]
          }));
          const additionalAmount = newAdditionalCharges.reduce((s, c) => s + c.amount, 0);

          const totalAmount =
            room.rentAmount + electricityAmount + waterAmount +
            internetAmount + trashAmount + parkingAmount +
            additionalAmount;

          return {
            id: `inv-${Date.now()}-${index}`,
            tenantName: room.tenantName,
            room: room.room,
            building: room.building,
            month: bulkSettings.month,
            rentAmount: room.rentAmount,

            electricityUsage: room.electricityUsage,
            electricityAmount,

            waterUsage: room.waterUsage,
            waterAmount,

            internetPlan,
            internetAmount,
            trashAmount,
            parkingCount,
            parkingAmount,

            additionalCharges: newAdditionalCharges,
            totalAmount,
            paidAmount: 0,
            remainingAmount: totalAmount,
            dueDate,
            paidDate: undefined,
            status: 'pending',
            paymentMethod: undefined
          };
        });
        setPayments(prevPayments => [...newPayments, ...prevPayments]);

        const invoiceCount = selectedRooms.length;
        const totalAmount = calculateBulkTotal();

        success({
          title: 'Tạo hóa đơn hàng loạt thành công',
          message: `Đã tạo ${invoiceCount} hóa đơn với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}đ`
        });
        setShowBulkModal(false);
        setBulkRooms(prev => prev.map(room => ({ ...room, selected: false })));
        setCommonCharges(defaultCommonCharges.map(c => ({ ...c, selected: false })));
      }
    });
  };

  const handleCreateNewInvoice = () => {
    if (!newInvoice.tenantName || !newInvoice.room) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn tháng và khách thuê.'
      });
      return;
    }

    const [year, month] = newInvoice.month.split('-').map(Number);
    const dueDate = new Date(year, month, 5).toISOString().split('T')[0];
    const dueDateString = new Date(dueDate).toLocaleDateString('vi-VN');

    showConfirm({
      title: 'Xác nhận tạo hóa đơn',
      message: `Bạn có chắc chắn muốn tạo hóa đơn cho "${newInvoice.tenantName}" (Hạn nộp: ${dueDateString}) không?`,
      onConfirm: () => {
        const totalAmount = calculateNewInvoiceTotal();
        const electricityAmount = newInvoice.electricityUsage * bulkSettings.electricityRate;
        const waterAmount = newInvoice.waterUsage * bulkSettings.waterRate;
        const building =
          (bulkRooms.find(r => r.room === newInvoice.room)?.building) ||
          (mockBulkRooms.find(r => r.room === newInvoice.room)?.building) ||
          '';
        const newPayment: Payment = {
          id: `inv-${Date.now()}`,
          tenantName: newInvoice.tenantName,
          room: newInvoice.room,
          building,
          month: newInvoice.month,
          rentAmount: newInvoice.rentAmount,

          electricityUsage: newInvoice.electricityUsage,
          electricityAmount,
          waterUsage: newInvoice.waterUsage,
          waterAmount,

          // dịch vụ tách
          internetPlan: newInvoice.internetPlan,
          internetAmount: newInvoice.internetAmount,
          trashAmount: newInvoice.trashAmount,
          parkingCount: newInvoice.parkingCount,
          parkingAmount: newInvoice.parkingAmount,

          additionalCharges: newInvoice.additionalCharges,
          totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          dueDate,
          paidDate: undefined,
          status: 'pending',
          paymentMethod: undefined
        };
        setPayments(prevPayments => [newPayment, ...prevPayments]);

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

          internetPlan: 1,
          internetAmount: 0,
          trashAmount: 0,
          parkingCount: 0,
          parkingAmount: 0,

          additionalCharges: [],
          notes: ''
        });

        setSearchRoomQuery('');
      }
    });
  };

  const calculateNewInvoiceTotal = () => {
    const electricityAmount = newInvoice.electricityUsage * bulkSettings.electricityRate;
    const waterAmount = newInvoice.waterUsage * bulkSettings.waterRate;
    const addOn = newInvoice.additionalCharges.reduce((s, c) => s + c.amount, 0);

    return (
      newInvoice.rentAmount +
      electricityAmount +
      waterAmount +
      newInvoice.internetAmount +
      newInvoice.trashAmount +
      newInvoice.parkingAmount +
      addOn
    );
  };


  const filteredRoomsForInvoice = mockBulkRooms.filter((room: BulkInvoiceRoom) =>
    room.tenantName.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
    room.room.toLowerCase().includes(searchRoomQuery.toLowerCase())
  );

  const filteredPayments = filterStatus === 'all'
    ? payments
    : payments.filter(payment => payment.status === filterStatus);

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const totalPending = payments.reduce((sum, payment) => sum + payment.remainingAmount, 0);

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;

    showConfirm({
      title: 'Xác nhận xóa hóa đơn',
      message: `Bạn có chắc chắn muốn xóa hóa đơn của "${payment.tenantName}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        setPayments(prevPayments => prevPayments.filter(p => p.id !== paymentId));
        success({
          title: 'Xóa hóa đơn thành công',
          message: `Đã xóa hóa đơn của ${payment.tenantName} thành công`
        });
      },
      type: 'danger'
    });
  };

  const planPrice = (plan: InternetPlan) =>
    plan === 1 ? bulkSettings.internetPricePlan1 : bulkSettings.internetPricePlan2;

  const handleSelectRoomForInvoice = (room: BulkInvoiceRoom) => {
    const internetPlan = room.internetPlan ?? bulkSettings.defaultInternetPlan;
    const internetAmount = planPrice(internetPlan);
    const trashAmount = room.trashIncluded === false ? 0 : bulkSettings.trashPrice;
    const parkingCount = room.parkingCount ?? bulkSettings.defaultParkingCount;
    const parkingAmount = parkingCount * bulkSettings.parkingPerVehicle;

    setNewInvoice({
      tenantName: room.tenantName,
      room: room.room,
      month: new Date().toISOString().slice(0, 7),
      rentAmount: room.rentAmount,
      electricityUsage: room.electricityUsage,
      waterUsage: room.waterUsage,

      internetPlan,
      internetAmount,
      trashAmount,
      parkingCount,
      parkingAmount,

      additionalCharges: [],
      notes: ''
    });

    setSearchRoomQuery(`${room.tenantName} - ${room.room}`);
    setShowRoomDropdown(false);
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
                      {payments.filter(p => p.status === 'overdue').length} {/* <-- Sửa */}
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
                    <p className="text-2xl font-bold text-gray-900">{payments.length}</p> {/* <-- Sửa */}
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
                            <div className="text-sm text-gray-500">{payment.building} • {payment.room}</div>
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
                            Nước: {payment.waterUsage} người - {payment.waterAmount.toLocaleString('vi-VN')}đ
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
                        {/* Biểu phí (Theo yêu cầu của bạn) */}
                        <div className="bg-blue-50 p-4 rounded-lg mb-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Biểu phí áp dụng</h3>
                          <div className="space-y-3">
                            {/* Input tháng vẫn giữ lại */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tháng hóa đơn</label>
                              <input
                                type="month"
                                value={bulkSettings.month}
                                onChange={(e) => setBulkSettings({ ...bulkSettings, month: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>
                            {/* Thay các input khác bằng label */}
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Giá điện:</span>
                              <span className="font-medium text-gray-900">{bulkSettings.electricityRate.toLocaleString('vi-VN')}đ / kWh</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Giá nước:</span>
                              <span className="font-medium text-gray-900">{bulkSettings.waterRate.toLocaleString('vi-VN')}đ / Người</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Phí rác:</span>
                              <span className="font-medium text-gray-900">
                                {bulkSettings.trashPrice.toLocaleString('vi-VN')}đ / Phòng
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Phí mạng:</span>
                              <span className="font-medium text-gray-900">
                                Plan 1: {bulkSettings.internetPricePlan1.toLocaleString('vi-VN')}đ •
                                Plan 2: {bulkSettings.internetPricePlan2.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Phí gửi xe:</span>
                              <span className="font-medium text-gray-900">
                                {bulkSettings.parkingPerVehicle.toLocaleString('vi-VN')}đ / Xe
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Hạn thanh toán:</span>
                              <span className="font-medium text-gray-900">Ngày 5 tháng sau</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Phí phát sinh (Tùy chọn)</h3>

                          {/* Danh sách phí có thể chọn */}
                          <div className="space-y-2 mb-4">
                            {commonCharges.map((charge) => (
                              <label key={charge.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={charge.selected}
                                  onChange={() => handleSelectCommonCharge(charge.id)}
                                  className="text-orange-600"
                                />
                                <span className="text-sm flex-1">{charge.description}</span>
                                <span className="text-sm font-medium mr-2">{charge.amount.toLocaleString('vi-VN')}đ</span>

                                {/* Nút xoá mục phí */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleRemoveCommonCharge(charge.id);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                  title="Xoá mục phí này"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </label>
                            ))}
                          </div>

                          {/* Thêm phí phát sinh mới */}
                          <div className="bg-white border rounded-lg p-3 space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả phí mới</label>
                              <input
                                type="text"
                                value={newCommonCharge.description}
                                onChange={(e) => setNewCommonCharge({ ...newCommonCharge, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Ví dụ: Vệ sinh máy lạnh, Sơn lại cửa..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (VNĐ)</label>
                                <input
                                  type="number"
                                  value={newCommonCharge.amount}
                                  onChange={(e) => setNewCommonCharge({ ...newCommonCharge, amount: parseInt(e.target.value) || 0 })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                  placeholder="0"
                                  min={0}
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  type="button"
                                  onClick={handleAddCustomCommonCharge}
                                  disabled={!newCommonCharge.description || newCommonCharge.amount <= 0}
                                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 whitespace-nowrap"
                                >
                                  <i className="ri-add-line mr-1"></i>
                                  Thêm
                                </button>
                              </div>
                            </div>
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
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số người</th>
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

                        {/* 1. Khối chọn phòng (Chọn dãy -> Chọn phòng) */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chọn phòng *</h3>

                          {/* Chọn dãy trước */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chọn dãy
                            </label>
                            <select
                              value={selectedBuildingForInvoice}
                              onChange={(e) => {
                                const building = e.target.value;
                                setSelectedBuildingForInvoice(building);

                                // Reset thông tin phòng đã chọn trước đó
                                setNewInvoice(prev => ({
                                  ...prev,
                                  tenantName: '',
                                  room: '',
                                  rentAmount: 0,
                                  electricityUsage: 0,
                                  waterUsage: 0,

                                  // reset dịch vụ tách
                                  internetPlan: bulkSettings.defaultInternetPlan,
                                  internetAmount: 0,
                                  trashAmount: 0,
                                  parkingCount: bulkSettings.defaultParkingCount,
                                  parkingAmount: 0,

                                  additionalCharges: []
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            >
                              <option value="">-- Chọn dãy --</option>
                              {getBuildings().map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>

                          {/* Chọn phòng sau khi đã chọn dãy */}
                          <div className={`${!selectedBuildingForInvoice ? 'opacity-50 pointer-events-none' : ''}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Chọn phòng (kèm tên khách)
                            </label>
                            <select
                              value={newInvoice.room || ''}
                              onChange={(e) => {
                                const roomSelected = roomsBySelectedBuilding.find(r => r.room === e.target.value);
                                if (roomSelected) {
                                  // Tận dụng hàm có sẵn để fill đủ dữ liệu mức tiêu thụ & dịch vụ
                                  handleSelectRoomForInvoice(roomSelected);
                                }
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              disabled={!selectedBuildingForInvoice}
                            >
                              <option value="">-- Chọn phòng --</option>
                              {roomsBySelectedBuilding.map((r) => (
                                <option key={r.id} value={r.room}>
                                  {r.room} • {r.tenantName}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Thông tin phòng đã chọn */}
                          {newInvoice.tenantName && (
                            <div className="mt-3 p-3 bg-white rounded border">
                              <div className="font-medium text-gray-900">{newInvoice.tenantName}</div>
                              <div className="text-sm text-gray-600">
                                Phòng {newInvoice.room} • Dãy {selectedBuildingForInvoice}
                              </div>
                            </div>
                          )}
                        </div>


                        {/* 2. Khối tiêu thụ (Đã sửa ở bước trước) */}
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Mức tiêu thụ & Dịch vụ</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Điện (kWh)</label>
                              <input
                                type="number"
                                value={newInvoice.electricityUsage}
                                onChange={(e) => setNewInvoice({ ...newInvoice, electricityUsage: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                                placeholder="0"
                                readOnly
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Số người</label>
                              <input
                                type="number"
                                value={newInvoice.waterUsage}
                                onChange={(e) => setNewInvoice({ ...newInvoice, waterUsage: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                                placeholder="0"
                                readOnly
                              />
                            </div>
                            <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Internet</label>
                                <input
                                  type="text"
                                  value={`${newInvoice.internetAmount.toLocaleString('vi-VN')}đ (Plan ${newInvoice.internetPlan})`}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rác</label>
                                <input
                                  type="text"
                                  value={`${newInvoice.trashAmount.toLocaleString('vi-VN')}đ`}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gửi xe</label>
                                <input
                                  type="text"
                                  value={`${newInvoice.parkingAmount.toLocaleString('vi-VN')}đ (${newInvoice.parkingCount} xe)`}
                                  readOnly
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
                                />
                              </div>
                            </div>

                          </div>
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
                              <span className="text-gray-600">Tiền nước ({newInvoice.waterUsage} người):</span>
                              <span className="font-medium">{(newInvoice.waterUsage * 60000).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Internet (Plan {newInvoice.internetPlan}):</span>
                              <span className="font-medium">{newInvoice.internetAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Rác:</span>
                              <span className="font-medium">{newInvoice.trashAmount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Gửi xe ({newInvoice.parkingCount} xe):</span>
                              <span className="font-medium">{newInvoice.parkingAmount.toLocaleString('vi-VN')}đ</span>
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
                                onChange={(e) => setTempCharge({ ...tempCharge, description: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                placeholder="Mô tả chi phí phát sinh..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={tempCharge.amount}
                                onChange={(e) => setTempCharge({ ...tempCharge, amount: parseInt(e.target.value) || 0 })}
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
                        disabled={!newInvoice.tenantName || !newInvoice.room} // <-- ĐÃ XÓA check dueDate
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
                            <span className="text-gray-600">Dãy:</span>
                            <span className="font-medium">{selectedPayment.building}</span>
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
                            <span className="text-gray-600">Tiền nước ({selectedPayment.waterUsage} người):</span>
                            <span className="font-medium">{selectedPayment.waterAmount.toLocaleString('vi-VN')}đ</span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-gray-600">Internet (Plan {selectedPayment.internetPlan}):</span>
                            <span className="font-medium">{selectedPayment.internetAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Rác:</span>
                            <span className="font-medium">{selectedPayment.trashAmount.toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Gửi xe ({selectedPayment.parkingCount} xe):</span>
                            <span className="font-medium">{selectedPayment.parkingAmount.toLocaleString('vi-VN')}đ</span>
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
                          onChange={(e) => setPaymentData({ ...paymentData, amount: parseInt(e.target.value) || 0 })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập số tiền thu"
                          max={selectedPaymentForPayment.remainingAmount}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setPaymentData({ ...paymentData, amount: selectedPaymentForPayment.remainingAmount })}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                          >
                            Thu toàn bộ
                          </button>
                          <button
                            onClick={() => setPaymentData({ ...paymentData, amount: Math.floor(selectedPaymentForPayment.remainingAmount / 2) })}
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
                          onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="cash">Tiền mặt</option>
                          <option value="transfer">Chuyển khoản</option>
                          <option value="other">Khác</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thanh toán</label>
                        <input
                          type="date"
                          value={paymentData.date}
                          onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea
                          value={paymentData.note}
                          onChange={(e) => setPaymentData({ ...paymentData, note: e.target.value })}
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
                          onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
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
                          onChange={(e) => setNotificationData({ ...notificationData, content: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={6}
                          placeholder="Nhập nội dung thông báo..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức gửi</label>
                        <select
                          value={notificationData.sendMethod}
                          onChange={(e) => setNotificationData({ ...notificationData, sendMethod: e.target.value as 'app' | 'sms' | 'both' })}
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
                          onChange={(e) => setNewCharge({ ...newCharge, description: e.target.value })}
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
                          onChange={(e) => setNewCharge({ ...newCharge, amount: parseInt(e.target.value) || 0 })}
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
        onClose={() => setShowConfirmDialog(false)}
        type={confirmAction?.type}
      />
    </div>
  );
}
