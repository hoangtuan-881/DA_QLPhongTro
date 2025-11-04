
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../dashboard/components/Sidebar';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

interface BookingDeposit {
  id: number;
  customerName: string;
  phone: string;
  email: string;
  roomNumber: string;
  depositAmount: number;
  bookingDate: string;
  expectedMoveIn: string;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  notes: string;
  expiryDate: string;
}

export default function BookingDeposits() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deposits, setDeposits] = useState<BookingDeposit[]>([
    {
      id: 1,
      customerName: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'an@email.com',
      roomNumber: '201',
      depositAmount: 3500000,
      bookingDate: '2024-01-15',
      expectedMoveIn: '2024-02-01',
      status: 'confirmed',
      notes: 'Khách hàng muốn xem phòng trước khi vào ở',
      expiryDate: '2024-01-22'
    },
    {
      id: 2,
      customerName: 'Trần Thị Bình',
      phone: '0912345678',
      email: 'binh@email.com',
      roomNumber: '203',
      depositAmount: 4000000,
      bookingDate: '2024-01-18',
      expectedMoveIn: '2024-02-05',
      status: 'pending',
      notes: 'Cần thời gian sắp xếp công việc',
      expiryDate: '2024-01-25'
    },
    {
      id: 3,
      customerName: 'Lê Văn Cường',
      phone: '0923456789',
      email: 'cuong@email.com',
      roomNumber: '301',
      depositAmount: 3200000,
      bookingDate: '2024-01-10',
      expectedMoveIn: '2024-01-25',
      status: 'expired',
      notes: 'Không liên lạc được',
      expiryDate: '2024-01-17'
    },
    {
      id: 4,
      customerName: 'Phạm Thị Dung',
      phone: '0934567890',
      email: 'dung@email.com',
      roomNumber: '302',
      depositAmount: 3800000,
      bookingDate: '2024-01-20',
      expectedMoveIn: '2024-02-10',
      status: 'pending',
      notes: 'Sinh viên, cần xác nhận học bổng',
      expiryDate: '2024-01-27'
    }
  ]);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<BookingDeposit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const { success, error, warning, info } = useToast();

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'cancelled', label: 'Đã hủy' }
  ];

  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = deposit.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deposit.phone.includes(searchTerm) ||
                         deposit.roomNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (depositId: number, newStatus: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    const statusText = newStatus === 'confirmed' ? 'xác nhận' :
                      newStatus === 'cancelled' ? 'hủy' :
                      newStatus === 'expired' ? 'hết hạn' : newStatus;
    
    setConfirmDialog({
      show: true,
      title: `${statusText.charAt(0).toUpperCase() + statusText.slice(1)} đặt cọc`,
      message: `Bạn có chắc chắn muốn ${statusText} đặt cọc của "${deposit?.customerName}" không?`,
      type: newStatus === 'cancelled' || newStatus === 'expired' ? 'danger' : 'info',
      onConfirm: () => {
        setDeposits(deposits.map(deposit => 
          deposit.id === depositId ? { ...deposit, status: newStatus as any } : deposit
        ));
        
        if (newStatus === 'cancelled' || newStatus === 'expired') {
          error({ title: `Đã ${statusText} đặt cọc của ${deposit?.customerName} thành công!` });
        } else {
          success({ title: `Đã ${statusText} đặt cọc của ${deposit?.customerName} thành công!` });
        }
      }
    });
  };

  const handleRefund = (depositId: number) => {
    const deposit = deposits.find(d => d.id === depositId);
    
    setConfirmDialog({
      show: true,
      title: 'Hoàn tiền cọc',
      message: `Bạn có chắc chắn muốn hoàn tiền cọc cho "${deposit?.customerName}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      onConfirm: () => {
        setDeposits(deposits.map(deposit => 
          deposit.id === depositId ? { ...deposit, status: 'cancelled' } : deposit
        ));
        success({ 
          title: `Đã xử lý hoàn tiền cọc cho ${deposit?.customerName} thành công!`,
          message: `Số tiền hoàn: ${deposit?.depositAmount.toLocaleString('vi-VN')}đ`
        });
      }
    });
  };

  const handleQuickRefund = (depositId: number) => {
    const deposit = deposits.find(d => d.id === depositId);
    
    setConfirmDialog({
      show: true,
      title: 'Hoàn cọc nhanh',
      message: `Hoàn cọc nhanh cho "${deposit?.customerName}" với số tiền ${deposit?.depositAmount.toLocaleString('vi-VN')}đ?`,
      type: 'warning',
      onConfirm: () => {
        setDeposits(deposits.map(deposit => 
          deposit.id === depositId ? { ...deposit, status: 'cancelled' } : deposit
        ));
        success({ 
          title: 'Hoàn cọc nhanh thành công!',
          message: `Đã hoàn ${deposit?.depositAmount.toLocaleString('vi-VN')}đ cho ${deposit?.customerName}`
        });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'expired': return 'Hết hạn';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-menu-line text-xl"></i>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Quản lý đặt cọc</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Tổng: {filteredDeposits.length} đặt cọc
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="ri-time-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {deposits.filter(d => d.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã xác nhận</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {deposits.filter(d => d.status === 'confirmed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="ri-close-line text-red-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hết hạn</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {deposits.filter(d => d.status === 'expired').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-indigo-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng tiền cọc</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(deposits.reduce((sum, d) => sum + d.depositAmount, 0) / 1000000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tên, SĐT, phòng..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Deposits Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách hàng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phòng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tiền cọc
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày đặt
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hết hạn
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
                    {filteredDeposits.map((deposit) => (
                      <tr key={deposit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {deposit.customerName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{deposit.customerName}</div>
                              <div className="text-sm text-gray-500">{deposit.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">Phòng {deposit.roomNumber}</div>
                          <div className="text-sm text-gray-500">Dự kiến: {deposit.expectedMoveIn}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-indigo-600">
                            {deposit.depositAmount.toLocaleString()}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {deposit.bookingDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${
                            new Date(deposit.expiryDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'
                          }`}>
                            {deposit.expiryDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(deposit.status)}`}>
                            {getStatusText(deposit.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDeposit(deposit);
                                setShowDetailModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            {deposit.status === 'pending' && (
                              <button
                                onClick={() => handleStatusChange(deposit.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900"
                                title="Xác nhận"
                              >
                                <i className="ri-check-line"></i>
                              </button>
                            )}
                            {(deposit.status === 'pending' || deposit.status === 'confirmed') && (
                              <>
                                <button
                                  onClick={() => handleQuickRefund(deposit.id)}
                                  className="text-orange-600 hover:text-orange-900"
                                  title="Hoàn cọc nhanh"
                                >
                                  <i className="ri-flashlight-line"></i>
                                </button>
                                <button
                                  onClick={() => handleRefund(deposit.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Hoàn tiền đầy đủ"
                                >
                                  <i className="ri-refund-line"></i>
                                </button>
                              </>
                            )}
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

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Chi tiết đặt cọc</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                      <p className="text-sm text-gray-900">{selectedDeposit.customerName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                      <p className="text-sm text-gray-900">{selectedDeposit.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedDeposit.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Thông tin đặt cọc</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phòng</label>
                      <p className="text-sm text-gray-900">Phòng {selectedDeposit.roomNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tiền cọc</label>
                      <p className="text-sm font-medium text-indigo-600">
                        {selectedDeposit.depositAmount.toLocaleString()}đ
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày đặt cọc</label>
                      <p className="text-sm text-gray-900">{selectedDeposit.bookingDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày dự kiến vào ở</label>
                      <p className="text-sm text-gray-900">{selectedDeposit.expectedMoveIn}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hết hạn</label>
                      <p className={`text-sm ${
                        new Date(selectedDeposit.expiryDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-900'
                      }`}>
                        {selectedDeposit.expiryDate}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDeposit.status)}`}>
                        {getStatusText(selectedDeposit.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedDeposit.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedDeposit.notes}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                {selectedDeposit.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedDeposit.id, 'confirmed');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition duration-200 whitespace-nowrap flex items-center justify-center"
                    >
                      <i className="ri-check-line mr-2"></i>
                      Xác nhận đặt cọc
                    </button>
                    <button
                      onClick={() => {
                        handleQuickRefund(selectedDeposit.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200 whitespace-nowrap flex items-center justify-center"
                    >
                      <i className="ri-flashlight-line mr-2"></i>
                      Hoàn cọc nhanh
                    </button>
                    <button
                      onClick={() => {
                        handleRefund(selectedDeposit.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 whitespace-nowrap flex items-center justify-center"
                    >
                      <i className="ri-refund-line mr-2"></i>
                      Hoàn tiền đầy đủ
                    </button>
                  </>
                )}
                {selectedDeposit.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => {
                        handleQuickRefund(selectedDeposit.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-200 whitespace-nowrap flex items-center justify-center"
                    >
                      <i className="ri-flashlight-line mr-2"></i>
                      Hoàn cọc nhanh
                    </button>
                    <button
                      onClick={() => {
                        handleRefund(selectedDeposit.id);
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-200 whitespace-nowrap flex items-center justify-center"
                    >
                      <i className="ri-refund-line mr-2"></i>
                      Hoàn tiền đầy đủ
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-close-line mr-2"></i>
                  Đóng
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, show: false });
        }}
        onCancel={() => setConfirmDialog({ ...confirmDialog, show: false })}
      />
    </div>
  );
}
