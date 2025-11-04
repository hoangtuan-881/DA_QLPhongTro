
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface Equipment {
  id: string;
  name: string;
  code: string;
  category: 'furniture' | 'appliance' | 'electronics' | 'safety' | 'other';
  room: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  lastMaintenance?: string;
  nextMaintenance?: string;
  warranty?: string;
  notes?: string;
}

interface MaintenanceRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  type: 'routine' | 'repair' | 'replacement';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: string;
  estimatedCost: number;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Điều hòa Daikin 12000BTU',
    code: 'AC001',
    category: 'appliance',
    room: 'P101',
    purchaseDate: '2023-06-15',
    purchasePrice: 8500000,
    condition: 'good',
    lastMaintenance: '2024-01-15',
    nextMaintenance: '2024-07-15',
    warranty: '2025-06-15',
    notes: 'Bảo dưỡng định kỳ 6 tháng/lần'
  },
  {
    id: '2',
    name: 'Tủ lạnh Samsung 180L',
    code: 'RF001',
    category: 'appliance',
    room: 'P101',
    purchaseDate: '2023-06-20',
    purchasePrice: 6200000,
    condition: 'good',
    lastMaintenance: '2024-02-10',
    warranty: '2025-06-20'
  },
  {
    id: '3',
    name: 'Giường đơn',
    code: 'BED001',
    category: 'furniture',
    room: 'P101',
    purchaseDate: '2023-05-10',
    purchasePrice: 2500000,
    condition: 'good'
  },
  {
    id: '4',
    name: 'Máy nước nóng Ariston',
    code: 'WH001',
    category: 'appliance',
    room: 'P102',
    purchaseDate: '2023-07-05',
    purchasePrice: 3200000,
    condition: 'fair',
    lastMaintenance: '2024-01-20',
    nextMaintenance: '2024-04-20',
    warranty: '2024-07-05',
    notes: 'Cần thay bộ đốt sớm'
  },
  {
    id: '5',
    name: 'Tủ quần áo 3 cánh',
    code: 'WD001',
    category: 'furniture',
    room: 'P102',
    purchaseDate: '2023-05-15',
    purchasePrice: 1800000,
    condition: 'good'
  },
  {
    id: '6',
    name: 'Bình cứu hỏa',
    code: 'FE001',
    category: 'safety',
    room: 'Tầng 1',
    purchaseDate: '2023-04-10',
    purchasePrice: 450000,
    condition: 'good',
    nextMaintenance: '2024-04-10',
    notes: 'Kiểm tra áp suất hàng năm'
  }
];

export default function Equipment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);

  // ConfirmDialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const { success, error, warning } = useToast();

  // Form states
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    code: '',
    category: '',
    room: '',
    purchaseDate: '',
    purchasePrice: 0,
    condition: 'good',
    warranty: '',
    notes: ''
  });

  const [maintenanceRequest, setMaintenanceRequest] = useState({
    type: 'routine',
    description: '',
    priority: 'medium',
    scheduledDate: '',
    estimatedCost: 0,
    assignedTo: '',
    notes: ''
  });

  // Existing helper functions
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'furniture': return 'bg-blue-100 text-blue-800';
      case 'appliance': return 'bg-green-100 text-green-800';
      case 'electronics': return 'bg-purple-100 text-purple-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'furniture': return 'Nội thất';
      case 'appliance': return 'Thiết bị điện';
      case 'electronics': return 'Điện tử';
      case 'safety': return 'An toàn';
      case 'other': return 'Khác';
      default: return category;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'good': return 'Tốt';
      case 'fair': return 'Khá';
      case 'poor': return 'Kém';
      case 'damaged': return 'Hỏng';
      default: return condition;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Thấp';
      case 'medium': return 'Trung bình';
      case 'high': return 'Cao';
      case 'urgent': return 'Khẩn cấp';
      default: return priority;
    }
  };

  const filteredEquipment = mockEquipment.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const conditionMatch = filterCondition === 'all' || item.condition === filterCondition;
    return categoryMatch && conditionMatch;
  });

  const isMaintenanceDue = (nextMaintenance?: string) => {
    if (!nextMaintenance) return false;
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenance);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
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

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setNewEquipment({
      name: equipment.name,
      code: equipment.code,
      category: equipment.category,
      room: equipment.room,
      purchaseDate: equipment.purchaseDate,
      purchasePrice: equipment.purchasePrice,
      condition: equipment.condition,
      warranty: equipment.warranty || '',
      notes: equipment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (equipment: Equipment) => {
    showConfirm({
      title: 'Xác nhận xóa thiết bị',
      message: `Bạn có chắc chắn muốn xóa thiết bị "${equipment.name}" (Mã: ${equipment.code}) không? Hành động này không thể hoàn tác.`,
      onConfirm: () => confirmDelete(equipment),
      type: 'danger'
    });
  };

  const confirmDelete = (equipment: Equipment) => {
    console.log('Xóa thiết bị:', equipment.id);
    success({
      title: 'Xóa thiết bị thành công',
      message: `Đã xóa thiết bị "${equipment.name}" thành công`
    });
  };

  const handleMaintenance = (equipment: Equipment) => {
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
      name: '',
      code: '',
      category: '',
      room: '',
      purchaseDate: '',
      purchasePrice: 0,
      condition: 'good',
      warranty: '',
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!newEquipment.name || !newEquipment.code || !newEquipment.category || !newEquipment.room) {
      error({
        title: 'Lỗi thêm thiết bị',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận thêm thiết bị',
      message: `Bạn có chắc chắn muốn thêm thiết bị "${newEquipment.name}" - Phòng ${newEquipment.room} không?`,
      onConfirm: () => {
        console.log('Thêm thiết bị:', newEquipment);
        setShowAddModal(false);
        resetForm();
        success({
          title: 'Thêm thiết bị thành công',
          message: `Đã thêm thiết bị "${newEquipment.name}" - Phòng ${newEquipment.room}`
        });
      }
    });
  };

  const handleUpdate = () => {
    if (!newEquipment.name || !newEquipment.code || !newEquipment.category || !newEquipment.room) {
      error({
        title: 'Lỗi cập nhật thiết bị',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
      });
      return;
    }

    showConfirm({
      title: 'Xác nhận cập nhật thiết bị',
      message: `Bạn có chắc chắn muốn lưu thay đổi cho thiết bị "${newEquipment.name}" không?`,
      onConfirm: () => {
        console.log('Cập nhật thiết bị:', editingEquipment?.id, newEquipment);
        setShowEditModal(false);
        setEditingEquipment(null);
        resetForm();
        success({
          title: 'Cập nhật thiết bị thành công',
          message: `Đã cập nhật thông tin thiết bị "${newEquipment.name}"`
        });
      }
    });
  };

  const handleCreateMaintenance = () => {
    if (!maintenanceRequest.description || !maintenanceRequest.scheduledDate) {
      error({
        title: 'Lỗi tạo yêu cầu bảo trì',
        message: 'Vui lòng điền đầy đủ mô tả và ngày thực hiện!'
      });
      return;
    }

    const typeText = maintenanceRequest.type === 'routine' ? 'bảo trì định kỳ' :
                     maintenanceRequest.type === 'repair' ? 'sửa chữa' : 'thay thế';

    showConfirm({
      title: 'Xác nhận tạo yêu cầu bảo trì',
      message: `Bạn có chắc chắn muốn tạo yêu cầu ${typeText} cho thiết bị "${maintenanceEquipment?.name}" không?`,
      onConfirm: () => {
        console.log('Tạo yêu cầu bảo trì:', {
          equipmentId: maintenanceEquipment?.id,
          ...maintenanceRequest
        });
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
        success({
          title: 'Tạo yêu cầu bảo trì thành công',
          message: `Đã tạo yêu cầu ${typeText} cho thiết bị "${maintenanceEquipment?.name}"`
        });
      }
    });
  };

  const handleQuickStatusUpdate = (equipment: Equipment, newCondition: string) => {
    const conditionText = getConditionText(newCondition);
    
    showConfirm({
      title: 'Xác nhận cập nhật tình trạng',
      message: `Bạn có chắc chắn muốn cập nhật tình trạng thiết bị "${equipment.name}" thành "${conditionText}" không?`,
      onConfirm: () => {
        console.log('Cập nhật tình trạng:', equipment.id, newCondition);
        if (newCondition === 'damaged' || newCondition === 'poor') {
          warning({
            title: 'Cập nhật tình trạng thành công',
            message: `Thiết bị "${equipment.name}" đã được cập nhật thành ${conditionText}. Cần kiểm tra và bảo trì!`
          });
        } else {
          success({
            title: 'Cập nhật tình trạng thành công',
            message: `Đã cập nhật tình trạng thiết bị "${equipment.name}" thành ${conditionText}`
          });
        }
      },
      type: newCondition === 'damaged' ? 'warning' : 'info'
    });
  };

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      error({
        title: 'Lỗi thao tác hàng loạt',
        message: 'Vui lòng chọn ít nhất một thiết bị!'
      });
      return;
    }

    const actionText = action === 'delete' ? 'xóa' :
                     action === 'maintenance' ? 'tạo yêu cầu bảo trì cho' :
                     action === 'export' ? 'xuất báo cáo' : action;

    showConfirm({
      title: `Xác nhận ${actionText} hàng loạt`,
      message: `Bạn có chắc chắn muốn ${actionText} ${selectedIds.length} thiết bị đã chọn không?`,
      onConfirm: () => {
        console.log(`${actionText} hàng loạt:`, selectedIds);
        
        if (action === 'delete') {
          success({
            title: 'Xóa hàng loạt thành công',
            message: `Đã xóa ${selectedIds.length} thiết bị thành công`
          });
        } else if (action === 'maintenance') {
          success({
            title: 'Tạo yêu cầu bảo trì hàng loạt thành công',
            message: `Đã tạo yêu cầu bảo trì cho ${selectedIds.length} thiết bị`
          });
        } else if (action === 'export') {
          success({
            title: 'Xuất báo cáo thành công',
            message: `Đã xuất báo cáo cho ${selectedIds.length} thiết bị`
          });
        }
      },
      type: action === 'delete' ? 'danger' : 'info'
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thiết bị</h1>
                <p className="text-gray-600">Quản lý thiết bị trang bị cho các phòng</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                Thêm thiết bị
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-tools-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
                    <p className="text-2xl font-bold text-gray-900">{mockEquipment.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-checkbox-circle-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tình trạng tốt</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockEquipment.filter(e => e.condition === 'good').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cần bảo trì</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockEquipment.filter(e => e.nextMaintenance && isMaintenanceDue(e.nextMaintenance)).length}
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
                    <p className="text-sm font-medium text-gray-600">Hỏng/Kém</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockEquipment.filter(e => e.condition === 'damaged' || e.condition === 'poor').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="furniture">Nội thất</option>
                  <option value="appliance">Thiết bị điện</option>
                  <option value="electronics">Điện tử</option>
                  <option value="safety">An toàn</option>
                  <option value="other">Khác</option>
                </select>
                <select
                  value={filterCondition}
                  onChange={(e) => setFilterCondition(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả tình trạng</option>
                  <option value="good">Tốt</option>
                  <option value="fair">Khá</option>
                  <option value="poor">Kém</option>
                  <option value="damaged">Hỏng</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã thiết bị..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Equipment Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thiết bị
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Danh mục
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá mua
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tình trạng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bảo trì
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEquipment.map((equipment) => (
                      <tr key={equipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{equipment.name}</div>
                            <div className="text-sm text-gray-500">{equipment.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(equipment.category)}`}>
                            {getCategoryText(equipment.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{equipment.room}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {equipment.purchasePrice.toLocaleString('vi-VN')}đ
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(equipment.purchaseDate).toLocaleDateString('vi-VN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(equipment.condition)}`}>
                            {getConditionText(equipment.condition)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {equipment.nextMaintenance ? (
                            <div>
                              <div className={`text-sm ${isMaintenanceDue(equipment.nextMaintenance) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                {new Date(equipment.nextMaintenance).toLocaleDateString('vi-VN')}
                              </div>
                              {isMaintenanceDue(equipment.nextMaintenance) && (
                                <div className="text-xs text-red-600">Cần bảo trì</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Không có</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setSelectedEquipment(equipment)}
                              className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => handleEdit(equipment)}
                              className="text-green-600 hover:text-green-900 cursor-pointer"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleMaintenance(equipment)}
                              className="text-orange-600 hover:text-orange-900 cursor-pointer"
                              title="Tạo yêu cầu bảo trì"
                            >
                              <i className="ri-tools-line"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(equipment)}
                              className="text-red-600 hover:text-red-900 cursor-pointer"
                              title="Xóa thiết bị"
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
          </div>
        </main>
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedEquipment(null)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết thiết bị</h2>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên thiết bị:</span>
                      <span className="font-medium">{selectedEquipment.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã thiết bị:</span>
                      <span className="font-medium">{selectedEquipment.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Danh mục:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEquipment.category)}`}>
                        {getCategoryText(selectedEquipment.category)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phòng:</span>
                      <span className="font-medium">{selectedEquipment.room}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tình trạng:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedEquipment.condition)}`}>
                        {getConditionText(selectedEquipment.condition)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Thông tin mua sắm & bảo trì</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày mua:</span>
                      <span className="font-medium">{new Date(selectedEquipment.purchaseDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giá mua:</span>
                      <span className="font-medium text-green-600">
                        {selectedEquipment.purchasePrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    {selectedEquipment.warranty && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bảo hành đến:</span>
                        <span className="font-medium">{new Date(selectedEquipment.warranty).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    {selectedEquipment.lastMaintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bảo trì lần cuối:</span>
                        <span className="font-medium">{new Date(selectedEquipment.lastMaintenance).toLocaleDateString('vi-VN')}</span>
                      </div>
                    )}
                    {selectedEquipment.nextMaintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bảo trì tiếp theo:</span>
                        <span className={`font-medium ${isMaintenanceDue(selectedEquipment.nextMaintenance) ? 'text-red-600' : 'text-gray-900'}`}>
                          {new Date(selectedEquipment.nextMaintenance).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedEquipment.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEquipment.notes}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => handleEdit(selectedEquipment)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleMaintenance(selectedEquipment)}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                >
                  Tạo yêu cầu bảo trì
                </button>
                <button 
                  onClick={() => handleDelete(selectedEquipment)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
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
                    <input 
                      type="text" 
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="Điều hòa Daikin" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input 
                      type="text" 
                      value={newEquipment.code}
                      onChange={(e) => setNewEquipment({...newEquipment, code: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="AC001" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select 
                      value={newEquipment.category}
                      onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="furniture">Nội thất</option>
                      <option value="appliance">Thiết bị điện</option>
                      <option value="electronics">Điện tử</option>
                      <option value="safety">An toàn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <select 
                      value={newEquipment.room}
                      onChange={(e) => setNewEquipment({...newEquipment, room: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="">Chọn phòng</option>
                      <option value="P101">P101</option>
                      <option value="P102">P102</option>
                      <option value="P201">P201</option>
                      <option value="P202">P202</option>
                      <option value="P301">P301</option>
                      <option value="Tầng 1">Tầng 1</option>
                      <option value="Tầng 2">Tầng 2</option>
                      <option value="Tầng 3">Tầng 3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input 
                      type="date" 
                      value={newEquipment.purchaseDate}
                      onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input 
                      type="number" 
                      value={newEquipment.purchasePrice}
                      onChange={(e) => setNewEquipment({...newEquipment, purchasePrice: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="8500000" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select 
                      value={newEquipment.condition}
                      onChange={(e) => setNewEquipment({...newEquipment, condition: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="good">Tốt</option>
                      <option value="fair">Khá</option>
                      <option value="poor">Kém</option>
                      <option value="damaged">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                    <input 
                      type="date" 
                      value={newEquipment.warranty}
                      onChange={(e) => setNewEquipment({...newEquipment, warranty: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea 
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Ghi chú về thiết bị..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Thêm thiết bị
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
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
                    <input 
                      type="text" 
                      value={newEquipment.name}
                      onChange={(e) => setNewEquipment({...newEquipment, name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="Điều hòa Daikin" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input 
                      type="text" 
                      value={newEquipment.code}
                      onChange={(e) => setNewEquipment({...newEquipment, code: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="AC001" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select 
                      value={newEquipment.category}
                      onChange={(e) => setNewEquipment({...newEquipment, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="">Chọn danh mục</option>
                      <option value="furniture">Nội thất</option>
                      <option value="appliance">Thiết bị điện</option>
                      <option value="electronics">Điện tử</option>
                      <option value="safety">An toàn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <select 
                      value={newEquipment.room}
                      onChange={(e) => setNewEquipment({...newEquipment, room: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="">Chọn phòng</option>
                      <option value="P101">P101</option>
                      <option value="P102">P102</option>
                      <option value="P201">P201</option>
                      <option value="P202">P202</option>
                      <option value="P301">P301</option>
                      <option value="Tầng 1">Tầng 1</option>
                      <option value="Tầng 2">Tầng 2</option>
                      <option value="Tầng 3">Tầng 3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input 
                      type="date" 
                      value={newEquipment.purchaseDate}
                      onChange={(e) => setNewEquipment({...newEquipment, purchaseDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input 
                      type="number" 
                      value={newEquipment.purchasePrice}
                      onChange={(e) => setNewEquipment({...newEquipment, purchasePrice: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="8500000" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select 
                      value={newEquipment.condition}
                      onChange={(e) => setNewEquipment({...newEquipment, condition: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="good">Tốt</option>
                      <option value="fair">Khá</option>
                      <option value="poor">Kém</option>
                      <option value="damaged">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                    <input 
                      type="date" 
                      value={newEquipment.warranty}
                      onChange={(e) => setNewEquipment({...newEquipment, warranty: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea 
                    value={newEquipment.notes}
                    onChange={(e) => setNewEquipment({...newEquipment, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Ghi chú về thiết bị..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingEquipment(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mr-4">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa thiết bị</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa thiết bị <strong>{deletingEquipment.name}</strong> (Mã: {deletingEquipment.code}) không?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tất cả dữ liệu liên quan đến thiết bị này sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingEquipment(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={() => confirmDelete(deletingEquipment)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa thiết bị
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Request Modal */}
      {showMaintenanceModal && maintenanceEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMaintenanceModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo yêu cầu bảo trì</h2>
              
              {/* Equipment Info */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin thiết bị</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Tên thiết bị:</span>
                    <span className="font-medium ml-2">{maintenanceEquipment.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mã thiết bị:</span>
                    <span className="font-medium ml-2">{maintenanceEquipment.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{maintenanceEquipment.room}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tình trạng:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getConditionColor(maintenanceEquipment.condition)}`}>
                      {getConditionText(maintenanceEquipment.condition)}
                    </span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bảo trì *</label>
                    <select 
                      value={maintenanceRequest.type}
                      onChange={(e) => setMaintenanceRequest({...maintenanceRequest, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="routine">Bảo trì định kỳ</option>
                      <option value="repair">Sửa chữa</option>
                      <option value="replacement">Thay thế</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select 
                      value={maintenanceRequest.priority}
                      onChange={(e) => setMaintenanceRequest({...maintenanceRequest, priority: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea 
                    value={maintenanceRequest.description}
                    onChange={(e) => setMaintenanceRequest({...maintenanceRequest, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Mô tả chi tiết vấn đề cần bảo trì hoặc sửa chữa..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến thực hiện *</label>
                    <input 
                      type="date" 
                      value={maintenanceRequest.scheduledDate}
                      onChange={(e) => setMaintenanceRequest({...maintenanceRequest, scheduledDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí ước tính (VNĐ)</label>
                    <input 
                      type="number" 
                      value={maintenanceRequest.estimatedCost}
                      onChange={(e) => setMaintenanceRequest({...maintenanceRequest, estimatedCost: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="500000" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người phụ trách</label>
                  <input 
                    type="text" 
                    value={maintenanceRequest.assignedTo}
                    onChange={(e) => setMaintenanceRequest({...maintenanceRequest, assignedTo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Tên kỹ thuật viên hoặc đơn vị thực hiện" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea 
                    value={maintenanceRequest.notes}
                    onChange={(e) => setMaintenanceRequest({...maintenanceRequest, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={2} 
                    placeholder="Ghi chú thêm về yêu cầu bảo trì..."
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaintenanceModal(false);
                      setMaintenanceEquipment(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateMaintenance}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                  >
                    Tạo yêu cầu bảo trì
                  </button>
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
        onCancel={() => setShowConfirmDialog(false)}
        type={confirmAction?.type}
      />
    </div>
  );
}
