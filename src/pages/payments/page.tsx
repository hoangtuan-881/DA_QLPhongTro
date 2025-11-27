
import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Pagination from '../../components/base/Pagination';
import thanhToanService from '../../services/thanh-toan.service';
import hoaDonService, { HoaDon, CreateHoaDonRequest, ChiTietHoaDon, CreateBulkHoaDonRequest, AddAdditionalChargeRequest, HoaDonStatistics } from '../../services/hoa-don.service';
import soDienService, { SoDien, CreateSoDienRequest } from '../../services/so-dien.service';
import thongBaoService, { ThongBao, CreateThongBaoRequest } from '../../services/thong-bao.service';
import phongTroService, { PhongTro } from '../../services/phong-tro.service';
import hopDongService from '../../services/hop-dong.service';
import { getErrorMessage } from '../../lib/http-client';

// Temporary interfaces cho UI features
type InternetPlan = 1 | 2;

interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
  date: string;
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

  // Backend integration fields
  MaPhong?: number;
  MaHopDong?: number;
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


const defaultCommonCharges: CommonCharge[] = [
  { id: '1', description: 'Rác tháng Tết', amount: 40000, selected: true },
];

export default function Payments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedHoaDon, setSelectedHoaDon] = useState<HoaDon | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showElectricModal, setShowElectricModal] = useState(false);
  const [showAdditionalChargesModal, setShowAdditionalChargesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [electricFilterBuilding, setElectricFilterBuilding] = useState<string>('all');
  const [electricFilterMonth, setElectricFilterMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // Format: YYYY-MM
  );
  const [electricReadings, setElectricReadings] = useState<ElectricReading[]>([]);
  const [editingReading, setEditingReading] = useState<string | null>(null);

  // Pagination for electricity readings modal
  const [electricReadingsPage, setElectricReadingsPage] = useState(1);
  const [electricReadingsPerPage] = useState(10);
  const [selectedHoaDonForCharges, setSelectedHoaDonForCharges] = useState<HoaDon | null>(null);
  const [newCharge, setNewCharge] = useState({ description: '', amount: 0 });
  const [selectedHoaDonForPayment, setSelectedHoaDonForPayment] = useState<HoaDon | null>(null);
  const [selectedHoaDonForNotification, setSelectedHoaDonForNotification] = useState<HoaDon | null>(null);
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
    notes: '',
    MaPhong: undefined,
    MaHopDong: undefined
  });
  const [selectedBuildingForInvoice, setSelectedBuildingForInvoice] = useState<string>('');
  const [bulkRooms, setBulkRooms] = useState<BulkInvoiceRoom[]>([]);
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

  // State cho HoaDon từ Backend
  const [hoaDons, setHoaDons] = useState<HoaDon[]>([]); // Paginated for display
  const [allHoaDonsForCheck, setAllHoaDonsForCheck] = useState<HoaDon[]>([]); // All invoices for duplicate checking
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [soDiens, setSoDiens] = useState<SoDien[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhongTros, setLoadingPhongTros] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statistics, setStatistics] = useState<HoaDonStatistics>({
    TongTien: 0,
    DaThanhToan: 0,
    ConLai: 0,
    TongSoHoaDon: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Load HoaDon và Statistics từ Backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch statistics, paginated data, và ALL data cho check duplicate
        const [statsResponse, hoaDonsResponse, allHoaDonsResponse] = await Promise.all([
          hoaDonService.getStatistics(controller.signal),
          hoaDonService.getAll({ page: currentPage, perPage }, controller.signal),
          hoaDonService.getAllNoPagination(controller.signal) // Fetch all for duplicate check
        ]);

        if (!controller.signal.aborted) {
          setStatistics(statsResponse.data.data);

          const response = hoaDonsResponse.data;
          setHoaDons(response.data || []);
          setCurrentPage(response.meta?.current_page || 1);
          setTotalPages(response.meta?.last_page || 1);
          setTotal(response.meta?.total || 0);

          // Set all invoices for duplicate checking
          const allResponse = allHoaDonsResponse.data;
          setAllHoaDonsForCheck(allResponse.data || []);

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
  }, [refreshKey, currentPage, perPage]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // Load PhongTro và SoDien data (chỉ phòng có khách thuê)
  useEffect(() => {
    const controller = new AbortController();

    const fetchRoomsAndElectricity = async () => {
      try {
        const [phongTrosResponse, soDiensResponse] = await Promise.all([
          phongTroService.getAll(controller.signal),
          soDienService.getAll(controller.signal)
        ]);

        if (!controller.signal.aborted) {
          const allPhongTros = phongTrosResponse.data.data || [];
          const soDiensData = soDiensResponse.data.data || [];

          // Lọc chỉ lấy phòng có khách thuê
          const phongTrosCoKhach = allPhongTros.filter(phong =>
            phong.khachThue && phong.khachThue.length > 0
          );

          setPhongTros(phongTrosCoKhach);
          setSoDiens(soDiensData);
          setLoadingPhongTros(false);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error('❌ Error loading rooms/electricity:', err);
          setLoadingPhongTros(false);
        }
      }
    };

    fetchRoomsAndElectricity();
    return () => controller.abort();
  }, [refreshKey]);

  // Build electricity readings từ phongTros (chỉ phòng có khách thuê và chưa có hóa đơn tháng đã chọn)
  useEffect(() => {
    if (phongTros.length > 0) {
      const readings: ElectricReading[] = phongTros
        .filter(phong => {
          const maPhong = phong.MaPhong;
          const hasInvoice = hasInvoiceInMonth(maPhong, electricFilterMonth);
          return !hasInvoice;
        })
        .map(phong => {
          const lastReading = soDiens
            .filter(sd => sd.MaPhong === phong.MaPhong)
            .sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];

          return {
            id: phong.MaPhong.toString(),
            building: phong.TenDay || 'N/A',
            room: phong.TenPhong,
            tenantName: phong.khachThue?.[0]?.HoTen || 'N/A',
            oldReading: lastReading?.ChiSoMoi || 0,
            newReading: lastReading?.ChiSoMoi || 0,
            usage: 0
          };
        });

      // Sort theo tên phòng
      const sortedReadings = readings.sort((a, b) => a.room.localeCompare(b.room));
      setElectricReadings(sortedReadings);
    }
  }, [phongTros, soDiens, electricFilterMonth, allHoaDonsForCheck]);

  // Reset pagination when electricReadings change
  useEffect(() => {
    setElectricReadingsPage(1);
  }, [electricReadings.length]);

  // Build bulk rooms từ phongTros (chỉ phòng có khách thuê)
  useEffect(() => {
    if (phongTros.length > 0) {
      const rooms: BulkInvoiceRoom[] = phongTros.map(phong => {
        // Tìm chỉ số điện gần nhất
        const lastReading = soDiens
          .filter(sd => sd.MaPhong === phong.MaPhong)
          .sort((a, b) => new Date(b.NgayGhi).getTime() - new Date(a.NgayGhi).getTime())[0];

        return {
          id: phong.MaPhong.toString(),
          room: phong.TenPhong,
          tenantName: phong.khachThue?.[0]?.HoTen || 'N/A',
          rentAmount: phong.GiaThueHienTai || phong.DonGiaCoBan,
          electricityUsage: lastReading?.SoKwh || 0,
          waterUsage: phong.khachThue?.length || 1, // Số người
          building: phong.TenDay,
          selected: false,
          internetPlan: 1,
          parkingCount: 0,
          trashIncluded: true
        };
      });

      setBulkRooms(rooms);
    }
  }, [phongTros, soDiens]);

  const electricBuildings = useMemo(() => {
    return [...new Set(electricReadings.map(r => r.building))].sort();
  }, [electricReadings]);

  const filteredElectricReadings = useMemo(() => {
    if (electricFilterBuilding === 'all') {
      return electricReadings;
    }
    return electricReadings.filter(r => r.building === electricFilterBuilding);
  }, [electricReadings, electricFilterBuilding]);

  // Calculate paginated electricity readings based on the filtered list
  const getPaginatedElectricReadings = () => {
    const startIndex = (electricReadingsPage - 1) * electricReadingsPerPage;
    const endIndex = startIndex + electricReadingsPerPage;
    return filteredElectricReadings.slice(startIndex, endIndex);
  };

  const electricReadingsTotalPages = Math.ceil(filteredElectricReadings.length / electricReadingsPerPage);

  // Reset page to 1 when filter changes
  useEffect(() => {
    setElectricReadingsPage(1);
  }, [electricFilterBuilding]);

  // Format tiền đầy đủ cho ngữ cảnh tài chính (không viết tắt)
  const formatCurrency = (amount: number | string): string => {
    const num = Number(amount || 0);
    return `${num.toLocaleString('vi-VN')}đ`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'da_thanh_toan': return 'bg-green-100 text-green-800';
      case 'da_thanh_toan_mot_phan': return 'bg-yellow-100 text-yellow-800';
      case 'moi_tao': return 'bg-blue-100 text-blue-800';
      case 'qua_han': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'da_thanh_toan': return 'Đã thanh toán';
      case 'da_thanh_toan_mot_phan': return 'Thanh toán một phần';
      case 'moi_tao': return 'Chờ thanh toán';
      case 'qua_han': return 'Quá hạn';
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

  const handleSaveReading = async (id: string) => {
    try {
      const reading = electricReadings.find(r => r.id === id);
      if (!reading) return;

      // Validate
      if (reading.newReading < reading.oldReading) {
        error({
          title: 'Lỗi nhập liệu',
          message: 'Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ'
        });
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      const soDienData: CreateSoDienRequest = {
        MaPhong: parseInt(id), // Assuming id is MaPhong
        Thang: currentMonth,
        ChiSoCu: reading.oldReading,
        ChiSoMoi: reading.newReading,
        NgayGhi: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        GhiChu: null
      };

      await soDienService.create(soDienData);

      setEditingReading(null);
      success({
        title: 'Lưu chỉ số điện thành công',
        message: `Đã lưu chỉ số điện cho phòng ${reading.room}: ${reading.usage} kWh`
      });
      refreshData(); // Refresh all data from backend
    } catch (err) {
      error({
        title: 'Lỗi lưu chỉ số điện',
        message: getErrorMessage(err)
      });
    }
  };

  const handleAddAdditionalCharge = (hoaDon: HoaDon) => {
    setSelectedHoaDonForCharges(hoaDon);
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

    if (!selectedHoaDonForCharges) return; // Kiểm tra an toàn

    showConfirm({
      title: 'Xác nhận thêm chi phí phát sinh',
      message: `Bạn có chắc chắn muốn thêm chi phí phát sinh "${newCharge.description}" với số tiền ${newCharge.amount.toLocaleString('vi-VN')}đ không?`,
      onConfirm: async () => {
        try {
          // Gọi API thêm phí phát sinh
          await hoaDonService.addAdditionalCharge(selectedHoaDonForCharges.MaHoaDon, {
            description: newCharge.description,
            amount: newCharge.amount
          });

          success({
            title: 'Thêm phát sinh thành công',
            message: `Đã thêm ${newCharge.description} - ${newCharge.amount.toLocaleString('vi-VN')}đ`
          });

          // Refresh data to get updated invoice
          refreshData();

          setShowAdditionalChargesModal(false);
          setNewCharge({ description: '', amount: 0 });
          setSelectedHoaDonForCharges(null);
        } catch (err) {
          error({
            title: 'Lỗi thêm phát sinh',
            message: getErrorMessage(err)
          });
        }
      }
    });
  };

  const handleCollectPayment = (hoaDon: HoaDon) => {
    setSelectedHoaDonForPayment(hoaDon);
    setPaymentData({
      amount: Number(hoaDon.ConLai || 0),
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

    if (!selectedHoaDonForPayment) return;

    if (paymentData.amount > selectedHoaDonForPayment.ConLai) {
      error({
        title: 'Lỗi thu tiền',
        message: 'Số tiền thu không được vượt quá số tiền còn lại'
      });
      return;
    }

    const tenantName = selectedHoaDonForPayment.hopDong?.khachThue?.HoTen || selectedHoaDonForPayment.hopDong?.TenKhachThue || 'Khách thuê';

    showConfirm({
      title: 'Xác nhận thu tiền',
      message: `Bạn có chắc chắn muốn thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ "${tenantName}" không?`,
      onConfirm: async () => {
        try {
          // Gọi API tạo bản ghi thanh toán
          await thanhToanService.create({
            MaHoaDon: selectedHoaDonForPayment.MaHoaDon,
            SoTien: paymentData.amount,
            NgayThanhToan: paymentData.date,
            PhuongThuc: paymentData.method === 'cash' ? 'tien_mat' : 'chuyen_khoan',
            GhiChu: paymentData.note || null
          });

          success({
            title: 'Thu tiền thành công',
            message: `Đã thu ${paymentData.amount.toLocaleString('vi-VN')}đ từ ${tenantName}`
          });

          // Refresh data to get updated invoice
          refreshData();

          setShowPaymentModal(false);
          setSelectedHoaDonForPayment(null);
          setPaymentData({
            amount: 0,
            method: 'cash',
            note: '',
            date: new Date().toISOString().split('T')[0]
          });
        } catch (err) {
          error({
            title: 'Lỗi thu tiền',
            message: getErrorMessage(err)
          });
        }
      }
    });
  };

  const handleSendPaymentNotification = (hoaDon: HoaDon) => {
    setSelectedHoaDonForNotification(hoaDon);
    const tenantName = hoaDon.hopDong?.khachThue?.HoTen || hoaDon.hopDong?.TenKhachThue || 'Khách thuê';
    const roomName = hoaDon.phongTro?.TenPhong || `Phòng ${hoaDon.MaPhong}`;
    setNotificationData({
      title: `Nhắc nhở thanh toán - ${roomName}`,
      content: `Kính gửi ${tenantName},\n\nBạn có hóa đơn tháng ${hoaDon.Thang} chưa thanh toán với số tiền ${Number(hoaDon.ConLai || 0).toLocaleString('vi-VN')}đ.\n\nHạn thanh toán: ${new Date(hoaDon.NgayHetHan).toLocaleDateString('vi-VN')}\n\nVui lòng thanh toán sớm để tránh phát sinh phí phạt.\n\nTrân trọng,\nBan quản lý`,
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

    if (!selectedHoaDonForNotification) return;

    const tenantName = selectedHoaDonForNotification.hopDong?.khachThue?.HoTen || selectedHoaDonForNotification.hopDong?.TenKhachThue || 'Khách thuê';
    const methodText = notificationData.sendMethod === 'app' ? 'qua ứng dụng' :
      notificationData.sendMethod === 'sms' ? 'qua SMS' : 'qua ứng dụng và SMS';

    showConfirm({
      title: 'Xác nhận gửi thông báo',
      message: `Bạn có chắc chắn muốn gửi thông báo ${methodText} cho "${tenantName}" không?`,
      onConfirm: () => {
        success({
          title: 'Gửi thông báo thành công',
          message: `Đã gửi thông báo ${methodText} cho ${tenantName}`
        });

        setShowNotificationModal(false);
        setSelectedHoaDonForNotification(null);
        setNotificationData({
          title: '',
          content: '',
          type: 'payment',
          sendMethod: 'app'
        });
      }
    });
  };

  const handleViewDetail = async (hoaDon: HoaDon) => {
    try {
      // Fetch chi tiết đầy đủ từ API
      const response = await hoaDonService.getById(hoaDon.MaHoaDon);
      setSelectedHoaDon(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      error({
        title: 'Lỗi tải chi tiết hóa đơn',
        message: getErrorMessage(err)
      });
    }
  };

  const handleSelectRoom = (roomId: string) => {
    setBulkRooms(prev => prev.map(room =>
      room.id === roomId ? { ...room, selected: !room.selected } : room
    ));
  };

  const handleSelectAllRooms = () => {
    const filteredRooms = getFilteredRooms(); // Chỉ phòng available (chưa có hóa đơn)
    const allFilteredSelected = filteredRooms.every(room => room.selected);
    const filteredRoomIds = new Set(filteredRooms.map(r => r.id));

    setBulkRooms(prev => prev.map(room => {
      // Chỉ toggle phòng nằm trong filteredRooms (available)
      if (filteredRoomIds.has(room.id)) {
        return { ...room, selected: !allFilteredSelected };
      }
      return room; // Các phòng khác giữ nguyên trạng thái
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

  // Helper: Check xem phòng đã có hóa đơn trong tháng chưa
  const hasInvoiceInMonth = (maPhong: number, thang: string): boolean => {
    return allHoaDonsForCheck.some(hoaDon =>
      hoaDon.MaPhong === maPhong && hoaDon.Thang === thang
    );
  };

  // Filter phòng theo dãy đã chọn và chưa có hóa đơn trong tháng (cho modal đơn lẻ)
  const roomsBySelectedBuilding: BulkInvoiceRoom[] = useMemo(() => {
    if (!selectedBuildingForInvoice) return [];
    return bulkRooms.filter(r => {
      const matchesBuilding = r.building === selectedBuildingForInvoice;
      const maPhong = parseInt(r.id);
      const hasInvoice = hasInvoiceInMonth(maPhong, newInvoice.month);
      return matchesBuilding && !hasInvoice; // Chỉ lấy phòng trong dãy và chưa có hóa đơn
    });
  }, [selectedBuildingForInvoice, bulkRooms, newInvoice.month, allHoaDonsForCheck]);

  // Filter phòng chưa có hóa đơn trong tháng được chọn
  const getAvailableRoomsForBulk = () => {
    return bulkRooms.filter(room => {
      const maPhong = parseInt(room.id);
      const hasInvoice = hasInvoiceInMonth(maPhong, bulkSettings.month);
      return !hasInvoice;
    });
  };

  const getFilteredRooms = () => {
    const availableRooms = getAvailableRoomsForBulk();
    if (selectedBuilding === 'all') {
      return availableRooms;
    }
    return availableRooms.filter(room => room.building === selectedBuilding);
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


  const handleCreateBulkInvoices = async () => {
    const selectedRooms = bulkRooms.filter(room => room.selected);

    if (selectedRooms.length === 0) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn ít nhất một phòng để tạo hóa đơn!'
      });
      return;
    }

    try {
      const selectedCharges: CommonCharge[] = commonCharges.filter(c => c.selected);

      // Build commonCharges for API (if any)
      const apiCommonCharges = selectedCharges.map(c => ({
        description: c.description,
        amount: c.amount
      }));

      const roomIds = selectedRooms.map(room => parseInt(room.id));

      const bulkData: CreateBulkHoaDonRequest = {
        Thang: bulkSettings.month,
        roomIds,
        commonCharges: apiCommonCharges.length > 0 ? apiCommonCharges : undefined
      };

      await hoaDonService.createBulk(bulkData);

      const totalAmount = calculateBulkTotal();

      success({
        title: 'Tạo hóa đơn hàng loạt thành công',
        message: `Đã tạo ${selectedRooms.length} hóa đơn với tổng giá trị ${totalAmount.toLocaleString('vi-VN')}đ`
      });

      // Refresh data
      refreshData();

      setShowBulkModal(false);
      setBulkRooms(prev => prev.map(room => ({ ...room, selected: false })));
      setCommonCharges(defaultCommonCharges.map(c => ({ ...c, selected: false })));
    } catch (err) {
      error({
        title: 'Lỗi tạo hóa đơn hàng loạt',
        message: getErrorMessage(err)
      });
    }
  };

  const handleCreateNewInvoice = async () => {
    if (!newInvoice.tenantName || !newInvoice.room) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Vui lòng chọn tháng và khách thuê.'
      });
      return;
    }

    if (!newInvoice.MaPhong) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: 'Không tìm thấy mã phòng. Vui lòng chọn lại phòng.'
      });
      return;
    }

    try {
      const [year, month] = newInvoice.month.split('-').map(Number);
      const ngayLap = new Date().toISOString().split('T')[0];
      const ngayHetHan = new Date(year, month, 5).toISOString().split('T')[0];

      // Calculate amounts
      const electricityAmount = newInvoice.electricityUsage * bulkSettings.electricityRate;
      const waterAmount = newInvoice.waterUsage * bulkSettings.waterRate;
      const totalAmount = calculateNewInvoiceTotal();

      // Build chiTietHoaDon array
      const chiTietHoaDon: ChiTietHoaDon[] = [];

      // 1. Tiền thuê
      if (newInvoice.rentAmount > 0) {
        chiTietHoaDon.push({
          NoiDung: `Tiền thuê phòng tháng ${month}/${year}`,
          SoLuong: 1,
          DonGia: newInvoice.rentAmount,
          ThanhTien: newInvoice.rentAmount
        });
      }

      // 2. Tiền điện
      if (newInvoice.electricityUsage > 0) {
        chiTietHoaDon.push({
          NoiDung: `Tiền điện tháng ${month}/${year} (${newInvoice.electricityUsage} kWh)`,
          SoLuong: newInvoice.electricityUsage,
          DonGia: bulkSettings.electricityRate,
          ThanhTien: electricityAmount
        });
      }

      // 3. Tiền nước
      if (newInvoice.waterUsage > 0) {
        chiTietHoaDon.push({
          NoiDung: `Tiền nước tháng ${month}/${year} (${newInvoice.waterUsage} người)`,
          SoLuong: newInvoice.waterUsage,
          DonGia: bulkSettings.waterRate,
          ThanhTien: waterAmount
        });
      }

      // 4. Dịch vụ
      if (newInvoice.internetAmount > 0) {
        chiTietHoaDon.push({
          NoiDung: `Phí Internet tháng ${month}/${year}`,
          SoLuong: 1,
          DonGia: newInvoice.internetAmount,
          ThanhTien: newInvoice.internetAmount
        });
      }

      if (newInvoice.trashAmount > 0) {
        chiTietHoaDon.push({
          NoiDung: `Phí rác tháng ${month}/${year}`,
          SoLuong: 1,
          DonGia: newInvoice.trashAmount,
          ThanhTien: newInvoice.trashAmount
        });
      }

      if (newInvoice.parkingAmount > 0) {
        chiTietHoaDon.push({
          NoiDung: `Phí gửi xe tháng ${month}/${year} (${newInvoice.parkingCount} xe)`,
          SoLuong: newInvoice.parkingCount,
          DonGia: newInvoice.parkingAmount / newInvoice.parkingCount,
          ThanhTien: newInvoice.parkingAmount
        });
      }

      // 5. Additional charges
      newInvoice.additionalCharges.forEach(charge => {
        chiTietHoaDon.push({
          NoiDung: charge.description,
          SoLuong: 1,
          DonGia: charge.amount,
          ThanhTien: charge.amount
        });
      });

      const daThanhToan = 0; // Initial payment amount
      const conLai = totalAmount - daThanhToan; // Calculate remaining amount

      const hoaDonData: CreateHoaDonRequest = {
        MaPhong: newInvoice.MaPhong,
        MaHopDong: newInvoice.MaHopDong, // Optional - Backend will look it up
        Thang: newInvoice.month,
        NgayLap: ngayLap,
        NgayHetHan: ngayHetHan,
        TongTien: totalAmount,
        DaThanhToan: daThanhToan,
        ConLai: conLai,
        TrangThai: 'moi_tao',
        GhiChu: newInvoice.notes || null,
        chiTietHoaDon
      };

      await hoaDonService.create(hoaDonData);

      success({
        title: 'Tạo hóa đơn thành công',
        message: `Hóa đơn cho ${newInvoice.tenantName} - ${newInvoice.room} đã được tạo với tổng tiền ${totalAmount.toLocaleString('vi-VN')}đ`
      });

      // Refresh data
      refreshData();

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
        notes: '',
        MaPhong: undefined,
        MaHopDong: undefined
      });
      setSearchRoomQuery('');
    } catch (err) {
      error({
        title: 'Lỗi tạo hóa đơn',
        message: getErrorMessage(err)
      });
    }
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


  // Filter phòng cho modal tạo hóa đơn đơn lẻ (chưa có hóa đơn trong tháng)
  const filteredRoomsForInvoice = bulkRooms.filter((room: BulkInvoiceRoom) => {
    const maPhong = parseInt(room.id);
    const hasInvoice = hasInvoiceInMonth(maPhong, newInvoice.month);
    const matchesSearch = room.tenantName.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
      room.room.toLowerCase().includes(searchRoomQuery.toLowerCase());
    return !hasInvoice && matchesSearch; // Chỉ lấy phòng chưa có hóa đơn và khớp tìm kiếm
  });

  const filteredHoaDons = filterStatus === 'all'
    ? (hoaDons || [])
    : (hoaDons || []).filter(hoaDon => hoaDon.TrangThai === filterStatus);

  // Pagination handlers for Backend pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLoading(true);
  };

  const goToPage = (page: number) => handlePageChange(page);
  const nextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };

  const totalRevenue = statistics.DaThanhToan;
  const totalPending = statistics.ConLai;

  const handleDeletePayment = (maHoaDon: number) => {
    const hoaDon = (hoaDons || []).find(h => h.MaHoaDon === maHoaDon);
    if (!hoaDon) return;

    showConfirm({
      title: 'Xác nhận xóa hóa đơn',
      message: `Bạn có chắc chắn muốn xóa hóa đơn #${maHoaDon} (Phòng ${hoaDon.MaPhong}) không? Hành động này không thể hoàn tác.`,
      onConfirm: async () => {
        try {
          await hoaDonService.delete(maHoaDon);
          refreshData();
          success({
            title: 'Xóa hóa đơn thành công',
            message: `Đã xóa hóa đơn #${maHoaDon} thành công`
          });
        } catch (err) {
          error({
            title: 'Lỗi xóa hóa đơn',
            message: getErrorMessage(err)
          });
        }
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
      notes: '',

      MaPhong: parseInt(room.id),
      MaHopDong: undefined // Backend will look it up based on MaPhong
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
                      {formatCurrency(totalRevenue)}
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
                      {formatCurrency(totalPending)}
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
                      {hoaDons.filter(p => p.TrangThai === 'qua_han').length}
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
                    <p className="text-2xl font-bold text-gray-900">{statistics.TongSoHoaDon}</p>
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
                  <option value="da_thanh_toan">Đã thanh toán</option>
                  <option value="da_thanh_toan_mot_phan">Thanh toán một phần</option>
                  <option value="moi_tao">Chờ thanh toán</option>
                  <option value="qua_han">Quá hạn</option>
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
                        Dịch vụ
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
                    {loading ? (
                      <tr key="loading">
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredHoaDons.length === 0 ? (
                      <tr key="empty">
                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                          Không có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      filteredHoaDons.map((hoaDon) => (
                        <tr key={hoaDon.MaHoaDon} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {hoaDon.hopDong?.khachThue?.HoTen || hoaDon.hopDong?.TenKhachThue || `Phòng ${hoaDon.MaPhong}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {hoaDon.phongTro?.DayTro?.TenDay || ''} • {hoaDon.phongTro?.TenPhong || `P${hoaDon.MaPhong}`}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Tháng {hoaDon.Thang}
                            </div>
                            <div className="text-xs text-gray-500">
                              Hạn: {new Date(hoaDon.NgayHetHan).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {hoaDon.chiTietHoaDon?.find(ct => ct.NoiDung?.includes('Tiền thuê'))?.ThanhTien
                                ? formatCurrency(hoaDon.chiTietHoaDon.find(ct => ct.NoiDung?.includes('Tiền thuê'))?.ThanhTien || '0')
                                : '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {hoaDon.chiTietHoaDon && hoaDon.chiTietHoaDon.length > 0 ? (
                              <div className="text-sm text-gray-900">
                                {hoaDon.chiTietHoaDon
                                  .filter(ct => !ct.NoiDung?.includes('Tiền thuê'))
                                  .map((ct, idx) => (
                                    <div key={ct.MaChiTiet || idx} className="text-xs">
                                      {ct.NoiDung}: {formatCurrency(ct.ThanhTien || '0')}
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">-</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(hoaDon.TongTien)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(hoaDon.DaThanhToan)}
                            </div>
                            {Number(hoaDon.ConLai || 0) > 0 && (
                              <div className="text-xs text-red-600">
                                Còn lại: {formatCurrency(hoaDon.ConLai)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(hoaDon.TrangThai)}`}>
                              {getStatusText(hoaDon.TrangThai)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleViewDetail(hoaDon)}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                              {hoaDon.TrangThai !== 'da_thanh_toan' && (
                                <>
                                  <button
                                    onClick={() => handleAddAdditionalCharge(hoaDon)}
                                    className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                    title="Thêm phát sinh"
                                  >
                                    <i className="ri-add-circle-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleCollectPayment(hoaDon)}
                                    className="text-green-600 hover:text-green-900 cursor-pointer"
                                    title="Thu tiền"
                                  >
                                    <i className="ri-money-dollar-circle-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleSendPaymentNotification(hoaDon)}
                                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                    title="Gửi thông báo"
                                  >
                                    <i className="ri-notification-line"></i>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeletePayment(hoaDon.MaHoaDon)}
                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                title="Xóa"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && filteredHoaDons.length > 0 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    onNext={nextPage}
                    onPrev={prevPage}
                  />
                </div>
              )}
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

                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex items-start md:items-center flex-col md:flex-row gap-4">
                        <div className="flex items-center flex-shrink-0">
                          <i className="ri-information-line text-blue-600 text-xl mr-3"></i>
                          <div>
                            <h3 className="font-semibold text-blue-900">Hướng dẫn nhập chỉ số điện</h3>
                            <p className="text-blue-700 text-sm">Nhập chỉ số điện tháng hiện tại. Chỉ hiển thị phòng chưa có hóa đơn tháng này.</p>
                          </div>
                        </div>
                        <div className="flex-grow w-full md:w-auto md:flex-grow-0 md:ml-auto">
                          <label htmlFor="building-filter" className="sr-only">Lọc theo dãy</label>
                          <select
                            id="building-filter"
                            value={electricFilterBuilding}
                            onChange={e => setElectricFilterBuilding(e.target.value)}
                            className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm"
                          >
                            <option value="all">Tất cả dãy</option>
                            {electricBuildings.map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
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
                          {loadingPhongTros ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <i className="ri-loader-4-line text-4xl text-gray-400 animate-spin mb-2"></i>
                                  <p className="text-gray-500">Đang tải dữ liệu phòng...</p>
                                </div>
                              </td>
                            </tr>
                          ) : filteredElectricReadings.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-8 text-center">
                                <div className="flex flex-col items-center justify-center">
                                  <i className="ri-home-line text-4xl text-gray-400 mb-2"></i>
                                  <p className="text-gray-500 font-medium">
                                    {electricFilterBuilding === 'all' ? 'Chưa có phòng nào trong hệ thống' : `Không có phòng nào trong dãy ${electricFilterBuilding}`}
                                  </p>
                                  <p className="text-gray-400 text-sm">Vui lòng thêm phòng hoặc chọn dãy khác.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            getPaginatedElectricReadings().map((reading) => (
                              <tr key={reading.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.building}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reading.room}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{reading.tenantName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {editingReading === reading.id ? (
                                    <input
                                      type="number"
                                      value={reading.oldReading}
                                      readOnly
                                      className="w-24 border-gray-200 bg-gray-100 rounded px-2 py-1 text-sm text-gray-500 focus:ring-0 focus:border-gray-200"
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
                                      className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
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
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination for electricity readings */}
                    {filteredElectricReadings.length > electricReadingsPerPage && (
                      <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Hiển thị{' '}
                          <span className="font-medium">
                            {(electricReadingsPage - 1) * electricReadingsPerPage + 1}
                          </span>
                          {' '}-{' '}
                          <span className="font-medium">
                            {Math.min(electricReadingsPage * electricReadingsPerPage, filteredElectricReadings.length)}
                          </span>
                          {' '}trong tổng số{' '}
                          <span className="font-medium">{filteredElectricReadings.length}</span> phòng
                        </div>
                        <Pagination
                          currentPage={electricReadingsPage}
                          totalPages={electricReadingsTotalPages}
                          onPageChange={setElectricReadingsPage}
                        />
                      </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowElectricModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const currentMonth = new Date().toISOString().slice(0, 7);
                            const currentDate = new Date().toISOString().split('T')[0];

                            // Lọc chỉ những phòng có thay đổi
                            const changedReadings = filteredElectricReadings.filter(r => {
                              // Bỏ qua nếu không có thay đổi
                              if (r.newReading === r.oldReading) return false;

                              // Validate: chỉ số mới phải >= chỉ số cũ
                              if (r.newReading < r.oldReading) {
                                error({
                                  title: 'Lỗi nhập liệu',
                                  message: `Phòng ${r.room}: Chỉ số mới (${r.newReading}) phải >= chỉ số cũ (${r.oldReading})`
                                });
                                return false;
                              }

                              return true;
                            });

                            if (changedReadings.length === 0) {
                              warning({
                                title: 'Không có thay đổi',
                                message: 'Không có phòng nào có thay đổi chỉ số điện'
                              });
                              return;
                            }

                            // Gửi tuần tự để tránh quá tải
                            let successCount = 0;
                            let errorCount = 0;
                            const errors: string[] = [];

                            for (const reading of changedReadings) {
                              try {
                                await soDienService.create({
                                  MaPhong: parseInt(reading.id),
                                  Thang: currentMonth,
                                  ChiSoCu: reading.oldReading,
                                  ChiSoMoi: reading.newReading,
                                  NgayGhi: currentDate,
                                  GhiChu: null
                                });
                                successCount++;

                                // Delay nhỏ giữa các request (50ms) để tránh quá tải
                                await new Promise(resolve => setTimeout(resolve, 50));
                              } catch (err) {
                                errorCount++;
                                errors.push(`${reading.room}: ${getErrorMessage(err)}`);
                                console.error(`❌ Failed to save reading for room ${reading.room}:`, err);
                              }
                            }

                            // Show result
                            if (errorCount === 0) {
                              success({
                                title: 'Lưu chỉ số điện thành công',
                                message: `Đã lưu chỉ số điện cho ${successCount}/${changedReadings.length} phòng`
                              });
                              setShowElectricModal(false);
                              refreshData();
                            } else {
                              warning({
                                title: 'Lưu một phần',
                                message: `Thành công: ${successCount}, Lỗi: ${errorCount}\n${errors.slice(0, 3).join('\n')}`
                              });
                            }
                          } catch (err) {
                            error({
                              title: 'Lỗi lưu chỉ số điện',
                              message: getErrorMessage(err)
                            });
                          }
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
            )
            }

            {/* Bulk Invoice Modal */}
            {showBulkModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBulkModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-7xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Tạo hóa đơn hàng loạt</h2>
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    {/* Info: Số phòng available */}
                    {(() => {
                      const availableRooms = getAvailableRoomsForBulk();
                      const totalRooms = bulkRooms.length;
                      return availableRooms.length === 0 ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                          <div className="flex">
                            <i className="ri-alert-line text-yellow-400 text-xl mr-3"></i>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Tất cả {totalRooms} phòng đã có hóa đơn cho tháng {bulkSettings.month}
                              </p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Vui lòng chọn tháng khác hoặc tạo hóa đơn đơn lẻ nếu cần chỉnh sửa.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                          <div className="flex items-center">
                            <i className="ri-information-line text-blue-400 text-xl mr-3"></i>
                            <p className="text-sm text-blue-700">
                              Có <strong>{availableRooms.length}/{totalRooms}</strong> phòng chưa có hóa đơn cho tháng {bulkSettings.month}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

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
                      {(() => {
                        const availableRooms = getAvailableRoomsForBulk();
                        const selectedCount = availableRooms.filter(room => room.selected).length;
                        const isDisabled = availableRooms.length === 0 || selectedCount === 0;

                        return (
                          <button
                            onClick={handleCreateBulkInvoices}
                            disabled={isDisabled}
                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-file-list-3-line mr-2"></i>
                            {availableRooms.length === 0
                              ? 'Không có phòng khả dụng'
                              : `Tạo ${selectedCount} hóa đơn`
                            }
                          </button>
                        );
                      })()}
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
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Tạo hóa đơn mới</h2>
                      <button
                        onClick={() => setShowAddModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    {/* Info: Số phòng available trong tháng */}
                    {(() => {
                      const availableCount = bulkRooms.filter(r => {
                        const maPhong = parseInt(r.id);
                        return !hasInvoiceInMonth(maPhong, newInvoice.month);
                      }).length;
                      const totalRooms = bulkRooms.length;

                      return availableCount === 0 ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                          <div className="flex">
                            <i className="ri-alert-line text-yellow-400 text-xl mr-3"></i>
                            <div>
                              <p className="text-sm font-medium text-yellow-800">
                                Tất cả {totalRooms} phòng đã có hóa đơn cho tháng {newInvoice.month}
                              </p>
                              <p className="text-sm text-yellow-700 mt-1">
                                Vui lòng chọn tháng khác để tạo hóa đơn mới.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                          <div className="flex items-center">
                            <i className="ri-information-line text-blue-400 text-xl mr-3"></i>
                            <p className="text-sm text-blue-700">
                              Có <strong>{availableCount}/{totalRooms}</strong> phòng chưa có hóa đơn cho tháng {newInvoice.month}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left Column - Basic Info */}
                      <div className="space-y-6">

                        {/* 1. Khối chọn phòng (Chọn dãy -> Chọn phòng) */}
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-4">Chọn phòng *</h3>

                          {/* Chọn tháng */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tháng hóa đơn
                            </label>
                            <input
                              type="month"
                              value={newInvoice.month}
                              onChange={(e) => {
                                setNewInvoice({ ...newInvoice, month: e.target.value });
                                // Reset phòng đã chọn khi đổi tháng
                                setSelectedBuildingForInvoice('');
                                setNewInvoice(prev => ({
                                  ...prev,
                                  month: e.target.value,
                                  tenantName: '',
                                  room: '',
                                  rentAmount: 0,
                                  electricityUsage: 0,
                                  waterUsage: 0,
                                  internetPlan: bulkSettings.defaultInternetPlan,
                                  internetAmount: 0,
                                  trashAmount: 0,
                                  parkingCount: bulkSettings.defaultParkingCount,
                                  parkingAmount: 0,
                                  additionalCharges: [],
                                  MaPhong: undefined,
                                  MaHopDong: undefined
                                }));
                              }}
                              className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                          </div>

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

                                  additionalCharges: [],

                                  // reset backend fields
                                  MaPhong: undefined,
                                  MaHopDong: undefined
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

                            {/* Warning: Không có phòng available trong dãy */}
                            {selectedBuildingForInvoice && roomsBySelectedBuilding.length === 0 && (
                              <div className="mt-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
                                <i className="ri-alert-line mr-1"></i>
                                Tất cả phòng trong dãy <strong>{selectedBuildingForInvoice}</strong> đã có hóa đơn tháng {newInvoice.month}
                              </div>
                            )}
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
            {showDetailModal && selectedHoaDon && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Chi tiết hóa đơn - {selectedHoaDon.hopDong?.khachThue?.HoTen || selectedHoaDon.hopDong?.TenKhachThue || 'Khách thuê'}
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
                            <span className="font-medium">{selectedHoaDon.hopDong?.khachThue?.HoTen || selectedHoaDon.hopDong?.TenKhachThue || 'Chưa có'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Phòng:</span>
                            <span className="font-medium">{selectedHoaDon.phongTro?.TenPhong || `Phòng ${selectedHoaDon.MaPhong}`}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Dãy:</span>
                            <span className="font-medium">{selectedHoaDon.phongTro?.dayTro?.TenDay || 'Chưa có'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tháng:</span>
                            <span className="font-medium">{selectedHoaDon.Thang}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Ngày lập:</span>
                            <span className="font-medium">
                              {new Date(selectedHoaDon.NgayLap).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hạn thanh toán:</span>
                            <span className={`font-medium ${new Date(selectedHoaDon.NgayHetHan) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(selectedHoaDon.NgayHetHan).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Trạng thái:</span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedHoaDon.TrangThai)}`}>
                              {getStatusText(selectedHoaDon.TrangThai)}
                            </span>
                          </div>
                          {selectedHoaDon.GhiChu && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ghi chú:</span>
                              <span className="font-medium">{selectedHoaDon.GhiChu}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-4">Chi tiết thanh toán</h3>
                        <div className="space-y-3">
                          {selectedHoaDon.chiTietHoaDon && selectedHoaDon.chiTietHoaDon.length > 0 ? (
                            <div className="space-y-2">
                              {selectedHoaDon.chiTietHoaDon.map((chiTiet, index) => {
                                const soLuong = parseFloat(chiTiet.SoLuong || '0');
                                const donGia = parseFloat(chiTiet.DonGia || '0');
                                const thanhTien = parseFloat(chiTiet.ThanhTien || '0');

                                return (
                                  <div key={chiTiet.MaChiTiet || index} className="border-b border-gray-200 pb-2 last:border-0">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="text-gray-900 font-medium">{chiTiet?.NoiDung || 'Chi phí'}</div>
                                        {soLuong > 0 && donGia > 0 && (
                                          <div className="text-xs text-gray-500 mt-1">
                                            {soLuong} x {donGia.toLocaleString('vi-VN')}đ
                                          </div>
                                        )}
                                      </div>
                                      <div className="text-right ml-4">
                                        <span className="font-semibold text-gray-900">
                                          {thanhTien.toLocaleString('vi-VN')}đ
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">Chưa có chi tiết hóa đơn</div>
                          )}

                          <div className="border-t-2 border-gray-300 pt-3 mt-3">
                            <div className="flex justify-between text-lg font-bold">
                              <span>Tổng cộng:</span>
                              <span className="text-green-600">{Number(selectedHoaDon.TongTien || 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                              <span>Đã thanh toán:</span>
                              <span>{Number(selectedHoaDon.DaThanhToan || 0).toLocaleString('vi-VN')}đ</span>
                            </div>
                            {Number(selectedHoaDon.ConLai || 0) > 0 && (
                              <div className="flex justify-between text-sm font-medium text-red-600 mt-1">
                                <span>Còn lại:</span>
                                <span>{Number(selectedHoaDon.ConLai || 0).toLocaleString('vi-VN')}đ</span>
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
                      {selectedHoaDon.TrangThai !== 'da_thanh_toan' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleCollectPayment(selectedHoaDon);
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-money-dollar-circle-line mr-2"></i>
                            Thu tiền
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleSendPaymentNotification(selectedHoaDon);
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
            {showPaymentModal && selectedHoaDonForPayment && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowPaymentModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Thu tiền - {selectedHoaDonForPayment.hopDong?.khachThue?.HoTen || selectedHoaDonForPayment.hopDong?.TenKhachThue || 'Khách thuê'}
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
                          <span className="font-medium ml-2">{selectedHoaDonForPayment.phongTro?.TenPhong || `Phòng ${selectedHoaDonForPayment.MaPhong}`}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">{selectedHoaDonForPayment.Thang}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền:</span>
                          <span className="font-medium ml-2">{Number(selectedHoaDonForPayment.TongTien || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Đã thanh toán:</span>
                          <span className="font-medium ml-2 text-green-600">{Number(selectedHoaDonForPayment.DaThanhToan || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-600">Còn lại:</span>
                          <span className="font-bold ml-2 text-red-600 text-lg">{Number(selectedHoaDonForPayment.ConLai || 0).toLocaleString('vi-VN')}đ</span>
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
                          max={selectedHoaDonForPayment.ConLai}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => setPaymentData({ ...paymentData, amount: selectedHoaDonForPayment.ConLai })}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 cursor-pointer whitespace-nowrap"
                          >
                            Thu toàn bộ
                          </button>
                          <button
                            onClick={() => setPaymentData({ ...paymentData, amount: Math.floor(selectedHoaDonForPayment.ConLai / 2) })}
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
            {showNotificationModal && selectedHoaDonForNotification && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowNotificationModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Gửi thông báo thu tiền - {selectedHoaDonForNotification.hopDong?.khachThue?.HoTen || selectedHoaDonForNotification.hopDong?.TenKhachThue || 'Khách thuê'}
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
                          <span className="font-medium ml-2">{selectedHoaDonForNotification.phongTro?.TenPhong || `Phòng ${selectedHoaDonForNotification.MaPhong}`}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">{selectedHoaDonForNotification.Thang}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Số tiền cần thu:</span>
                          <span className="font-bold ml-2 text-red-600">{Number(selectedHoaDonForNotification.ConLai || 0).toLocaleString('vi-VN')}đ</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hạn thanh toán:</span>
                          <span className={`font-medium ml-2 ${new Date(selectedHoaDonForNotification.NgayHetHan) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(selectedHoaDonForNotification.NgayHetHan).toLocaleDateString('vi-VN')}
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
            {showAdditionalChargesModal && selectedHoaDonForCharges && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAdditionalChargesModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Thêm chi phí phát sinh - {selectedHoaDonForCharges.hopDong?.khachThue?.HoTen || selectedHoaDonForCharges.hopDong?.TenKhachThue || 'Khách thuê'}
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
                          <span className="font-medium ml-2">{selectedHoaDonForCharges.phongTro?.TenPhong || `Phòng ${selectedHoaDonForCharges.MaPhong}`}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tháng:</span>
                          <span className="font-medium ml-2">{selectedHoaDonForCharges.Thang}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Tổng tiền hiện tại:</span>
                          <span className="font-medium ml-2">{Number(selectedHoaDonForCharges.TongTien || 0).toLocaleString('vi-VN')}đ</span>
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
