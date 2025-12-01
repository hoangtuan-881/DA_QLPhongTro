import React, { useMemo, useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import Pagination from '../../components/base/Pagination';
import { useToast } from '../../hooks/useToast';
import { usePagination } from '../../hooks/usePagination';
import hopDongService, {
  HopDong,
  HopDongCreateInput,
  HopDongUpdateInput,
  HopDongRenewInput,
  HopDongTerminateInput
} from '../../services/hop-dong.service';
import { PhongTro } from '../../services/phong-tro.service';
import { KhachThue } from '../../services/khach-thue.service';
import { DichVu } from '../../services/dich-vu.service';
import { getErrorMessage } from '../../lib/http-client';

// =================== Helpers ===================
const getStatusColor = (status: string) => {
  switch (status) {
    case 'DangHieuLuc': return 'bg-green-100 text-green-800';
    case 'HetHan': return 'bg-red-100 text-red-800';
    case 'DaChamDut': return 'bg-gray-200 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'DangHieuLuc': return 'Đang hiệu lực';
    case 'HetHan': return 'Hết hạn';
    case 'DaChamDut': return 'Đã chấm dứt';
    default: return 'Không xác định';
  }
};

const getRoomStatusColor = (status: string) => {
  switch (status) {
    case 'Trống': return 'bg-green-100 text-green-800';
    case 'DaThue': return 'bg-red-100 text-red-800';
    case 'BaoTri': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getRoomStatusText = (status: string) => {
  switch (status) {
    case 'Trống': return 'Trống';
    case 'DaThue': return 'Đã thuê';
    case 'BaoTri': return 'Bảo trì';
    default: return 'Không xác định';
  }
};

const parseDate = (dateStr: string): Date => {
  // Backend returns DD/MM/YYYY
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
};

const formatToYYYYMMDD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getDaysUntilExpiry = (endDate: string) => {
  const today = new Date();
  const expiry = parseDate(endDate);
  const todayAt0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffTime = expiry.getTime() - todayAt0.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const isInFinalMonth = (endDate: string) => {
  const end = parseDate(endDate);
  const now = new Date();
  return end.getFullYear() === now.getFullYear() && end.getMonth() === now.getMonth();
};

// =================== Component ===================
export default function Contracts() {
  const { success, error, warning } = useToast();

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<HopDong | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [filterBuilding, setFilterBuilding] = useState<'all' | string>('all');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // master lists
  const [hopDongs, setHopDongs] = useState<HopDong[]>([]);
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [khachThues, setKhachThues] = useState<KhachThue[]>([]);
  const [dichVus, setDichVus] = useState<DichVu[]>([]);

  // create modal state
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedKhachThue, setSelectedKhachThue] = useState<KhachThue | null>(null);
  const [khachThueSearch, setKhachThueSearch] = useState('');
  const [showKhachThueDropdown, setShowKhachThueDropdown] = useState(false);
  const [selectedPhong, setSelectedPhong] = useState<PhongTro | null>(null);
  const [showPhongDropdown, setShowPhongDropdown] = useState(false);
  const [selectedDayForCreate, setSelectedDayForCreate] = useState<string>('');
  const [selectedDichVuIds, setSelectedDichVuIds] = useState<number[]>([]);
  const [newContract, setNewContract] = useState({
    SoHopDong: '',
    NgayKy: formatToYYYYMMDD(new Date()),
    NgayBatDau: '',
    NgayKetThuc: '',
    TienCoc: 0,
    TienThueHangThang: 0,
    GhiChu: '',
  });

  // edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingContract, setEditingContract] = useState<HopDong | null>(null);
  const [editingDichVuIds, setEditingDichVuIds] = useState<number[]>([]);
  const [editForm, setEditForm] = useState({
    SoHopDong: '',
    NgayKy: '',
    NgayBatDau: '',
    NgayKetThuc: '',
    TienCoc: 0,
    TienThueHangThang: 0,
    GhiChu: '',
  });

  // renewal modal state
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewingContract, setRenewingContract] = useState<HopDong | null>(null);
  const [renewalData, setRenewalData] = useState({
    NgayKetThuc: '',
  });

  // termination modal state
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [terminatingContract, setTerminatingContract] = useState<HopDong | null>(null);
  const [terminationData, setTerminationData] = useState({
    GhiChu: '',
  });

  // confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean; title: string; message: string; type: 'danger' | 'warning' | 'info'; onConfirm: () => void;
  }>({ show: false, title: '', message: '', type: 'info', onConfirm: () => { } });

  // ====== Data fetching ======
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [contractsRes, dataForContractRes] = await Promise.all([
          hopDongService.getAll({ 
            signal: controller.signal,
            sort_by: 'updated_at',
            sort_direction: 'desc'
          }),
          hopDongService.getDataForContract(controller.signal),
        ]);

        if (!controller.signal.aborted) {
          const order = {
            'DangHieuLuc': 1,
            'HetHan': 2,
            'DaChamDut': 3,
          };
          const sortedData = (contractsRes.data.data || []).sort((a, b) => {
            const aOrder = order[a.TrangThai as keyof typeof order] || 4;
            const bOrder = order[b.TrangThai as keyof typeof order] || 4;
            return aOrder - bOrder;
          });

          setHopDongs(sortedData);
          setPhongTros(dataForContractRes.data.data.phongTros || []);
          setKhachThues(dataForContractRes.data.data.khachThues || []);
          setDichVus(dataForContractRes.data.data.dichVus || []);
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

  // ====== derived lists ======
  const unpaginatedContracts = useMemo(() => {
    let base = filterStatus === 'all' ? hopDongs : hopDongs.filter(c => c.TrangThai === filterStatus);
    if (filterBuilding !== 'all') {
      base = base.filter(c => c.TenDay === filterBuilding);
    }
    const q = keyword.trim().toLowerCase();
    if (!q) return base;
    return base.filter(c =>
      c.SoHopDong.toLowerCase().includes(q) ||
      c.TenKhachThue.toLowerCase().includes(q) ||
      c.TenPhong.toLowerCase().includes(q) ||
      c.TenDay.toLowerCase().includes(q)
    );
  }, [hopDongs, filterStatus, keyword, filterBuilding]);

  // ====== Pagination ======
  const {
    paginatedData: filteredContracts,
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
    data: unpaginatedContracts,
    initialItemsPerPage: 10,
  });

  const filteredKhachThues = useMemo(() => {
    const q = khachThueSearch.trim().toLowerCase();
    if (!q) return khachThues;
    return khachThues.filter(t =>
      t.HoTen.toLowerCase().includes(q) ||
      t.SDT1.includes(q) ||
      (t.CCCD && t.CCCD.includes(q))
    );
  }, [khachThueSearch, khachThues]);

  const buildings = useMemo(() => Array.from(new Set(phongTros.map(r => r.TenDay))).sort(), [phongTros]);
  const availablePhongs = useMemo(() => phongTros.filter(r => r.TrangThai === 'Trống'), [phongTros]);
  const availablePhongsBySelectedDay = useMemo(
    () => availablePhongs.filter(r => !selectedDayForCreate || r.TenDay === selectedDayForCreate),
    [availablePhongs, selectedDayForCreate]
  );

  // ====== selection handlers ======
  const handleKhachThueSelect = (khachThue: KhachThue) => {
    setSelectedKhachThue(khachThue);
    setKhachThueSearch(khachThue.HoTen);
    setShowKhachThueDropdown(false);
  };

  const handlePhongSelect = (phong: PhongTro) => {
    setSelectedPhong(phong);
    setNewContract(prev => ({
      ...prev,
      TienCoc: Number(phong.TienCoc) || 0,
      TienThueHangThang: Number(phong.GiaThue) || 0
    }));
    setShowPhongDropdown(false);
  };

  const getDefaultDichVuIds = () => {
    const byName = (n: string) => dichVus.find(s => s.TenDichVu.toLowerCase() === n.toLowerCase() && s.TrangThaiHoatDong === true)?.MaDichVu;
    return [byName('Điện'), byName('Nước'), byName('Rác'), byName('Internet'), byName('Gửi xe')].filter(Boolean) as number[];
  };

  const resetContractForm = () => {
    setSelectedKhachThue(null);
    setSelectedPhong(null);
    setSelectedDayForCreate('');
    setKhachThueSearch('');
    setSelectedDichVuIds([]);
    setNewContract({
      SoHopDong: '',
      NgayKy: formatToYYYYMMDD(new Date()),
      NgayBatDau: '',
      NgayKetThuc: '',
      TienCoc: 0,
      TienThueHangThang: 0,
      GhiChu: ''
    });
  };

  // ====== edit ======
  const openEdit = (contract: HopDong) => {
    setEditingContract(contract);
    setEditForm({
      SoHopDong: contract.SoHopDong,
      NgayKy: formatToYYYYMMDD(parseDate(contract.NgayKy)),
      NgayBatDau: formatToYYYYMMDD(parseDate(contract.NgayBatDau)),
      NgayKetThuc: formatToYYYYMMDD(parseDate(contract.NgayKetThuc)),
      TienCoc: Number(contract.TienCoc) || 0,
      TienThueHangThang: Number(contract.TienThueHangThang) || 0,
      GhiChu: contract.GhiChu || '',
    });
    // Load dịch vụ đã áp dụng
    const currentDichVuIds = contract.hopDongDichVus?.map(dv => dv.MaDichVu) || [];
    setEditingDichVuIds(currentDichVuIds);
    // Đóng modal chi tiết trước khi mở modal sửa
    setSelectedContract(null);
    setShowEditModal(true);
  };

  const handleUpdateContract = async () => {
    if (!editingContract || !editForm.SoHopDong || !editForm.NgayBatDau || !editForm.NgayKetThuc) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    const start = new Date(editForm.NgayBatDau);
    const end = new Date(editForm.NgayKetThuc);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      error({ title: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận cập nhật',
      message: `Cập nhật hợp đồng ${editForm.SoHopDong}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const updateData: HopDongUpdateInput = {
            SoHopDong: editForm.SoHopDong,
            NgayKy: editForm.NgayKy,
            NgayBatDau: editForm.NgayBatDau,
            NgayKetThuc: editForm.NgayKetThuc,
            TienCoc: editForm.TienCoc,
            GhiChu: editForm.GhiChu,
            DichVuIds: editingDichVuIds,
          };
          await hopDongService.update(editingContract.MaHopDong, updateData);
          setShowEditModal(false);
          setEditingContract(null);
          setEditingDichVuIds([]);
          success({ title: 'Cập nhật hợp đồng thành công!' });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi cập nhật hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  // ====== renew ======
  const openRenewal = (contract: HopDong) => {
    setRenewingContract(contract);
    setRenewalData({ NgayKetThuc: '' });
    // Đóng modal chi tiết trước khi mở modal gia hạn
    setSelectedContract(null);
    setShowRenewalModal(true);
  };

  const confirmRenewal = async () => {
    if (!renewalData.NgayKetThuc || !renewingContract) {
      error({ title: 'Vui lòng chọn ngày kết thúc mới!' });
      return;
    }
    const oldEnd = parseDate(renewingContract.NgayKetThuc);
    const newEnd = new Date(renewalData.NgayKetThuc);
    if (isNaN(newEnd.getTime()) || newEnd <= oldEnd) {
      error({ title: 'Ngày kết thúc mới phải lớn hơn ngày hết hạn hiện tại.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận gia hạn',
      message: `Gia hạn hợp đồng ${renewingContract.SoHopDong} đến ${new Date(renewalData.NgayKetThuc).toLocaleDateString('vi-VN')}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const renewInput: HopDongRenewInput = {
            NgayKetThuc: renewalData.NgayKetThuc,
          };
          await hopDongService.renew(renewingContract.MaHopDong, renewInput);
          setShowRenewalModal(false);
          setRenewingContract(null);
          setRenewalData({ NgayKetThuc: '' });
          success({ title: `Đã gia hạn hợp đồng ${renewingContract.SoHopDong}!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi gia hạn hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  // ====== terminate ======
  const openTerminate = (contract: HopDong) => {
    setTerminatingContract(contract);
    setTerminationData({ GhiChu: '' });
    // Đóng modal chi tiết trước khi mở modal chấm dứt
    setSelectedContract(null);
    setShowTerminateModal(true);
  };

  const confirmTermination = async () => {
    if (!terminatingContract) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận chấm dứt',
      message: `Chấm dứt hợp đồng ${terminatingContract.SoHopDong}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          const terminateInput: HopDongTerminateInput = {
            GhiChu: terminationData.GhiChu,
          };
          await hopDongService.terminate(terminatingContract.MaHopDong, terminateInput);
          setShowTerminateModal(false);
          setTerminatingContract(null);
          setTerminationData({ GhiChu: '' });
          warning({ title: `Đã chấm dứt hợp đồng ${terminatingContract.SoHopDong}!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi chấm dứt hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  // ====== create ======
  const openCreateContract = () => {
    setSelectedDichVuIds(getDefaultDichVuIds());
    setShowContractModal(true);
  };

  const handleSubmitContract = async () => {
    if (!selectedKhachThue || !selectedPhong || !newContract.SoHopDong || !newContract.NgayBatDau || !newContract.NgayKetThuc) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    const start = new Date(newContract.NgayBatDau);
    const end = new Date(newContract.NgayKetThuc);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      error({ title: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.' });
      return;
    }

    setConfirmDialog({
      show: true,
      title: 'Xác nhận tạo hợp đồng',
      message: `Tạo hợp đồng ${newContract.SoHopDong} cho khách thuê "${selectedKhachThue.HoTen}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const createData: HopDongCreateInput = {
            SoHopDong: newContract.SoHopDong,
            MaPhong: selectedPhong.MaPhong,
            MaKhachThue: selectedKhachThue.MaKhachThue,
            NgayKy: newContract.NgayKy,
            NgayBatDau: newContract.NgayBatDau,
            NgayKetThuc: newContract.NgayKetThuc,
            TienCoc: newContract.TienCoc,
            TienThueHangThang: newContract.TienThueHangThang,
            GhiChu: newContract.GhiChu,
            DichVuIds: selectedDichVuIds,
          };
          await hopDongService.create(createData);
          setShowContractModal(false);
          resetContractForm();
          success({ title: `Tạo hợp đồng ${newContract.SoHopDong} thành công!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi tạo hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  const openDelete = (contract: HopDong) => {
    setConfirmDialog({
      show: true,
      title: 'Xác nhận xóa hợp đồng',
      message: `Bạn chắc chắn muốn xóa hợp đồng ${contract.SoHopDong} của "${contract.TenKhachThue}"? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await hopDongService.delete(contract.MaHopDong);
          if (selectedContract?.MaHopDong === contract.MaHopDong) setSelectedContract(null);
          success({ title: `Đã xóa hợp đồng ${contract.SoHopDong} thành công!` });
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi xóa hợp đồng', message: getErrorMessage(err) });
        }
      },
    });
  };

  // ====== stats ======
  const activeCount = useMemo(() => hopDongs.filter(c => c.TrangThai === 'DangHieuLuc').length, [hopDongs]);
  const nearlyExpiredCount = useMemo(() => hopDongs.filter(c => c.TrangThai === 'DangHieuLuc' && getDaysUntilExpiry(c.NgayKetThuc) <= 30).length, [hopDongs]);
  const expiredCount = useMemo(() => hopDongs.filter(c => c.TrangThai === 'HetHan').length, [hopDongs]);
  const renewedCount = useMemo(() => hopDongs.filter(c => c.SoLanGiaHan > 0).length, [hopDongs]);

  // =================== Render ===================
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                  <option value="DangHieuLuc">Đang hiệu lực</option>
                  <option value="HetHan">Hết hạn</option>
                  <option value="DaChamDut">Đã chấm dứt</option>
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
              {unpaginatedContracts.length === 0 ? (
                <div className="text-center py-12">
                  <i className="ri-file-list-3-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-500">Không tìm thấy hợp đồng nào</p>
                </div>
              ) : (
                <>
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
                      <tr key={contract.MaHopDong} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{contract.SoHopDong}</div>
                            <div className="text-sm text-gray-500">Ký: {contract.NgayKy}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.TenKhachThue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.TenDay}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{contract.TenPhong}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contract.NgayBatDau} - {contract.NgayKetThuc}</div>
                          {contract.TrangThai === 'DangHieuLuc' && getDaysUntilExpiry(contract.NgayKetThuc) <= 30 && (
                            <div className="text-xs text-red-600">Còn {getDaysUntilExpiry(contract.NgayKetThuc)} ngày</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">{Number(contract.TienThueHangThang || 0).toLocaleString('vi-VN')}đ/tháng</div>
                          <div className="text-xs text-gray-500">Cọc: {Number(contract.TienCoc || 0).toLocaleString('vi-VN')}đ</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.TrangThai)}`}>
                            {getStatusText(contract.TrangThai)}
                          </span>
                          {contract.SoLanGiaHan > 0 && (
                            <div className="text-xs text-blue-600 mt-1">Đã gia hạn {contract.SoLanGiaHan} lần</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button onClick={() => setSelectedContract(contract)} className="text-indigo-600 hover:text-indigo-900 cursor-pointer" title="Xem chi tiết">
                              <i className="ri-eye-line"></i>
                            </button>
                            {/* <button onClick={() => openEdit(contract)} className="text-green-600 hover:text-green-900 cursor-pointer" title="Chỉnh sửa">
                              <i className="ri-edit-line"></i>
                            </button> */}
                            {contract.TrangThai === 'DangHieuLuc' && isInFinalMonth(contract.NgayKetThuc) && (
                              <button onClick={() => openRenewal(contract)} className="text-blue-600 hover:text-blue-900 cursor-pointer" title="Gia hạn hợp đồng">
                                <i className="ri-refresh-line"></i>
                              </button>
                            )}
                            {/* <button onClick={() => openDelete(contract)} className="text-red-600 hover:text-red-900 cursor-pointer" title="Xóa hợp đồng">
                              <i className="ri-delete-bin-line"></i>
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
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
                itemLabel="hợp đồng"
              />
            </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Contract Detail Modal - Continue in next part due to size */}
      {selectedContract ? (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedContract(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết hợp đồng</h2>
                <button onClick={() => setSelectedContract(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin khách thuê & phòng</h3>

                  {/* Khách thuê */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Khách thuê</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ tên:</span>
                        <span className="font-medium">{selectedContract.khachThue?.HoTen || selectedContract.TenKhachThue}</span>
                      </div>
                      {selectedContract.khachThue?.SDT1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">{selectedContract.khachThue.SDT1}</span>
                        </div>
                      )}
                      {selectedContract.khachThue?.Email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{selectedContract.khachThue.Email}</span>
                        </div>
                      )}
                      {selectedContract.khachThue?.CCCD && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CCCD:</span>
                          <span className="font-medium">{selectedContract.khachThue.CCCD}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phòng trọ */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin phòng</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dãy:</span>
                        <span className="font-medium">{selectedContract.phongTro?.TenDay || selectedContract.TenDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phòng:</span>
                        <span className="font-medium">{selectedContract.phongTro?.TenPhong || selectedContract.TenPhong}</span>
                      </div>
                      {selectedContract.phongTro?.LoaiPhong && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại phòng:</span>
                          <span className="font-medium">{selectedContract.phongTro.LoaiPhong}</span>
                        </div>
                      )}
                      {selectedContract.phongTro?.DienTich && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diện tích:</span>
                          <span className="font-medium">{selectedContract.phongTro.DienTich}m²</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền thuê:</span>
                        <span className="font-medium text-green-600">{Number(selectedContract.TienThueHangThang || 0).toLocaleString('vi-VN')}đ/tháng</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tiền cọc:</span>
                        <span className="font-medium text-blue-600">{Number(selectedContract.TienCoc || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>

                  {/* Dịch vụ áp dụng */}
                  {selectedContract.hopDongDichVus && selectedContract.hopDongDichVus.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Dịch vụ áp dụng</h4>
                      <div className="space-y-2">
                        {selectedContract.hopDongDichVus.map((dv) => (
                          <div key={dv.MaHopDongDichVu} className="flex justify-between text-sm border-b border-green-100 pb-2 last:border-0 last:pb-0">
                            <span className="font-medium text-gray-700">{dv.TenDichVu}</span>
                            <span className="text-gray-600">{Number(dv.GiaApDung || 0).toLocaleString('vi-VN')}đ/{dv.DonViTinh}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng</label>
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{selectedContract.SoHopDong}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                      <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{selectedContract.NgayKy}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{selectedContract.NgayBatDau}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{selectedContract.NgayKetThuc}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getStatusColor(selectedContract.TrangThai)}`}>
                          {getStatusText(selectedContract.TrangThai)}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số lần gia hạn</label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">{selectedContract.SoLanGiaHan}</div>
                      </div>
                    </div>

                    {selectedContract.GhiChu && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 min-h-[80px]">{selectedContract.GhiChu}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => openEdit(selectedContract)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Chỉnh sửa</button>

                {selectedContract.TrangThai === 'DangHieuLuc' && isInFinalMonth(selectedContract.NgayKetThuc) && (
                  <button onClick={() => openRenewal(selectedContract)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap">Gia hạn</button>
                )}

                {selectedContract.TrangThai === 'DangHieuLuc' && (
                  <button onClick={() => openTerminate(selectedContract)} className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 cursor-pointer whitespace-nowrap">Chấm dứt</button>
                )}

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
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
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
                      value={khachThueSearch}
                      onChange={(e) => { setKhachThueSearch(e.target.value); setShowKhachThueDropdown(true); }}
                      onFocus={() => setShowKhachThueDropdown(true)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Tìm kiếm khách thuê..."
                    />
                    {showKhachThueDropdown && filteredKhachThues.length > 0 && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                        {filteredKhachThues.map((khachThue: KhachThue) => (
                          <div key={khachThue.MaKhachThue} onClick={() => handleKhachThueSelect(khachThue)} className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                            <div className="font-medium">{khachThue.HoTen}</div>
                            <div className="text-sm text-gray-500">{khachThue.SDT1} • {khachThue.Email}</div>
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
                        value={selectedDayForCreate}
                        onChange={(e) => {
                          setSelectedDayForCreate(e.target.value);
                          setSelectedPhong(null);
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
                        disabled={!selectedDayForCreate}
                        onClick={() => selectedDayForCreate && setShowPhongDropdown(!showPhongDropdown)}
                        className={`w-full border rounded-lg px-3 py-2 text-left flex justify-between items-center ${selectedDayForCreate ? 'border-gray-300' : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                          }`}
                        title={!selectedDayForCreate ? 'Hãy chọn dãy trước' : 'Chọn phòng'}
                      >
                        <span>
                          {selectedPhong
                            ? `${selectedPhong.TenPhong} - ${selectedPhong.LoaiPhong}`
                            : selectedDayForCreate
                              ? 'Chọn phòng'
                              : 'Chọn dãy trước'}
                        </span>
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      {showPhongDropdown && selectedDayForCreate && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto">
                          {availablePhongsBySelectedDay.length === 0 && (
                            <div className="p-3 text-sm text-gray-500">Không có phòng trống trong {selectedDayForCreate}</div>
                          )}
                          {availablePhongsBySelectedDay.map((phong: PhongTro) => (
                            <div
                              key={phong.MaPhong}
                              onClick={() => {
                                handlePhongSelect(phong);
                                setShowPhongDropdown(false);
                              }}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                              <div className="font-medium">
                                {phong.TenPhong} - {phong.LoaiPhong}
                              </div>
                              <div className="text-xs text-gray-600 mb-1">{phong.TenDay}</div>
                              <div className="text-sm text-gray-500">
                                {phong.DienTich}m² • {Number(phong.GiaThue || 0).toLocaleString('vi-VN')}đ/tháng
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoomStatusColor(phong.TrangThai)}`}>
                                  {getRoomStatusText(phong.TrangThai)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room Details */}
                  {selectedPhong && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Thông tin phòng</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span>Dãy:</span><span className="font-medium">{selectedPhong.TenDay}</span></div>
                        <div className="flex justify-between"><span>Tiền thuê:</span><span className="font-medium">{Number(selectedPhong.GiaThue || 0).toLocaleString('vi-VN')}đ/tháng</span></div>
                        <div className="flex justify-between"><span>Tiền cọc:</span><span className="font-medium">{Number(selectedPhong.TienCoc || 0).toLocaleString('vi-VN')}đ</span></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                    <input type="text" value={newContract.SoHopDong} onChange={(e) => setNewContract({ ...newContract, SoHopDong: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="HD001" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input type="date" value={newContract.NgayKy} onChange={(e) => setNewContract({ ...newContract, NgayKy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input type="date" value={newContract.NgayBatDau} onChange={(e) => setNewContract({ ...newContract, NgayBatDau: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input type="date" value={newContract.NgayKetThuc} onChange={(e) => setNewContract({ ...newContract, NgayKetThuc: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ) *</label>
                      <input type="number" value={newContract.TienCoc} onChange={(e) => setNewContract({ ...newContract, TienCoc: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thuê (VNĐ) *</label>
                      <input type="number" value={newContract.TienThueHangThang} onChange={(e) => setNewContract({ ...newContract, TienThueHangThang: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ áp dụng</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dichVus.filter(s => s.TrangThaiHoatDong === true).map(s => (
                        <label key={s.MaDichVu} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedDichVuIds.includes(s.MaDichVu)}
                            onChange={(e) => setSelectedDichVuIds(prev => e.target.checked ? [...prev, s.MaDichVu] : prev.filter((id: number) => id !== s.MaDichVu))}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{s.TenDichVu} <span className="text-gray-500">• {Number(s.DonGia || 0).toLocaleString('vi-VN')}đ/{s.DonViTinh}</span></div>
                            {s.MoTa && <div className="text-gray-500">{s.MoTa}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea value={newContract.GhiChu} onChange={(e) => setNewContract({ ...newContract, GhiChu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú thêm về hợp đồng..." />
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
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa hợp đồng</h2>

              <div className="grid grid-cols-2 gap-6">
                {/* Left Column - Tenant & Room Info (Read-only) */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin khách thuê & phòng</h3>

                  {/* Khách thuê */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Khách thuê</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Họ tên:</span>
                        <span className="font-medium">{editingContract.khachThue?.HoTen || editingContract.TenKhachThue}</span>
                      </div>
                      {editingContract.khachThue?.SDT1 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Số điện thoại:</span>
                          <span className="font-medium">{editingContract.khachThue.SDT1}</span>
                        </div>
                      )}
                      {editingContract.khachThue?.Email && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-xs">{editingContract.khachThue.Email}</span>
                        </div>
                      )}
                      {editingContract.khachThue?.CCCD && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CCCD:</span>
                          <span className="font-medium">{editingContract.khachThue.CCCD}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phòng trọ */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin phòng</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dãy:</span>
                        <span className="font-medium">{editingContract.phongTro?.TenDay || editingContract.TenDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phòng:</span>
                        <span className="font-medium">{editingContract.phongTro?.TenPhong || editingContract.TenPhong}</span>
                      </div>
                      {editingContract.phongTro?.LoaiPhong && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Loại phòng:</span>
                          <span className="font-medium">{editingContract.phongTro.LoaiPhong}</span>
                        </div>
                      )}
                      {editingContract.phongTro?.DienTich && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Diện tích:</span>
                          <span className="font-medium">{editingContract.phongTro.DienTich}m²</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Editable Contract Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Chi tiết hợp đồng</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số hợp đồng *</label>
                    <input type="text" value={editForm.SoHopDong} onChange={(e) => setEditForm({ ...editForm, SoHopDong: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày ký hợp đồng</label>
                    <input type="date" value={editForm.NgayKy} onChange={(e) => setEditForm({ ...editForm, NgayKy: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                      <input type="date" value={editForm.NgayBatDau} onChange={(e) => setEditForm({ ...editForm, NgayBatDau: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                      <input type="date" value={editForm.NgayKetThuc} onChange={(e) => setEditForm({ ...editForm, NgayKetThuc: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiền cọc (VNĐ) *</label>
                      <input type="number" value={editForm.TienCoc} onChange={(e) => setEditForm({ ...editForm, TienCoc: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiền thuê (VNĐ) *</label>
                      <input type="number" value={editForm.TienThueHangThang} onChange={(e) => setEditForm({ ...editForm, TienThueHangThang: parseInt(e.target.value || '0', 10) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="block text-sm font-medium text-gray-700 mb-2">Dịch vụ áp dụng</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {dichVus.filter(s => s.TrangThaiHoatDong === true).map(s => (
                        <label key={s.MaDichVu} className="flex items-start gap-3 p-2 rounded border border-gray-200 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={editingDichVuIds.includes(s.MaDichVu)}
                            onChange={(e) => setEditingDichVuIds(prev => e.target.checked ? [...prev, s.MaDichVu] : prev.filter((id: number) => id !== s.MaDichVu))}
                          />
                          <div className="text-sm">
                            <div className="font-medium">{s.TenDichVu} <span className="text-gray-500">• {Number(s.DonGia || 0).toLocaleString('vi-VN')}đ/{s.DonViTinh}</span></div>
                            {s.MoTa && <div className="text-gray-500">{s.MoTa}</div>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                    <textarea value={editForm.GhiChu} onChange={(e) => setEditForm({ ...editForm, GhiChu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú thêm về hợp đồng..." />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => { setShowEditModal(false); setEditingContract(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                <button onClick={handleUpdateContract} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Cập nhật</button>
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
                <div>Hợp đồng: <strong>{renewingContract.SoHopDong}</strong></div>
                <div>Khách thuê: <strong>{renewingContract.TenKhachThue}</strong></div>
                <div>Hết hạn hiện tại: <strong>{renewingContract.NgayKetThuc}</strong></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc mới *</label>
                  <input type="date" value={renewalData.NgayKetThuc} onChange={(e) => setRenewalData({ ...renewalData, NgayKetThuc: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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
                <div>Hợp đồng: <strong>{terminatingContract.SoHopDong}</strong></div>
                <div>Khách thuê: <strong>{terminatingContract.TenKhachThue}</strong></div>
                <div>Tiền cọc hiện tại: <strong>{Number(terminatingContract.TienCoc || 0).toLocaleString('vi-VN')}đ</strong></div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={terminationData.GhiChu} onChange={(e) => setTerminationData({ ...terminationData, GhiChu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Lý do chấm dứt hợp đồng..." />
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
