
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';

interface ReportData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  occupancyRate: number;
  totalRooms: number;
  occupiedRooms: number;
  newTenants: number;
  terminatedContracts: number;
}

const mockReportData: ReportData[] = [
  {
    month: '2024-01',
    revenue: 45000000,
    expenses: 8500000,
    profit: 36500000,
    occupancyRate: 85,
    totalRooms: 20,
    occupiedRooms: 17,
    newTenants: 3,
    terminatedContracts: 1
  },
  {
    month: '2024-02',
    revenue: 48000000,
    expenses: 9200000,
    profit: 38800000,
    occupancyRate: 90,
    totalRooms: 20,
    occupiedRooms: 18,
    newTenants: 2,
    terminatedContracts: 1
  },
  {
    month: '2024-03',
    revenue: 52000000,
    expenses: 10100000,
    profit: 41900000,
    occupancyRate: 95,
    totalRooms: 20,
    occupiedRooms: 19,
    newTenants: 4,
    terminatedContracts: 2
  }
];

export default function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState('2024-03');

  const currentData = mockReportData.find(data => data.month === selectedMonth) || mockReportData[mockReportData.length - 1];

  const getGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const previousData = mockReportData[mockReportData.length - 2];
  const revenueGrowth = getGrowthRate(currentData.revenue, previousData?.revenue || 0);
  const profitGrowth = getGrowthRate(currentData.profit, previousData?.profit || 0);

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
                <h1 className="text-xl font-semibold text-gray-900">Báo cáo thống kê</h1>
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="2024-01">Tháng 1/2024</option>
                  <option value="2024-02">Tháng 2/2024</option>
                  <option value="2024-03">Tháng 3/2024</option>
                </select>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer">
                  <i className="ri-download-line mr-2"></i>
                  Xuất báo cáo
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentData.revenue.toLocaleString('vi-VN')}đ
                    </p>
                    <p className={`text-sm ${parseFloat(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}% so với tháng trước
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <i className="ri-money-dollar-circle-line text-green-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Chi phí</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentData.expenses.toLocaleString('vi-VN')}đ
                    </p>
                    <p className="text-sm text-gray-500">
                      {((currentData.expenses / currentData.revenue) * 100).toFixed(1)}% doanh thu
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 rounded-lg">
                    <i className="ri-money-dollar-circle-line text-red-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lợi nhuận</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentData.profit.toLocaleString('vi-VN')}đ
                    </p>
                    <p className={`text-sm ${parseFloat(profitGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(profitGrowth) >= 0 ? '+' : ''}{profitGrowth}% so với tháng trước
                    </p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <i className="ri-line-chart-line text-blue-600 text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
                    <p className="text-2xl font-bold text-gray-900">{currentData.occupancyRate}%</p>
                    <p className="text-sm text-gray-500">
                      {currentData.occupiedRooms}/{currentData.totalRooms} phòng
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <i className="ri-home-line text-purple-600 text-xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Revenue Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {mockReportData.map((data, index) => (
                    <div key={data.month} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-blue-500 rounded-t w-full"
                        style={{ 
                          height: `${(data.revenue / Math.max(...mockReportData.map(d => d.revenue))) * 200}px`,
                          minHeight: '20px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">
                        T{data.month.split('-')[1]}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {(data.revenue / 1000000).toFixed(0)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Occupancy Chart */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {mockReportData.map((data, index) => (
                    <div key={data.month} className="flex flex-col items-center flex-1">
                      <div 
                        className="bg-green-500 rounded-t w-full"
                        style={{ 
                          height: `${(data.occupancyRate / 100) * 200}px`,
                          minHeight: '20px'
                        }}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2">
                        T{data.month.split('-')[1]}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {data.occupancyRate}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt tài chính</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tổng doanh thu</span>
                    <span className="font-medium text-green-600">
                      {currentData.revenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Chi phí vận hành</span>
                    <span className="font-medium text-red-600">
                      {currentData.expenses.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Lợi nhuận gộp</span>
                    <span className="font-medium text-blue-600">
                      {currentData.profit.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tỷ suất lợi nhuận</span>
                    <span className="font-medium text-purple-600">
                      {((currentData.profit / currentData.revenue) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy Details */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết lấp đầy</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tổng số phòng</span>
                    <span className="font-medium">{currentData.totalRooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Phòng đã thuê</span>
                    <span className="font-medium text-green-600">{currentData.occupiedRooms}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Phòng trống</span>
                    <span className="font-medium text-orange-600">
                      {currentData.totalRooms - currentData.occupiedRooms}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Khách thuê mới</span>
                    <span className="font-medium text-blue-600">{currentData.newTenants}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Hợp đồng kết thúc</span>
                    <span className="font-medium text-red-600">{currentData.terminatedContracts}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Comparison Table */}
            <div className="bg-white rounded-lg shadow-sm mt-8 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">So sánh theo tháng</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tháng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doanh thu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Chi phí
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lợi nhuận
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tỷ lệ lấp đầy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Khách mới
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockReportData.map((data) => (
                      <tr key={data.month} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            Tháng {data.month.split('-')[1]}/{data.month.split('-')[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600 font-medium">
                            {data.revenue.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-red-600 font-medium">
                            {data.expenses.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-blue-600 font-medium">
                            {data.profit.toLocaleString('vi-VN')}đ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {data.occupancyRate}%
                          </div>
                          <div className="text-sm text-gray-500">
                            {data.occupiedRooms}/{data.totalRooms} phòng
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {data.newTenants}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
