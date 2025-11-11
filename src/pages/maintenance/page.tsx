import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface MaintenanceRequest {
  id: string;
  tenantName: string;
  building: string;
  room: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'appliance' | 'furniture' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestDate: string;
  assignedTo?: string;
  scheduledDate?: string;
  completedDate?: string;
  notes?: string;
  images?: string[];
  progress?: number;
  actualCost?: number;
}

const mockMaintenanceRequests: MaintenanceRequest[] = [
  // 1) Đang xử lý (in_progress) — đã phân công, ngày phân công là hôm nay
  {
    id: '1',
    tenantName: 'Nguyễn Văn An',
    building: 'Dãy A',
    room: 'A101',
    title: 'Điều hòa không lạnh',
    description: 'Điều hòa chạy nhưng không thổi khí lạnh, có thể do thiếu gas',
    category: 'appliance',
    priority: 'high',
    status: 'in_progress',
    requestDate: '2024-03-15',
    assignedTo: 'Tuấn',
    scheduledDate: '2025-11-05', // ngày phân công hiển thị dưới tên
    notes: 'Đã kiểm tra, cần nạp gas'
  },

  // 2) Chờ xử lý (pending) — chưa phân công
  {
    id: '2',
    tenantName: 'Trần Thị Bé',
    building: 'Dãy A',
    room: 'A202',
    title: 'Vòi nước bồn rửa bát bị rỉ',
    description: 'Vòi nước trong bếp bị rỉ nước liên tục',
    category: 'plumbing',
    priority: 'medium',
    status: 'pending',
    requestDate: '2024-03-18'
  },

  // 3) Chờ xử lý (pending) — khẩn cấp, chưa phân công
  {
    id: '3',
    tenantName: 'Phạm Thị Dung',
    building: 'Dãy A',
    room: 'A301',
    title: 'Ổ cắm điện bị cháy',
    description: 'Ổ cắm điện gần giường bị cháy, có mùi khét',
    category: 'electrical',
    priority: 'urgent',
    status: 'pending',
    requestDate: '2024-03-20',
    notes: 'Ưu tiên kiểm tra trong ngày'
  },

  // 4) Hoàn thành (completed) — có ngày hoàn thành
  {
    id: '4',
    tenantName: 'Lê Văn Bảy',
    building: 'Dãy A',
    room: 'A105',
    title: 'Cửa tủ quần áo bị lệch',
    description: 'Cửa tủ quần áo bị lệch, không đóng được',
    category: 'furniture',
    priority: 'low',
    status: 'completed',
    requestDate: '2024-03-10',
    assignedTo: 'My',
    scheduledDate: '2024-03-12',   // ngày phân công trước đó
    completedDate: '2024-03-12',
    notes: 'Đã sửa chữa bản lề cửa',
    images: ['completed_cabinet_1.jpg', 'completed_cabinet_2.jpg']
  },

  // 5) Đã hủy (cancelled) — hủy trước khi phân công (KHÔNG có assignedTo)
  {
    id: '5',
    tenantName: 'Đỗ Minh Quân',
    building: 'Dãy A',
    room: 'B207',
    title: 'Quạt trần rung mạnh',
    description: 'Quạt trần kêu và rung khi bật số cao',
    category: 'appliance',
    priority: 'medium',
    status: 'cancelled',
    requestDate: '2024-04-02',
    notes: 'Khách tự xử lý, yêu cầu hủy'
  },

  // 6) Đang xử lý (in_progress) — danh mục other, high
  {
    id: '6',
    tenantName: 'Võ Thị Hạnh',
    building: 'Dãy A',
    room: 'B305',
    title: 'Khe cửa ra vào kẹt',
    description: 'Cửa ra vào bị kẹt, khó đóng mở',
    category: 'other',
    priority: 'high',
    status: 'in_progress',
    requestDate: '2024-04-05',
    assignedTo: 'My',
    scheduledDate: '2025-11-05',
    notes: 'Đang chờ thay ron cửa'
  },

  // 7) Chờ xử lý (pending) — danh mục furniture, low
  {
    id: '7',
    tenantName: 'Trịnh Nhật Tân',
    building: 'Dãy A',
    room: 'C102',
    title: 'Ghế phòng khách lung lay',
    description: 'Một chân ghế bị lỏng ốc',
    category: 'furniture',
    priority: 'low',
    status: 'pending',
    requestDate: '2025-10-28'
  },

  // 8) Hoàn thành (completed) — có ảnh hoàn thành, ghi chú
  {
    id: '8',
    tenantName: 'Phạm Hồng Ân',
    building: 'Dãy A',
    room: 'C210',
    title: 'Rò rỉ ống nước lavabo',
    description: 'Nước rò rỉ nhẹ dưới lavabo, sàn ẩm ướt',
    category: 'plumbing',
    priority: 'medium',
    status: 'completed',
    requestDate: '2025-10-20',
    assignedTo: 'Tuấn',
    scheduledDate: '2025-10-21',
    completedDate: '2025-10-21',
    notes: 'Đã thay phớt, test 30 phút không rò',
    images: ['lavabo_before.jpg', 'lavabo_after.jpg']
  }
];

export default function Maintenance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState<MaintenanceRequest[]>(mockMaintenanceRequests);
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

  const [newRequest, setNewRequest] = useState<{
    title: string;
    description: string;
    category: string;
    priority: string;
    building: string;
    room: string;
    reportedBy: string;
    contactInfo: string;
    images: string[];
  }>({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    building: '',
    room: '',
    reportedBy: '',
    contactInfo: '',
    images: []
  });

  const [assignData, setAssignData] = useState({
    technician: '',
    notes: ''
  });

  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    completionImages: [] as string[]
  });

  const { success, error, warning, info } = useToast();

  const handleCreateRequest = () => {
    if (!newRequest.title || !newRequest.description || !newRequest.room || !newRequest.reportedBy || !newRequest.building) {
      error({
        title: 'Lỗi tạo yêu cầu',
        message: 'Vui lòng điền đầy đủ (Tiêu đề, Mô tả, Dãy, Phòng, Người báo cáo)!'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận tạo yêu cầu',
      message: `Bạn có chắc chắn muốn tạo yêu cầu bảo trì "${newRequest.title}" cho phòng ${newRequest.room} không?`,
      onConfirm: () => {
        setRequests(prev => [
          {
            id: String(Date.now()),
            tenantName: newRequest.reportedBy || 'Khách thuê',
            building: newRequest.building,
            room: newRequest.room,
            title: newRequest.title,
            description: newRequest.description,
            category: newRequest.category as MaintenanceRequest['category'],
            priority: newRequest.priority as MaintenanceRequest['priority'],
            status: 'pending',
            requestDate: new Date().toISOString(),
            notes: ''
          },
          ...prev
        ]);
        success({
          title: 'Tạo yêu cầu thành công',
          message: `Đã tạo yêu cầu "${newRequest.title}" cho ${newRequest.building} - ${newRequest.room}`
        });

        setShowAddModal(false);
        setNewRequest({
          title: '',
          description: '',
          category: 'electrical',
          priority: 'medium',
          building: '',
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
        if (selectedRequest) {
          setRequests(prev =>
            prev.map(r =>
              r.id === selectedRequest.id
                ? {
                  ...r,
                  assignedTo: assignData.technician,
                  status: 'in_progress',
                  scheduledDate: new Date().toISOString(), // <-- NGÀY PHÂN CÔNG (hiện tại)
                }
                : r
            )
          );
        }
        if (selectedRequest) {
          setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id
              ? { ...r, assignedTo: assignData.technician, status: 'in_progress' }
              : r
          ));
        }
        success({
          title: 'Phân công thành công',
          message: `Đã phân công ${assignData.technician} xử lý yêu cầu "${selectedRequest?.title}"`
        });

        setShowAssignModal(false);
        setSelectedRequest(null);
        setAssignData({
          technician: '',
          notes: ''
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleUpdateStatus = () => {
    if (!updateData.status) {

      // Cấm hủy nếu không phải pending
      if (updateData.status === 'cancelled' && selectedRequest?.status !== 'pending') {
        error({
          title: 'Không thể hủy',
          message: 'Chỉ được hủy khi yêu cầu đang ở trạng thái Chờ xử lý.'
        });
        return;
      }
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

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật trạng thái',
      message: `Bạn có chắc chắn muốn cập nhật trạng thái yêu cầu "${selectedRequest?.title}" thành "${statusText}" không?`,
      onConfirm: () => {
        if (selectedRequest) {
          setRequests(prev => prev.map(r =>
            r.id === selectedRequest.id
              ? {
                ...r,
                status: updateData.status as MaintenanceRequest['status'],
                completedDate: updateData.status === 'completed' ? new Date().toISOString() : r.completedDate
              }
              : r
          ));
        }
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
          notes: '',
          completionImages: []
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa yêu cầu',
      message: `Bạn có chắc chắn muốn xóa yêu cầu bảo trì "${request?.title}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        error({
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

  const handleUpdate = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      notes: '',
      completionImages: []
    });
    setShowUpdateModal(true);
  };

  const handleQuickStatusChange = (requestId: string, newStatus: string) => {
    const request = requests.find(r => r.id === requestId);
    const statusText = newStatus === 'in_progress' ? 'đang thực hiện' :
      newStatus === 'completed' ? 'hoàn thành' :
        newStatus === 'cancelled' ? 'đã hủy' : newStatus;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thay đổi trạng thái',
      message: `Bạn có chắc chắn muốn thay đổi trạng thái yêu cầu "${request?.title}" thành "${statusText}" không?`,
      onConfirm: () => {
        if (!request) return;

        if (newStatus === 'cancelled' && request.status !== 'pending') {
          error({
            title: 'Không thể hủy',
            message: 'Chỉ được hủy khi yêu cầu đang ở trạng thái Chờ xử lý.'
          });
          setConfirmDialog({ ...confirmDialog, isOpen: false });
          return;
        }

        setRequests(prev => prev.map(r =>
          r.id === requestId
            ? {
              ...r,
              status: newStatus as MaintenanceRequest['status'],
              completedDate: newStatus === 'completed' ? new Date().toISOString() : r.completedDate
            }
            : r
        ));
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

  const filteredRequests = requests.filter(request => {
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
                      {requests.filter(r => r.status === 'pending').length}
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
                      {requests.filter(r => r.status === 'in_progress').length}
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
                      {requests.filter(r => r.status === 'completed').length}
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
                      {requests.filter(r => r.priority === 'urgent').length}
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
                            <div className="text-sm text-gray-500">{request.building} - {request.room}</div>
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
                            <button
                              onClick={() => handleUpdate(request)}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button onClick={() => handleDeleteRequest(request.id)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Xóa"
                            >
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
                      {/* HÀNG 1: DÃY, PHÒNG, NGƯỜI BÁO CÁO */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dãy trọ *</label>
                          <input
                            type="text"
                            value={newRequest.building}
                            onChange={(e) => setNewRequest({ ...newRequest, building: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="VD: Dãy A"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                          <input
                            type="text"
                            value={newRequest.room}
                            onChange={(e) => setNewRequest({ ...newRequest, room: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="VD: A101"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Người báo cáo *</label>
                          <input
                            type="text"
                            value={newRequest.reportedBy}
                            onChange={(e) => setNewRequest({ ...newRequest, reportedBy: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            placeholder="Tên khách thuê"
                          />
                        </div>
                      </div>

                      {/* HÀNG 2: DANH MỤC, MỨC ĐỘ */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                          <select
                            value={newRequest.category}
                            onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
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
                            value={newRequest.priority}
                            onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
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
                          value={newRequest.title}
                          onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          placeholder="Mô tả ngắn gọn vấn đề"
                        />
                      </div>

                      {/* HÀNG 4: MÔ TẢ */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                        <textarea
                          value={newRequest.description}
                          onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={4}
                          placeholder="Mô tả chi tiết vấn đề cần sửa chữa..."
                        ></textarea>
                      </div>

                      {/* HÀNG 5: NÚT BẤM */}
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
                        <select
                          value={assignData.technician}
                          onChange={(e) => setAssignData({ ...assignData, technician: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="">Chọn nhân viên</option>
                          <option value="Tuấn">Tuấn</option>
                          <option value="My">My</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                        <textarea
                          value={assignData.notes}
                          onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
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
                          value={updateData.status}
                          onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="">Chọn trạng thái</option>
                          <option value="in_progress">Đang thực hiện</option>
                          <option value="on_hold">Tạm dừng</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cập nhật</label>
                        <textarea
                          value={updateData.notes}
                          onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
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
                          {/* THAY ĐỔI DÒNG NÀY */}
                          <span className="text-gray-600">Khu vực:</span>
                          <span className="font-medium ml-2">{selectedRequest.building} - {selectedRequest.room}</span>
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
                              <span className="text-gray-600">Ngày phân công:</span>
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
              onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            />

          </div>
        </main>
      </div>
    </div>
  );
}
