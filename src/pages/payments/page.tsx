
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
  waterUsage: number; // Số người
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
  waterUsage: number; // Số người
  serviceAmount: number;
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
  waterUsage: number; // Số người
  building: string;
  selected: boolean;
}

interface CommonCharge {
  id: string;
  description: string;
  amount: number;
  selected: boolean;
}

/**
 * Bảng giá dịch vụ (Dùng để tính toán)
 * Điện: 3500/kWh
 * Nước: 60000/Người
 * Rác: 40000/Phòng
 * Gửi xe: 100000/Xe
 * Internet 1: 50000/Phòng
 * Internet 2: 100000/Phòng
 */

const mockPayments: Payment[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    room: 'A101',
    month: '2025-10',
    rentAmount: 3500000,
    electricityUsage: 100, // 100 kWh
    electricityAmount: 350000, // 100 * 3500
    waterUsage: 2, // 2 người
    waterAmount: 120000, // 2 * 60000
    serviceAmount: 290000, // Internet 1 (50k) + Rác (40k) + Gửi xe (2 xe * 100k = 200k)
    additionalCharges: [
      { id: '1', description: 'Sửa vòi nước', amount: 150000, date: '2025-10-10' }
    ],
    totalAmount: 4410000, // 3.5M + 350k + 120k + 290k + 150k
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
    month: '2025-10',
    rentAmount: 3200000,
    electricityUsage: 80, // 80 kWh
    electricityAmount: 280000, // 80 * 3500
    waterUsage: 1, // 1 người
    waterAmount: 60000, // 1 * 60000
    serviceAmount: 240000, // Internet 2 (100k) + Rác (40k) + Gửi xe (1 xe * 100k = 100k)
    additionalCharges: [],
    totalAmount: 3780000, // 3.2M + 280k + 60k + 240k
    paidAmount: 3200000, // Mới trả tiền nhà
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
    month: '2025-10',
    rentAmount: 4000000,
    electricityUsage: 150, // 150 kWh
    electricityAmount: 525000, // 150 * 3500
    waterUsage: 3, // 3 người
    waterAmount: 180000, // 3 * 60000
    serviceAmount: 340000, // Internet 2 (100k) + Rác (40k) + Gửi xe (2 xe * 100k = 200k)
    additionalCharges: [],
    totalAmount: 5045000, // 4M + 525k + 180k + 340k
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
    month: '2025-11',
    rentAmount: 3800000,
    electricityUsage: 110, // 110 kWh
    electricityAmount: 385000, // 110 * 3500
    waterUsage: 2, // 2 người
    waterAmount: 120000, // 2 * 60000
    serviceAmount: 190000, // Internet 1 (50k) + Rác (40k) + Gửi xe (1 xe * 100k = 100k)
    additionalCharges: [],
    totalAmount: 4495000, // 3.8M + 385k + 120k + 190k
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
    month: '2025-09',
    rentAmount: 3500000,
    electricityUsage: 90, // 90 kWh
    electricityAmount: 315000, // 90 * 3500
    waterUsage: 2, // 2 người
    waterAmount: 120000, // 2 * 60000
    serviceAmount: 290000, // Internet 1 (50k) + Rác (40k) + Gửi xe (2 xe * 100k = 200k)
    additionalCharges: [],
    totalAmount: 4225000, // 3.5M + 315k + 120k + 290k
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
    month: '2025-11',
    rentAmount: 4500000,
    electricityUsage: 130, // 130 kWh
    electricityAmount: 455000, // 130 * 3500
    waterUsage: 2, // 2 người
    waterAmount: 120000, // 2 * 60000
    serviceAmount: 140000, // Internet 2 (100k) + Rác (40k) + Gửi xe (0 xe)
    additionalCharges: [
      { id: '2', description: 'Phí làm thêm chìa khóa', amount: 80000, date: '2025-11-02' }
    ],
    totalAmount: 5295000, // 4.5M + 455k + 120k + 140k + 80k
    paidAmount: 0,
    remainingAmount: 5295000,
    dueDate: '2025-12-05',
    status: 'pending',
    paymentMethod: undefined
  }
];

// === ĐÃ CẬP NHẬT ===
// Cập nhật lại mã phòng, tên khách, và số điện (usage)
// để khớp với dữ liệu trong `mockPayments`
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

// === ĐÃ CẬP NHẬT ===
// Cập nhật mã phòng, tên, tiền thuê, số điện/nước
// để làm nguồn dữ liệu lập hóa đơn hàng loạt
// (waterUsage ở đây là SỐ NGƯỜI)
const mockBulkRooms: BulkInvoiceRoom[] = [
  {
    id: '1',
    room: 'A101',
    tenantName: 'Nguyễn Văn A',
    rentAmount: 3500000,
    electricityUsage: 100, // Đã ghi ở T10
    waterUsage: 2, // 2 người
    building: 'Dãy A',
    selected: false
  },
  {
    id: '2',
    room: 'A102',
    tenantName: 'Trần Thị B',
    rentAmount: 3200000,
    electricityUsage: 80, // Đã ghi ở T10
    waterUsage: 1, // 1 người
    building: 'Dãy A',
    selected: false
  },
  {
    id: '3',
    room: 'B201',
    tenantName: 'Lê Văn C',
    rentAmount: 4000000,
    electricityUsage: 150, // Đã ghi ở T10
    waterUsage: 3, // 3 người
    building: 'Dãy B',
    selected: false
  },
  {
    id: '4',
    room: 'B202',
    tenantName: 'Phạm Hoàng D',
    rentAmount: 3800000,
    electricityUsage: 110, // Chưa ghi (cho T11)
    waterUsage: 2, // 2 người
    building: 'Dãy B',
    selected: false
  },
  {
    id: '5',
    room: 'C301',
    tenantName: 'Vũ Đình E',
    rentAmount: 4500000,
    electricityUsage: 130, // Chưa ghi (cho T11)
    waterUsage: 2, // 2 người
    building: 'Dãy C',
    selected: false
  },
  {
    id: '6',
    room: 'C302',
    tenantName: 'Trần Văn F',
    rentAmount: 4100000,
    electricityUsage: 95, // Đã ghi ở T10
    waterUsage: 2, // 2 người
    building: 'Dãy C',
    selected: false
  }
];

// === KHÔNG THAY ĐỔI ===
// Các khoản phí này dùng chung khi lập hóa đơn hàng loạt, không cần đồng bộ
const defaultCommonCharges: CommonCharge[] = [
  { id: '1', description: 'Rác tháng Tết', amount: 40000, selected: true }, // Mặc định chọn
  { id: '2', description: 'Phí vệ sinh chung', amount: 50000, selected: false },
  { id: '3', description: 'Phí an ninh', amount: 100000, selected: false },
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
  const [searchRoomQuery, setSearchRoomQuery] = useState(''); // <-- Đổi tên
  const [showRoomDropdown, setShowRoomDropdown] = useState(false); // <-- Đổi tên
  const [tempCharge, setTempCharge] = useState({ description: '', amount: 0 });

  // New invoice states
  const [newInvoice, setNewInvoice] = useState<NewInvoice>({
    tenantName: '',
    room: '',
    month: new Date().toISOString().slice(0, 7),
    rentAmount: 0,
    electricityUsage: 0,
    waterUsage: 0, // Đây là số người
    serviceAmount: 0,
    additionalCharges: [],
    notes: ''
  });

  // Bulk invoice states
  const [bulkRooms, setBulkRooms] = useState<BulkInvoiceRoom[]>(mockBulkRooms);
  const [commonCharges, setCommonCharges] = useState<CommonCharge[]>(defaultCommonCharges);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [bulkSettings, setBulkSettings] = useState({
    month: new Date().toISOString().slice(0, 7),
    electricityRate: 3500,
    waterRate: 60000, // Giá theo người
    serviceAmount: 150000, // Phí dịch vụ (Internet + Rác + Xe)
    // dueDate: '' // <-- ĐÃ XÓA (sẽ tự tính)
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
        // === BẮT ĐẦU CẬP NHẬT STATE ===
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

              // Nếu hóa đơn đã 'paid' trước đó, chuyển lại thành 'partial' vì có nợ mới
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
        // === KẾT THÚC CẬP NHẬT STATE ===

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

    if (!selectedPaymentForPayment) return; // Kiểm tra an toàn

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
        // === BẮT ĐẦU CẬP NHẬT STATE ===
        setPayments(prevPayments =>
          prevPayments.map(payment => {
            if (payment.id === selectedPaymentForPayment.id) {
              const newPaidAmount = payment.paidAmount + paymentData.amount;
              const newRemainingAmount = payment.totalAmount - newPaidAmount;

              // Nếu nợ còn lại <= 0, chuyển status thành 'paid'
              const newStatus = newRemainingAmount <= 0 ? 'paid' : 'partial';

              return {
                ...payment,
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                status: newStatus,
                paidDate: paymentData.date, // Cập nhật ngày trả
                paymentMethod: paymentData.method // Cập nhật phương thức
              };
            }
            return payment;
          })
        );
        // === KẾT THÚC CẬP NHẬT STATE ===

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

    // Tự động tính hạn thanh toán là ngày 5 tháng sau
    const [year, month] = bulkSettings.month.split('-').map(Number);
    const dueDate = new Date(year, month, 5).toISOString().split('T')[0]; // Format YYYY-MM-DD
    const dueDateString = new Date(dueDate).toLocaleDateString('vi-VN');

    showConfirm({
      title: 'Xác nhận tạo hóa đơn hàng loạt',
      message: `Bạn có chắc chắn muốn tạo ${selectedRooms.length} hóa đơn (Hạn nộp: ${dueDateString}) không?`,
      onConfirm: () => {
        // --- LOGIC THÊM MỚI BẮT ĐẦU TỪ ĐÂY ---
        const selectedCharges = commonCharges.filter(charge => charge.selected);

        // 1. Tạo các đối tượng Payment mới
        const newPayments: Payment[] = selectedRooms.map((room, index) => {
          const electricityAmount = room.electricityUsage * bulkSettings.electricityRate;
          const waterAmount = room.waterUsage * bulkSettings.waterRate; // waterUsage là số người

          // Lấy phí dịch vụ cố định (Internet + Rác + Xe) từ cài đặt
          // (Chúng ta sẽ dùng giá trị này thay vì tính toán chi tiết trong mock)
          const serviceAmount = bulkSettings.serviceAmount;

          // Tạo các khoản phí phát sinh từ "commonCharges"
          const newAdditionalCharges: AdditionalCharge[] = selectedCharges.map((charge, chargeIndex) => ({
            id: `bc-${room.id}-${chargeIndex}`,
            description: charge.description,
            amount: charge.amount,
            date: new Date().toISOString().split('T')[0]
          }));

          const additionalAmount = newAdditionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
          const totalAmount = room.rentAmount + electricityAmount + waterAmount + serviceAmount + additionalAmount;

          return {
            id: `inv-${Date.now()}-${index}`, // ID mới
            tenantName: room.tenantName,
            room: room.room,
            month: bulkSettings.month,
            rentAmount: room.rentAmount,
            electricityUsage: room.electricityUsage,
            electricityAmount: electricityAmount,
            waterUsage: room.waterUsage,
            waterAmount: waterAmount,
            serviceAmount: serviceAmount,
            additionalCharges: newAdditionalCharges,
            totalAmount: totalAmount,
            paidAmount: 0,
            remainingAmount: totalAmount,
            dueDate: dueDate,
            paidDate: undefined,
            status: 'pending' as 'pending',
            paymentMethod: undefined
          };
        });

        // 2. Cập nhật state chính
        setPayments(prevPayments => [...prevPayments, ...newPayments]);
        // --- LOGIC THÊM MỚI KẾT THÚC ---

        const invoiceCount = selectedRooms.length;
        const totalAmount = calculateBulkTotal(); // Hàm này chỉ để tính tổng tiền cho thông báo

        success({
          title: 'Tạo hóa đơn hàng loạt thành công',
          message: `Đã tạo ${invoiceCount} hóa đơn với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}đ`
        });
        setShowBulkModal(false);

        // Reset selections (Reset về giá trị mặc định, không chỉ là bỏ chọn)
        setBulkRooms(prev => prev.map(room => ({ ...room, selected: false })));
        setCommonCharges(defaultCommonCharges);
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
    const dueDate = new Date(year, month, 5).toISOString().split('T')[0]; // Format YYYY-MM-DD
    const dueDateString = new Date(dueDate).toLocaleDateString('vi-VN');

    showConfirm({
      title: 'Xác nhận tạo hóa đơn',
      message: `Bạn có chắc chắn muốn tạo hóa đơn cho "${newInvoice.tenantName}" (Hạn nộp: ${dueDateString}) không?`,
      onConfirm: () => {
        // --- LOGIC THÊM MỚI BẮT ĐẦU TỪ ĐÂY ---
        const totalAmount = calculateNewInvoiceTotal();
        const electricityAmount = newInvoice.electricityUsage * 3500;
        const waterAmount = newInvoice.waterUsage * 60000; // Giá theo người

        // 1. Tạo đối tượng Payment mới
        const newPayment: Payment = {
          id: `inv-${Date.now()}`, // ID mới
          tenantName: newInvoice.tenantName,
          room: newInvoice.room,
          month: newInvoice.month,
          rentAmount: newInvoice.rentAmount,
          electricityUsage: newInvoice.electricityUsage,
          electricityAmount: electricityAmount,
          waterUsage: newInvoice.waterUsage, // Số người
          waterAmount: waterAmount,
          serviceAmount: newInvoice.serviceAmount,
          additionalCharges: newInvoice.additionalCharges,
          totalAmount: totalAmount,
          paidAmount: 0,
          remainingAmount: totalAmount,
          dueDate: dueDate,
          paidDate: undefined,
          status: 'pending',
          paymentMethod: undefined
        };

        // 2. Cập nhật state chính
        setPayments(prevPayments => [...prevPayments, newPayment]);
        // --- LOGIC THÊM MỚI KẾT THÚC ---

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
          notes: ''
        });
        setSearchRoomQuery('');
      }
    });
  };

  const calculateNewInvoiceTotal = () => {
    const electricityAmount = newInvoice.electricityUsage * 3500;
    const waterAmount = newInvoice.waterUsage * 60000;
    const additionalAmount = newInvoice.additionalCharges.reduce((sum, charge) => sum + charge.amount, 0);
    return newInvoice.rentAmount + electricityAmount + waterAmount + newInvoice.serviceAmount + additionalAmount;
  };

  // Đổi tên và dùng state 'searchRoomQuery'
  const filteredRoomsForInvoice = mockBulkRooms.filter((room: BulkInvoiceRoom) =>
    room.tenantName.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
    room.room.toLowerCase().includes(searchRoomQuery.toLowerCase())
  );

  const filteredPayments = filterStatus === 'all'
    ? payments // <-- Sửa
    : payments.filter(payment => payment.status === filterStatus); // <-- Sửa

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.paidAmount, 0); // <-- Sửa
  const totalPending = payments.reduce((sum, payment) => sum + payment.remainingAmount, 0); // <-- Sửa

  const handleDeletePayment = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return; // Kiểm tra an toàn

    showConfirm({
      title: 'Xác nhận xóa hóa đơn',
      message: `Bạn có chắc chắn muốn xóa hóa đơn của "${payment.tenantName}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        // === BẮT ĐẦU CẬP NHẬT STATE ===
        setPayments(prevPayments => prevPayments.filter(p => p.id !== paymentId));
        // === KẾT THÚC CẬP NHẬT STATE ===

        success({
          title: 'Xóa hóa đơn thành công',
          message: `Đã xóa hóa đơn của ${payment.tenantName} thành công`
        });
      },
      type: 'danger'
    });
  };

  // Đổi tên hàm và logic
  const handleSelectRoomForInvoice = (room: BulkInvoiceRoom) => {
    // Tự động điền tất cả thông tin từ phòng đã chọn
    setNewInvoice({
      ...newInvoice,
      tenantName: room.tenantName,
      room: room.room,
      rentAmount: room.rentAmount || 0,
      electricityUsage: room.electricityUsage || 0, // Tự động điền số điện
      waterUsage: room.waterUsage || 0, // Tự động điền số người
      // Lấy phí dịch vụ mặc định từ bulkSettings (giống như tạo hàng loạt)
      serviceAmount: bulkSettings.serviceAmount || 0,
      additionalCharges: [], // Reset phí phát sinh
      notes: '' // Reset ghi chú
    });
    setSearchRoomQuery(`${room.tenantName} - ${room.room}`); // Dùng state mới
    setShowRoomDropdown(false); // Dùng state mới
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
                              <span className="text-gray-700">Phí dịch vụ (Net, Rác, Xe):</span>
                              <span className="font-medium text-gray-900">{bulkSettings.serviceAmount.toLocaleString('vi-VN')}đ / Phòng</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-700">Hạn thanh toán:</span>
                              <span className="font-medium text-gray-900">Ngày 5 tháng sau</span>
                            </div>
                          </div>
                        </div>

                        {/* Phí phát sinh (Thay cho Phí chung) */}
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Phí phát sinh (Tùy chọn)</h3>
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

                        {/* 1. Khối chọn phòng (Chỉ 1 lần) */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chọn phòng *</h3>
                          <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tìm kiếm phòng
                            </label>
                            <input
                              type="text"
                              value={searchRoomQuery}
                              onChange={(e) => {
                                setSearchRoomQuery(e.target.value);
                                setShowRoomDropdown(true);
                              }}
                              onFocus={() => setShowRoomDropdown(true)}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              placeholder="Nhập tên khách hoặc số phòng..."
                            />
                            {showRoomDropdown && filteredRoomsForInvoice.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {filteredRoomsForInvoice.map((room) => (
                                  <div
                                    key={room.id}
                                    onClick={() => handleSelectRoomForInvoice(room)}
                                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  >
                                    <div className="font-medium text-gray-900">{room.tenantName}</div>
                                    <div className="text-sm text-gray-600">
                                      Phòng {room.room} • Dãy {room.building}
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
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phí dịch vụ (VNĐ)</label>
                              <input
                                type="number"
                                value={newInvoice.serviceAmount}
                                onChange={(e) => setNewInvoice({ ...newInvoice, serviceAmount: parseInt(e.target.value) || 0 })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                placeholder="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 3. Khối ghi chú (Đã sửa ở bước trước) */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Ghi chú</h3>
                          <textarea
                            value={newInvoice.notes}
                            onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
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
                              <span className="text-gray-600">Tiền nước ({newInvoice.waterUsage} người):</span>
                              <span className="font-medium">{(newInvoice.waterUsage * 60000).toLocaleString('vi-VN')}đ</span>
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
                            <span className="text-gray-600">Tiền nước ({newInvoice.waterUsage} người):</span>
                            <span className="font-medium">{(newInvoice.waterUsage * 60000).toLocaleString('vi-VN')}đ</span>
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
