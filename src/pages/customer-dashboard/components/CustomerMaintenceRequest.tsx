import { useState, useEffect } from 'react';
import ConfirmDialog from '../../../components/base/ConfirmDialog';
import { useToast } from '../../../hooks/useToast';
import maintenanceService, { type YeuCauBaoTri, type MaintenanceRequestCreateForCustomer } from '../../../services/maintenance.service';
import { getErrorMessage } from '../../../lib/http-client';

export default function MaintenanceRequest() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<YeuCauBaoTri | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'info' | 'warning' | 'danger';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
  });

  const { success, error, warning } = useToast();

  const [requests, setRequests] = useState<YeuCauBaoTri[]>([]);

  // Fetch requests for current customer
  useEffect(() => {
    const controller = new AbortController();

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await maintenanceService.getAllForCustomer(controller.signal);
        if (!controller.signal.aborted) {
          setRequests(response.data.data);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(err) });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();
    return () => controller.abort();
  }, [refreshKey, error]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // ===== Handlers =====
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const TieuDe = formData.get('title') as string;
    const MoTa = formData.get('description') as string;
    const PhanLoai = formData.get('category') as 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
    const MucDoUuTien = formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent';

    if (!TieuDe || !MoTa || !PhanLoai || !MucDoUuTien) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận gửi yêu cầu',
      message: `Bạn có chắc chắn muốn gửi yêu cầu sửa chữa "${TieuDe}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const requestData: MaintenanceRequestCreateForCustomer = {
            TieuDe,
            MoTa,
            PhanLoai,
            MucDoUuTien,
            GhiChu: formData.get('notes') as string || '',
            HinhAnhMinhChung: [],
          };

          await maintenanceService.createForCustomer(requestData);
          setShowCreateModal(false);
          form.reset();
          success({ title: `Đã gửi yêu cầu sửa chữa "${TieuDe}" thành công!` });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
        }
      },
    });
  };

  const handleUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const TieuDe = formData.get('title') as string;
    const MoTa = formData.get('description') as string;
    const PhanLoai = formData.get('category') as 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
    const MucDoUuTien = formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent';

    if (!TieuDe || !MoTa || !PhanLoai || !MucDoUuTien || !selectedRequest) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật',
      message: `Bạn có chắc chắn muốn lưu thay đổi cho yêu cầu "${selectedRequest.TieuDe}" không?`,
      type: 'info',
      onConfirm: async () => {
        try {
          const updateData = {
            TieuDe,
            MoTa,
            PhanLoai,
            MucDoUuTien,
            GhiChu: formData.get('notes') as string || '',
          };

          await maintenanceService.update(selectedRequest.MaYeuCau, updateData);
          setShowEditModal(false);
          setSelectedRequest(null);
          success({ title: `Đã cập nhật yêu cầu "${TieuDe}" thành công!` });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
        }
      },
    });
  };

  const handleDeleteRequest = (requestId: number) => {
    const req = requests.find((r) => r.MaYeuCau === requestId);
    if (!req) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa yêu cầu',
      message: `Bạn có chắc chắn muốn xóa yêu cầu "${req.TieuDe}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await maintenanceService.delete(requestId);
          success({ title: `Đã xóa yêu cầu "${req.TieuDe}" thành công!` });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
        }
      },
    });
  };

  const handleCancelRequest = (requestId: number) => {
    const req = requests.find((r) => r.MaYeuCau === requestId);
    if (!req) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận hủy yêu cầu',
      message: `Bạn có chắc chắn muốn hủy yêu cầu "${req.TieuDe}" không?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await maintenanceService.updateStatus(requestId, {
            TrangThai: 'cancelled',
            GhiChu: 'Khách hàng đã hủy yêu cầu',
          });
          warning({ title: `Đã hủy yêu cầu "${req.TieuDe}" thành công!` });
          setShowDetailModal(false);
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
          refreshData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
          setConfirmDialog((d) => ({ ...d, isOpen: false }));
        }
      },
    });
  };

  // ===== UI helpers =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'on_hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý';
      case 'in_progress':
        return 'Đang xử lý';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'on_hold':
        return 'Tạm dừng';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'Khẩn cấp';
      case 'high':
        return 'Cao';
      case 'medium':
        return 'Trung bình';
      case 'low':
        return 'Thấp';
      default:
        return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'electrical':
        return 'Điện';
      case 'plumbing':
        return 'Hệ thống nước';
      case 'appliance':
        return 'Điện lạnh';
      case 'furniture':
        return 'Nội thất';
      case 'other':
        return 'Khác';
      default:
        return category;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yêu cầu sửa chữa</h1>
        <p className="text-gray-600">Quản lý các yêu cầu sửa chữa và bảo trì</p>
      </div>

      {/* Header section */}
      <div className="flex justify-end items-center mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center whitespace-nowrap cursor-pointer"
        >
          <i className="ri-add-line mr-2"></i>
          Tạo yêu cầu mới
        </button>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <i className="ri-time-line text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.TrangThai === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <i className="ri-settings-line text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.TrangThai === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <i className="ri-check-line text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.TrangThai === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <i className="ri-alert-line text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ưu tiên cao</p>
              <p className="text-2xl font-bold text-gray-900">
                {requests.filter((r) => r.MucDoUuTien === 'urgent' || r.MucDoUuTien === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách yêu cầu</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yêu cầu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ưu tiên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl"></i>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <i className="ri-inbox-line text-4xl text-gray-300"></i>
                    <p className="mt-2">Chưa có yêu cầu sửa chữa nào</p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.MaYeuCau} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.TieuDe}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{request.MoTa}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {getCategoryText(request.PhanLoai)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.MucDoUuTien)}`}>
                        {getPriorityText(request.MucDoUuTien)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.TrangThai)}`}>
                        {getStatusText(request.TrangThai)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      {(request.TrangThai === 'pending' || request.TrangThai === 'in_progress') && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteRequest(request.MaYeuCau)}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Xóa"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                      {request.TrangThai === 'pending' && (
                        <button
                          onClick={() => handleCancelRequest(request.MaYeuCau)}
                          className="text-orange-600 hover:text-orange-900 cursor-pointer"
                          title="Hủy yêu cầu"
                        >
                          <i className="ri-close-circle-line"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu sửa chữa mới</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề yêu cầu *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Mô tả ngắn gọn vấn đề"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="electrical">Điện</option>
                      <option value="plumbing">Hệ thống nước</option>
                      <option value="appliance">Điện lạnh</option>
                      <option value="furniture">Nội thất</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về vấn đề cần sửa chữa"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select
                      name="priority"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="">Chọn mức độ</option>
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh minh họa</label>
                    <input
                      type="file"
                      name="images"
                      multiple
                      accept="image/*"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Có thể chọn nhiều hình ảnh</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea
                    name="notes"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Thông tin bổ sung (không bắt buộc)"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-send-plane-line mr-2"></i>
                    Gửi yêu cầu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Chi tiết yêu cầu sửa chữa</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cột 1 */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-600">Tiêu đề:</span><span className="font-medium">{selectedRequest.TieuDe}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Danh mục:</span><span className="font-medium">{getCategoryText(selectedRequest.PhanLoai)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Ưu tiên:</span><span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedRequest.MucDoUuTien)}`}>{getPriorityText(selectedRequest.MucDoUuTien)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.TrangThai)}`}>{getStatusText(selectedRequest.TrangThai)}</span></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả vấn đề</h4>
                    <p className="text-gray-700">{selectedRequest.MoTa}</p>
                  </div>

                  {selectedRequest.HinhAnhMinhChung && selectedRequest.HinhAnhMinhChung.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Hình ảnh minh họa</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRequest.HinhAnhMinhChung.map((_image: string, index: number) => (
                          <div key={index} className="bg-gray-200 rounded-lg h-24 flex items-center justify-center">
                            <i className="ri-image-line text-gray-400 text-2xl"></i>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cột 2 */}
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin xử lý</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between"><span className="text-gray-600">Ngày tạo:</span><span className="font-medium">{new Date(selectedRequest.NgayYeuCau).toLocaleDateString('vi-VN')}</span></div>
                      {selectedRequest.NgayHoanThanh && (
                        <div className="flex justify-between"><span className="text-gray-600">Ngày hoàn thành:</span><span className="font-medium">{new Date(selectedRequest.NgayHoanThanh).toLocaleDateString('vi-VN')}</span></div>
                      )}
                      {selectedRequest.nhanVienPhanCong && (
                        <div className="flex justify-between"><span className="text-gray-600">Kỹ thuật viên:</span><span className="font-medium">{selectedRequest.nhanVienPhanCong.HoTen}</span></div>
                      )}
                      {selectedRequest.NgayPhanCong && (
                        <div className="flex justify-between"><span className="text-gray-600">Ngày phân công:</span><span className="font-medium">{new Date(selectedRequest.NgayPhanCong).toLocaleDateString('vi-VN')}</span></div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chi phí</h4>
                    <div className="space-y-2">
                      {selectedRequest.ChiPhiThucTe && (
                        <div className="flex justify-between"><span className="text-gray-600">Chi phí thực tế:</span><span className="font-medium text-green-600">{Number(selectedRequest.ChiPhiThucTe).toLocaleString('vi-VN')} VNĐ</span></div>
                      )}
                    </div>
                  </div>

                  {selectedRequest.GhiChu && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Ghi chú</h4>
                      <p className="text-gray-700">{selectedRequest.GhiChu}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.TrangThai === 'pending' && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleCancelRequest(selectedRequest.MaYeuCau)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy yêu cầu
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer">Đóng</button>
                {(selectedRequest.TrangThai === 'pending' || selectedRequest.TrangThai === 'in_progress') && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap cursor-pointer"
                  >
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa yêu cầu</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleUpdateRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề yêu cầu *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      defaultValue={selectedRequest.TieuDe}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select
                      name="category"
                      required
                      defaultValue={selectedRequest.PhanLoai}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="electrical">Điện</option>
                      <option value="plumbing">Hệ thống nước</option>
                      <option value="appliance">Điện lạnh</option>
                      <option value="furniture">Nội thất</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    defaultValue={selectedRequest.MoTa}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select
                      name="priority"
                      required
                      defaultValue={selectedRequest.MucDoUuTien}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={selectedRequest.GhiChu || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRequest(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
    </div>
  );
}
