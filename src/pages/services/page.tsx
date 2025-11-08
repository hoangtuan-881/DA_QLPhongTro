import { useMemo, useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import dichVuService, { DichVu } from '../../services/dich-vu.service';
import { getErrorMessage } from '../../lib/http-client';

// Type alias for cleaner code
type Service = DichVu;

export default function Services() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // UI states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '' as React.ReactNode,
    type: 'info' as 'danger' | 'warning' | 'info',
    loading: false,
    onConfirm: () => { }
  });

  // Form
  const emptyForm = { name: '', description: '', price: 0, unit: '', category: '' as '' | Service['category'], isActive: true };
  const [newService, setNewService] = useState<typeof emptyForm>(emptyForm);

  // Helpers
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'services': return 'bg-blue-100 text-blue-800';
      case 'utilities': return 'bg-purple-100 text-purple-800';
      case 'other': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'services': return 'Dịch vụ';
      case 'utilities': return 'Tiện ích';
      case 'other': return 'Khác';
      default: return category;
    }
  };

  // Lọc & search luôn dựa trên "services" (state) để UI thay đổi ngay
  const filteredServices = useMemo(() => {
    let data = services;
    if (filterCategory !== 'all') data = data.filter(s => s.category === filterCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    }
    return data;
  }, [services, filterCategory, search]);

  // Fetch services from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchServices = async () => {
      try {
        const response = await dichVuService.getAll({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setServices(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        // Only show error toast for non-cancelled requests
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching services:', error);
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchServices();

    // Cleanup: abort request if component unmounts or refreshKey changes
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const refreshServices = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const resetForm = () => setNewService(emptyForm);

  // ===== Thêm =====
  const handleOpenAdd = () => { resetForm(); setShowAddModal(true); };
  const handleSubmitAdd = () => {
    if (!newService.name || !newService.description || !newService.category || !newService.unit || newService.price <= 0) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thêm dịch vụ',
      message: <>Bạn có chắc muốn thêm dịch vụ <strong>{newService.name}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.createService({
            name: newService.name,
            description: newService.description,
            price: newService.price,
            unit: newService.unit,
            category: newService.category as Service['category'],
            isActive: newService.isActive
          });
          setShowAddModal(false);
          resetForm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Đã thêm dịch vụ', message: `Thêm "${newService.name}" thành công.` });
          refreshServices();
        } catch (error) {
          console.error('Error creating service:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi thêm dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Sửa =====
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
  const handleSubmitEdit = () => {
    if (!editingService) return;
    if (!newService.name || !newService.description || !newService.category || !newService.unit || newService.price <= 0) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật dịch vụ',
      message: <>Cập nhật thông tin dịch vụ <strong>{editingService.name}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.updateService(editingService.id, {
            name: newService.name,
            description: newService.description,
            price: newService.price,
            unit: newService.unit,
            category: newService.category as Service['category'],
            isActive: newService.isActive
          });
          setShowEditModal(false);
          setEditingService(null);
          resetForm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Đã cập nhật', message: `Cập nhật "${newService.name}" thành công.` });
          setShowDetailModal(false);
          setSelectedService(null);
          refreshServices();
        } catch (error) {
          console.error('Error updating service:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi cập nhật dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Xóa =====
  const handleDelete = (service: Service) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa dịch vụ',
      message: <>Bạn có chắc muốn xóa <strong>{service.name}</strong>? Hành động này không thể hoàn tác.</>,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.deleteService(service.id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.error({ title: 'Đã xóa', message: `Đã xóa dịch vụ "${service.name}".` });
          setShowDetailModal(false);
          setSelectedService(null);
          refreshServices();
        } catch (error) {
          console.error('Error deleting service:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi xóa dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Toggle trạng thái =====
  const toggleServiceStatus = (service: Service) => {
    const next = !service.isActive;
    setConfirmDialog({
      isOpen: true,
      title: `${next ? 'Kích hoạt' : 'Tạm dừng'} dịch vụ`,
      message: <>Bạn muốn {next ? 'kích hoạt' : 'tạm dừng'} <strong>{service.name}</strong>?</>,
      type: 'warning',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.toggleStatus(service.id);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({
            title: next ? 'Đã kích hoạt' : 'Đã tạm dừng',
            message: `"${service.name}" đã được ${next ? 'kích hoạt' : 'tạm dừng'}.`
          });
          setShowDetailModal(false);
          setSelectedService(null);
          refreshServices();
        } catch (error) {
          console.error('Error toggling service status:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi thay đổi trạng thái',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
                <p className="text-gray-600">Quản lý các dịch vụ đi kèm</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i> Thêm dịch vụ
              </button>
            </div>

            {/* Tabs: chỉ còn Danh sách dịch vụ */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button className="py-3 px-6 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600 cursor-default">
                    Danh sách dịch vụ
                  </button>
                </nav>
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
                  <option value="services">Dịch vụ</option>
                  <option value="utilities">Tiện ích</option>
                  <option value="other">Khác</option>
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm dịch vụ..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && services.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
                <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm dịch vụ đầu tiên</p>
                <button
                  onClick={handleOpenAdd}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i> Thêm dịch vụ
                </button>
              </div>
            )}

            {/* No Results State */}
            {!loading && services.length > 0 && filteredServices.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center col-span-full">
                <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
                <p className="text-gray-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
              </div>
            )}

            {/* Services Grid */}
            {!loading && filteredServices.length > 0 && (
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
                        <span className="text-sm text-gray-600">Số phòng đang sử dụng:</span>
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
                        onClick={() => { setSelectedService(service); setShowDetailModal(true); }}
                        className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line mr-1"></i> Chi tiết
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
            )}

          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết dịch vụ</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Tên dịch vụ:</span><span className="font-medium">{selectedService.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Mô tả:</span><span className="font-medium">{selectedService.description}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedService.category)}`}>
                    {getCategoryText(selectedService.category)}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-gray-600">Giá:</span><span className="font-medium text-green-600">{selectedService.price.toLocaleString('vi-VN')}đ/{selectedService.unit}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Số phòng đang sử dụng:</span><span className="font-medium">{selectedService.usageCount}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className={`font-medium ${selectedService.isActive ? 'text-green-600' : 'text-red-600'}`}>{selectedService.isActive ? 'Hoạt động' : 'Tạm dừng'}</span></div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => handleEdit(selectedService)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Chỉnh sửa</button>
                <button onClick={() => toggleServiceStatus(selectedService)} className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap text-white ${selectedService.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{selectedService.isActive ? 'Tạm dừng' : 'Kích hoạt'}</button>
                <button onClick={() => handleDelete(selectedService)} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap">Xóa dịch vụ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm dịch vụ mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input type="text" value={newService.unit} onChange={(e) => setNewService({ ...newService, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value as any })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                    <option value="">Chọn danh mục</option>
                    <option value="services">Dịch vụ</option>
                    <option value="utilities">Tiện ích</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={newService.isActive} onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })} className="mr-2" />
                    <span className="text-sm text-gray-700">Kích hoạt dịch vụ ngay</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                  <button type="button" onClick={handleSubmitAdd} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Thêm dịch vụ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa dịch vụ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input type="text" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input type="number" value={newService.price} onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input type="text" value={newService.unit} onChange={(e) => setNewService({ ...newService, unit: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value as any })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                    <option value="services">Dịch vụ</option>
                    <option value="utilities">Tiện ích</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={newService.isActive} onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })} className="mr-2" />
                    <span className="text-sm text-gray-700">Dịch vụ đang hoạt động</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingService(null); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                  <button type="button" onClick={handleSubmitEdit} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Cập nhật</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog dùng chung */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
