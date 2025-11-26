
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CustomerSidebar from './components/CustomerSidebar';
import CustomerHeader from './components/CustomerHeader';
import RoomStatus from './components/RoomStatus';
import ContractInfo from './components/ContractInfo';
import CustomerOverview from './components/CustomerOverview';
import CustomerViolationReport from './components/CustomerViolationReport';
import CustomerInvoices from './components/CustomerInvoices';
import MaintenanceRequest from './components/CustomerMaintenceRequest';

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
      case 'violations':
        return <CustomerViolationReport />;
      case 'invoices':
        return <CustomerInvoices />;
      case 'maintenance':
        return <MaintenanceRequest />;
      default:
        return <CustomerOverview />;
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
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}