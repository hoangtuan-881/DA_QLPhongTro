
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'cleaning' | 'laundry' | 'parking' | 'internet' | 'other';
  isActive: boolean;
  usageCount: number;
}

interface ServiceUsage {
  id: string;
  tenantName: string;
  room: string;
  serviceName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface ServiceManagement {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  isActive: boolean;
  provider: string;
  contactInfo: string;
  contractStart: string;
  contractEnd: string;
  notes: string;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Giặt sấy',
    description: 'Dịch vụ giặt sấy quần áo',
    price: 25000,
    unit: 'kg',
    category: 'laundry',
    isActive: true,
    usageCount: 45
  },
  {
    id: '2',
    name: 'Gửi xe máy',
    description: 'Dịch vụ gửi xe máy theo tháng',
    price: 150000,
    unit: 'tháng',
    category: 'parking',
    isActive: true,
    usageCount: 32
  },
  {
    id: '3',
    name: 'Internet WiFi',
    description: 'Dịch vụ internet tốc độ cao',
    price: 200000,
    unit: 'tháng',
    category: 'internet',
    isActive: true,
    usageCount: 28
  },
  {
    id: '4',
    name: 'Dọn phòng',
    description: 'Dịch vụ dọn dẹp phòng theo yêu cầu',
    price: 100000,
    unit: 'lần',
    category: 'cleaning',
    isActive: true,
    usageCount: 15
  },
  {
    id: '5',
    name: 'Gửi xe ô tô',
    description: 'Dịch vụ gửi xe ô tô theo tháng',
    price: 500000,
    unit: 'tháng',
    category: 'parking',
    isActive: false,
    usageCount: 8
  }
];

const mockServiceUsages: ServiceUsage[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    room: 'P101',
    serviceName: 'Giặt sấy',
    quantity: 3,
    price: 25000,
    totalAmount: 75000,
    date: '2024-03-15',
    status: 'completed'
  },
  {
    id: '2',
    tenantName: 'Trần Thị B',
    room: 'P202',
    serviceName: 'Gửi xe máy',
    quantity: 1,
    price: 150000,
    totalAmount: 150000,
    date: '2024-03-01',
    status: 'completed'
  },
  {
    id: '3',
    tenantName: 'Phạm Thị D',
    room: 'P301',
    serviceName: 'Dọn phòng',
    quantity: 2,
    price: 100000,
    totalAmount: 200000,
    date: '2024-03-20',
    status: 'pending'
  }
];

const mockServiceManagement: ServiceManagement[] = [
  {
    id: '1',
    name: 'Dịch vụ giặt sấy',
    description: 'Hợp tác với tiệm giặt ủi ABC',
    price: 25000,
    unit: 'kg',
    category: 'Giặt sấy',
    isActive: true,
    provider: 'Tiệm giặt ủi ABC',
    contactInfo: '0123456789',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    notes: 'Giảm giá 10% cho số lượng lớn'
  },
  {
    id: '2',
    name: 'Internet WiFi',
    description: 'Cung cấp internet tốc độ cao',
    price: 200000,
    unit: 'tháng',
    category: 'Internet',
    isActive: true,
    provider: 'Viettel',
    contactInfo: '18008098',
    contractStart: '2024-01-01',
    contractEnd: '2025-01-01',
    notes: 'Gói cước doanh nghiệp'
  }
];

export default function Services() {
  const { success, error, warning } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'services' | 'usage' | 'management'>('services');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedManagement, setSelectedManagement] = useState<ServiceManagement | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const [showManagementDetailModal, setShowManagementDetailModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingManagement, setEditingManagement] = useState<ServiceManagement | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);

  // Form states
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '',
    category: '',
    isActive: true
  });

  const [newManagement, setNewManagement] = useState({
    name: '',
    description: '',
    price: 0,
    unit: '',
    category: '',
    isActive: true,
    provider: '',
    contactInfo: '',
    contractStart: '',
    contractEnd: '',
    notes: ''
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'laundry': return 'bg-purple-100 text-purple-800';
      case 'parking': return 'bg-green-100 text-green-800';
      case 'internet': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'cleaning': return 'Vệ sinh';
      case 'laundry': return 'Giặt sấy';
      case 'parking': return 'Gửi xe';
      case 'internet': return 'Internet';
      case 'other': return 'Khác';
      default: return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredServices = filterCategory === 'all' 
    ? mockServices 
    : mockServices.filter(service => service.category === filterCategory);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
      unit: service.unit,
      category: service.category,
      isActive: service.isActive
    });
    setShowEditModal(true);
  };

  const handleEditManagement = (management: ServiceManagement) => {
    setEditingManagement(management);
    setNewManagement({
      name: management.name,
      description: management.description,
      price: management.price,
      unit: management.unit,
      category: management.category,
      isActive: management.isActive,
      provider: management.provider,
      contactInfo: management.contactInfo,
      contractStart: management.contractStart,
      contractEnd: management.contractEnd,
      notes: management.notes
    });
    setShowManagementModal(true);
  };

  const handleDelete = (service: Service) => {
    setDeletingService(service);
    setShowDeleteModal(true);
  };

  const toggleServiceStatus = (service: Service) => {
    console.log('Thay đổi trạng thái dịch vụ:', service.id, !service.isActive);
    if (service.isActive) {
      warning({ title: `Đã tạm dừng dịch vụ ${service.name}` });
    } else {
      success({ title: `Đã kích hoạt dịch vụ ${service.name}` });
    }
  };

  const resetForm = () => {
    setNewService({
      name: '',
      description: '',
      price: 0,
      unit: '',
      category: '',
      isActive: true
    });
  };

  const resetManagementForm = () => {
    setNewManagement({
      name: '',
      description: '',
      price: 0,
      unit: '',
      category: '',
      isActive: true,
      provider: '',
      contactInfo: '',
      contractStart: '',
      contractEnd: '',
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!newService.name || !newService.description || !newService.category || !newService.unit || newService.price <= 0) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log('Thêm dịch vụ:', newService);
    setShowAddModal(false);
    resetForm();
    success({ title: 'Thêm dịch vụ thành công!' });
  };

  const handleUpdate = () => {
    if (!newService.name || !newService.description || !newService.category || !newService.unit || newService.price <= 0) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log('Cập nhật dịch vụ:', editingService?.id, newService);
    setShowEditModal(false);
    setEditingService(null);
    resetForm();
    success({ title: 'Cập nhật dịch vụ thành công!' });
  };

  const handleManagementSubmit = () => {
    if (!newManagement.name || !newManagement.provider || !newManagement.contactInfo) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    console.log(editingManagement ? 'Cập nhật quản lý dịch vụ:' : 'Thêm quản lý dịch vụ:', newManagement);
    setShowManagementModal(false);
    setEditingManagement(null);
    resetManagementForm();
    success({ title: `${editingManagement ? 'Cập nhật' : 'Thêm'} quản lý dịch vụ thành công!` });
  };

  const confirmDelete = () => {
    console.log('Xóa dịch vụ:', deletingService?.id);
    setShowDeleteModal(false);
    setDeletingService(null);
    success({ title: `Đã xóa dịch vụ ${deletingService?.name} thành công!` });
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
                <p className="text-gray-600">Quản lý các dịch vụ đi kèm</p>
              </div>
              <button
                onClick={() => {
                  if (activeTab === 'management') {
                    setShowManagementModal(true);
                  } else {
                    setShowAddModal(true);
                  }
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                {activeTab === 'management' ? 'Thêm quản lý dịch vụ' : 'Thêm dịch vụ'}
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'services'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } cursor-pointer`}
                  >
                    Danh sách dịch vụ
                  </button>
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'usage'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } cursor-pointer`}
                  >
                    Lịch sử sử dụng
                  </button>
                  <button
                    onClick={() => setActiveTab('management')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'management'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } cursor-pointer`}
                  >
                    Quản lý dịch vụ
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'services' && (
              <>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="all">Tất cả danh mục</option>
                      <option value="cleaning">Vệ sinh</option>
                      <option value="laundry">Giặt sấy</option>
                      <option value="parking">Gửi xe</option>
                      <option value="internet">Internet</option>
                      <option value="other">Khác</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tìm kiếm dịch vụ..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                    />
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(service.category)}`}>
                              {getCategoryText(service.category)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Giá:</span>
                            <span className="text-sm font-medium text-green-600">
                              {service.price.toLocaleString('vi-VN')}đ/{service.unit}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Số lần sử dụng:</span>
                            <span className="text-sm font-medium">{service.usageCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Trạng thái:</span>
                            <span className={`text-sm font-medium ${service.isActive ? 'text-green-600' : 'text-red-600'}`}>
                              {service.isActive ? 'Hoạt động' : 'Tạm dừng'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedService(service);
                              setShowDetailModal(true);
                            }}
                            className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <i className="ri-eye-line mr-1"></i>
                            Chi tiết
                          </button>
                          <button 
                            onClick={() => handleEdit(service)}
                            className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button 
                            onClick={() => handleDelete(service)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Xóa dịch vụ"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'usage' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dịch vụ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Số lượng
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thành tiền
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ngày sử dụng
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
                      {mockServiceUsages.map((usage) => (
                        <tr key={usage.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{usage.tenantName}</div>
                              <div className="text-sm text-gray-500">{usage.room}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{usage.serviceName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{usage.quantity}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              {usage.totalAmount.toLocaleString('vi-VN')}đ
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(usage.date).toLocaleDateString('vi-VN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(usage.status)}`}>
                              {getStatusText(usage.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'management' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockServiceManagement.map((management) => (
                  <div key={management.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{management.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{management.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${management.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {management.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Nhà cung cấp:</span>
                          <span className="text-sm font-medium">{management.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Liên hệ:</span>
                          <span className="text-sm font-medium">{management.contactInfo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hợp đồng:</span>
                          <span className="text-sm font-medium">
                            {new Date(management.contractStart).toLocaleDateString('vi-VN')} - {new Date(management.contractEnd).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedManagement(management);
                            setShowManagementDetailModal(true);
                          }}
                          className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                          title="Xem chi tiết"
                        >
                          <i className="ri-eye-line mr-1"></i>
                          Chi tiết
                        </button>
                        <button 
                          onClick={() => handleEditManagement(management)}
                          className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button 
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Xóa"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Service Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết dịch vụ</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên dịch vụ:</span>
                  <span className="font-medium">{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="font-medium">{selectedService.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedService.category)}`}>
                    {getCategoryText(selectedService.category)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá:</span>
                  <span className="font-medium text-green-600">
                    {selectedService.price.toLocaleString('vi-VN')}đ/{selectedService.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lần sử dụng:</span>
                  <span className="font-medium">{selectedService.usageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${selectedService.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedService.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => handleEdit(selectedService)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => toggleServiceStatus(selectedService)}
                  className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                    selectedService.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedService.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
                <button 
                  onClick={() => handleDelete(selectedService)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa dịch vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Management Detail Modal */}
      {showManagementDetailModal && selectedManagement && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowManagementDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết quản lý dịch vụ</h2>
                <button
                  onClick={() => setShowManagementDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Tên dịch vụ:</span>
                      <p className="font-medium">{selectedManagement.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Mô tả:</span>
                      <p className="text-sm">{selectedManagement.description}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Danh mục:</span>
                      <p className="font-medium">{selectedManagement.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Giá:</span>
                      <p className="font-medium text-green-600">
                        {selectedManagement.price.toLocaleString('vi-VN')}đ/{selectedManagement.unit}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin nhà cung cấp</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Nhà cung cấp:</span>
                      <p className="font-medium">{selectedManagement.provider}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Thông tin liên hệ:</span>
                      <p className="font-medium">{selectedManagement.contactInfo}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ngày bắt đầu hợp đồng:</span>
                      <p className="font-medium">{new Date(selectedManagement.contractStart).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Ngày kết thúc hợp đồng:</span>
                      <p className="font-medium">{new Date(selectedManagement.contractEnd).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${selectedManagement.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedManagement.isActive ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedManagement.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-600">{selectedManagement.notes}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button 
                  onClick={() => {
                    setShowManagementDetailModal(false);
                    handleEditManagement(selectedManagement);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Chỉnh sửa
                </button>
                <button 
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm dịch vụ mới</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input 
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Dịch vụ giặt sấy" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea 
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Mô tả dịch vụ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select 
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="cleaning">Vệ sinh</option>
                    <option value="laundry">Giặt sấy</option>
                    <option value="parking">Gửi xe</option>
                    <option value="internet">Internet</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input 
                      type="number" 
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="25000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input 
                      type="text" 
                      value={newService.unit}
                      onChange={(e) => setNewService({...newService, unit: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="kg, lần, tháng..." 
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newService.isActive}
                      onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
                      className="mr-2" 
                    />
                    <span className="text-sm text-gray-700">Kích hoạt dịch vụ ngay</span>
                  </label>
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
                    Thêm dịch vụ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa dịch vụ</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input 
                    type="text" 
                    value={newService.name}
                    onChange={(e) => setNewService({...newService, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Dịch vụ giặt sấy" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea 
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Mô tả dịch vụ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select 
                    value={newService.category}
                    onChange={(e) => setNewService({...newService, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="cleaning">Vệ sinh</option>
                    <option value="laundry">Giặt sấy</option>
                    <option value="parking">Gửi xe</option>
                    <option value="internet">Internet</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input 
                      type="number" 
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="25000" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input 
                      type="text" 
                      value={newService.unit}
                      onChange={(e) => setNewService({...newService, unit: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      placeholder="kg, lần, tháng..." 
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newService.isActive}
                      onChange={(e) => setNewService({...newService, isActive: e.target.checked})}
                      className="mr-2" 
                    />
                    <span className="text-sm text-gray-700">Dịch vụ đang hoạt động</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingService(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {showManagementModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-height-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowManagementModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingManagement ? 'Chỉnh sửa quản lý dịch vụ' : 'Thêm quản lý dịch vụ mới'}
              </h2>
              
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input 
                    type="text" 
                    value={newManagement.name}
                    onChange={(e) => setNewManagement({...newManagement, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Dịch vụ giặt sấy" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <input 
                    type="text" 
                    value={newManagement.category}
                    onChange={(e) => setNewManagement({...newManagement, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Giặt sấy" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea 
                    value={newManagement.description}
                    onChange={(e) => setNewManagement({...newManagement, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Mô tả dịch vụ..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà cung cấp *</label>
                  <input 
                    type="text" 
                    value={newManagement.provider}
                    onChange={(e) => setNewManagement({...newManagement, provider: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Tên nhà cung cấp" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thông tin liên hệ *</label>
                  <input 
                    type="text" 
                    value={newManagement.contactInfo}
                    onChange={(e) => setNewManagement({...newManagement, contactInfo: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="Số điện thoại hoặc email" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu hợp đồng</label>
                  <input 
                    type="date" 
                    value={newManagement.contractStart}
                    onChange={(e) => setNewManagement({...newManagement, contractStart: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc hợp đồng</label>
                  <input 
                    type="date" 
                    value={newManagement.contractEnd}
                    onChange={(e) => setNewManagement({...newManagement, contractEnd: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                  <input 
                    type="number" 
                    value={newManagement.price}
                    onChange={(e) => setNewManagement({...newManagement, price: parseInt(e.target.value) || 0})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="25000" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <input 
                    type="text" 
                    value={newManagement.unit}
                    onChange={(e) => setNewManagement({...newManagement, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    placeholder="kg, lần, tháng..." 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea 
                    value={newManagement.notes}
                    onChange={(e) => setNewManagement({...newManagement, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                    rows={3} 
                    placeholder="Ghi chú thêm..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={newManagement.isActive}
                      onChange={(e) => setNewManagement({...newManagement, isActive: e.target.checked})}
                      className="mr-2" 
                    />
                    <span className="text-sm text-gray-700">Dịch vụ đang hoạt động</span>
                  </label>
                </div>
                
                <div className="md:col-span-2 flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManagementModal(false);
                      setEditingManagement(null);
                      resetManagementForm();
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleManagementSubmit}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    {editingManagement ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDeleteModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full mr-4">
                  <i className="ri-error-warning-line text-red-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Xác nhận xóa dịch vụ</h3>
                  <p className="text-sm text-gray-500">Hành động này không thể hoàn tác</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700">
                  Bạn có chắc chắn muốn xóa dịch vụ <strong>{deletingService.name}</strong> không?
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Tất cả dữ liệu liên quan đến dịch vụ này sẽ bị xóa vĩnh viễn.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingService(null);
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xóa dịch vụ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
