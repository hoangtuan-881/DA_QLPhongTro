
import { Link, useLocation, useNavigate } from 'react-router-dom';

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
    icon: 'ri-price-tag-3-line', 
    label: 'Loại phòng', 
    path: '/room-types'
  },
  { 
    icon: 'ri-building-line', 
    label: 'Quản lý phòng', 
    path: '/rooms'
  },
  { 
    icon: 'ri-user-line', 
    label: 'Khách thuê', 
    path: '/tenants'
  },
  { 
    icon: 'ri-calendar-line', 
    label: 'Đặt phòng', 
    path: '/bookings'
  },
  { 
    icon: 'ri-money-dollar-circle-line', 
    label: 'Đặt cọc', 
    path: '/booking-deposits'
  },
  { 
    icon: 'ri-file-text-line', 
    label: 'Hợp đồng', 
    path: '/contracts'
  },
  { 
    icon: 'ri-bank-card-line', 
    label: 'Thanh toán', 
    path: '/payments'
  },
  { 
    icon: 'ri-customer-service-line', 
    label: 'Dịch vụ', 
    path: '/services'
  },
  { 
    icon: 'ri-tools-line', 
    label: 'Bảo trì', 
    path: '/maintenance'
  },
  { 
    icon: 'ri-settings-line', 
    label: 'Thiết bị', 
    path: '/equipment'
  },
  { 
    icon: 'ri-file-list-line', 
    label: 'Báo cáo', 
    path: '/reports'
  },
  { 
    icon: 'ri-bar-chart-line', 
    label: 'Phân tích', 
    path: '/analytics'
  },
  { 
    icon: 'ri-shield-line', 
    label: 'Nội quy', 
    path: '/rules'
  },
  { 
    icon: 'ri-alert-line', 
    label: 'Vi phạm', 
    path: '/rules-violations'
  },
  { 
    icon: 'ri-notification-line', 
    label: 'Thông báo', 
    path: '/notifications'
  },
  { 
    icon: 'ri-user-settings-line', 
    label: 'Quản lý tài khoản', 
    path: '/user-management'
  },
  { 
    icon: 'ri-settings-3-line', 
    label: 'Cài đặt', 
    path: '/settings'
  }
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = () => {
    onClose();
    navigate('/');
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
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
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
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => onClose()}
            >
              <i className={`${item.icon} text-lg mr-3`}></i>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
            <i className="ri-logout-box-line text-lg mr-3"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </>
  );
}
