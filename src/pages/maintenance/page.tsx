import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import maintenanceService, {
  type YeuCauBaoTri,
  type MaintenanceRequestCreate,
  type MaintenanceRequestAssign,
  type MaintenanceRequestUpdateStatus
} from '../../services/maintenance.service';
import khachThueService, { type KhachThueListItem } from '../../services/khach-thue.service';
import nhanVienService, { type NhanVienListItem } from '../../services/nhan-vien.service';
import { getErrorMessage } from '../../lib/http-client';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/base/Pagination';

export default function Maintenance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<YeuCauBaoTri | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [requests, setRequests] = useState<YeuCauBaoTri[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);

  const [allTenants, setAllTenants] = useState<KhachThueListItem[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [allNhanViens, setAllNhanViens] = useState<NhanVienListItem[]>([]);
  const [loadingNhanViens, setLoadingNhanViens] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { }
  });

  const [newRequest, setNewRequest] = useState<MaintenanceRequestCreate>({
    MaKhachThue: 0,
    TieuDe: '',
    MoTa: '',
    PhanLoai: 'electrical',
    MucDoUuTien: 'medium',
    GhiChu: '',
    ChiPhiThucTe: undefined,
    HinhAnhMinhChung: []
  });

  const [assignData, setAssignData] = useState<{
    MaNhanVienPhanCong: number | null;
    GhiChu: string;
  }>({
    MaNhanVienPhanCong: null,
    GhiChu: ''
  });

  const [updateData, setUpdateData] = useState<MaintenanceRequestUpdateStatus>({
    TrangThai: 'pending',
    GhiChu: '',
    ChiPhiThucTe: undefined,
    HinhAnhMinhChung: []
  });

  const { success, error, warning, info } = useToast();

  // ===== Data Fetching =====
  useEffect(() => {
    const controller = new AbortController();
    const fetchRequests = async () => {
      setLoadingRequests(true);
      try {
        const response = await maintenanceService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setRequests(response.data.data || []);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải yêu cầu bảo trì', message: getErrorMessage(err) });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRequests(false);
        }
      }
    };

    fetchRequests();
    return () => controller.abort();
  }, [requestRefreshKey, error]);

  const refreshRequestsData = () => setRequestRefreshKey(prev => prev + 1);

  // Fetch tenants when "Add Request" modal is opened
  useEffect(() => {
    if (!showAddModal || allTenants.length > 0) return;

    const controller = new AbortController();
    const fetchTenants = async () => {
      setLoadingTenants(true);
      try {
        const response = await khachThueService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          const tenantsWithRooms = response.data.data.filter(t => t.MaPhong);
          setAllTenants(tenantsWithRooms);
        }
      } catch (err) {
        error({ title: 'Lỗi tải danh sách khách thuê', message: getErrorMessage(err) });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTenants(false);
        }
      }
    };

    fetchTenants();
    return () => controller.abort();
  }, [showAddModal, allTenants.length, error]);

  // Fetch nhanviens when "Assign" modal is opened
  useEffect(() => {
    if (!showAssignModal || allNhanViens.length > 0) return;

    const controller = new AbortController();
    const fetchNhanViens = async () => {
      setLoadingNhanViens(true);
      try {
        const response = await nhanVienService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setAllNhanViens(response.data.data || []);
        }
      } catch (err) {
        error({ title: 'Lỗi tải danh sách nhân viên', message: getErrorMessage(err) });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingNhanViens(false);
        }
      }
    };

    fetchNhanViens();
    return () => controller.abort();
  }, [showAssignModal, allNhanViens.length, error]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'electrical': return 'bg-yellow-100 text-yellow-800';
      case 'plumbing': return 'bg-blue-100 text-blue-800';
      case 'appliance': return 'bg-green-100 text-green-800';
      case 'furniture': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'electrical': return 'Điện';
      case 'plumbing': return 'Nước';
      case 'appliance': return 'Thiết bị';
      case 'furniture': return 'Nội thất';
      case 'other': return 'Khác';
      default: return category;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Khẩn cấp';
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'on_hold': return 'Tạm dừng';
      case 'in_progress': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // ===== Handler Functions =====
  const handleViewDetail = (request: YeuCauBaoTri) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCreateRequest = async () => {
    if (!newRequest.MaKhachThue || !newRequest.TieuDe || !newRequest.MoTa) {
      warning({ title: 'Cảnh báo', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    try {
      await maintenanceService.create(newRequest);
      success({ title: 'Thành công', message: 'Tạo yêu cầu bảo trì thành công' });
      setShowAddModal(false);
      setNewRequest({
        MaKhachThue: 0,
        TieuDe: '',
        MoTa: '',
        PhanLoai: 'electrical',
        MucDoUuTien: 'medium',
        GhiChu: '',
        ChiPhiThucTe: undefined,
        HinhAnhMinhChung: []
      });
      refreshRequestsData();
    } catch (err) {
      error({ title: 'Lỗi', message: getErrorMessage(err) });
    }
  };

  const handleUpdate = (request: YeuCauBaoTri) => {
    setSelectedRequest(request);
    setUpdateData({
      TrangThai: request.TrangThai as 'pending' | 'on_hold' | 'in_progress' | 'completed' | 'cancelled',
      GhiChu: request.GhiChu || '',
      ChiPhiThucTe: request.ChiPhiThucTe ? Number(request.ChiPhiThucTe) : undefined,
      HinhAnhMinhChung: []
    });
    setShowUpdateModal(true);
  };

  const handleAssign = (request: YeuCauBaoTri) => {
    setSelectedRequest(request);
    setAssignData({
      MaNhanVienPhanCong: null,
      GhiChu: ''
    });
    setShowAssignModal(true);
  };

  const handleAssignTechnician = async () => {
    if (!selectedRequest || !assignData.MaNhanVienPhanCong) {
      warning({ title: 'Cảnh báo', message: 'Vui lòng chọn nhân viên' });
      return;
    }

    try {
      const payload: MaintenanceRequestAssign = {
        MaNhanVienPhanCong: assignData.MaNhanVienPhanCong,
        GhiChu: assignData.GhiChu
      };
      await maintenanceService.assign(selectedRequest.MaYeuCau, payload);
      success({ title: 'Thành công', message: 'Phân công nhân viên thành công' });
      setShowAssignModal(false);
      setSelectedRequest(null);
      refreshRequestsData();
    } catch (err) {
      error({ title: 'Lỗi', message: getErrorMessage(err) });
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !updateData.TrangThai) {
      warning({ title: 'Cảnh báo', message: 'Vui lòng chọn trạng thái' });
      return;
    }

    try {
      await maintenanceService.updateStatus(selectedRequest.MaYeuCau, updateData);
      success({ title: 'Thành công', message: 'Cập nhật trạng thái thành công' });
      setShowUpdateModal(false);
      setSelectedRequest(null);
      refreshRequestsData();
    } catch (err) {
      error({ title: 'Lỗi', message: getErrorMessage(err) });
    }
  };

  const handleQuickStatusChange = async (id: number, status: string) => {
    try {
      await maintenanceService.updateStatus(id, {
        TrangThai: status as 'pending' | 'on_hold' | 'in_progress' | 'completed' | 'cancelled',
        GhiChu: '',
        ChiPhiThucTe: undefined,
        HinhAnhMinhChung: []
      });
      success({ title: 'Thành công', message: 'Cập nhật trạng thái thành công' });
      refreshRequestsData();
    } catch (err) {
      error({ title: 'Lỗi', message: getErrorMessage(err) });
    }
  };

  const handleDeleteRequest = (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa yêu cầu bảo trì này?',
      onConfirm: async () => {
        try {
          await maintenanceService.delete(id);
          success({ title: 'Thành công', message: 'Xóa yêu cầu thành công' });
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          refreshRequestsData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
        }
      }
    });
  };

  const filteredRequests = requests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.TrangThai === filterStatus;
    const priorityMatch = filterPriority === 'all' || request.MucDoUuTien === filterPriority;
    const categoryMatch = filterCategory === 'all' || request.PhanLoai === filterCategory;
    const searchMatch = searchTerm === '' ||
      request.TieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.khachThue?.HoTen && request.khachThue.HoTen.toLowerCase().includes(searchTerm.toLowerCase()));
    return statusMatch && priorityMatch && categoryMatch && searchMatch;
  });

  // NEW: Pagination logic
  const {
    paginatedData: paginatedRequests,
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
    data: filteredRequests,
    initialItemsPerPage: 10, // You can adjust this value
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý bảo trì</h1>
                <p className="text-gray-600">Theo dõi và xử lý các yêu cầu bảo trì</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Tạo yêu cầu
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.TrangThai === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <i className="ri-tools-line text-purple-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.TrangThai === 'in_progress').length}
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
                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.TrangThai === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-error-warning-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Khẩn cấp</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {requests.filter(r => r.MucDoUuTien === 'urgent').length}
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
                  <option value="pending">Chờ xử lý</option>
                  <option value="on_hold">Tạm dừng</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="border border-gray-3 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả mức độ</option>
                  <option value="urgent">Khẩn cấp</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="electrical">Điện</option>
                  <option value="plumbing">Nước</option>
                  <option value="appliance">Thiết bị</option>
                  <option value="furniture">Nội thất</option>
                  <option value="other">Khác</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề, phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Loading State */}
            {loadingRequests ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <>
                {/* Empty State */}
                {paginatedRequests.length === 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <i className="ri-inbox-line text-6xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không có yêu cầu bảo trì nào</h3>
                    <p className="text-gray-600">Hãy tạo yêu cầu bảo trì đầu tiên hoặc điều chỉnh bộ lọc.</p>
                  </div>
                )}

                {/* Maintenance Requests Table */}
                {paginatedRequests.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Yêu cầu
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Khách thuê
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Mức độ
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Trạng thái
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Phân công
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao tác
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedRequests.map((request) => (
                            <tr key={request.MaYeuCau} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{request.TieuDe}</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{request.khachThue?.HoTen || 'N/A'}</div>
                                  <div className="text-sm text-gray-500">Phòng: {request.MaKhachThue}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(request.PhanLoai)}`}>
                                  {getCategoryText(request.PhanLoai)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.MucDoUuTien)}`}>
                                  {getPriorityText(request.MucDoUuTien)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.TrangThai)}`}>
                                  {getStatusText(request.TrangThai)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {request.nhanVienPhanCong ? (
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{request.nhanVienPhanCong.HoTen}</div>
                                    {request.NgayPhanCong && (
                                      <div className="text-sm text-gray-500">
                                        {new Date(request.NgayPhanCong).toLocaleDateString('vi-VN')}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-500">Chưa phân công</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleViewDetail(request)}
                                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                    title="Xem chi tiết"
                                  >
                                    <i className="ri-eye-line"></i>
                                  </button>
                                  {/* <button
                                    onClick={() => handleUpdate(request)}
                                    className="text-green-600 hover:text-green-900 cursor-pointer"
                                    title="Chỉnh sửa"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button> */}
                                  <button onClick={() => handleDeleteRequest(request.MaYeuCau)}
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                    title="Xóa"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                  {request.TrangThai === 'pending' && (
                                    <button
                                      onClick={() => handleAssign(request)}
                                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                      title="Phân công"
                                    >
                                      <i className="ri-user-add-line"></i>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleUpdate(request)}
                                    className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                                    title="Cập nhật trạng thái"
                                  >
                                    <i className="ri-refresh-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Pagination Controls */}
                {!loadingRequests && filteredRequests.length > 0 && (
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
                    itemLabel="yêu cầu"
                  />
                )}
              </>
            )}

            {/* Add Request Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo yêu cầu bảo trì mới</h2>

                    <form className="space-y-4">
                      {/* HÀNG 1: KHÁCH THUÊ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê *</label>
                        {loadingTenants ? (
                          <div className="text-gray-500 text-sm">Đang tải...</div>
                        ) : (
                          <select
                            value={newRequest.MaKhachThue || ''}
                            onChange={(e) => setNewRequest({ ...newRequest, MaKhachThue: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                          >
                            <option value="">Chọn khách thuê</option>
                            {allTenants.map(tenant => (
                              <option key={tenant.MaKhachThue} value={tenant.MaKhachThue}>
                                {tenant.HoTen} - {tenant.TenPhong || 'Chưa có phòng'}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* HÀNG 2: DANH MỤC, MỨC ĐỘ */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                          <select
                            value={newRequest.PhanLoai}
                            onChange={(e) => setNewRequest({ ...newRequest, PhanLoai: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                          >
                            <option value="electrical">Điện</option>
                            <option value="plumbing">Nước</option>
                            <option value="appliance">Thiết bị</option>
                            <option value="furniture">Nội thất</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                          <select
                            value={newRequest.MucDoUuTien}
                            onChange={(e) => setNewRequest({ ...newRequest, MucDoUuTien: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                          >
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                          </select>
                        </div>
                      </div>

                      {/* HÀNG 3: TIÊU ĐỀ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                        <input
                          type="text"
                          value={newRequest.TieuDe}
                          onChange={(e) => setNewRequest({ ...newRequest, TieuDe: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Mô tả ngắn gọn vấn đề"
                        />
                      </div>

                      {/* HÀNG 4: MÔ TẢ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                        <textarea
                          value={newRequest.MoTa}
                          onChange={(e) => setNewRequest({ ...newRequest, MoTa: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={4}
                          placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                        ></textarea>
                      </div>

                      {/* HÀNG 5: GHI CHÚ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          value={newRequest.GhiChu}
                          onChange={(e) => setNewRequest({ ...newRequest, GhiChu: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={2}
                          placeholder="Ghi chú thêm (nếu có)..."
                        ></textarea>
                      </div>

                      {/* HÀNG 6: NÚT BẤM */}
                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center justify-center"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateRequest}
                          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Tạo yêu cầu
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Assign Modal */}
            {showAssignModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAssignModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Phân công nhân viên</h2>

                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên *</label>
                        {loadingNhanViens ? (
                          <div className="text-gray-500 text-sm">Đang tải...</div>
                        ) : (
                          <select
                            value={assignData.MaNhanVienPhanCong || ''}
                            onChange={(e) => setAssignData({ ...assignData, MaNhanVienPhanCong: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                          >
                            <option value="">Chọn nhân viên</option>
                            {allNhanViens.map(nv => (
                              <option key={nv.MaNV} value={nv.MaNV}>
                                {nv.HoTen}{nv.SDT ? ` - ${nv.SDT}` : ''}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          value={assignData.GhiChu}
                          onChange={(e) => setAssignData({ ...assignData, GhiChu: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={3}
                          placeholder="Ghi chú thêm về công việc..."
                        />
                      </div>
                    </form>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowAssignModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleAssignTechnician}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-user-add-line mr-2"></i>
                        Phân công
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Update Status Modal */}
            {showUpdateModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowUpdateModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Cập nhật trạng thái</h2>

                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới *</label>
                        <select
                          value={updateData.TrangThai}
                          onChange={(e) => setUpdateData({ ...updateData, TrangThai: e.target.value as 'pending' | 'on_hold' | 'in_progress' | 'completed' | 'cancelled' })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="in_progress">Đang thực hiện</option>
                          <option value="on_hold">Tạm dừng</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí thực tế</label>
                        <input
                          type="number"
                          value={updateData.ChiPhiThucTe || ''}
                          onChange={(e) => setUpdateData({ ...updateData, ChiPhiThucTe: e.target.value ? Number(e.target.value) : undefined })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Nhập chi phí (nếu có)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cập nhật</label>
                        <textarea
                          value={updateData.GhiChu}
                          onChange={(e) => setUpdateData({ ...updateData, GhiChu: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={3}
                          placeholder="Ghi chú về tiến độ, vấn đề gặp phải..."
                        />
                      </div>

                      {updateData.TrangThai === 'completed' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh hoàn thành</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">Có thể chọn nhiều hình ảnh</p>
                        </div>
                      )}
                    </form>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowUpdateModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleUpdateStatus}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-refresh-line mr-2"></i>
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Request Detail Modal */}
            {showDetailModal && selectedRequest && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Chi tiết yêu cầu bảo trì</h2>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-close-line text-xl"></i>
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Khách thuê:</span>
                          <span className="font-medium ml-2">{selectedRequest.khachThue?.HoTen || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mã khách thuê:</span>
                          <span className="font-medium ml-2">{selectedRequest.MaKhachThue}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600">Tiêu đề:</span>
                        <span className="font-medium ml-2">{selectedRequest.TieuDe}</span>
                      </div>

                      <div>
                        <span className="text-gray-600">Mô tả:</span>
                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.MoTa}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedRequest.PhanLoai)}`}>
                            {getCategoryText(selectedRequest.PhanLoai)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mức độ:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.MucDoUuTien)}`}>
                            {getPriorityText(selectedRequest.MucDoUuTien)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Ngày yêu cầu:</span>
                          <span className="font-medium ml-2">{new Date(selectedRequest.NgayYeuCau).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.TrangThai)}`}>
                            {getStatusText(selectedRequest.TrangThai)}
                          </span>
                        </div>
                      </div>

                      {selectedRequest.nhanVienPhanCong && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Phân công cho:</span>
                            <span className="font-medium ml-2">{selectedRequest.nhanVienPhanCong.HoTen}</span>
                          </div>
                          {selectedRequest.NgayPhanCong && (
                            <div>
                              <span className="text-gray-600">Ngày phân công:</span>
                              <span className="font-medium ml-2">{new Date(selectedRequest.NgayPhanCong).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedRequest.NgayHoanThanh && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Ngày hoàn thành:</span>
                            <span className="font-medium ml-2">{new Date(selectedRequest.NgayHoanThanh).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                      )}

                      {selectedRequest.GhiChu && (
                        <div>
                          <span className="text-gray-600">Ghi chú:</span>
                          <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.GhiChu}</p>
                        </div>
                      )}

                      {selectedRequest.ChiPhiThucTe && (
                        <div>
                          <span className="text-gray-600">Chi phí thực tế:</span>
                          <span className="font-medium ml-2">{Number(selectedRequest.ChiPhiThucTe).toLocaleString('vi-VN')} VND</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      {selectedRequest.TrangThai === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleAssign(selectedRequest);
                            }}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                          >
                            <i className="ri-check-line mr-2"></i>
                            Xác nhận
                          </button>
                          <button
                            onClick={() => {
                              setShowDetailModal(false);
                              handleAssign(selectedRequest);
                            }}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                          >
                            <i className="ri-user-add-line mr-2"></i>
                            Phân công
                          </button>
                        </>
                      )}
                      {selectedRequest.TrangThai === 'in_progress' && (
                        <button
                          onClick={() => {
                            setShowDetailModal(false);
                            handleQuickStatusChange(selectedRequest.MaYeuCau, 'completed');
                          }}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                        >
                          <i className="ri-check-double-line mr-2"></i>
                          Hoàn thành
                        </button>
                      )}
                      {/* <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleUpdate(selectedRequest);
                        }}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                      >
                        <i className="ri-edit-line mr-2"></i>
                        Chỉnh sửa
                      </button> */}
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          handleDeleteRequest(selectedRequest.MaYeuCau);
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Xóa yêu cầu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <ConfirmDialog
              isOpen={confirmDialog.isOpen}
              title={confirmDialog.title}
              message={confirmDialog.message}
              onConfirm={confirmDialog.onConfirm}
              onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

          </div>
        </main>
      </div>
    </div>
  );
}
