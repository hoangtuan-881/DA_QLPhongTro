
import { useState } from 'react';
import ConfirmDialog from '../../../components/base/ConfirmDialog';
import { useToast } from '../../../hooks/useToast';

export default function ServiceUsage() {
  const [activeTab, setActiveTab] = useState<'current' | 'register'>('current');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => {}
  });

  const toast = useToast();

  const [currentServices, setCurrentServices] = useState([
    {
      id: 1,
      name: 'Giặt ủi',
      provider: 'Clean House',
      price: '15,000',
      unit: 'kg',
      status: 'Đang sử dụng',
      registeredDate: '2024-01-15',
      lastUsed: '2024-12-10',
      totalUsage: '25 kg',
      totalCost: '375,000'
    },
    {
      id: 2,
      name: 'Dọn phòng',
      provider: 'Home Care',
      price: '200,000',
      unit: 'lần',
      status: 'Đang sử dụng',
      registeredDate: '2024-02-01',
      lastUsed: '2024-12-08',
      totalUsage: '8 lần',
      totalCost: '1,600,000'
    },
    {
      id: 3,
      name: 'Giao đồ ăn',
      provider: 'Food Express',
      price: '25,000',
      unit: 'đơn',
      status: 'Tạm dừng',
      registeredDate: '2024-03-10',
      lastUsed: '2024-11-20',
      totalUsage: '45 đơn',
      totalCost: '1,125,000'
    }
  ]);

  const [availableServices] = useState([
    {
      id: 4,
      name: 'Sửa chữa điện tử',
      provider: 'Tech Fix',
      price: '100,000',
      unit: 'lần',
      description: 'Sửa chữa các thiết bị điện tử, laptop, điện thoại'
    },
    {
      id: 5,
      name: 'Giao hàng nhanh',
      provider: 'Express Delivery',
      price: '30,000',
      unit: 'đơn',
      description: 'Giao hàng trong ngày trong khu vực'
    },
    {
      id: 6,
      name: 'Massage tại nhà',
      provider: 'Relax Center',
      price: '300,000',
      unit: 'giờ',
      description: 'Dịch vụ massage thư giãn tại phòng'
    }
  ]);

  const handleRegisterService = (service: any) => {
    setSelectedService(service);
    setShowRegisterModal(true);
  };

  const handleViewDetail = (service: any) => {
    setSelectedService(service);
    setShowDetailModal(true);
  };

  const handlePauseService = (serviceId: number) => {
    const service = currentServices.find(s => s.id === serviceId);
    if (!service) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận tạm dừng dịch vụ',
      message: `Bạn có chắc chắn muốn tạm dừng dịch vụ "${service.name}" không?`,
      type: 'warning',
      onConfirm: () => {
        setCurrentServices(prev => prev.map(s => 
          s.id === serviceId ? { ...s, status: 'Tạm dừng' } : s
        ));
        toast.warning({ title: `Đã tạm dừng dịch vụ "${service.name}" thành công!` });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleResumeService = (serviceId: number) => {
    const service = currentServices.find(s => s.id === serviceId);
    if (!service) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận tiếp tục dịch vụ',
      message: `Bạn có chắc chắn muốn tiếp tục sử dụng dịch vụ "${service.name}" không?`,
      type: 'info',
      onConfirm: () => {
        setCurrentServices(prev => prev.map(s => 
          s.id === serviceId ? { ...s, status: 'Đang sử dụng' } : s
        ));
        toast.success({ title: `Đã tiếp tục dịch vụ "${service.name}" thành công!` });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleCancelService = (serviceId: number) => {
    const service = currentServices.find(s => s.id === serviceId);
    if (!service) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận hủy dịch vụ',
      message: `Bạn có chắc chắn muốn hủy dịch vụ "${service.name}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setCurrentServices(prev => prev.filter(s => s.id !== serviceId));
        toast.success({ title: `Đã hủy dịch vụ "${service.name}" thành công!` });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRegisterModal(false);
    if (selectedService) {
      toast.success({ title: `Đã gửi yêu cầu đăng ký dịch vụ "${selectedService.name}" thành công!` });
    }
    setSelectedService(null);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dịch vụ đang sử dụng
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'register'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Đăng ký dịch vụ mới
          </button>
        </nav>
      </div>

      {/* Dịch vụ đang sử dụng */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          {currentServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  <p className="text-gray-600">Nhà cung cấp: {service.provider}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  service.status === 'Đang sử dụng' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Giá dịch vụ</p>
                  <p className="font-semibold text-gray-900">{service.price} VNĐ/{service.unit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tổng sử dụng</p>
                  <p className="font-semibold text-gray-900">{service.totalUsage}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Tổng chi phí</p>
                  <p className="font-semibold text-green-600">{service.totalCost} VNĐ</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Sử dụng gần nhất</p>
                  <p className="font-semibold text-gray-900">{service.lastUsed}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Đăng ký từ: {service.registeredDate}</span>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => handleViewDetail(service)}
                    className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <i className="ri-eye-line text-lg"></i>
                  </button>
                  
                  {service.status === 'Đang sử dụng' ? (
                    <button 
                      onClick={() => handlePauseService(service.id)}
                      className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Tạm dừng"
                    >
                      <i className="ri-pause-circle-line text-lg"></i>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleResumeService(service.id)}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Tiếp tục"
                    >
                      <i className="ri-play-circle-line text-lg"></i>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleCancelService(service.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hủy dịch vụ"
                  >
                    <i className="ri-close-circle-line text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Đăng ký dịch vụ mới */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-information-line text-blue-600 mr-3"></i>
              <div>
                <h4 className="font-medium text-blue-800">Thông tin đăng ký dịch vụ</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Chọn dịch vụ bạn muốn sử dụng và điền thông tin đăng ký. Yêu cầu sẽ được xử lý trong 24h.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableServices.map((service) => (
              <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.provider}</p>
                <p className="text-sm text-gray-700 mb-4">{service.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-green-600">
                    {service.price} VNĐ/{service.unit}
                  </span>
                </div>

                <button
                  onClick={() => handleRegisterService(service)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Đăng ký dịch vụ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal chi tiết dịch vụ */}
      {showDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Chi tiết dịch vụ: {selectedService.name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhà cung cấp:</span>
                        <span className="font-medium">{selectedService.provider}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá dịch vụ:</span>
                        <span className="font-medium">{selectedService.price} VNĐ/{selectedService.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedService.status === 'Đang sử dụng' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedService.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Thống kê sử dụng</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Đăng ký từ:</span>
                        <span className="font-medium">{selectedService.registeredDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng sử dụng:</span>
                        <span className="font-medium">{selectedService.totalUsage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tổng chi phí:</span>
                        <span className="font-medium text-green-600">{selectedService.totalCost} VNĐ</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lần cuối sử dụng:</span>
                        <span className="font-medium">{selectedService.lastUsed}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Lịch sử sử dụng gần đây</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sử dụng dịch vụ</p>
                        <p className="text-xs text-gray-600">2024-12-10 14:30</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">-{selectedService.price} VNĐ</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sử dụng dịch vụ</p>
                        <p className="text-xs text-gray-600">2024-12-08 10:15</p>
                      </div>
                      <span className="text-sm font-medium text-green-600">-{selectedService.price} VNĐ</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-6 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đăng ký dịch vụ */}
      {showRegisterModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Đăng ký dịch vụ: {selectedService.name}
                </h3>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitRegistration} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú yêu cầu
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={3}
                    placeholder="Mô tả chi tiết yêu cầu của bạn..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian mong muốn
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Giá dịch vụ:</span>
                    <span className="font-medium">{selectedService.price} VNĐ/{selectedService.unit}</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Đăng ký
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        confirmText="Xác nhận"
        cancelText="Hủy"
      />
    </div>
  );
}
