import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface MaintenanceRequest {
  id: string;
  tenantName: string;
  room: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  requestDate: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
  images?: string[];
  progress?: number;
  actualCost?: number;
}

const mockMaintenanceRequests: MaintenanceRequest[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    room: 'P101',
    title: 'Điều hòa không lạnh',
    description: 'Điều hòa chạy nhưng không thổi khí lạnh, có thể do thiếu gas',
    category: 'appliance',
    priority: 'high',
    status: 'in_progress',
    requestDate: '2024-03-15',
    assignedTo: 'Thợ điện Minh',
    scheduledDate: '2024-03-16',
    notes: 'Đã kiểm tra, cần nạp gas'
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    room: 'P202',
    title: 'Vòi nước bồn rửa bát bị rỉ',
    description: 'Vòi nước trong bếp bị rỉ nước liên tục',
    category: 'plumbing',
    priority: 'medium',
    status: 'assigned',
    requestDate: '2024-03-18',
    assignedTo: 'Thợ nước Hùng',
    scheduledDate: '2024-03-20'
  },
  {
    id: '3',
    tenantName: 'Phạm Thị D',
    room: 'P301',
    title: 'Ổ cắm điện bị cháy',
    description: 'Ổ cắm điện gần giường bị cháy, có mùi khét',
    category: 'electrical',
    priority: 'urgent',
    status: 'pending',
    requestDate: '2024-03-20'
  },
  {
    id: '4',
    tenantName: 'Lê Văn C',
    room: 'P105',
    title: 'Cửa tủ quần áo bị lệch',
    description: 'Cửa tủ quần áo bị lệch, không đóng được',
    category: 'furniture',
    priority: 'low',
    status: 'completed',
    requestDate: '2024-03-10',
    assignedTo: 'Thợ mộc Tùng',
    scheduledDate: '2024-03-12',
    completedDate: '2024-03-12',
    cost: 150000,
    notes: 'Đã sửa chữa bản lề cửa'
  }
];

export default function Maintenance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [newRequest, setNewRequest] = useState<{
    title: string;
    description: string;
    category: string;
    priority: string;
    room: string;
    reportedBy: string;
    contactInfo: string;
    images: string[];
  }>({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    room: '',
    reportedBy: '',
    contactInfo: '',
    images: []
  });

  const [assignData, setAssignData] = useState({
    technician: '',
    estimatedCost: 0,
    notes: ''
  });

  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 1,
    notes: ''
  });

  const [updateData, setUpdateData] = useState({
    status: '',
    progress: 0,
    notes: '',
    actualCost: 0,
    completionImages: [] as string[]
  });

  const { success, error, warning, info } = useToast();

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.room || !newRequest.reportedBy) {
      error({
        title: 'Lỗi tạo yêu cầu',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận tạo yêu cầu',
      message: `Bạn có chắc chắn muốn tạo yêu cầu bảo trì "${newRequest.title}" cho phòng ${newRequest.room} không?`,
      onConfirm: () => {
        success({
          title: 'Tạo yêu cầu thành công',
          message: `Đã tạo yêu cầu bảo trì "${newRequest.title}" cho phòng ${newRequest.room}`
        });

        setShowAddModal(false);
        setNewRequest({
          title: '',
          description: '',
          category: 'electrical',
          priority: 'medium',
          room: '',
          reportedBy: '',
          contactInfo: '',
          images: []
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleAssignTechnician = () => {
    if (!assignData.technician) {
      error({
        title: 'Lỗi phân công',
        message: 'Vui lòng chọn kỹ thuật viên!'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận phân công',
      message: `Bạn có chắc chắn muốn phân công "${assignData.technician}" xử lý yêu cầu "${selectedRequest?.title}" không?`,
      onConfirm: () => {
        success({
          title: 'Phân công thành công',
          message: `Đã phân công ${assignData.technician} xử lý yêu cầu "${selectedRequest?.title}"`
        });

        setShowAssignModal(false);
        setSelectedRequest(null);
        setAssignData({
          technician: '',
          estimatedCost: 0,
          notes: ''
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleScheduleMaintenance = () => {
    if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      error({
        title: 'Lỗi lên lịch',
        message: 'Vui lòng chọn ngày và giờ thực hiện!'
      });
      return;
    }

    const scheduledDateTime = new Date(`${scheduleData.scheduledDate}T${scheduleData.scheduledTime}`);
    const now = new Date();

    if (scheduledDateTime <= now) {
      error({
        title: 'Lỗi lên lịch',
        message: 'Thời gian thực hiện phải sau thời điểm hiện tại!'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận lên lịch',
      message: `Bạn có chắc chắn muốn lên lịch bảo trì "${selectedRequest?.title}" vào ${scheduledDateTime.toLocaleString('vi-VN')} không?`,
      onConfirm: () => {
        success({
          title: 'Lên lịch thành công',
          message: `Đã lên lịch bảo trì "${selectedRequest?.title}" vào ${scheduledDateTime.toLocaleString('vi-VN')}`
        });

        setShowScheduleModal(false);
        setSelectedRequest(null);
        setScheduleData({
          scheduledDate: '',
          scheduledTime: '',
          estimatedDuration: 1,
          notes: ''
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleUpdateStatus = () => {
    if (!updateData.status) {
      error({
        title: 'Lỗi cập nhật',
        message: 'Vui lòng chọn trạng thái mới!'
      });
      return;
    }

    const statusText = updateData.status === 'in_progress' ? 'đang thực hiện' :
                      updateData.status === 'completed' ? 'hoàn thành' :
                      updateData.status === 'cancelled' ? 'đã hủy' :
                      updateData.status === 'on_hold' ? 'tạm dừng' : updateData.status;

    if (updateData.status === 'completed' && updateData.progress < 100) {
      warning({
        title: 'Cảnh báo',
        message: 'Tiến độ chưa đạt 100% nhưng trạng thái là hoàn thành. Bạn có chắc chắn không?'
      });
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật trạng thái',
      message: `Bạn có chắc chắn muốn cập nhật trạng thái yêu cầu "${selectedRequest?.title}" thành "${statusText}" không?`,
      onConfirm: () => {
        if (updateData.status === 'completed') {
          success({
            title: 'Hoàn thành bảo trì',
            message: `Đã hoàn thành yêu cầu bảo trì "${selectedRequest?.title}" thành công`
          });
        } else if (updateData.status === 'cancelled') {
          warning({
            title: 'Hủy yêu cầu bảo trì',
            message: `Đã hủy yêu cầu bảo trì "${selectedRequest?.title}"`
          });
        } else {
          success({
            title: 'Cập nhật trạng thái thành công',
            message: `Đã cập nhật trạng thái yêu cầu "${selectedRequest?.title}" thành ${statusText}`
          });
        }

        setShowUpdateModal(false);
        setSelectedRequest(null);
        setUpdateData({
          status: '',
          progress: 0,
          notes: '',
          actualCost: 0,
          completionImages: []
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    const request = mockMaintenanceRequests.find(r => r.id === requestId);
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa yêu cầu',
      message: `Bạn có chắc chắn muốn xóa yêu cầu bảo trì "${request?.title}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        success({
          title: 'Xóa yêu cầu thành công',
          message: `Đã xóa yêu cầu bảo trì "${request?.title}" thành công`
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleViewDetail = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleAssign = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowAssignModal(true);
  };

  const handleSchedule = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowScheduleModal(true);
  };

  const handleUpdate = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      progress: request.progress || 0,
      notes: '',
      actualCost: request.actualCost || 0,
      completionImages: []
    });
    setShowUpdateModal(true);
  };

  const handleQuickStatusChange = (requestId: string, newStatus: string) => {
    const request = mockMaintenanceRequests.find(r => r.id === requestId);
    const statusText = newStatus === 'in_progress' ? 'đang thực hiện' :
                      newStatus === 'completed' ? 'hoàn thành' :
                      newStatus === 'cancelled' ? 'đã hủy' : newStatus;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thay đổi trạng thái',
      message: `Bạn có chắc chắn muốn thay đổi trạng thái yêu cầu "${request?.title}" thành "${statusText}" không?`,
      onConfirm: () => {
        if (newStatus === 'completed') {
          success({
            title: 'Hoàn thành bảo trì',
            message: `Đã đánh dấu hoàn thành yêu cầu "${request?.title}"`
          });
        } else if (newStatus === 'cancelled') {
          warning({
            title: 'Hủy yêu cầu bảo trì',
            message: `Đã hủy yêu cầu bảo trì "${request?.title}"`
          });
        } else {
          info({
            title: 'Cập nhật trạng thái',
            message: `Đã cập nhật trạng thái yêu cầu "${request?.title}" thành ${statusText}`
          });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      error({
        title: 'Lỗi thao tác hàng loạt',
        message: 'Vui lòng chọn ít nhất một yêu cầu!'
      });
      return;
    }

    const actionText = action === 'assign' ? 'phân công' :
                      action === 'complete' ? 'hoàn thành' :
                      action === 'cancel' ? 'hủy' : action;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thao tác hàng loạt',
      message: `Bạn có chắc chắn muốn ${actionText} ${selectedIds.length} yêu cầu đã chọn không?`,
      onConfirm: () => {
        if (action === 'complete') {
          success({
            title: 'Thao tác hàng loạt thành công',
            message: `Đã hoàn thành ${selectedIds.length} yêu cầu bảo trì`
          });
        } else if (action === 'cancel') {
          warning({
            title: 'Thao tác hàng loạt thành công',
            message: `Đã hủy ${selectedIds.length} yêu cầu bảo trì`
          });
        } else {
          success({
            title: 'Thao tác hàng loạt thành công',
            message: `Đã ${actionText} ${selectedIds.length} yêu cầu thành công`
          });
        }
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleExportReport = (type: 'excel' | 'pdf') => {
    const typeText = type === 'excel' ? 'Excel' : 'PDF';
    success({
      title: 'Xuất báo cáo thành công',
      message: `Đã xuất báo cáo bảo trì dạng ${typeText}. File sẽ được tải xuống trong giây lát.`
    });
  };

  const handleSendNotification = (requestId: string, type: 'tenant' | 'technician') => {
    const request = mockMaintenanceRequests.find(r => r.id === requestId);
    const recipientText = type === 'tenant' ? 'khách thuê' : 'kỹ thuật viên';
    
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận gửi thông báo',
      message: `Bạn có chắc chắn muốn gửi thông báo về yêu cầu "${request?.title}" cho ${recipientText} không?`,
      onConfirm: () => {
        success({
          title: 'Gửi thông báo thành công',
          message: `Đã gửi thông báo về yêu cầu "${request?.title}" cho ${recipientText}`
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

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
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'assigned': return 'Đã phân công';
      case 'in_progress': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredRequests = mockMaintenanceRequests.filter(request => {
    const statusMatch = filterStatus === 'all' || request.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || request.priority === filterPriority;
    const categoryMatch = filterCategory === 'all' || request.category === filterCategory;
    const searchMatch = searchTerm === '' || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && priorityMatch && categoryMatch && searchMatch;
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
                  onClick={() => handleExportReport('excel')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-file-excel-2-line mr-2"></i>
                  Xuất Excel
                </button>
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-file-pdf-line mr-2"></i>
                  Xuất PDF
                </button>
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
                      {mockMaintenanceRequests.filter(r => r.status === 'pending').length}
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
                      {mockMaintenanceRequests.filter(r => r.status === 'in_progress' || r.status === 'assigned').length}
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
                      {mockMaintenanceRequests.filter(r => r.status === 'completed').length}
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
                      {mockMaintenanceRequests.filter(r => r.priority === 'urgent').length}
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
                  <option value="assigned">Đã phân công</option>
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

            {/* Maintenance Requests Table */}
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
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.title}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(request.requestDate).toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.tenantName}</div>
                            <div className="text-sm text-gray-500">{request.room}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(request.category)}`}>
                            {getCategoryText(request.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                            {getPriorityText(request.priority)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                            {getStatusText(request.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.assignedTo ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.assignedTo}</div>
                              {request.scheduledDate && (
                                <div className="text-sm text-gray-500">
                                  {new Date(request.scheduledDate).toLocaleDateString('vi-VN')}
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
                            <button className="text-green-600 hover:text-green-900 cursor-pointer" title="Chỉnh sửa">
                              <i className="ri-edit-line"></i>
                            </button>
                            <button className="text-red-600 hover:text-red-900 cursor-pointer" title="Xóa">
                              <i className="ri-delete-bin-line"></i>
                            </button>
                            {request.status === 'pending' && (
                              <button
                                onClick={() => handleAssign(request)}
                                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                title="Phân công"
                              >
                                <i className="ri-user-add-line"></i>
                              </button>
                            )}
                            {request.status !== 'completed' && request.status !== 'cancelled' && (
                              <button
                                onClick={() => handleSchedule(request)}
                                className="text-purple-600 hover:text-purple-900 cursor-pointer"
                                title="Lên lịch"
                              >
                                <i className="ri-calendar-check-line"></i>
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

            {/* Add Request Modal */}
            {showAddModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo yêu cầu bảo trì mới</h2>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê</label>
                          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                            <option value="">Chọn khách thuê</option>
                            <option value="1">Nguyễn Văn A - P101</option>
                            <option value="2">Trần Thị B - P202</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                            <option value="">Chọn danh mục</option>
                            <option value="electrical">Điện</option>
                            <option value="plumbing">Nước</option>
                            <option value="appliance">Thiết bị</option>
                            <option value="furniture">Nội thất</option>
                            <option value="other">Khác</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên</label>
                          <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                            <option value="low">Thấp</option>
                            <option value="medium">Trung bình</option>
                            <option value="high">Cao</option>
                            <option value="urgent">Khẩn cấp</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày yêu cầu</label>
                          <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                        <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Mô tả ngắn gọn vấn đề" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                        <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phân công cho</label>
                        <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                          <option value="">Chọn thợ (tùy chọn)</option>
                          <option value="1">Thợ điện Minh</option>
                          <option value="2">Thợ nước Hùng</option>
                          <option value="3">Thợ mộc Tùng</option>
                        </select>
                      </div>
                      
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
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Phân công kỹ thuật viên</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chọn kỹ thuật viên *</label>
                        <select 
                          value={assignData.technician}
                          onChange={(e) => setAssignData({...assignData, technician: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="">Chọn kỹ thuật viên</option>
                          <option value="Thợ điện Minh">Thợ điện Minh</option>
                          <option value="Thợ nước Hùng">Thợ nước Hùng</option>
                          <option value="Thợ mộc Tùng">Thợ mộc Tùng</option>
                          <option value="Thợ điện lạnh Nam">Thợ điện lạnh Nam</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí ước tính (VNĐ)</label>
                        <input 
                          type="number"
                          value={assignData.estimatedCost}
                          onChange={(e) => setAssignData({...assignData, estimatedCost: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea 
                          value={assignData.notes}
                          onChange={(e) => setAssignData({...assignData, notes: e.target.value})}
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

            {/* Schedule Modal */}
            {showScheduleModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex items-center justify-center min-h-screen px-4">
                  <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowScheduleModal(false)}></div>
                  <div className="relative bg-white rounded-lg max-w-lg w-full p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Lên lịch bảo trì</h2>
                    
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thực hiện *</label>
                          <input 
                            type="date"
                            value={scheduleData.scheduledDate}
                            onChange={(e) => setScheduleData({...scheduleData, scheduledDate: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Giờ thực hiện *</label>
                          <input 
                            type="time"
                            value={scheduleData.scheduledTime}
                            onChange={(e) => setScheduleData({...scheduleData, scheduledTime: e.target.value})}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian ước tính (giờ)</label>
                        <input 
                          type="number"
                          value={scheduleData.estimatedDuration}
                          onChange={(e) => setScheduleData({...scheduleData, estimatedDuration: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          min="0.5"
                          step="0.5"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea 
                          value={scheduleData.notes}
                          onChange={(e) => setScheduleData({...scheduleData, notes: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          rows={3}
                          placeholder="Ghi chú về lịch trình..."
                        />
                      </div>
                    </form>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      <button
                        onClick={() => setShowScheduleModal(false)}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleScheduleMaintenance}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-calendar-check-line mr-2"></i>
                        Lên lịch
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
                          value={updateData.status}
                          onChange={(e) => setUpdateData({...updateData, status: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="">Chọn trạng thái</option>
                          <option value="assigned">Đã phân công</option>
                          <option value="in_progress">Đang thực hiện</option>
                          <option value="on_hold">Tạm dừng</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tiến độ (%)</label>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={updateData.progress}
                          onChange={(e) => setUpdateData({...updateData, progress: Number(e.target.value)})}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>0%</span>
                          <span className="font-medium">{updateData.progress}%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí thực tế (VNĐ)</label>
                        <input 
                          type="number"
                          value={updateData.actualCost}
                          onChange={(e) => setUpdateData({...updateData, actualCost: Number(e.target.value)})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cập nhật</label>
                        <textarea 
                          value={updateData.notes}
                          onChange={(e) => setUpdateData({...updateData, notes: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                          rows={3}
                          placeholder="Ghi chú về tiến độ, vấn đề gặp phải..."
                        />
                      </div>

                      {updateData.status === 'completed' && (
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
                          <span className="font-medium ml-2">{selectedRequest.tenantName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Phòng:</span>
                          <span className="font-medium ml-2">{selectedRequest.room}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600">Tiêu đề:</span>
                        <span className="font-medium ml-2">{selectedRequest.title}</span>
                      </div>

                      <div>
                        <span className="text-gray-600">Mô tả:</span>
                        <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedRequest.category)}`}>
                            {getCategoryText(selectedRequest.category)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mức độ:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                            {getPriorityText(selectedRequest.priority)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Ngày yêu cầu:</span>
                          <span className="font-medium ml-2">{new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Trạng thái:</span>
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                            {getStatusText(selectedRequest.status)}
                          </span>
                        </div>
                      </div>

                      {selectedRequest.assignedTo && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Phân công cho:</span>
                            <span className="font-medium ml-2">{selectedRequest.assignedTo}</span>
                          </div>
                          {selectedRequest.scheduledDate && (
                            <div>
                              <span className="text-gray-600">Ngày hẹn:</span>
                              <span className="font-medium ml-2">{new Date(selectedRequest.scheduledDate).toLocaleDateString('vi-VN')}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedRequest.completedDate && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-600">Ngày hoàn thành:</span>
                            <span className="font-medium ml-2">{new Date(selectedRequest.completedDate).toLocaleDateString('vi-VN')}</span>
                          </div>
                          {selectedRequest.cost && (
                            <div>
                              <span className="text-gray-600">Chi phí:</span>
                              <span className="font-medium text-green-600 ml-2">{selectedRequest.cost.toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}
                        </div>
                      )}

                      {selectedRequest.notes && (
                        <div>
                          <span className="text-gray-600">Ghi chú:</span>
                          <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-6 pt-6 border-t">
                      {selectedRequest.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => {
                              setShowDetailModal(false);
                              handleQuickStatusChange(selectedRequest.id, 'assigned');
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
                      {selectedRequest.status === 'in_progress' && (
                        <button 
                          onClick={() => {
                            setShowDetailModal(false);
                            handleQuickStatusChange(selectedRequest.id, 'completed');
                          }}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                        >
                          <i className="ri-check-double-line mr-2"></i>
                          Hoàn thành
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setShowDetailModal(false);
                          handleUpdate(selectedRequest);
                        }}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                      >
                        <i className="ri-edit-line mr-2"></i>
                        Chỉnh sửa
                      </button>
                      <button 
                        onClick={() => {
                          setShowDetailModal(false);
                          handleDeleteRequest(selectedRequest.id);
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
              onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

          </div>
        </main>
      </div>
    </div>
  );
}
