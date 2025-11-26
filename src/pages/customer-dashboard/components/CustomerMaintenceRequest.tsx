import React, { useState } from 'react';
import ConfirmDialog from '../../../components/base/ConfirmDialog';
import { useToast } from '../../../hooks/useToast';

export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  status: 'Chờ xử lý' | 'Đang xử lý' | 'Hoàn thành' | 'Đã hủy';
  createdDate: string;
  estimatedCost?: string;
  images: string[];
  notes?: string;
  technician?: string;
  completedDate?: string;
  actualCost?: string;
}

export default function MaintenanceRequest() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

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

  const [requests, setRequests] = useState<MaintenanceRequest[]>([
    {
      id: 1,
      title: 'Điều hòa không hoạt động',
      description: 'Điều hòa phòng 101A không thể bật, có thể do hỏng remote hoặc máy',
      category: 'Điện lạnh',
      priority: 'Cao',
      status: 'Chờ xử lý',
      createdDate: '2024-12-10',
      estimatedCost: '500,000',
      images: ['image1.jpg', 'image2.jpg'],
      notes: 'Cần xử lý gấp vì trời nóng',
    },
    {
      id: 2,
      title: 'Vòi nước bồn rửa bát bị rò',
      description: 'Vòi nước trong bếp bị rò rỉ, nước chảy liên tục',
      category: 'Hệ thống nước',
      priority: 'Trung bình',
      status: 'Đang xử lý',
      createdDate: '2024-12-08',
      estimatedCost: '200,000',
      images: ['image3.jpg'],
      technician: 'Nguyễn Văn Tú',
      notes: 'Đã liên hệ thợ sửa',
    },
    {
      id: 3,
      title: 'Bóng đèn phòng ngủ cháy',
      description: 'Bóng đèn LED phòng ngủ bị cháy, cần thay mới',
      category: 'Điện',
      priority: 'Thấp',
      status: 'Hoàn thành',
      createdDate: '2024-12-05',
      completedDate: '2024-12-06',
      actualCost: '50,000',
      images: [],
      technician: 'Trần Minh Đức',
      notes: 'Đã thay bóng đèn mới',
    },
  ]);

  // ===== Handlers =====
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as 'Cao' | 'Trung bình' | 'Thấp';

    if (!title || !description || !category || !priority) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận gửi yêu cầu',
      message: `Bạn có chắc chắn muốn gửi yêu cầu sửa chữa "${title}" không?`,
      type: 'info',
      onConfirm: () => {
        const request: MaintenanceRequest = {
          id: Date.now(),
          title,
          description,
          category,
          priority,
          status: 'Chờ xử lý',
          createdDate: new Date().toISOString().split('T')[0],
          notes: formData.get('notes') as string,
          images: [],
        };

        setRequests((prev) => [...prev, request]);
        setShowCreateModal(false);
        form.reset();
        success({ title: `Đã gửi yêu cầu sửa chữa "${title}" thành công!` });
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleUpdateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const priority = formData.get('priority') as 'Cao' | 'Trung bình' | 'Thấp';

    if (!title || !description || !category || !priority || !selectedRequest) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật',
      message: `Bạn có chắc chắn muốn lưu thay đổi cho yêu cầu "${selectedRequest.title}" không?`,
      type: 'info',
      onConfirm: () => {
        const updatedRequest: MaintenanceRequest = {
          ...selectedRequest,
          title,
          description,
          category,
          priority,
          notes: formData.get('notes') as string,
        };

        setRequests((prev) => prev.map((r) => (r.id === selectedRequest.id ? updatedRequest : r)));
        setShowEditModal(false);
        setSelectedRequest(null);
        success({ title: `Đã cập nhật yêu cầu "${title}" thành công!` });
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleDeleteRequest = (requestId: number) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa yêu cầu',
      message: `Bạn có chắc chắn muốn xóa yêu cầu "${req.title}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        success({ title: `Đã xóa yêu cầu "${req.title}" thành công!` });
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  const handleCancelRequest = (requestId: number) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận hủy yêu cầu',
      message: `Bạn có chắc chắn muốn hủy yêu cầu "${req.title}" không?`,
      type: 'warning',
      onConfirm: () => {
        setRequests((prev) => prev.map((r) => (r.id === requestId ? { ...r, status: 'Đã hủy' } : r)));
        warning({ title: `Đã hủy yêu cầu "${req.title}" thành công!` });
        setShowDetailModal(false);
        setConfirmDialog((d) => ({ ...d, isOpen: false }));
      },
    });
  };

  // ===== UI helpers =====
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý':
        return 'bg-yellow-100 text-yellow-800';
      case 'Đang xử lý':
        return 'bg-blue-100 text-blue-800';
      case 'Hoàn thành':
        return 'bg-green-100 text-green-800';
      case 'Đã hủy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Cao':
        return 'bg-red-100 text-red-800';
      case 'Trung bình':
        return 'bg-yellow-100 text-yellow-800';
      case 'Thấp':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
                {requests.filter((r) => r.status === 'Chờ xử lý').length}
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
                {requests.filter((r) => r.status === 'Đang xử lý').length}
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
                {requests.filter((r) => r.status === 'Hoàn thành').length}
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
                {requests.filter((r) => r.priority === 'Cao').length}
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
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{request.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {request.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.createdDate}</td>
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
                    {(request.status === 'Chờ xử lý' || request.status === 'Đang xử lý') && (
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
                      onClick={() => handleDeleteRequest(request.id)}
                      className="text-red-600 hover:text-red-900 cursor-pointer"
                      title="Xóa"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                    {request.status === 'Chờ xử lý' && (
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="text-orange-600 hover:text-orange-900 cursor-pointer"
                        title="Hủy yêu cầu"
                      >
                        <i className="ri-close-circle-line"></i>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
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
                      <option value="Điện">Điện</option>
                      <option value="Hệ thống nước">Hệ thống nước</option>
                      <option value="Điện lạnh">Điện lạnh</option>
                      <option value="Nội thất">Nội thất</option>
                      <option value="Khác">Khác</option>
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
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao</option>
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
                      <div className="flex justify-between"><span className="text-gray-600">Tiêu đề:</span><span className="font-medium">{selectedRequest.title}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Danh mục:</span><span className="font-medium">{selectedRequest.category}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Ưu tiên:</span><span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(selectedRequest.priority)}`}>{selectedRequest.priority}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedRequest.status)}`}>{selectedRequest.status}</span></div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả vấn đề</h4>
                    <p className="text-gray-700">{selectedRequest.description}</p>
                  </div>

                  {selectedRequest.images && selectedRequest.images.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Hình ảnh minh họa</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRequest.images.map((_image: string, index: number) => (
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
                      <div className="flex justify-between"><span className="text-gray-600">Ngày tạo:</span><span className="font-medium">{selectedRequest.createdDate}</span></div>
                      {selectedRequest.completedDate && (
                        <div className="flex justify-between"><span className="text-gray-600">Ngày hoàn thành:</span><span className="font-medium">{selectedRequest.completedDate}</span></div>
                      )}
                      {selectedRequest.technician && (
                        <div className="flex justify-between"><span className="text-gray-600">Kỹ thuật viên:</span><span className="font-medium">{selectedRequest.technician}</span></div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chi phí</h4>
                    <div className="space-y-2">
                      {selectedRequest.estimatedCost && (
                        <div className="flex justify-between"><span className="text-gray-600">Chi phí ước tính:</span><span className="font-medium text-orange-600">{selectedRequest.estimatedCost} VNĐ</span></div>
                      )}
                      {selectedRequest.actualCost && (
                        <div className="flex justify-between"><span className="text-gray-600">Chi phí thực tế:</span><span className="font-medium text-green-600">{selectedRequest.actualCost} VNĐ</span></div>
                      )}
                    </div>
                  </div>

                  {selectedRequest.notes && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Ghi chú</h4>
                      <p className="text-gray-700">{selectedRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedRequest.status === 'Chờ xử lý' && (
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleCancelRequest(selectedRequest.id)}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy yêu cầu
                  </button>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap cursor-pointer">Đóng</button>
                {(selectedRequest.status === 'Chờ xử lý' || selectedRequest.status === 'Đang xử lý') && (
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
                      defaultValue={selectedRequest.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select
                      name="category"
                      required
                      defaultValue={selectedRequest.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="Điện">Điện</option>
                      <option value="Hệ thống nước">Hệ thống nước</option>
                      <option value="Điện lạnh">Điện lạnh</option>
                      <option value="Nội thất">Nội thất</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    defaultValue={selectedRequest.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select
                      name="priority"
                      required
                      defaultValue={selectedRequest.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-8"
                    >
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={selectedRequest.notes || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent"
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
