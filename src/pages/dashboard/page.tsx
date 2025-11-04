
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import RecentActivities from './components/RecentActivities';
import RoomChart from './components/RoomChart';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Tổng quan hệ thống quản lý phòng trọ</p>
            </div>

            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RoomChart />
              <RecentActivities />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
