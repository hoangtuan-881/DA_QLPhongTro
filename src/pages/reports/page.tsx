import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';

export default function ReportsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('2024-03');

  const roomStats = { total: 20, occupied: 17, vacant: 3, occupancyRate: 85 };
  const revenueData = { currentMonth: 68500000, lastMonth: 65200000, growth: 5.1, yearToDate: 756800000 };

  const monthlyRevenue = [
    { month: 'T1', revenue: 62000000 }, { month: 'T2', revenue: 64500000 },
    { month: 'T3', revenue: 63800000 }, { month: 'T4', revenue: 66200000 },
    { month: 'T5', revenue: 67100000 }, { month: 'T6', revenue: 68900000 },
    { month: 'T7', revenue: 70200000 }, { month: 'T8', revenue: 69800000 },
    { month: 'T9', revenue: 71500000 }, { month: 'T10', revenue: 72300000 },
    { month: 'T11', revenue: 68500000 }, { month: 'T12', revenue: 0 },
  ];
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue));

  const topRooms = [
    { room: '201', revenue: 4200000, tenant: 'Nguyễn Văn An' },
    { room: '203', revenue: 4000000, tenant: 'Trần Thị Bình' },
    { room: '301', revenue: 3800000, tenant: 'Lê Văn Cường' },
    { room: '302', revenue: 3600000, tenant: 'Phạm Thị Dung' },
    { room: '101', revenue: 3500000, tenant: 'Hoàng Văn Em' },
  ];

  const recentTransactions = [
    { id: 1, type: 'payment', description: 'Thu tiền phòng 201 - Tháng 1', amount: 4200000, date: '2024-01-20' },
    { id: 3, type: 'payment', description: 'Thu tiền phòng 203 - Tháng 1', amount: 4000000, date: '2024-01-18' },
    { id: 5, type: 'payment', description: 'Thu tiền phòng 301 - Tháng 1', amount: 3800000, date: '2024-01-16' },
  ];

  interface ReportData {
    month: string;
    revenue: number;
    occupancyRate: number;
    totalRooms: number;
    occupiedRooms: number;
    newTenants: number;
    terminatedContracts: number;
  }

  const mockReportData: ReportData[] = [
    { month: '2024-01', revenue: 45000000, occupancyRate: 85, totalRooms: 20, occupiedRooms: 17, newTenants: 3, terminatedContracts: 1 },
    { month: '2024-02', revenue: 48000000, occupancyRate: 90, totalRooms: 20, occupiedRooms: 18, newTenants: 2, terminatedContracts: 1 },
    { month: '2024-03', revenue: 52000000, occupancyRate: 95, totalRooms: 20, occupiedRooms: 19, newTenants: 4, terminatedContracts: 2 },
  ];
  const currentData = mockReportData.find((d) => d.month === selectedMonth) || mockReportData[mockReportData.length - 1];
  const previousData = mockReportData[mockReportData.length - 2];
  const getGrowthRate = (current: number, previous: number) => (!previous ? '0.0' : (((current - previous) / previous) * 100).toFixed(1));
  const revenueGrowth = getGrowthRate(currentData.revenue, previousData?.revenue || 0);

  const handleExport = () => {
    alert('Đang chuẩn bị xuất báo cáo (demo).');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Báo cáo & Thống kê</h1>
            <button
              onClick={handleExport}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
            >
              <i className="ri-download-line mr-2" />Xuất báo cáo
            </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'overview'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Thống kê
                  </button>
                  <button
                    onClick={() => setActiveTab('reports')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'reports'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Báo cáo
                  </button>
                </nav>
              </div>

              <div className="p-4">
                {activeTab === 'overview' && (
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                    >
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                    <span className="text-sm text-gray-500">Chọn năm để xem thống kê tổng quan</span>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="flex flex-wrap gap-3 items-center">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm pr-8"
                    >
                      <option value="2024-01">Tháng 1/2024</option>
                      <option value="2024-02">Tháng 2/2024</option>
                      <option value="2024-03">Tháng 3/2024</option>
                    </select>
                    <span className="text-sm text-gray-500">Chọn tháng để tạo báo cáo chi tiết</span>
                  </div>
                )}
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <i className="ri-home-line text-blue-600 text-xl" />
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
                        <i className="ri-percent-line text-green-600 text-xl" />
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
                        <i className="ri-money-dollar-circle-line text-indigo-600 text-xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                        <p className="text-2xl font-semibold text-gray-900">{(revenueData.currentMonth / 1_000_000).toFixed(1)}M</p>
                        <p className="text-sm text-green-600">+{revenueData.growth}% so với tháng trước</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <i className="ri-calendar-line text-yellow-600 text-xl" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Doanh thu năm</p>
                        <p className="text-2xl font-semibold text-gray-900">{(revenueData.yearToDate / 1_000_000).toFixed(1)}M</p>
                        <p className="text-sm text-gray-500">Tính đến tháng 11</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 mb-8">
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
                      {monthlyRevenue.map((item) => (
                        <div key={item.month} className="flex items-center">
                          <div className="w-8 text-sm text-gray-600">{item.month}</div>
                          <div className="flex-1 mx-3">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="w-16 text-sm text-gray-900 text-right">
                            {item.revenue > 0 ? `${(item.revenue / 1_000_000).toFixed(1)}M` : '-'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          <div className="text-sm font-medium text-indigo-600">{(room.revenue / 1_000_000).toFixed(1)}M</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Giao dịch thu tiền gần đây</h3>
                    <div className="space-y-4">
                      {recentTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${t.type === 'payment' ? 'bg-green-100' : 'bg-red-100'}`}>
                              <i className={`text-sm ${t.type === 'payment' ? 'ri-arrow-down-line text-green-600' : 'ri-arrow-up-line text-red-600'}`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{t.description}</div>
                              <div className="text-xs text-gray-500">{t.date}</div>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {t.amount > 0 ? '+' : ''}{(t.amount / 1_000_000).toFixed(1)}M
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'reports' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                        <p className="text-2xl font-bold text-gray-900">{currentData.revenue.toLocaleString('vi-VN')}đ</p>
                        <p className={`text-sm ${parseFloat(revenueGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}% so với tháng trước
                        </p>
                      </div>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <i className="ri-money-dollar-circle-line text-green-600 text-xl" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tỷ lệ lấp đầy</p>
                        <p className="text-2xl font-bold text-gray-900">{currentData.occupancyRate}%</p>
                        <p className="text-sm text-gray-500">{currentData.occupiedRooms}/{currentData.totalRooms} phòng</p>
                      </div>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <i className="ri-home-line text-purple-600 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {mockReportData.map((d) => (
                        <div key={d.month} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-blue-500 rounded-t w-full"
                            style={{ height: `${(d.revenue / Math.max(...mockReportData.map((x) => x.revenue))) * 200}px`, minHeight: '20px' }}
                          />
                          <div className="text-xs text-gray-600 mt-2">T{d.month.split('-')[1]}</div>
                          <div className="text-xs font-medium text-gray-900">{(d.revenue / 1_000_000).toFixed(0)}M</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {mockReportData.map((d) => (
                        <div key={d.month} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-green-500 rounded-t w-full"
                            style={{ height: `${(d.occupancyRate / 100) * 200}px`, minHeight: '20px' }}
                          />
                          <div className="text-xs text-gray-600 mt-2">T{d.month.split('-')[1]}</div>
                          <div className="text-xs font-medium text-gray-900">{d.occupancyRate}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
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
                        <span className="font-medium text-orange-600">{currentData.totalRooms - currentData.occupiedRooms}</span>
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

                <div className="bg-white rounded-lg shadow-sm mt-8 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">So sánh theo tháng</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tỷ lệ lấp đầy</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách mới</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mockReportData.map((d) => (
                          <tr key={d.month} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                Tháng {d.month.split('-')[1]}/{d.month.split('-')[0]}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600 font-medium">{d.revenue.toLocaleString('vi-VN')}đ</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{d.occupancyRate}%</div>
                              <div className="text-sm text-gray-500">{d.occupiedRooms}/{d.totalRooms} phòng</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{d.newTenants}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}