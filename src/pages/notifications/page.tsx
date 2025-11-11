import { useMemo, useState, useEffect } from 'react';
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
  targetRooms?: string[]; // lưu theo mã phòng (VD: "201")
  status: 'draft' | 'sent' | 'scheduled';
  createdAt: string;
  sentAt?: string;
  scheduledAt?: string;
  readCount: number;
  totalRecipients: number;
}

type Room = {
  id: string;
  building: string;
  room: string;
  tenantName: string;
  rentAmount: number;
  electricityUsage: number;
  waterUsage: number;
};

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success, error, warning } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [confirmMessage, setConfirmMessage] = useState('');

  // Tabs theo trạng thái
  const [statusTab, setStatusTab] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');

  // ---- MOCK ROOMS (có building) ----
  const [rooms] = useState<Room[]>([
    { id: 'A-201', building: 'A', room: '201', tenantName: 'Nguyễn Văn An', rentAmount: 3500000, electricityUsage: 120, waterUsage: 2 },
    { id: 'A-203', building: 'A', room: '203', tenantName: 'Trần Thị Bình', rentAmount: 3400000, electricityUsage: 110, waterUsage: 2 },
    { id: 'A-301', building: 'A', room: '301', tenantName: 'Lê Văn Cường', rentAmount: 3600000, electricityUsage: 100, waterUsage: 3 },
    { id: 'B-101', building: 'B', room: '101', tenantName: 'Hoàng Văn Em', rentAmount: 3300000, electricityUsage: 90, waterUsage: 1 },
    { id: 'B-302', building: 'B', room: '302', tenantName: 'Phạm Thị Dung', rentAmount: 3600000, electricityUsage: 95, waterUsage: 2 },
  ]);

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
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'urgent' | 'maintenance' | 'payment'>('all');

  // Inline scheduling cho bản nháp
  const [scheduleEditId, setScheduleEditId] = useState<number | null>(null);
  const [scheduleValue, setScheduleValue] = useState<string>('');

  const notificationTypes = [
    { value: 'all', label: 'Tất cả loại' },
    { value: 'general', label: 'Thông báo chung' },
    { value: 'urgent', label: 'Khẩn cấp' },
    { value: 'maintenance', label: 'Bảo trì' },
    { value: 'payment', label: 'Thanh toán' },
  ];

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const listByTab =
    statusTab === 'all' ? filteredNotifications : filteredNotifications.filter((n) => n.status === statusTab);

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

    if (notificationData.targetAudience === 'specific' && (!notificationData.targetRooms || notificationData.targetRooms.length === 0)) {
      error({ title: 'Vui lòng chọn ít nhất một phòng!' });
      return;
    }

    const totalRecipients =
      notificationData.targetAudience === 'all'
        ? rooms.length
        : (notificationData.targetRooms?.length || 0);

    const newNotification: Notification = {
      id: notifications.length + 1,
      ...notificationData,
      createdAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      totalRecipients,
    };
    setNotifications((prev) => [newNotification, ...prev]);
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
    const totalRecipients =
      notificationData.targetAudience === 'all'
        ? rooms.length
        : (notificationData.targetRooms?.length || 0);

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === selectedNotification.id
          ? { ...notification, ...notificationData, totalRecipients }
          : notification
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

  // Helpers
  const nowPlus1HourLocalString = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleQuickPlus1Hour = (id: number) => {
    const t = nowPlus1HourLocalString();
    setNotifications(prev =>
      prev.map(n => n.id === id ? ({ ...n, status: 'scheduled', scheduledAt: t.replace('T', ' ') }) : n)
    );
    success({ title: 'Đã đặt lịch sau 1 giờ' });
  };

  const openScheduleForDraft = (id: number) => {
    setScheduleEditId(id);
    setScheduleValue(nowPlus1HourLocalString()); // gợi ý +1 giờ
  };

  const saveScheduleForDraft = (id: number) => {
    if (!scheduleValue) {
      error({ title: 'Vui lòng chọn thời gian gửi.' });
      return;
    }
    setNotifications(prev =>
      prev.map(n => n.id === id ? ({ ...n, status: 'scheduled', scheduledAt: scheduleValue.replace('T', ' ') }) : n)
    );
    setScheduleEditId(null);
    setScheduleValue('');
    success({ title: 'Đã đặt lịch gửi cho bản nháp.' });
  };

  const cancelScheduleEdit = () => {
    setScheduleEditId(null);
    setScheduleValue('');
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

            {/* Tabs trạng thái */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {([
                    { key: 'all', label: 'Tất cả' },
                    { key: 'sent', label: `Đã gửi (${notifications.filter(n => n.status === 'sent').length})` },
                    { key: 'scheduled', label: `Đang lên lịch (${notifications.filter(n => n.status === 'scheduled').length})` },
                    { key: 'draft', label: `Nháp (${notifications.filter(n => n.status === 'draft').length})` },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStatusTab(t.key)}
                      className={`py-3 px-6 border-b-2 font-medium text-sm cursor-pointer ${statusTab === t.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-500">
                  Hiển thị theo nhóm trạng thái. Bạn vẫn có thể tìm kiếm hoặc lọc theo loại ở bên dưới.
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatCard icon="ri-notification-line" color="blue" label="Tổng thông báo" value={notifications.length} />
              <StatCard icon="ri-send-plane-line" color="green" label="Đã gửi" value={notifications.filter(n => n.status === 'sent').length} />
              <StatCard icon="ri-calendar-schedule-line" color="yellow" label="Đã lên lịch" value={notifications.filter(n => n.status === 'scheduled').length} />
              <StatCard icon="ri-draft-line" color="purple" label="Bản nháp" value={notifications.filter(n => n.status === 'draft').length} />
            </div>

            {/* Filters: chỉ tìm kiếm + loại */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    {[
                      { value: 'all', label: 'Tất cả loại' },
                      { value: 'general', label: 'Thông báo chung' },
                      { value: 'urgent', label: 'Khẩn cấp' },
                      { value: 'maintenance', label: 'Bảo trì' },
                      { value: 'payment', label: 'Thanh toán' },
                    ].map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
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
              {listByTab.map((notification) => {
                const isDraft = notification.status === 'draft';
                const isScheduled = notification.status === 'scheduled';

                return (
                  <div key={notification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                            {getTypeText(notification.type)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{notification.content}</p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span>
                            <i className="ri-user-line mr-1"></i>
                            {notification.targetAudience === 'all'
                              ? 'Tất cả'
                              : `${notification.targetRooms?.length ?? 0} phòng`}
                          </span>
                          <span>
                            <i className="ri-calendar-line mr-1"></i>
                            Tạo lúc: {notification.createdAt}
                          </span>

                          {notification.status === 'sent' && (
                            <>
                              <span>
                                <i className="ri-send-plane-line mr-1"></i>
                                Đã gửi: {notification.sentAt}
                              </span>
                              <span>
                                <i className="ri-eye-line mr-1"></i>
                                {notification.readCount}/{notification.totalRecipients} đã đọc
                              </span>
                            </>
                          )}

                          {isScheduled && notification.scheduledAt && (
                            <span>
                              <i className="ri-time-line mr-1"></i>
                              Gửi lúc: {notification.scheduledAt}
                            </span>
                          )}

                          {isDraft && (
                            <span className="italic">
                              <i className="ri-draft-line mr-1"></i>
                              Bản nháp
                            </span>
                          )}
                        </div>

                        {/* Inline schedule editor cho Nháp */}
                        {isDraft && scheduleEditId === notification.id && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <input
                              type="datetime-local"
                              value={scheduleValue}
                              onChange={(e) => setScheduleValue(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => saveScheduleForDraft(notification.id)}
                              className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
                            >
                              Lưu lịch
                            </button>
                            <button
                              onClick={cancelScheduleEdit}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
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

                        {/* Gửi ngay (chỉ cho nháp) */}
                        {isDraft && (
                          <button
                            onClick={() => handleSendNotification(notification)}
                            className="text-green-600 hover:text-green-900"
                            title="Gửi ngay"
                          >
                            <i className="ri-send-plane-line"></i>
                          </button>
                        )}

                        {/* Đặt giờ (chỉ cho nháp) */}
                        {isDraft && (
                          <button
                            onClick={() => openScheduleForDraft(notification.id)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Đặt giờ gửi"
                          >
                            <i className="ri-time-line"></i>
                          </button>
                        )}

                        {/* Nhanh +1 giờ (chỉ cho đang lên lịch) */}
                        {isScheduled && (
                          <button
                            onClick={() => handleQuickPlus1Hour(notification.id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Đặt lại: gửi sau 1 giờ"
                          >
                            <i className="ri-timer-line"></i>
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
                );
              })}

              {listByTab.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
                  Không có thông báo phù hợp.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Notification Modal */}
        {showModal && (
          <NotificationModal
            notification={selectedNotification}
            rooms={rooms}
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

function StatCard({ icon, color, label, value }: { icon: string; color: 'blue' | 'green' | 'yellow' | 'purple'; label: string; value: number }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  } as const;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${colorMap[color].split(' ')[0]} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${colorMap[color].split(' ')[1]} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   NotificationModal
   ========================= */
interface NotificationModalProps {
  notification?: Notification | null;
  rooms: Room[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function NotificationModal({ notification, rooms, onClose, onSubmit }: NotificationModalProps) {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    content: notification?.content || '',
    type: (notification?.type || 'general') as Notification['type'],
    targetAudience: (notification?.targetAudience || 'all') as Notification['targetAudience'],
    status: (notification?.status || 'draft') as Notification['status'],
    scheduledAt: notification?.scheduledAt || '',
  });

  // --- State chọn phòng giống Bulk Invoice ---
  const [selectedBuilding, setSelectedBuilding] = useState<'all' | string>('all');
  const [roomState, setRoomState] = useState<(Room & { selected: boolean })[]>([]);

  // khởi tạo roomState và pre-select nếu đang sửa notification specific
  useEffect(() => {
    const init = rooms.map(r => ({
      ...r,
      selected: notification?.targetAudience === 'specific'
        ? (notification?.targetRooms || []).includes(r.room)
        : false,
    }));
    setRoomState(init);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, notification?.id]);

  const getBuildings = useMemo(() => {
    const set = new Set(rooms.map(r => r.building));
    return Array.from(set).sort();
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    return roomState.filter(r => selectedBuilding === 'all' ? true : r.building === selectedBuilding);
  }, [roomState, selectedBuilding]);

  const allFilteredSelected = filteredRooms.length > 0 && filteredRooms.every(r => r.selected);
  const anyFilteredSelected = filteredRooms.some(r => r.selected);

  const toggleSelectAllFiltered = () => {
    setRoomState(prev =>
      prev.map(r => (selectedBuilding === 'all' || r.building === selectedBuilding)
        ? { ...r, selected: !allFilteredSelected }
        : r
      )
    );
  };

  const toggleRoom = (id: string) => {
    setRoomState(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const selectedRooms = roomState.filter(r => r.selected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      targetRooms:
        formData.targetAudience === 'specific'
          ? selectedRooms.map(r => r.room) // lưu theo số phòng
          : [],
    };

    if (submitData.targetAudience === 'specific' && submitData.targetRooms.length === 0) {
      alert('Vui lòng chọn ít nhất một phòng.');
      return;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[500] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-[1099px] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {notification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tiêu đề, loại, nội dung + trạng thái/schedule sang bên trái */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  {/* Trạng thái chuyển sang cột trái để cân layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Notification['status'] })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent text-sm pr-8"
                    >
                      <option value="draft">Lưu bản nháp</option>
                      <option value="sent">Gửi ngay</option>
                      <option value="scheduled">Lên lịch gửi</option>
                    </select>
                  </div>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Nhập nội dung thông báo"
                  />
                </div>
              </div>

              {/* Khối chọn đối tượng nhận (giống Bulk Room Selection) */}
              <div className="space-y-4">
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
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Chọn phòng nhận thông báo</h3>
                      <div className="flex gap-2">
                        <select
                          value={selectedBuilding}
                          onChange={(e) => setSelectedBuilding(e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="all">Tất cả dãy</option>
                          {getBuildings.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={toggleSelectAllFiltered}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                          {allFilteredSelected ? 'Bỏ chọn tất cả' : (anyFilteredSelected ? 'Chọn hết (lọc)' : 'Chọn tất cả')}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-72">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <input
                                  type="checkbox"
                                  checked={allFilteredSelected}
                                  onChange={toggleSelectAllFiltered}
                                  className="text-blue-600"
                                />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dãy</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách thuê</th>
                              {/* Đã bỏ Tiền thuê & Điện (kWh) */}
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số người</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRooms.map((r) => (
                              <tr key={r.id} className={`hover:bg-gray-50 ${r.selected ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={r.selected}
                                    onChange={() => toggleRoom(r.id)}
                                    className="text-blue-600"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{r.building}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{r.room}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{r.tenantName}</td>
                                {/* Bỏ hiển thị rentAmount & electricityUsage */}
                                <td className="px-4 py-3 text-sm text-gray-900">{r.waterUsage}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm">
                        <span className="text-gray-600">Số phòng đã chọn:</span>
                        <span className="font-semibold text-green-700 ml-2">{selectedRooms.length}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
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
