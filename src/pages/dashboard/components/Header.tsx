import { useState, useEffect, useRef, useMemo } from 'react';
import UserMenu from '@/components/base/UserMenu';
import thongBaoService from '@/services/thong-bao.service';
import { ChiTietThongBao } from '@/types/thong-bao';
import { getErrorMessage } from '@/lib/http-client';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<ChiTietThongBao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const notificationRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    const controller = new AbortController();

    const fetchNotifications = async () => {
      try {
        const response = await thongBaoService.getUserNotifications(controller.signal);
        if (!controller.signal.aborted) {
          setNotifications(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching notifications:', getErrorMessage(error));
          setLoading(false);
        }
      }
    };

    fetchNotifications();
    return () => controller.abort();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await thongBaoService.markAsRead(id);
      setNotifications(prev =>
        prev.map(notification =>
          notification.MaChiTiet === id
            ? { ...notification, TrangThaiDoc: 'da_doc' as const }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', getErrorMessage(error));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await thongBaoService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, TrangThaiDoc: 'da_doc' as const }))
      );
    } catch (error) {
      console.error('Error marking all as read:', getErrorMessage(error));
    }
  };

  const unreadCount = notifications.filter(n => n.TrangThaiDoc === 'chua_doc').length;

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => n.TrangThaiDoc === 'chua_doc');
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <i className="ri-menu-line text-gray-600"></i>
          </button>
          
          <div className="hidden md:flex items-center ml-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Tìm kiếm phòng, khách thuê..."
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 relative"
            >
              <i className="ri-notification-line text-gray-600 text-xl"></i>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-indigo-600 hover:text-indigo-800"
                    >
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                </div>
                
                {/* Filter Tabs */}
                <div className="p-2 border-b border-gray-200 flex items-center text-sm">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 rounded-md ${filter === 'all' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 rounded-md ml-2 ${filter === 'unread' ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    Chưa đọc
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {loading && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Đang tải...
                    </div>
                  )}
                  {!loading && filteredNotifications.length === 0 && (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Không có thông báo nào'}
                    </div>
                  )}
                  {!loading && filteredNotifications.map((notification) => (
                    <div
                      key={notification.MaChiTiet}
                      onClick={() => {
                        if (notification.TrangThaiDoc === 'chua_doc') {
                          handleMarkAsRead(notification.MaChiTiet);
                        }
                        // No link navigation for now
                      }}
                      className={`p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                        notification.TrangThaiDoc === 'chua_doc' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <p className={`text-sm ${
                          notification.TrangThaiDoc === 'chua_doc' ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.ThongBao.NoiDung}
                        </p>
                        {notification.TrangThaiDoc === 'chua_doc' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1.5 flex-shrink-0"></span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {notification.ThongBao.Loai}
                        </span>
                        <p className="text-xs text-gray-500">
                          {notification.ThongBao.ThoiGianGuiThucTe}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu with Logout */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
