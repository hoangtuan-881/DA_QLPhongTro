
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../dashboard/components/Sidebar';

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2024');

  // Mock data for analytics
  const roomStats = {
    total: 20,
    occupied: 17,
    vacant: 3,
    occupancyRate: 85
  };

  const revenueData = {
    currentMonth: 68500000,
    lastMonth: 65200000,
    growth: 5.1,
    yearToDate: 756800000
  };

  const monthlyRevenue = [
    { month: 'T1', revenue: 62000000 },
    { month: 'T2', revenue: 64500000 },
    { month: 'T3', revenue: 63800000 },
    { month: 'T4', revenue: 66200000 },
    { month: 'T5', revenue: 67100000 },
    { month: 'T6', revenue: 68900000 },
    { month: 'T7', revenue: 70200000 },
    { month: 'T8', revenue: 69800000 },
    { month: 'T9', revenue: 71500000 },
    { month: 'T10', revenue: 72300000 },
    { month: 'T11', revenue: 68500000 },
    { month: 'T12', revenue: 0 }
  ];

  const expenseData = {
    electricity: 12500000,
    water: 3200000,
    maintenance: 5800000,
    cleaning: 2100000,
    other: 1900000
  };

  const topRooms = [
    { room: '201', revenue: 4200000, tenant: 'Nguyễn Văn An' },
    { room: '203', revenue: 4000000, tenant: 'Trần Thị Bình' },
    { room: '301', revenue: 3800000, tenant: 'Lê Văn Cường' },
    { room: '302', revenue: 3600000, tenant: 'Phạm Thị Dung' },
    { room: '101', revenue: 3500000, tenant: 'Hoàng Văn Em' }
  ];

  const recentTransactions = [
    { id: 1, type: 'payment', description: 'Thu tiền phòng 201 - Tháng 1', amount: 4200000, date: '2024-01-20' },
    { id: 2, type: 'expense', description: 'Tiền điện tháng 1', amount: -12500000, date: '2024-01-19' },
    { id: 3, type: 'payment', description: 'Thu tiền phòng 203 - Tháng 1', amount: 4000000, date: '2024-01-18' },
    { id: 4, type: 'expense', description: 'Sửa chữa điều hòa phòng 301', amount: -1200000, date: '2024-01-17' },
    { id: 5, type: 'payment', description: 'Thu tiền phòng 301 - Tháng 1', amount: 3800000, date: '2024-01-16' }
  ];

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

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
                <h1 className="text-xl font-semibold text-gray-900">Báo cáo & Thống kê</h1>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                  <option value="year">Năm này</option>
                </select>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap">
                  <i className="ri-download-line mr-2"></i>
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ri-home-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                    <p className="text-2xl font-semibold text-gray-900">{roomStats.total}</p>
                    <p className="text-sm text-gray-500">
                      {roomStats.occupied} đã thuê, {roomStats.vacant} trống
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-percent-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
                    <p className="text-2xl font-semibold text-gray-900">{roomStats.occupancyRate}%</p>
                    <p className="text-sm text-green-600">+2.5% so với tháng trước</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-indigo-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(revenueData.currentMonth / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-green-600">+{revenueData.growth}% so với tháng trước</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="ri-calendar-line text-yellow-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Doanh thu năm</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {(revenueData.yearToDate / 1000000).toFixed(1)}M
                    </p>
                    <p className="text-sm text-gray-500">Tính đến tháng 11</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Doanh thu theo tháng</h3>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm pr-8"
                  >
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                </div>
                <div className="space-y-3">
                  {monthlyRevenue.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 text-sm text-gray-600">{item.month}</div>
                      <div className="flex-1 mx-3">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="w-16 text-sm text-gray-900 text-right">
                        {item.revenue > 0 ? `${(item.revenue / 1000000).toFixed(1)}M` : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expense Breakdown */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Chi phí tháng này</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Tiền điện</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(expenseData.electricity / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Tiền nước</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(expenseData.water / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Bảo trì</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(expenseData.maintenance / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Vệ sinh</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(expenseData.cleaning / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">Khác</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {(expenseData.other / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="border-t pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Tổng chi phí</span>
                      <span className="text-sm font-semibold text-red-600">
                        {((expenseData.electricity + expenseData.water + expenseData.maintenance + expenseData.cleaning + expenseData.other) / 1000000).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Performing Rooms */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Top phòng doanh thu cao</h3>
                <div className="space-y-4">
                  {topRooms.map((room, index) => (
                    <div key={room.room} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-indigo-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Phòng {room.room}</div>
                          <div className="text-xs text-gray-500">{room.tenant}</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-indigo-600">
                        {(room.revenue / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Giao dịch gần đây</h3>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          transaction.type === 'payment' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          <i className={`text-sm ${
                            transaction.type === 'payment' 
                              ? 'ri-arrow-down-line text-green-600' 
                              : 'ri-arrow-up-line text-red-600'
                          }`}></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                          <div className="text-xs text-gray-500">{transaction.date}</div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{(transaction.amount / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
