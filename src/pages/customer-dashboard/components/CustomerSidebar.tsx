import { Link, useLocation, useNavigate } from 'react-router-dom';

interface CustomerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function CustomerSidebar({ isOpen, onClose, activeTab, setActiveTab }: CustomerSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      id: 'overview',
      icon: 'ri-dashboard-line',
      label: 'Tổng quan',
      path: '/customer-dashboard',
      isDashboard: true
    },
    {
      id: 'room',
      icon: 'ri-home-4-line',
      label: 'Phòng của tôi',
      path: '/customer-dashboard',
      isDashboard: true
    },
    {
      id: 'invoices',
      icon: 'ri-bill-line',
      label: 'Hóa đơn',
      path: '/customer-dashboard',
      isDashboard: true
    },
    {
      id: 'contract',
      icon: 'ri-file-text-line',
      label: 'Hợp đồng',
      path: '/customer-dashboard',
      isDashboard: true
    },
    {
      id: 'violations',
      icon: 'ri-error-warning-line',
      label: 'Nội quy và vi phạm',
      path: '/customer-dashboard',
      isDashboard: true
    },
    {
      id: 'maintenance',
      icon: 'ri-tools-line',
      label: 'Yêu cầu sửa chữa',
      path: '/customer-dashboard',
      isDashboard: true
    },
  ];

  const handleDashboardTabClick = (tabId: string) => {
    onClose();

    // Nếu đang ở trang khác, navigate về customer-dashboard
    if (location.pathname !== '/customer-dashboard') {
      navigate('/customer-dashboard', {
        state: { activeTab: tabId },
        replace: true
      });
    } else {
      // Nếu đã ở trang dashboard, chỉ cần set tab
      if (setActiveTab) {
        setActiveTab(tabId);
      }
    }
  };

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
            <span className="ml-3 text-lg font-semibold text-gray-900">Khách thuê</span>
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
            item.isDashboard ? (
              <button
                key={item.id}
                onClick={() => handleDashboardTabClick(item.id)}
                className={`w-full flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${activeTab === item.id && location.pathname === '/customer-dashboard'
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <i className={`${item.icon} text-lg mr-3`}></i>
                {item.label}
              </button>
            ) : (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center px-3 py-3 mb-1 text-sm font-medium rounded-lg transition-colors ${location.pathname === item.path
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={onClose}
              >
                <i className={`${item.icon} text-lg mr-3`}></i>
                {item.label}
              </Link>
            )
          ))}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <Link
            to="/login"
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50"
            onClick={onClose}
          >
            <i className="ri-logout-box-line text-lg mr-3"></i>
            Đăng xuất
          </Link>
        </div>
      </div>
    </>
  );
}