import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'maintenance' | 'payment';
  targetAudience: 'all' | 'specific';
  targetRooms?: string[];
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  readCount: number;
  totalRecipients: number;
}

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success, error, warning } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [confirmMessage, setConfirmMessage] = useState('');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: 'Thông báo bảo trì hệ thống điện',
      content: 'Khu trọ sẽ tạm ngừng cung cấp điện từ 8h-12h ngày 25/01 để bảo trì hệ thống. Mong mọi người thông cảm.',
      type: 'maintenance',
      targetAudience: 'all',
      status: 'sent',
      createdAt: '2024-01-20',
      sentAt: '2024-01-20 09:00',
      readCount: 15,
      totalRecipients: 20,
    },
    {
      id: 2,
      title: 'Nhắc nhở đóng tiền phòng tháng 1',
      content: 'Các bạn chưa đóng tiền phòng tháng 1 vui lòng đóng trước ngày 25/01. Liên hệ ban quản lý nếu có thắc mắc.',
      type: 'payment',
      targetAudience: 'specific',
      targetRooms: ['201', '203', '301'],
      status: 'sent',
      createdAt: '2024-01-18',
      sentAt: '2024-01-18 14:30',
      readCount: 2,
      totalRecipients: 3,
    },
    {
      id: 3,
      title: 'Cập nhật nội quy mới',
      content: 'Từ ngày 1/2, khu trọ sẽ áp dụng nội quy mới về giờ giấc và vệ sinh. Mọi người vui lòng đọc kỹ và tuân thủ.',
      type: 'general',
      targetAudience: 'all',
      status: 'scheduled',
      createdAt: '2024-01-20',
      scheduledAt: '2024-02-01 08:00',
      readCount: 0,
      totalRecipients: 20,
    },
    {
      id: 4,
      title: 'Khẩn cấp: Sự cố thang máy',
      content: 'Thang máy đang gặp sự cố, tạm thời không sử dụng được. Mọi người sử dụng cầu thang bộ. Dự kiến sửa xong trong 2 ngày.',
      type: 'urgent',
      targetAudience: 'all',
      status: 'draft',
      createdAt: '2024-01-21',
      readCount: 0,
      totalRecipients: 20,
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const notificationTypes = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'general', label: 'Thông báo chung' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'payment', label: 'Thanh toán' },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'draft', label: 'Bản nháp' },
    { value: 'sent', label: 'Đã gửi' },
    { value: 'scheduled', label: 'Đã lên lịch' },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general':
        return 'Chung';
      case 'urgent':
        return 'Khẩn cấp';
      case 'maintenance':
        return 'Bảo trì';
      case 'payment':
        return 'Thanh toán';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Bản nháp';
      case 'sent':
        return 'Đã gửi';
      case 'scheduled':
        return 'Đã lên lịch';
      default:
        return status;
    }
  };

  const handleSendNotification = (notification: Notification) => {
    setConfirmMessage(`Bạn có chắc chắn muốn gửi thông báo "${notification.title}" không?`);
    setConfirmAction(() => () => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, status: 'sent', sentAt: new Date().toLocaleString() } : n
        )
      );
      success({ title: `Đã gửi thông báo "${notification.title}" thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleDeleteNotification = (notification: Notification) => {
    setConfirmMessage(`Bạn có chắc chắn muốn xóa thông báo "${notification.title}" không? Hành động này không thể hoàn tác.`);
    setConfirmAction(() => () => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      success({ title: `Đã xóa thông báo "${notification.title}" thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleAddNotification = (notificationData: any) => {
    if (!notificationData.title || !notificationData.content) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    if (notificationData.targetAudience === 'specific' && !notificationData.targetRooms?.length) {
      error({ title: 'Vui lòng chọn ít nhất một phòng!' });
      return;
    }

    const newNotification: Notification = {
      id: notifications.length + 1,
      ...notificationData,
      createdAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      totalRecipients:
        notificationData.targetAudience === 'all'
          ? 20
          : notificationData.targetRooms?.length || 0,
    };
    setNotifications((prev) => [...prev, newNotification]);
    setShowModal(false);

    if (notificationData.status === 'sent') {
      success({ title: `Đã tạo và gửi thông báo "${notificationData.title}" thành công!` });
    } else if (notificationData.status === 'scheduled') {
      success({ title: `Đã lên lịch gửi thông báo "${notificationData.title}" thành công!` });
    } else {
      success({ title: `Đã lưu bản nháp thông báo "${notificationData.title}" thành công!` });
    }
  };

  const handleUpdateNotification = (notificationData: any) => {
    if (!selectedNotification || !notificationData.title || !notificationData.content) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === selectedNotification.id ? { ...notification, ...notificationData } : notification
      )
    );
    setShowModal(false);
    setSelectedNotification(null);
    success({ title: `Đã cập nhật thông báo "${notificationData.title}" thành công!` });
  };

  const handleBulkSendNotifications = () => {
    const draftNotifications = notifications.filter((n) => n.status === 'draft');
    if (draftNotifications.length === 0) {
      warning({ title: 'Không có thông báo nháp nào để gửi!' });
      return;
    }

    setConfirmMessage(`Bạn có chắc chắn muốn gửi tất cả ${draftNotifications.length} thông báo nháp không?`);
    setConfirmAction(() => () => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.status === 'draft' ? { ...n, status: 'sent', sentAt: new Date().toLocaleString() } : n
        )
      );
      success({ title: `Đã gửi ${draftNotifications.length} thông báo thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleBulkDeleteNotifications = () => {
    const draftNotifications = notifications.filter((n) => n.status === 'draft');
    if (draftNotifications.length === 0) {
      warning({ title: 'Không có thông báo nháp nào để xóa!' });
      return;
    }

    setConfirmMessage(`Bạn có chắc chắn muốn xóa tất cả ${draftNotifications.length} thông báo nháp không? Hành động này không thể hoàn tác.`);
    setConfirmAction(() => () => {
      setNotifications((prev) => prev.filter((n) => n.status !== 'draft'));
      success({ title: `Đã xóa ${draftNotifications.length} thông báo nháp thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thông báo</h1>
                <p className="text-gray-600">Tạo và quản lý thông báo gửi đến khách thuê</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkSendNotifications}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 whitespace-nowrap flex items-center"
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Gửi tất cả nháp
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap flex items-center"
                >
                  <i className="ri-add-line mr-2"></i>
                  Tạo thông báo
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ri-notification-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng thông báo</p>
                    <p className="text-2xl font-semibold text-gray-900">{notifications.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-send-plane-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã gửi</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {notifications.filter((n) => n.status === 'sent').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="ri-draft-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Bản nháp</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {notifications.filter((n) => n.status === 'draft').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="ri-calendar-schedule-line text-purple-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Đã lên lịch</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {notifications.filter((n) => n.status === 'scheduled').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tiêu đề, nội dung..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    {notificationTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                      setStatusFilter('all');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {getTypeText(notification.type)}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            notification.status
                          )}`}
                        >
                          {getStatusText(notification.status)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.content}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span>
                          <i className="ri-user-line mr-1"></i>
                          {notification.targetAudience === 'all'
                            ? 'Tất cả'
                            : `${notification.targetRooms?.length} phòng`}
                        </span>
                        <span>
                          <i className="ri-calendar-line mr-1"></i>
                          {notification.createdAt}
                        </span>
                        {notification.status === 'sent' && (
                          <span>
                            <i className="ri-eye-line mr-1"></i>
                            {notification.readCount}/{notification.totalRecipients} đã đọc
                          </span>
                        )}
                        {notification.status === 'scheduled' && (
                          <span>
                            <i className="ri-time-line mr-1"></i>
                            Gửi lúc: {notification.scheduledAt}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Chỉnh sửa"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      {notification.status === 'draft' && (
                        <button
                          onClick={() => handleSendNotification(notification)}
                          className="text-green-600 hover:text-green-900"
                          title="Gửi ngay"
                        >
                          <i className="ri-send-plane-line"></i>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification)}
                        className="text-red-600 hover:text-red-900"
                        title="Xóa"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Notification Modal */}
        {showModal && (
          <NotificationModal
            notification={selectedNotification}
            onClose={() => {
              setShowModal(false);
              setSelectedNotification(null);
            }}
            onSubmit={selectedNotification ? handleUpdateNotification : handleAddNotification}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận thao tác"
          message={confirmMessage}
          onConfirm={confirmAction}
          onClose={() => setShowConfirmDialog(false)}
        />
      </div>
    </div>
  );
}

// NotificationModal component
interface NotificationModalProps {
  notification?: Notification | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function NotificationModal({ notification, onClose, onSubmit }: NotificationModalProps) {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    content: notification?.content || '',
    type: (notification?.type || 'general') as Notification['type'],
    targetAudience: (notification?.targetAudience || 'all') as Notification['targetAudience'],
    targetRooms: notification?.targetRooms?.join(', ') || '',
    status: (notification?.status || 'draft') as Notification['status'],
    scheduledAt: notification?.scheduledAt || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      targetRooms:
        formData.targetAudience === 'specific'
          ? formData.targetRooms.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
    };
    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[500] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {notification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập tiêu đề thông báo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Notification['type'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                <option value="general">Thông báo chung</option>
                <option value="urgent">Khẩn cấp</option>
                <option value="maintenance">Bảo trì</option>
                <option value="payment">Thanh toán</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập nội dung thông báo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng nhận *</label>
              <select
                required
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as Notification['targetAudience'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                <option value="all">Tất cả khách thuê</option>
                <option value="specific">Phòng cụ thể</option>
              </select>
            </div>

            {formData.targetAudience === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số phòng</label>
                <input
                  type="text"
                  value={formData.targetRooms}
                  onChange={(e) => setFormData({ ...formData, targetRooms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  placeholder="Nhập số phòng, cách nhau bằng dấu phẩy (VD: 201, 203, 301)"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Notification['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                <option value="draft">Lưu bản nháp</option>
                <option value="sent">Gửi ngay</option>
                <option value="scheduled">Lên lịch gửi</option>
              </select>
            </div>

            {formData.status === 'scheduled' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi</label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                {notification ? 'Cập nhật' : 'Tạo thông báo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
