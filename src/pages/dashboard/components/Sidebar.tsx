
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: 'ri-dashboard-line',
    label: 'Tổng quan',
    path: '/dashboard'
  },
  {
    icon: 'ri-building-line',
    label: 'Quản lý loại phòng',
    path: '/room-types'
  },
  {
    icon: 'ri-hotel-bed-line',
    label: 'Quản lý phòng',
    path: '/rooms'
  },
  {
    icon: 'ri-user-line',
    label: 'Quản lý khách thuê',
    path: '/tenants'
  },
  {
    icon: 'ri-calendar-line',
    label: 'Quản lý đặt phòng',
    path: '/bookings'
  },
  {
    icon: 'ri-file-text-line',
    label: 'Quản lý hợp đồng',
    path: '/contracts'
  },
  {
    icon: 'ri-bank-card-line',
    label: 'Quản lý thanh toán',
    path: '/payments'
  },
  {
    icon: 'ri-service-line',
    label: 'Quản lý dịch vụ',
    path: '/services'
  },
  {
    icon: 'ri-tools-line',
    label: 'Quản lý bảo trì',
    path: '/maintenance'
  },
  {
    icon: 'ri-settings-line',
    label: 'Quản lý thiết bị',
    path: '/equipment'
  },
  {
    icon: 'ri-file-list-line',
    label: 'Báo cáo & Thống kê',
    path: '/reports'
  },
  {
    icon: 'ri-shield-line',
    label: 'Nội quy và vi phạm',
    path: '/rules'
  },
  {
    icon: 'ri-notification-line',
    label: 'Quản lý thông báo',
    path: '/notifications'
  },
  {
    icon: 'ri-user-settings-line',
    label: 'Quản lý tài khoản',
    path: '/user-management'
  },
  {
    icon: 'ri-team-line',
    label: 'Quản lý nhân viên',
    path: '/employees'
  },
  {
    icon: 'ri-settings-3-line',
    label: 'Cài đặt',
    path: '/settings'
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleHomeClick = () => {
    onClose();
    navigate('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={handleHomeClick}
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <i className="ri-home-4-fill text-white text-lg"></i>
            </div>
            <span className="ml-3 text-lg font-semibold text-gray-900">Phòng trọ</span>
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 overflow-y-auto pb-20">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${isActive
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
                }`
              }
              onClick={() => onClose()}
            >
              <i className={`${item.icon} text-lg mr-3`}></i>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <i className="ri-logout-box-line text-lg mr-3"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}
