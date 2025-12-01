import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import datCocService, { PhieuDatCoc, PhieuDatCocCreateInput, PhieuDatCocUpdateInput } from '../../services/dat-coc.service';
import phongTroService, { PhongTro } from '../../services/phong-tro.service';
import dichVuService, { DichVu } from '../../services/dich-vu.service';
import khachThueService, { KhachThue } from '../../services/khach-thue.service';
import { getErrorMessage } from '../../lib/http-client';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/base/Pagination';

// Local interfaces for UI state
interface BookingFormData {
  HoTenNguoiDat: string;
  SoDienThoaiNguoiDat: string;
  EmailNguoiDat: string;
  MaPhong: number | '';
  selectedBlock: string;
  NgayDuKienVaoO: string;
  TienDatCoc: number;
  GhiChu: string;
}

interface ContractFormData {
  contractNumber: string;
  signedDate: string;
  startDate: string;
  endDate: string;
  customDeposit: number;
  notes: string;
}

interface RefundFormData {
  amount: number;
  reason: string;
  notes: string;
}

export default function Bookings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data states
  const [phieuDatCocs, setPhieuDatCocs] = useState<PhieuDatCoc[]>([]);
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [dichVus, setDichVus] = useState<DichVu[]>([]);
  const [khachThues, setKhachThues] = useState<KhachThue[]>([]);

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState<PhieuDatCoc | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);

  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBlock, setFilterBlock] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // Form states
  const [newBooking, setNewBooking] = useState<BookingFormData>({
    HoTenNguoiDat: '',
    SoDienThoaiNguoiDat: '',
    EmailNguoiDat: '',
    MaPhong: '',
    selectedBlock: '',
    NgayDuKienVaoO: '',
    TienDatCoc: 0,
    GhiChu: ''
  });

  // Booking customer type states
  const [bookingCustomerType, setBookingCustomerType] = useState<'new' | 'existing'>('new');
  const [selectedBookingCustomer, setSelectedBookingCustomer] = useState<KhachThue | null>(null);

  // Contract creation states
  const [contractBooking, setContractBooking] = useState<PhieuDatCoc | null>(null);
  const [contractTenantType, setContractTenantType] = useState<'auto' | 'existing'>('auto');
  const [selectedTenant, setSelectedTenant] = useState<KhachThue | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<PhongTro | null>(null);
  const [tenantSearch, setTenantSearch] = useState('');
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);
  const [contractBlock, setContractBlock] = useState<string>('');
  const [contractType, setContractType] = useState<string>('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [newContract, setNewContract] = useState<ContractFormData>({
    contractNumber: '',
    signedDate: '',
    startDate: '',
    endDate: '',
    customDeposit: 0,
    notes: ''
  });

  // Refund states
  const [refundBooking, setRefundBooking] = useState<PhieuDatCoc | null>(null);
  const [refundData, setRefundData] = useState<RefundFormData>({
    amount: 0,
    reason: '',
    notes: ''
  });

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

  const { success, error } = useToast();

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ChoXacNhan':
        return 'bg-yellow-100 text-yellow-800';
      case 'DaXacNhan':
        return 'bg-green-100 text-green-800';
      case 'DaHuy':
        return 'bg-red-100 text-red-800';
      case 'HoanTat':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ChoXacNhan':
        return 'Chờ xác nhận';
      case 'DaXacNhan':
        return 'Đã xác nhận';
      case 'DaHuy':
        return 'Đã hủy';
      case 'HoanTat':
        return 'Hoàn thành';
      default:
        return status;
    }
  };

  const getDefaultServiceIds = () => {
    const byName = (n: string) => dichVus.find(s => s.TenDichVu.toLowerCase() === n.toLowerCase() && s.TrangThaiHoatDong)?.MaDichVu;
    const ids = [
      byName('Điện'),
      byName('Nước'),
      byName('Rác'),
      byName('Internet 1'),
      byName('Gửi xe'),
    ].filter(Boolean) as number[];
    return ids;
  };

  const getPhongByMaPhong = (maPhong: number) => {
    return phongTros.find(p => p.MaPhong === maPhong);
  };

  const availableTenants = khachThues.filter(tenant => {
    // Chỉ lấy khách CHƯA CÓ PHÒNG (để tạo hợp đồng mới)
    if (tenant.MaPhong) {
      return false;
    }

    // Search filter
    return (
      tenant.HoTen.toLowerCase().includes(tenantSearch.toLowerCase()) ||
      tenant.SDT1.includes(tenantSearch) ||
      (tenant.CCCD && tenant.CCCD.includes(tenantSearch))
    );
  });

  const availableRooms = phongTros.filter(room => room.TrangThai === 'Trống');

  const allBlocks = [...new Set(phongTros.map(r => r.dayTro?.TenDay).filter(Boolean))];

  // Filtering
  const filteredBookings = phieuDatCocs.filter(booking => {
    const matchStatus = filterStatus === 'all' || booking.TrangThai === filterStatus;
    const phong = getPhongByMaPhong(booking.MaPhong);
    const matchBlock = filterBlock === 'all' || phong?.dayTro?.TenDay === filterBlock;
    const matchSearch = searchText === '' ||
      booking.HoTenNguoiDat.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.SoDienThoaiNguoiDat.includes(searchText);
    return matchStatus && matchBlock && matchSearch;
  });

  // NEW: Pagination logic
  const {
    paginatedData: paginatedBookings,
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    itemsPerPage,
    totalItems,
    setItemsPerPage,
    nextPage,
    prevPage,
    goToPage,
  } = usePagination({
    data: filteredBookings,
    initialItemsPerPage: 10, // You can adjust this value
  });

  // Data fetching
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [phieuRes, phongRes, dichVuRes, khachThueRes] = await Promise.all([
          datCocService.getAll({ signal: controller.signal, sort_by: 'updated_at', sort_direction: 'desc' }),
          phongTroService.getAll({ signal: controller.signal, sort_by: 'updated_at', sort_direction: 'desc' }),
          dichVuService.getAll({ signal: controller.signal, sort_by: 'updated_at', sort_direction: 'desc' }),
          khachThueService.getAll({ signal: controller.signal, sort_by: 'updated_at', sort_direction: 'desc' })
        ]);

        if (!controller.signal.aborted) {
          setPhieuDatCocs(phieuRes.data.data || []);
          setPhongTros(phongRes.data.data || []);
          setDichVus(dichVuRes.data.data || []);
          setKhachThues(khachThueRes.data.data || []);
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

  const resetBookingForm = () => {
    setNewBooking({
      HoTenNguoiDat: '',
      SoDienThoaiNguoiDat: '',
      EmailNguoiDat: '',
      MaPhong: '',
      selectedBlock: '',
      NgayDuKienVaoO: '',
      TienDatCoc: 0,
      GhiChu: ''
    });
    setBookingCustomerType('new');
    setSelectedBookingCustomer(null);
  };

  // CRUD Handlers
  const handleCreateBooking = async () => {
    if (!newBooking.HoTenNguoiDat || !newBooking.SoDienThoaiNguoiDat || !newBooking.MaPhong || !newBooking.NgayDuKienVaoO) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo đặt phòng',
      message: `Bạn có chắc chắn muốn tạo đặt phòng cho "${newBooking.HoTenNguoiDat}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocCreateInput = {
            MaPhong: newBooking.MaPhong as number,
            HoTenNguoiDat: newBooking.HoTenNguoiDat,
            SoDienThoaiNguoiDat: newBooking.SoDienThoaiNguoiDat,
            EmailNguoiDat: newBooking.EmailNguoiDat || undefined,
            NgayDuKienVaoO: newBooking.NgayDuKienVaoO,
            TienDatCoc: newBooking.TienDatCoc,
            GhiChu: newBooking.GhiChu || undefined
          };

          await datCocService.create(payload);
          setShowAddModal(false);
          resetBookingForm();
          success({ title: 'Tạo đặt phòng thành công!' });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi tạo đặt phòng', message: getErrorMessage(err) });
        }
      },
    });
  };

  const handleConfirmBooking = (booking: PhieuDatCoc) => {
    setConfirmDialog({
      show: true,
      title: 'Xác nhận đặt phòng',
      message: `Bạn có chắc chắn muốn xác nhận đặt phòng của "${booking.HoTenNguoiDat}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocUpdateInput = { TrangThai: 'DaXacNhan' };
          await datCocService.update(booking.MaPhieuDatCoc, payload);
          success({ title: `Xác nhận đặt phòng của ${booking.HoTenNguoiDat} thành công!` });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi xác nhận', message: getErrorMessage(err) });
        }
      },
    });
  };

  const handleRejectBooking = (booking: PhieuDatCoc) => {
    setConfirmDialog({
      show: true,
      title: 'Từ chối đặt phòng',
      message: `Bạn có chắc chắn muốn từ chối đặt phòng của "${booking.HoTenNguoiDat}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocUpdateInput = { TrangThai: 'DaHuy' };
          await datCocService.update(booking.MaPhieuDatCoc, payload);
          error({ title: `Đã từ chối đặt phòng của ${booking.HoTenNguoiDat}` });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi từ chối', message: getErrorMessage(err) });
        }
      },
    });
  };

  const handleCancelBooking = (booking: PhieuDatCoc) => {
    setConfirmDialog({
      show: true,
      title: 'Hủy đặt phòng',
      message: `Bạn có chắc chắn muốn hủy đặt phòng của "${booking.HoTenNguoiDat}" không?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocUpdateInput = { TrangThai: 'DaHuy' };
          await datCocService.update(booking.MaPhieuDatCoc, payload);
          error({ title: `Đã hủy đặt phòng của ${booking.HoTenNguoiDat}` });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi hủy', message: getErrorMessage(err) });
        }
      },
    });
  };

  const handleDeleteBooking = (booking: PhieuDatCoc) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa đặt phòng',
      message: `Bạn có chắc chắn muốn xóa đặt phòng của "${booking.HoTenNguoiDat}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await datCocService.delete(booking.MaPhieuDatCoc);
          success({ title: `Đã xóa đặt phòng của ${booking.HoTenNguoiDat}` });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi xóa', message: getErrorMessage(err) });
        }
      },
    });
  };

  // Contract handlers
  const handleCreateContract = async (booking: PhieuDatCoc) => {
    setContractBooking(booking);

    const phong = getPhongByMaPhong(booking.MaPhong);

    // Debug
    console.log('handleCreateContract:', {
      booking,
      phong,
      phongTros: phongTros.length,
      maPhong: booking.MaPhong
    });

    if (!phong) {
      error({ title: 'Lỗi', message: 'Không tìm thấy thông tin phòng. Vui lòng thử lại!' });
      return;
    }

    let tenant = khachThues.find(t =>
      (booking.SoDienThoaiNguoiDat && t.SDT1 === booking.SoDienThoaiNguoiDat) ||
      (booking.EmailNguoiDat && t.Email === booking.EmailNguoiDat) ||
      t.HoTen.toLowerCase() === booking.HoTenNguoiDat.toLowerCase()
    );

    // Debug
    console.log('Tenant search:', {
      khachThues: khachThues.length,
      booking: {
        HoTenNguoiDat: booking.HoTenNguoiDat,
        SoDienThoaiNguoiDat: booking.SoDienThoaiNguoiDat,
        EmailNguoiDat: booking.EmailNguoiDat
      },
      tenant
    });

    setContractBlock(phong?.dayTro?.TenDay || '');
    setContractType(phong?.loaiPhong?.TenLoaiPhong || '');

    if (tenant) {
      setSelectedTenant(tenant);
      setTenantSearch(tenant.HoTen);
    } else {
      // Không tìm thấy - để user chọn hoặc sẽ tự tạo khi submit
      setSelectedTenant(null);
      setTenantSearch(booking.HoTenNguoiDat);
    }

    setSelectedRoom(phong);

    // Convert d/m/Y to yyyy-mm-dd for input[type="date"]
    const convertDateToISO = (dateStr: string): string => {
      // Backend trả về format d/m/Y (ví dụ: 15/11/2025)
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return new Date().toISOString().split('T')[0]; // fallback
    };

    const startDateISO = convertDateToISO(booking.NgayDuKienVaoO);
    const endDate = new Date(startDateISO);
    endDate.setFullYear(endDate.getFullYear() + 1);

    setNewContract({
      contractNumber: `HD${Date.now().toString().slice(-6)}`,
      signedDate: new Date().toISOString().split('T')[0],
      startDate: startDateISO,
      endDate: endDate.toISOString().split('T')[0],
      customDeposit: booking.TienDatCoc,
      notes: `Hợp đồng được tạo từ đặt phòng #${booking.MaPhieuDatCoc}`
    });

    setSelectedServiceIds(getDefaultServiceIds());
    setShowContractModal(true);
  };

  const handleSubmitContract = () => {
    if (!selectedRoom) {
      error({ title: 'Không tìm thấy thông tin phòng!' });
      return;
    }

    if (!newContract.contractNumber) {
      error({ title: 'Vui lòng nhập số hợp đồng!' });
      return;
    }

    if (!newContract.startDate || !newContract.endDate) {
      error({ title: 'Vui lòng chọn ngày bắt đầu và ngày kết thúc!' });
      return;
    }

    // Validate tenant selection based on type
    if (contractTenantType === 'existing' && !selectedTenant) {
      error({ title: 'Vui lòng chọn khách thuê từ danh sách!' });
      return;
    }

    const tenantName = selectedTenant?.HoTen || contractBooking?.HoTenNguoiDat || 'khách thuê';

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo hợp đồng',
      message: `Bạn có chắc chắn muốn tạo hợp đồng ${newContract.contractNumber} cho "${tenantName}" không?${contractTenantType === 'auto' ? ' (Khách thuê sẽ được tạo tự động từ booking)' : ''}`,
      type: 'info',
      onConfirm: async () => {
        try {
          if (!contractBooking || !selectedRoom) return;

          // Chuẩn bị dữ liệu hợp đồng theo Backend schema
          const duLieuHopDong: any = {
            SoHopDong: newContract.contractNumber,
            NgayKy: newContract.signedDate,
            NgayBatDau: newContract.startDate,
            NgayKetThuc: newContract.endDate,
            TienThueHangThang: selectedRoom.GiaThueHienTai || selectedRoom.DonGiaCoBan,
            GhiChu: newContract.notes || undefined,
            DichVuIds: selectedServiceIds.length > 0 ? selectedServiceIds : undefined,
          };

          // Nếu đã chọn khách thuê thủ công thì gửi MaKhachThue
          // Nếu không, Backend sẽ tự tạo khách thuê từ thông tin booking
          if (selectedTenant) {
            duLieuHopDong.MaKhachThue = selectedTenant.MaKhachThue;
          }

          // Gọi API tạo hợp đồng từ phiếu đặt cọc
          await datCocService.taoHopDongTuPhieuDatCoc(contractBooking.MaPhieuDatCoc, duLieuHopDong);

          setShowContractModal(false);
          setContractBooking(null);
          resetContractForm();
          success({ title: `Tạo hợp đồng ${newContract.contractNumber} thành công!` });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi tạo hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  const resetContractForm = () => {
    setContractTenantType('auto');
    setSelectedTenant(null);
    setSelectedRoom(null);
    setTenantSearch('');
    setContractBlock('');
    setContractType('');
    setSelectedServiceIds([]);
    setNewContract({
      contractNumber: '',
      signedDate: '',
      startDate: '',
      endDate: '',
      customDeposit: 0,
      notes: ''
    });
  };

  // Refund handlers
  const handleQuickRefund = (booking: PhieuDatCoc) => {
    setConfirmDialog({
      show: true,
      title: 'Hoàn cọc nhanh',
      message: `Bạn có chắc chắn muốn hoàn cọc nhanh ${booking.TienDatCoc.toLocaleString('vi-VN')}đ cho "${booking.HoTenNguoiDat}" không?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocUpdateInput = { TrangThai: 'DaHuy' };
          await datCocService.update(booking.MaPhieuDatCoc, payload);
          success({
            title: `Hoàn cọc thành công!`,
            message: `Đã hoàn ${booking.TienDatCoc.toLocaleString('vi-VN')}đ cho ${booking.HoTenNguoiDat}`
          });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi hoàn cọc', message: getErrorMessage(err) });
        }
      },
    });
  };

  const handleFullRefund = (booking: PhieuDatCoc) => {
    setRefundBooking(booking);
    setRefundData({
      amount: booking.TienDatCoc,
      reason: '',
      notes: ''
    });
    setShowRefundModal(true);
  };

  const handleSubmitRefund = () => {
    if (!refundBooking || !refundData.reason) {
      error({ title: 'Vui lòng điền đầy đủ thông tin!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận hoàn tiền',
      message: `Bạn có chắc chắn muốn hoàn ${refundData.amount.toLocaleString('vi-VN')}đ cho "${refundBooking.HoTenNguoiDat}" không?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const payload: PhieuDatCocUpdateInput = { TrangThai: 'DaHuy' };
          await datCocService.update(refundBooking.MaPhieuDatCoc, payload);

          setShowRefundModal(false);
          setRefundBooking(null);
          success({
            title: `Hoàn tiền thành công!`,
            message: `Đã hoàn ${refundData.amount.toLocaleString('vi-VN')}đ cho ${refundBooking.HoTenNguoiDat}`
          });
          refreshData();
        } catch (err: any) {
          error({ title: 'Lỗi hoàn tiền', message: getErrorMessage(err) });
        }
      },
    });
  };

  const selectedRoomForNewBooking = newBooking.MaPhong ? getPhongByMaPhong(newBooking.MaPhong as number) : null;

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
              <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer" onClick={() => setFilterStatus('ChoXacNhan')}>
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {phieuDatCocs.filter((b) => b.TrangThai === 'ChoXacNhan').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer" onClick={() => setFilterStatus('DaXacNhan')}>
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {phieuDatCocs.filter((b) => b.TrangThai === 'DaXacNhan').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer" onClick={() => setFilterStatus('HoanTat')}>
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-check-double-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {phieuDatCocs.filter((b) => b.TrangThai === 'HoanTat').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 cursor-pointer" onClick={() => setFilterStatus('DaHuy')}>
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-close-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {phieuDatCocs.filter((b) => b.TrangThai === 'DaHuy').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterBlock}
                  onChange={(e) => setFilterBlock(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả dãy</option>
                  {allBlocks.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ChoXacNhan">Chờ xác nhận</option>
                  <option value="DaXacNhan">Đã xác nhận</option>
                  <option value="HoanTat">Hoàn thành</option>
                  <option value="DaHuy">Đã hủy</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên khách hàng, SĐT..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && paginatedBookings.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không có đặt phòng nào</h3>
                <p className="text-gray-600">Hãy tạo đặt phòng đầu tiên</p>
              </div>
            )}

            {/* Bookings Table */}
            {!loading && paginatedBookings.length > 0 && (
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
                      {paginatedBookings.map((booking) => {
                        const phong = getPhongByMaPhong(booking.MaPhong);
                        return (
                          <tr key={booking.MaPhieuDatCoc} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{booking.HoTenNguoiDat}</div>
                                <div className="text-sm text-gray-500">{booking.SoDienThoaiNguoiDat}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{phong?.dayTro?.TenDay || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{phong?.TenPhong || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.NgayDuKienVaoO}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                {booking.TienDatCoc.toLocaleString('vi-VN')}đ
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  booking.TrangThai,
                                )}`}
                              >
                                {getStatusText(booking.TrangThai)}
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
                                {booking.TrangThai === 'ChoXacNhan' && (
                                  <>
                                    <button
                                      onClick={() => handleConfirmBooking(booking)}
                                      className="text-green-600 hover:text-green-900 cursor-pointer"
                                      title="Xác nhận"
                                    >
                                      <i className="ri-check-line"></i>
                                    </button>
                                    <button
                                      onClick={() => handleCancelBooking(booking)}
                                      className="text-red-600 hover:text-red-900 cursor-pointer"
                                      title="Hủy"
                                    >
                                      <i className="ri-close-line"></i>
                                    </button>
                                  </>
                                )}
                                {booking.TrangThai === 'DaXacNhan' && (
                                  <>
                                    <button
                                      onClick={() => handleCreateContract(booking)}
                                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                      title="Tạo hợp đồng"
                                    >
                                      <i className="ri-file-text-line"></i>
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
                                <button
                                  onClick={() => handleDeleteBooking(booking)}
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
              </div>
            )}

            {/* NEW: Pagination Controls */}
            {!loading && filteredBookings.length > 0 && ( // Chỉ hiển thị phân trang nếu có dữ liệu đã lọc
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                itemsPerPage={itemsPerPage}
                onPageChange={goToPage}
                onItemsPerPageChange={setItemsPerPage}
                onNext={nextPage}
                onPrev={prevPage}
                itemLabel="đặt phòng"
              />
            )}
          </div>
        </main>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedBooking(null)}
            ></div>

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
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin khách hàng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">{selectedBooking.HoTenNguoiDat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-medium">{selectedBooking.SoDienThoaiNguoiDat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedBooking.EmailNguoiDat || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin đặt phòng</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{getPhongByMaPhong(selectedBooking.MaPhong)?.TenPhong || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dãy:</span>
                      <span className="font-medium">{getPhongByMaPhong(selectedBooking.MaPhong)?.dayTro?.TenDay || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày nhận phòng:</span>
                      <span className="font-medium">{selectedBooking.NgayDuKienVaoO}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tiền cọc:</span>
                      <span className="font-medium text-green-600">
                        {selectedBooking.TienDatCoc.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.GhiChu && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedBooking.GhiChu}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedBooking.TrangThai === 'ChoXacNhan' && (
                  <>
                    <button
                      onClick={() => {
                        handleConfirmBooking(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Xác nhận
                    </button>
                    <button
                      onClick={() => {
                        handleRejectBooking(selectedBooking);
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-close-line mr-2"></i>
                      Từ chối
                    </button>
                  </>
                )}
                {selectedBooking.TrangThai === 'DaXacNhan' && (
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
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setShowAddModal(false);
                resetBookingForm();
              }}
            ></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Tạo đặt phòng mới</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetBookingForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>

                  {/* Customer Type Selection */}
                  <div className="mb-4 flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="customerType"
                        checked={bookingCustomerType === 'new'}
                        onChange={() => {
                          setBookingCustomerType('new');
                          setSelectedBookingCustomer(null);
                          setNewBooking(prev => ({
                            ...prev,
                            HoTenNguoiDat: '',
                            SoDienThoaiNguoiDat: '',
                            EmailNguoiDat: ''
                          }));
                        }}
                        className="w-4 h-4 mr-2 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Khách hàng mới</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="customerType"
                        checked={bookingCustomerType === 'existing'}
                        onChange={() => {
                          setBookingCustomerType('existing');
                          setNewBooking(prev => ({
                            ...prev,
                            HoTenNguoiDat: '',
                            SoDienThoaiNguoiDat: '',
                            EmailNguoiDat: ''
                          }));
                        }}
                        className="w-4 h-4 mr-2 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Chọn khách hàng có sẵn</span>
                    </label>
                  </div>

                  {/* Existing Customer Selection */}
                  {bookingCustomerType === 'existing' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chọn khách hàng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedBookingCustomer?.MaKhachThue || ''}
                        onChange={(e) => {
                          const khachThue = khachThues.find(k => k.MaKhachThue === Number(e.target.value));
                          setSelectedBookingCustomer(khachThue || null);
                          if (khachThue) {
                            setNewBooking(prev => ({
                              ...prev,
                              HoTenNguoiDat: khachThue.HoTen,
                              SoDienThoaiNguoiDat: khachThue.SDT1,
                              EmailNguoiDat: khachThue.Email || ''
                            }));
                          }
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                      >
                        <option value="">-- Chọn khách hàng --</option>
                        {khachThues
                          .filter(k => !k.MaPhong)
                          .map(k => (
                            <option key={k.MaKhachThue} value={k.MaKhachThue}>
                              {k.HoTen} - {k.SDT1}
                            </option>
                          ))}
                      </select>
                      {selectedBookingCustomer && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                          <div><span className="font-medium">Họ tên:</span> {selectedBookingCustomer.HoTen}</div>
                          <div><span className="font-medium">SĐT:</span> {selectedBookingCustomer.SDT1}</div>
                          {selectedBookingCustomer.Email && (
                            <div><span className="font-medium">Email:</span> {selectedBookingCustomer.Email}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* New Customer Form */}
                  {bookingCustomerType === 'new' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={newBooking.HoTenNguoiDat}
                          onChange={(e) => setNewBooking({ ...newBooking, HoTenNguoiDat: e.target.value })}
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
                          value={newBooking.SoDienThoaiNguoiDat}
                          onChange={(e) => setNewBooking({ ...newBooking, SoDienThoaiNguoiDat: e.target.value })}
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
                          value={newBooking.EmailNguoiDat}
                          onChange={(e) => setNewBooking({ ...newBooking, EmailNguoiDat: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Nhập email (tùy chọn)"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin đặt phòng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dãy phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newBooking.selectedBlock}
                        onChange={(e) => {
                          const block = e.target.value;
                          setNewBooking(prev => ({ ...prev, selectedBlock: block, MaPhong: '', TienDatCoc: 0 }));
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                      >
                        <option value="">Chọn dãy</option>
                        {allBlocks.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phòng <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newBooking.MaPhong}
                        onChange={(e) => {
                          const maPhong = Number(e.target.value);
                          const phong = getPhongByMaPhong(maPhong);
                          setNewBooking(prev => ({
                            ...prev,
                            MaPhong: maPhong,
                            TienDatCoc: phong?.TienCoc || prev.TienDatCoc,
                            selectedBlock: phong?.dayTro?.TenDay || prev.selectedBlock,
                          }));
                        }}
                        disabled={!newBooking.selectedBlock}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                      >
                        <option value="">{newBooking.selectedBlock ? 'Chọn phòng theo dãy' : 'Chọn dãy trước'}</option>
                        {availableRooms
                          .filter(r => !newBooking.selectedBlock || r.dayTro?.TenDay === newBooking.selectedBlock)
                          .map(r => (
                            <option key={r.MaPhong} value={r.MaPhong}>
                              {r.TenPhong}
                            </option>
                          ))}
                      </select>

                      {selectedRoomForNewBooking && (
                        <div className="mt-2 text-xs text-gray-600 space-y-1">
                          <div>Dãy: <span className="font-medium">{selectedRoomForNewBooking.dayTro?.TenDay}</span></div>
                          <div>Loại phòng: <span className="font-medium">{selectedRoomForNewBooking.loaiPhong?.TenLoaiPhong}</span></div>
                          <div>Diện tích: <span className="font-medium">{selectedRoomForNewBooking.DienTich} m²</span></div>
                          <div>Tiền thuê: <span className="font-medium">{(selectedRoomForNewBooking.GiaThueHienTai || selectedRoomForNewBooking.DonGiaCoBan)?.toLocaleString('vi-VN')}đ/tháng</span></div>
                          <div>Tiền cọc: <span className="font-medium">{selectedRoomForNewBooking.TienCoc?.toLocaleString('vi-VN') || '0'}đ</span></div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày nhận phòng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={newBooking.NgayDuKienVaoO}
                        onChange={(e) => setNewBooking({ ...newBooking, NgayDuKienVaoO: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiền cọc (VNĐ)
                      </label>
                      <input
                        type="number"
                        value={newBooking.TienDatCoc}
                        onChange={(e) => setNewBooking({ ...newBooking, TienDatCoc: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        min="0"
                        step="100000"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={newBooking.GhiChu}
                    onChange={(e) => setNewBooking({ ...newBooking, GhiChu: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập ghi chú (tùy chọn)"
                  />
                </div>

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
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo hợp đồng từ đặt phòng</h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium ml-2">{contractBooking.HoTenNguoiDat}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dãy:</span>
                    <span className="font-medium ml-2">{getPhongByMaPhong(contractBooking.MaPhong)?.dayTro?.TenDay}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{getPhongByMaPhong(contractBooking.MaPhong)?.TenPhong}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày nhận phòng:</span>
                    <span className="font-medium ml-2">{contractBooking.NgayDuKienVaoO}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin khách thuê & phòng</h3>

                  {/* Tenant Type Selection */}
                  <div className="mb-3 flex gap-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="contractTenantType"
                        checked={contractTenantType === 'auto'}
                        onChange={() => {
                          setContractTenantType('auto');
                          setSelectedTenant(null);
                          setTenantSearch('');
                          setShowTenantDropdown(false);
                        }}
                        className="w-4 h-4 mr-2 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Tự động tạo từ booking</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="contractTenantType"
                        checked={contractTenantType === 'existing'}
                        onChange={() => {
                          setContractTenantType('existing');
                          setSelectedTenant(null);
                          setTenantSearch('');
                        }}
                        className="w-4 h-4 mr-2 text-indigo-600 cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Chọn khách thuê có sẵn</span>
                    </label>
                  </div>

                  {/* Auto-create message */}
                  {contractTenantType === 'auto' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <i className="ri-information-line text-blue-600 mr-2 mt-0.5"></i>
                        <div className="text-sm text-blue-700">
                          <p className="font-medium mb-1">Khách thuê sẽ được tạo tự động</p>
                          <p className="text-xs">Hệ thống sẽ tự động tạo khách thuê từ thông tin đặt phòng: <strong>{contractBooking?.HoTenNguoiDat}</strong> - <strong>{contractBooking?.SoDienThoaiNguoiDat}</strong></p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing tenant search */}
                  {contractTenantType === 'existing' && (
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
                      {showTenantDropdown && availableTenants.length > 0 && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                          {availableTenants.map((tenant) => (
                            <div
                              key={tenant.MaKhachThue}
                              onClick={() => {
                                setSelectedTenant(tenant);
                                setTenantSearch(tenant.HoTen);
                                setShowTenantDropdown(false);
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                              <div className="font-medium">{tenant.HoTen}</div>
                              <div className="text-sm text-gray-500">{tenant.SDT1} • {tenant.Email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                      <input
                        type="text"
                        value={contractBlock}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                        placeholder="Dãy từ đặt cọc"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                      <input
                        type="text"
                        value={selectedRoom?.TenPhong || ''}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                        placeholder="Phòng từ đặt cọc"
                      />
                      <p className="text-xs text-gray-500 mt-1">Phòng được lấy từ phiếu đặt cọc, không thể thay đổi</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                      <input
                        type="text"
                        value={selectedRoom?.loaiPhong?.TenLoaiPhong || contractType || ''}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                        placeholder="Tự điền theo phòng"
                      />
                    </div>
                  </div>

                  {selectedRoom && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Dãy:</span>
                          <span className="font-medium">{selectedRoom.dayTro?.TenDay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loại phòng:</span>
                          <span className="font-medium">{selectedRoom.loaiPhong?.TenLoaiPhong}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền thuê:</span>
                          <span className="font-medium">{(selectedRoom.GiaThueHienTai || selectedRoom.DonGiaCoBan)?.toLocaleString('vi-VN')}đ/tháng</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tiền cọc:</span>
                          <span className="font-medium">{selectedRoom.TienCoc?.toLocaleString('vi-VN') || '0'}đ</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {dichVus
                        .filter(s => s.TrangThaiHoatDong && (s.TenDichVu === 'Điện' || s.TenDichVu === 'Nước'))
                        .map(s => (
                          <label key={s.MaDichVu} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedServiceIds.includes(s.MaDichVu)}
                              onChange={(e) => {
                                setSelectedServiceIds(prev => e.target.checked
                                  ? [...prev, s.MaDichVu]
                                  : prev.filter(id => id !== s.MaDichVu)
                                );
                              }}
                            />
                            <div className="text-sm">
                              <div className="font-medium">{s.TenDichVu} <span className="text-gray-500">• {s.DonGia.toLocaleString('vi-VN')}đ/{s.DonViTinh}</span></div>
                              {s.MoTa && <div className="text-gray-500">{s.MoTa}</div>}
                            </div>
                          </label>
                        ))
                      }

                      <div className="p-2 rounded border border-gray-200">
                        <div className="font-medium text-sm mb-1">Internet (chọn 1)</div>
                        {dichVus
                          .filter(s => s.TrangThaiHoatDong && s.TenDichVu.toLowerCase().startsWith('internet'))
                          .map(s => (
                            <label key={s.MaDichVu} className="flex items-start gap-3 py-1">
                              <input
                                type="radio"
                                name="internet-plan"
                                checked={selectedServiceIds.includes(s.MaDichVu)}
                                onChange={() => {
                                  const internetIds = dichVus
                                    .filter(x => x.TenDichVu.toLowerCase().startsWith('internet'))
                                    .map(x => x.MaDichVu);
                                  setSelectedServiceIds(prev => [...prev.filter(id => !internetIds.includes(id)), s.MaDichVu]);
                                }}
                              />
                              <div className="text-sm">
                                <div className="font-medium">{s.TenDichVu} <span className="text-gray-500">• {s.DonGia.toLocaleString('vi-VN')}đ/{s.DonViTinh}</span></div>
                                {s.MoTa && <div className="text-gray-500">{s.MoTa}</div>}
                              </div>
                            </label>
                          ))
                        }
                      </div>

                      {dichVus
                        .filter(s =>
                          s.TrangThaiHoatDong &&
                          s.TenDichVu !== 'Điện' &&
                          s.TenDichVu !== 'Nước' &&
                          !s.TenDichVu.toLowerCase().startsWith('internet')
                        )
                        .map(s => (
                          <label key={s.MaDichVu} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                            <input
                              type="checkbox"
                              className="mt-1"
                              checked={selectedServiceIds.includes(s.MaDichVu)}
                              onChange={(e) => {
                                setSelectedServiceIds(prev => e.target.checked
                                  ? [...prev, s.MaDichVu]
                                  : prev.filter(id => id !== s.MaDichVu)
                                );
                              }}
                            />
                            <div className="text-sm">
                              <div className="font-medium">{s.TenDichVu} <span className="text-gray-500">• {s.DonGia.toLocaleString('vi-VN')}đ/{s.DonViTinh}</span></div>
                              {s.MoTa && <div className="text-gray-500">{s.MoTa}</div>}
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

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin đặt phòng</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Khách hàng:</span>
                    <span className="font-medium ml-2">{refundBooking.HoTenNguoiDat}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{getPhongByMaPhong(refundBooking.MaPhong)?.TenPhong}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiền cọc gốc:</span>
                    <span className="font-medium ml-2 text-green-600">{refundBooking.TienDatCoc.toLocaleString('vi-VN')}đ</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày đặt:</span>
                    <span className="font-medium ml-2">{refundBooking.NgayDuKienVaoO}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền hoàn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={refundData.amount}
                    onChange={(e) => setRefundData({ ...refundData, amount: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    max={refundBooking.TienDatCoc}
                    step="10000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tối đa: {refundBooking.TienDatCoc.toLocaleString('vi-VN')}đ
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do hoàn tiền <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={refundData.reason}
                    onChange={(e) => setRefundData({ ...refundData, reason: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thêm
                  </label>
                  <textarea
                    value={refundData.notes}
                    onChange={(e) => setRefundData({ ...refundData, notes: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập ghi chú thêm về việc hoàn tiền..."
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Tóm tắt hoàn tiền</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Tiền cọc gốc:</span>
                      <span className="font-medium">{refundBooking.TienDatCoc.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số tiền hoàn:</span>
                      <span className="font-medium text-green-600">{refundData.amount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Số tiền giữ lại:</span>
                      <span className="font-medium text-red-600">{(refundBooking.TienDatCoc - refundData.amount).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              </div>

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
