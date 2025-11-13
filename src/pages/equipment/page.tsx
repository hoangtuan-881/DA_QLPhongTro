import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import thietBiService, { ThietBi, ThietBiCreateInput, ThietBiUpdateInput } from '../../services/thiet-bi.service';
import maintenanceService, { MaintenanceRequestCreate } from '../../services/maintenance.service';
import { dayTroService, DayTro } from '../../services/day-tro.service';
import phongTroService, { PhongTro } from '../../services/phong-tro.service';
import { getErrorMessage } from '../../lib/http-client';
import LoadingSpinner from '../../components/base/LoadingSpinner';
import EmptyState from '../../components/base/EmptyState';
import { API_ENDPOINTS } from '../../config/api';



export default function Equipment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<ThietBi | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'placement'>('inventory');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [placementBlock, setPlacementBlock] = useState<string>('all');
  const [placementStatus, setPlacementStatus] = useState<'all' | 'ok' | 'need_maintenance'>('all');
  const [placementSearch, setSearchPlacement] = useState<string>('');
  const [editingEquipment, setEditingEquipment] = useState<ThietBi | null>(null);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<ThietBi | null>(null);
  const [equipments, setEquipments] = useState<ThietBi[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [dayTros, setDayTros] = useState<DayTro[]>([]);
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [loadingDayTros, setLoadingDayTros] = useState(true);
  const [loadingPhongTros, setLoadingPhongTros] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [detailContext, setDetailContext] = useState<'inventory' | 'placement' | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const toast = useToast();

  const [newEquipment, setNewEquipment] = useState<ThietBiCreateInput>({
    TenThietBi: '',
    MaThietBi_Code: '',
    LoaiThietBi: 'Khac', // Default value
    MaDay: null,
    MaPhong: null,
    TinhTrang: 'Tot', // Default value
    GiaMua: null,
    NgayMua: null,
    HangSanXuat: null,
    GhiChu: null, // Changed from MoTa to GhiChu
  });

  const [maintenanceRequest, setMaintenanceRequest] = useState({
    type: 'routine', // This will map to PhanLoaiBaoTriEnum
    description: '', // This will map to MoTa
    priority: 'medium', // This will map to MucDoUuTienBaoTriEnum
    scheduledDate: '', // This will map to NgayYeuCau
    estimatedCost: 0, // This will map to ChiPhiDuKien
    assignedTo: '', // This will map to MaNhanVienPhanCong (need to fetch NhanVien)
    notes: '' // This will map to GhiChu
  });

  // Fetch data
  useEffect(() => {
    const controller = new AbortController();
    const fetchEquipments = async () => {
      setLoadingEquipments(true);
      try {
        const response = await thietBiService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setEquipments(response.data.data || []);
          setLoadingEquipments(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải thiết bị', message: getErrorMessage(error) });
          setLoadingEquipments(false);
        }
      }
    };

    fetchEquipments();
    return () => controller.abort();
  }, [refreshKey]);

  // Fetch DayTros and PhongTros for dropdowns
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoadingDayTros(true);
      setLoadingPhongTros(true);
      try {
        const [dayTroRes, phongTroRes] = await Promise.all([
          dayTroService.getAll(controller.signal),
          phongTroService.getAll(controller.signal)
        ]);

        if (!controller.signal.aborted) {
          setDayTros(dayTroRes.data.data || []);
          setLoadingDayTros(false);
          setPhongTros(phongTroRes.data.data || []);
          setLoadingPhongTros(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải dữ liệu dãy trọ/phòng trọ', message: getErrorMessage(error) });
          setLoadingDayTros(false);
          setLoadingPhongTros(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, []); // Empty dependency array means this runs once on mount

  const refreshData = () => {
    setLoadingEquipments(true);
    setRefreshKey(prev => prev + 1);
  };

  /** ====== HELPERS ====== */
  const getCategoryColor = (category: ThietBi['LoaiThietBi']) => {
    switch (category) {
      case 'NoiThat': return 'bg-blue-100 text-blue-800';
      case 'ThietBiDien': return 'bg-green-100 text-green-800';
      case 'DienTu': return 'bg-purple-100 text-purple-800';
      case 'AnToan': return 'bg-red-100 text-red-800';
      case 'Khac': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryText = (category: ThietBi['LoaiThietBi']) => {
    switch (category) {
      case 'NoiThat': return 'Nội thất';
      case 'ThietBiDien': return 'Thiết bị điện';
      case 'DienTu': return 'Điện tử';
      case 'AnToan': return 'An toàn';
      case 'Khac': return 'Khác';
      default: return category;
    }
  };
  const getConditionColor = (condition: ThietBi['TinhTrang']) => {
    switch (condition) {
      case 'Tot': return 'bg-green-100 text-green-800';
      case 'Binh_Thuong': return 'bg-yellow-100 text-yellow-800';
      case 'Kem': return 'bg-orange-100 text-orange-800';
      case 'Hu_Hong': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getConditionText = (condition: ThietBi['TinhTrang']) => {
    switch (condition) {
      case 'Tot': return 'Tốt';
      case 'Binh_Thuong': return 'Bình thường';
      case 'Kem': return 'Kém';
      case 'Hu_Hong': return 'Hư hỏng';
      default: return condition;
    }
  };

  // Tạm thời bỏ qua logic bảo trì vì thiếu trường trong ThietBi interface
  const isMaintenanceDue = (nextMaintenance?: string) => {
    return false; // Placeholder
  };

  const getPlacementStatus = (e: ThietBi) => {
    // Tạm thời chỉ dựa vào TinhTrang
    const need = e.TinhTrang === 'Kem' || e.TinhTrang === 'Hu_Hong';
    return need ? 'need_maintenance' : 'ok';
  };

  /** ====== FILTERED DATA ====== */
  const unpaginatedInventoryFiltered = useMemo(() => {
    return equipments.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.LoaiThietBi === filterCategory;
      const q = (search || '').toLowerCase().trim();
      const searchMatch =
        !q ||
        item.TenThietBi.toLowerCase().includes(q) ||
        item.MaThietBi_Code.toLowerCase().includes(q) ||
        (item.MoTa || '').toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [equipments, filterCategory, search]);

  const inventoryFiltered = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return unpaginatedInventoryFiltered.slice(startIndex, endIndex);
  }, [unpaginatedInventoryFiltered, currentPage, itemsPerPage]);

  type PlacementRow = {
    MaThietBi: number;
    MaDay: number | null;
    MaPhong: number | null;
    TenDay?: string | null;
    TenPhong?: string | null;
    TenThietBi: string;
    MaThietBi_Code: string;
    status: 'ok' | 'need_maintenance';
    original: ThietBi;
  };

  const placementRows: PlacementRow[] = useMemo(() => {
    return equipments.map(e => ({
      MaThietBi: e.MaThietBi,
      MaDay: e.MaDay,
      MaPhong: e.MaPhong,
      TenDay: e.dayTro?.TenDay, // Access from nested object
      TenPhong: e.phongTro?.TenPhong, // Access from nested object
      TenThietBi: e.TenThietBi,
      MaThietBi_Code: e.MaThietBi_Code,
      status: getPlacementStatus(e),
      original: e
    }));
  }, [equipments]);

  const uniqueBlocks = useMemo(() => {
    const set = new Set<string>();
    placementRows.forEach(r => {
      if (r.TenDay) set.add(r.TenDay);
    });
    return Array.from(set);
  }, [placementRows]);

  const unpaginatedPlacementFiltered = useMemo(() => {
    return placementRows.filter(r => {
      const blockMatch = placementBlock === 'all' || r.TenDay === placementBlock;
      const statusMatch = placementStatus === 'all' || r.status === placementStatus;
      const q = (placementSearch || '').toLowerCase().trim();
      const searchMatch =
        !q ||
        r.TenThietBi.toLowerCase().includes(q) ||
        (r.TenPhong || '').toLowerCase().includes(q) ||
        r.MaThietBi_Code.toLowerCase().includes(q);
      return blockMatch && statusMatch && searchMatch;
    });
  }, [placementRows, placementBlock, placementStatus, placementSearch]);

  const placementFiltered = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return unpaginatedPlacementFiltered.slice(startIndex, endIndex);
  }, [unpaginatedPlacementFiltered, currentPage, itemsPerPage]);

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
    if (confirmAction) confirmAction.onConfirm();
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleEdit = (equipment: ThietBi) => {
    setEditingEquipment(equipment);
    setNewEquipment({
      TenThietBi: equipment.TenThietBi,
      MaThietBi_Code: equipment.MaThietBi_Code,
      LoaiThietBi: equipment.LoaiThietBi,
      MaDay: equipment.MaDay,
      MaPhong: equipment.MaPhong,
      GiaMua: equipment.GiaMua,
      NgayMua: equipment.NgayMua,
      TinhTrang: equipment.TinhTrang,
      HangSanXuat: equipment.HangSanXuat,
      GhiChu: equipment.GhiChu, // Changed from MoTa to GhiChu
    });
    setShowEditModal(true);
  };

  const handleDelete = (equipment: ThietBi) => {
    showConfirm({
      title: 'Xác nhận xóa thiết bị',
      message: `Bạn có chắc chắn muốn xóa thiết bị "${equipment.TenThietBi}" (Mã: ${equipment.MaThietBi_Code}) không? Hành động này không thể hoàn tác.`,
      onConfirm: () => confirmDelete(equipment),
      type: 'danger'
    });
  };
  const confirmDelete = async (equipment: ThietBi) => {
    if (!equipment.MaThietBi) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy ID thiết bị để xóa.' });
      return;
    }
    try {
      await thietBiService.delete(equipment.MaThietBi);
      toast.success({ title: 'Đã xóa thiết bị', message: `Đã xóa "${equipment.TenThietBi}" (${equipment.MaThietBi_Code})` });
      refreshData(); // Re-fetch data after deletion
      setSelectedEquipment(null); // Close the detail modal
    } catch (error) {
      toast.error({ title: 'Lỗi xóa thiết bị', message: getErrorMessage(error) });
    }
  };

  const handleMaintenance = (equipment: ThietBi) => {
    setMaintenanceEquipment(equipment);
    setMaintenanceRequest({
      type: 'routine',
      description: '',
      priority: 'medium',
      scheduledDate: '',
      estimatedCost: 0,
      assignedTo: '',
      notes: ''
    });
    setShowMaintenanceModal(true);
  };

  const resetForm = () => {
    setNewEquipment({
      TenThietBi: '',
      MaThietBi_Code: '',
      LoaiThietBi: 'Khac',
      MaDay: null,
      MaPhong: null,
      TinhTrang: 'Tot',
      GiaMua: null,
      NgayMua: null,
      HangSanXuat: null,
      GhiChu: null, // Changed from MoTa to GhiChu
    });
  };

  const handleSubmit = () => {
    if (!newEquipment.TenThietBi || !newEquipment.MaThietBi_Code || !newEquipment.LoaiThietBi || newEquipment.MaDay === null || newEquipment.MaPhong === null) {
      toast.error({ title: 'Lỗi', message: 'Vui lòng điền đầy đủ tên, mã, danh mục, dãy, phòng!' });
      return;
    }
    showConfirm({
      title: 'Xác nhận thêm thiết bị',
      message: `Bạn có chắc muốn thêm "${newEquipment.TenThietBi}" - Phòng ${newEquipment.MaPhong}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await thietBiService.create(newEquipment);
          setShowAddModal(false);
          resetForm();
          toast.success({ title: 'Thêm thiết bị thành công', message: `Đã thêm "${newEquipment.TenThietBi}"` });
          refreshData(); // Re-fetch data after creation
        } catch (error) {
          toast.error({ title: 'Lỗi thêm thiết bị', message: getErrorMessage(error) });
        }
      }
    });
  };

  const handleUpdate = () => {
    if (!editingEquipment || !newEquipment.TenThietBi || !newEquipment.MaThietBi_Code || !newEquipment.LoaiThietBi || newEquipment.MaDay === null || newEquipment.MaPhong === null) {
      toast.error({ title: 'Lỗi cập nhật thiết bị', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    showConfirm({
      title: 'Xác nhận cập nhật',
      message: `Lưu thay đổi cho "${newEquipment.TenThietBi}"?`,
      type: 'info',
      onConfirm: async () => {
        try {
          await thietBiService.update(editingEquipment.MaThietBi, newEquipment);
          setShowEditModal(false);
          setEditingEquipment(null);
          setSelectedEquipment(null); // Close the detail modal as well
          resetForm();
          toast.success({ title: 'Cập nhật thiết bị thành công', message: `Đã cập nhật "${newEquipment.TenThietBi}"` });
          refreshData(); // Re-fetch data after update
        } catch (error) {
          toast.error({ title: 'Lỗi cập nhật thiết bị', message: getErrorMessage(error) });
        }
      }
    });
  };

  const handleCreateMaintenance = async () => {
    if (!maintenanceRequest.description || !maintenanceRequest.scheduledDate) {
      toast.error({ title: 'Lỗi tạo yêu cầu bảo trì', message: 'Vui lòng nhập mô tả và ngày thực hiện!' });
      return;
    }
    if (!maintenanceEquipment || !maintenanceEquipment.MaThietBi) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy thiết bị để tạo yêu cầu bảo trì.' });
      return;
    }

    const typeText =
      maintenanceRequest.type === 'routine' ? 'bảo trì định kỳ' :
        maintenanceRequest.type === 'repair' ? 'sửa chữa' : 'thay thế';

    showConfirm({
      title: 'Xác nhận tạo yêu cầu bảo trì',
      message: `Tạo yêu cầu ${typeText} cho "${maintenanceEquipment?.TenThietBi}" vào ${new Date(maintenanceRequest.scheduledDate).toLocaleDateString('vi-VN')}?`,
      type: 'info',
      onConfirm: async () => {
        try {
          // Map frontend type to backend PhanLoai
          let phanLoai: MaintenanceRequestCreate['PhanLoai'] = 'other';
          // If you have a more specific mapping, implement it here.
          // For example, if maintenanceEquipment.LoaiThietBi could map to PhanLoai.

          // Map frontend priority to backend MucDoUuTien
          let mucDoUuTien: MaintenanceRequestCreate['MucDoUuTien'] = 'medium';
          if (maintenanceRequest.priority === 'low') mucDoUuTien = 'low';
          else if (maintenanceRequest.priority === 'high') mucDoUuTien = 'high';
          else if (maintenanceRequest.priority === 'urgent') mucDoUuTien = 'urgent';

          // Construct the payload for the maintenance request
          const payload: MaintenanceRequestCreate = {
            MaKhachThue: 1, // Placeholder: In a real app, this would come from auth context or a selection
            TieuDe: `Yêu cầu ${typeText} cho ${maintenanceEquipment.TenThietBi} (${maintenanceEquipment.MaThietBi_Code})`,
            MoTa: `Thiết bị: ${maintenanceEquipment.TenThietBi} (Mã: ${maintenanceEquipment.MaThietBi_Code}), Phòng: ${maintenanceEquipment.phongTro?.TenPhong || 'N/A'}, Dãy: ${maintenanceEquipment.dayTro?.TenDay || 'N/A'}. Chi tiết: ${maintenanceRequest.description}`,
            PhanLoai: phanLoai,
            MucDoUuTien: mucDoUuTien,
            GhiChu: maintenanceRequest.notes,
            ChiPhiThucTe: maintenanceRequest.estimatedCost > 0 ? maintenanceRequest.estimatedCost : undefined,
            // HinhAnhMinhChung: [], // Assuming no image upload for now
          };

          await maintenanceService.create(payload);

          // Optionally update the local equipment state to reflect the new maintenance request
          // For example, update nextMaintenance date if the backend returns it
          // setEquipments(prev => prev.map(e =>
          //   e.MaThietBi === maintenanceEquipment.MaThietBi
          //     ? { ...e, nextMaintenance: maintenanceRequest.scheduledDate } // This field doesn't exist in ThietBi
          //     : e
          // ));

          setShowMaintenanceModal(false);
          setMaintenanceEquipment(null);
          setMaintenanceRequest({
            type: 'routine',
            description: '',
            priority: 'medium',
            scheduledDate: '',
            estimatedCost: 0,
            assignedTo: '',
            notes: ''
          });
          toast.success({ title: 'Đã tạo yêu cầu bảo trì', message: `Đã ${typeText} cho "${maintenanceEquipment?.TenThietBi}"` });
          toast.warn({ title: 'Lưu ý', message: 'MaKhachThue đang được mã hóa cứng là 1. Cần thay thế bằng ID khách thuê thực tế.' });
          // No refreshData() here as maintenance request is a separate entity, not directly updating equipment list
        } catch (error) {
          toast.error({ title: 'Lỗi tạo yêu cầu bảo trì', message: getErrorMessage(error) });
        }
      }
    });
  };

  /** ====== RENDER ====== */
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thiết bị</h1>
                <p className="text-gray-600">Quản lý thiết bị và thiết bị theo phòng</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i> Thêm thiết bị
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Thiết bị hiện có
                  </button>
                  <button
                    onClick={() => setActiveTab('placement')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'placement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Thiết bị theo phòng
                  </button>
                </nav>
              </div>
            </div>

            {/* Stats (chung) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg"><i className="ri-tools-line text-blue-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
                    <p className="text-2xl font-bold text-gray-900">{equipments.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg"><i className="ri-checkbox-circle-line text-green-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tình trạng tốt</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {equipments.filter(e => e.TinhTrang === 'Tot').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg"><i className="ri-time-line text-yellow-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cần bảo trì (gần hạn)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {/* Temporarily removed as ThietBi interface doesn't have nextMaintenance */}
                      0
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg"><i className="ri-error-warning-line text-red-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hỏng/Kém</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {equipments.filter(e => e.TinhTrang === 'Hu_Hong' || e.TinhTrang === 'Kem').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTERS theo TAB */}
            {activeTab === 'inventory' ? (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="NoiThat">Nội thất</option>
                    <option value="ThietBiDien">Thiết bị điện</option>
                    <option value="DienTu">Điện tử</option>
                    <option value="AnToan">An toàn</option>
                    <option value="Khac">Khác</option>
                  </select>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên, mã, ghi chú..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={placementBlock}
                    onChange={(e) => setPlacementBlock(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả dãy</option>
                    {uniqueBlocks.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả tình trạng</option>
                    <option value="ok">Bình thường</option>
                    <option value="need_maintenance">Cần bảo trì</option>
                  </select>
                  <input
                    type="text"
                    value={placementSearch}
                    onChange={(e) => setSearchPlacement(e.target.value)}
                    placeholder="Tìm theo phòng / thiết bị / mã..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                  />
                </div>
              </div>
            )}

            {/* TABLES theo TAB */}
            {loadingEquipments ? (
              <LoadingSpinner />
            ) : (
              <>
                {activeTab === 'inventory' ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thiết bị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá mua</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryFiltered.map((e) => (
                            <tr key={e.MaThietBi} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.TenThietBi}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{e.MaThietBi_Code}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(e.LoaiThietBi)}`}>
                                  {getCategoryText(e.LoaiThietBi)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{e.GiaMua?.toLocaleString('vi-VN')}đ</div>
                                <div className="text-xs text-gray-500">{e.NgayMua ? new Date(e.NgayMua).toLocaleDateString('vi-VN') : 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{e.GhiChu || <span className="text-gray-400 italic">—</span>}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => { setDetailContext('inventory'); setSelectedEquipment(e); }}
                                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <i className="ri-eye-line"></i>
                                  </button>

                                  <button
                                    onClick={() => handleEdit(e)}
                                    className="text-green-600 hover:text-green-900 cursor-pointer"
                                    title="Chỉnh sửa"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(e)}
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                    title="Xóa thiết bị"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {inventoryFiltered.length === 0 && (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                <EmptyState message="Không có thiết bị nào phù hợp bộ lọc." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dãy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {placementFiltered.map(row => (
                            <tr key={row.MaThietBi} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm text-gray-900">{row.TenDay || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm text-gray-900">{row.TenPhong || 'N/A'}</td>
                              <td className="px-6 py-4 text-sm">
                                <div className="text-gray-900 font-medium">{row.TenThietBi}</div>
                                <div className="text-gray-500">{row.MaThietBi_Code}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {row.status === 'need_maintenance' ? (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cần bảo trì</span>
                                ) : (
                                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Bình thường</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => { setDetailContext('placement'); setSelectedEquipment(row.original); }}
                                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <i className="ri-eye-line"></i>
                                  </button>

                                  <button
                                    onClick={() => handleEdit(row.original)}
                                    className="text-green-600 hover:text-green-900 cursor-pointer"
                                    title="Chỉnh sửa"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleMaintenance(row.original)}
                                    className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                    title="Bảo trì"
                                  >
                                    <i className="ri-tools-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(row.original)}
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                    title="Xóa"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {placementFiltered.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                <EmptyState message="Không có thiết bị nào phù hợp bộ lọc." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Hiển thị {((currentPage - 1) * itemsPerPage) + 1} đến {Math.min(currentPage * itemsPerPage, (activeTab === 'inventory' ? unpaginatedInventoryFiltered.length : unpaginatedPlacementFiltered.length))} của {(activeTab === 'inventory' ? unpaginatedInventoryFiltered.length : unpaginatedPlacementFiltered.length)} mục
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {Array.from({ length: Math.ceil((activeTab === 'inventory' ? unpaginatedInventoryFiltered.length : unpaginatedPlacementFiltered.length) / itemsPerPage) }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg ${currentPage === i + 1 ? 'bg-indigo-600 text-white' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil((activeTab === 'inventory' ? unpaginatedInventoryFiltered.length : unpaginatedPlacementFiltered.length) / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil((activeTab === 'inventory' ? unpaginatedInventoryFiltered.length : unpaginatedPlacementFiltered.length) / itemsPerPage)}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tiếp
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* === Detail Modal === */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => { setSelectedEquipment(null); setDetailContext(null); }}
            ></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {detailContext === 'inventory' ? 'Chi tiết thiết bị (Thông tin chung)' : 'Chi tiết thiết bị'}
                </h2>
                <button
                  onClick={() => { setSelectedEquipment(null); setDetailContext(null); }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* ========== INVENTORY VIEW: chỉ thông tin chung ========== */}
              {detailContext === 'inventory' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên thiết bị:</span>
                          <span className="font-medium">{selectedEquipment.TenThietBi}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã thiết bị:</span>
                          <span className="font-medium">{selectedEquipment.MaThietBi_Code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEquipment.LoaiThietBi)}`}>
                            {getCategoryText(selectedEquipment.LoaiThietBi)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Mua sắm</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày mua:</span>
                          <span className="font-medium">{selectedEquipment.NgayMua ? new Date(selectedEquipment.NgayMua).toLocaleDateString('vi-VN') : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá mua:</span>
                          <span className="font-medium text-green-600">
                            {selectedEquipment.GiaMua?.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        {selectedEquipment.HangSanXuat && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hãng sản xuất:</span>
                            <span className="font-medium">
                              {selectedEquipment.HangSanXuat}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedEquipment.MoTa && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEquipment.MoTa}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => handleEdit(selectedEquipment)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEquipment)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Xóa thiết bị
                    </button>
                  </div>
                </>
              )}

              {/* ========== PLACEMENT VIEW: chi tiết đầy đủ như hiện có ========== */}
              {detailContext === 'placement' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Tên thiết bị:</span><span className="font-medium">{selectedEquipment.TenThietBi}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Mã thiết bị:</span><span className="font-medium">{selectedEquipment.MaThietBi_Code}</span></div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEquipment.LoaiThietBi)}`}>
                            {getCategoryText(selectedEquipment.LoaiThietBi)}
                          </span>
                        </div>
                        <div className="flex justify-between"><span className="text-gray-600">Dãy:</span><span className="font-medium">{selectedEquipment.TenDay || 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Phòng:</span><span className="font-medium">{selectedEquipment.TenPhong || 'N/A'}</span></div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tình trạng:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedEquipment.TinhTrang)}`}>
                            {getConditionText(selectedEquipment.TinhTrang)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Mua sắm & bảo trì</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Ngày mua:</span><span className="font-medium">{selectedEquipment.NgayMua ? new Date(selectedEquipment.NgayMua).toLocaleDateString('vi-VN') : 'N/A'}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Giá mua:</span><span className="font-medium text-green-600">{selectedEquipment.GiaMua?.toLocaleString('vi-VN')}đ</span></div>
                        {selectedEquipment.HangSanXuat && (<div className="flex justify-between"><span className="text-gray-600">Hãng sản xuất:</span><span className="font-medium">{selectedEquipment.HangSanXuat}</span></div>)}
                        {/* Temporarily removed as ThietBi interface doesn't have lastMaintenance/nextMaintenance */}
                        {/* {selectedEquipment.lastMaintenance && (<div className="flex justify-between"><span className="text-gray-600">Bảo trì lần cuối:</span><span className="font-medium">{new Date(selectedEquipment.lastMaintenance).toLocaleDateString('vi-VN')}</span></div>)}
                        {selectedEquipment.nextMaintenance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bảo trì tiếp theo:</span>
                            <span className={`font-medium ${isMaintenanceDue(selectedEquipment.nextMaintenance) ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(selectedEquipment.nextMaintenance).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  {selectedEquipment.MoTa && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEquipment.MoTa}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <button onClick={() => handleEdit(selectedEquipment)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Chỉnh sửa</button>
                    <button onClick={() => handleMaintenance(selectedEquipment)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">Tạo yêu cầu bảo trì</button>
                    <button onClick={() => handleDelete(selectedEquipment)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">Xóa thiết bị</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm thiết bị mới</h2>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                    <input type="text" value={newEquipment.TenThietBi} onChange={(e) => setNewEquipment({ ...newEquipment, TenThietBi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Điều hòa Daikin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input type="text" value={newEquipment.MaThietBi_Code || ''} onChange={(e) => setNewEquipment({ ...newEquipment, MaThietBi_Code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="AC001" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select value={newEquipment.LoaiThietBi} onChange={(e) => setNewEquipment({ ...newEquipment, LoaiThietBi: e.target.value as ThietBi['LoaiThietBi'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="Khac">Chọn danh mục</option>
                      <option value="NoiThat">Nội thất</option>
                      <option value="ThietBiDien">Thiết bị điện</option>
                      <option value="DienTu">Điện tử</option>
                      <option value="AnToan">An toàn</option>
                      <option value="Khac">Khác</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                    <select
                      value={newEquipment.MaDay || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, MaDay: parseInt(e.target.value) || null, MaPhong: null })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      disabled={loadingDayTros}
                    >
                      <option value="">{loadingDayTros ? 'Đang tải dãy...' : 'Chọn dãy'}</option>
                      {dayTros.map(day => (
                        <option key={day.MaDay} value={day.MaDay}>{day.TenDay}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <select
                      value={newEquipment.MaPhong || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, MaPhong: parseInt(e.target.value) || null })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      disabled={!newEquipment.MaDay || loadingPhongTros}
                    >
                      <option value="">
                        {loadingPhongTros ? 'Đang tải phòng...' : (newEquipment.MaDay ? 'Chọn phòng' : 'Chọn dãy trước')}
                      </option>
                      {phongTros
                        .filter(phong => phong.MaDay === newEquipment.MaDay)
                        .map(phong => (
                          <option key={phong.MaPhong} value={phong.MaPhong}>{phong.TenPhong}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input type="date" value={newEquipment.NgayMua || ''} onChange={(e) => setNewEquipment({ ...newEquipment, NgayMua: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input type="number" value={newEquipment.GiaMua || ''} onChange={(e) => setNewEquipment({ ...newEquipment, GiaMua: parseInt(e.target.value) || null })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="8500000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select value={newEquipment.TinhTrang} onChange={(e) => setNewEquipment({ ...newEquipment, TinhTrang: e.target.value as ThietBi['TinhTrang'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="Tot">Tốt</option>
                      <option value="Binh_Thuong">Bình thường</option>
                      <option value="Kem">Kém</option>
                      <option value="Hu_Hong">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                    <input type="text" value={newEquipment.HangSanXuat || ''} onChange={(e) => setNewEquipment({ ...newEquipment, HangSanXuat: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Sony, Samsung, Panasonic..." />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={newEquipment.GhiChu || ''} onChange={(e) => setNewEquipment({ ...newEquipment, GhiChu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú về thiết bị..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Thêm thiết bị</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thiết bị</h2>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                    <input type="text" value={newEquipment.TenThietBi} onChange={(e) => setNewEquipment({ ...newEquipment, TenThietBi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input type="text" value={newEquipment.MaThietBi_Code || ''} onChange={(e) => setNewEquipment({ ...newEquipment, MaThietBi_Code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select value={newEquipment.LoaiThietBi} onChange={(e) => setNewEquipment({ ...newEquipment, LoaiThietBi: e.target.value as ThietBi['LoaiThietBi'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="Khac">Chọn danh mục</option>
                      <option value="NoiThat">Nội thất</option>
                      <option value="ThietBiDien">Thiết bị điện</option>
                      <option value="DienTu">Điện tử</option>
                      <option value="AnToan">An toàn</option>
                      <option value="Khac">Khác</option>
                    </select>
                  </div>
                </div>
                {/* Add & Edit modal – NEW field */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                    <select
                      value={newEquipment.MaDay || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, MaDay: parseInt(e.target.value) || null, MaPhong: null })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      disabled={loadingDayTros}
                    >
                      <option value="">{loadingDayTros ? 'Đang tải dãy...' : 'Chọn dãy'}</option>
                      {dayTros.map(day => (
                        <option key={day.MaDay} value={day.MaDay}>{day.TenDay}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <select
                      value={newEquipment.MaPhong || ''}
                      onChange={(e) => setNewEquipment({ ...newEquipment, MaPhong: parseInt(e.target.value) || null })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      disabled={!newEquipment.MaDay || loadingPhongTros}
                    >
                      <option value="">
                        {loadingPhongTros ? 'Đang tải phòng...' : (newEquipment.MaDay ? 'Chọn phòng' : 'Chọn dãy trước')}
                      </option>
                      {phongTros
                        .filter(phong => phong.MaDay === newEquipment.MaDay)
                        .map(phong => (
                          <option key={phong.MaPhong} value={phong.MaPhong}>{phong.TenPhong}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input type="date" value={newEquipment.NgayMua || ''} onChange={(e) => setNewEquipment({ ...newEquipment, NgayMua: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input type="number" value={newEquipment.GiaMua || ''} onChange={(e) => setNewEquipment({ ...newEquipment, GiaMua: parseInt(e.target.value) || null })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select value={newEquipment.TinhTrang} onChange={(e) => setNewEquipment({ ...newEquipment, TinhTrang: e.target.value as ThietBi['TinhTrang'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="Tot">Tốt</option>
                      <option value="Binh_Thuong">Bình thường</option>
                      <option value="Kem">Kém</option>
                      <option value="Hu_Hong">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hãng sản xuất</label>
                    <input type="text" value={newEquipment.HangSanXuat || ''} onChange={(e) => setNewEquipment({ ...newEquipment, HangSanXuat: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={newEquipment.GhiChu || ''} onChange={(e) => setNewEquipment({ ...newEquipment, GhiChu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingEquipment(null); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleUpdate} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && maintenanceEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMaintenanceModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo yêu cầu bảo trì</h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin thiết bị</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Tên thiết bị:</span><span className="font-medium ml-2">{maintenanceEquipment.TenThietBi}</span></div>
                  <div><span className="text-gray-600">Mã thiết bị:</span><span className="font-medium ml-2">{maintenanceEquipment.MaThietBi_Code}</span></div>
                  <div><span className="text-gray-600">Phòng:</span><span className="font-medium ml-2">{maintenanceEquipment.phongTro?.TenPhong || 'N/A'}</span></div>
                  <div><span className="text-gray-600">Tình trạng:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getConditionColor(maintenanceEquipment.TinhTrang)}`}>
                      {getConditionText(maintenanceEquipment.TinhTrang)}
                    </span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bảo trì *</label>
                    <select value={maintenanceRequest.type} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="routine">Bảo trì định kỳ</option>
                      <option value="repair">Sửa chữa</option>
                      <option value="replacement">Thay thế</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select value={maintenanceRequest.priority} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, priority: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea value={maintenanceRequest.description} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Mô tả chi tiết vấn đề..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến thực hiện *</label>
                    <input type="date" value={maintenanceRequest.scheduledDate} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, scheduledDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí ước tính (VNĐ)</label>
                    <input type="number" value={maintenanceRequest.estimatedCost} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, estimatedCost: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="500000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người phụ trách</label>
                  <input type="text" value={maintenanceRequest.assignedTo} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, assignedTo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tên kỹ thuật viên / đơn vị" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea value={maintenanceRequest.notes} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} placeholder="Ghi chú thêm..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowMaintenanceModal(false); setMaintenanceEquipment(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleCreateMaintenance} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">Tạo yêu cầu bảo trì</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
