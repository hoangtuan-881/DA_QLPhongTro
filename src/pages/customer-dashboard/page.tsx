
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerHeader from './components/CustomerHeader';
import RoomStatus from './components/RoomStatus';
import ContractInfo from './components/ContractInfo';
import CustomerOverview from './components/CustomerOverview';

export default function CustomerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const location = useLocation();

  // Xử lý activeTab từ navigation state
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear state sau khi đã set
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CustomerOverview />;
      case 'room':
        return <RoomStatus />;
      case 'contract':
        return <ContractInfo />;
      default:
        return <RoomStatus />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomerHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang cá nhân</h1>
              <p className="text-gray-600">Quản lý thông tin phòng trọ của bạn</p>
            </div>

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}