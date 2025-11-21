import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { baoCaoService, BaoCaoTongQuan, BaoCaoSoSanhThang } from '@/services/bao-cao.service';
import { useToast } from '@/hooks/useToast';
import { getErrorMessage } from '@/lib/http-client';

export default function ReportsAnalytics() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview');
  const [selectedYear, setSelectedYear] = useState('2025');

  // Default to current month
  const getCurrentMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // API data state for Overview tab
  const [baoCaoData, setBaoCaoData] = useState<BaoCaoTongQuan | null>(null);
  const [loading, setLoading] = useState(true);

  // API data state for Reports tab
  const [soSanhThangData, setSoSanhThangData] = useState<BaoCaoSoSanhThang[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const toast = useToast();

  // Fetch data from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchBaoCao = async () => {
      try {
        setLoading(true);
        const response = await baoCaoService.getTongQuan(parseInt(selectedYear), controller.signal);
        if (!controller.signal.aborted) {
          setBaoCaoData(response.data.data || null);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải báo cáo', message: getErrorMessage(error) });
          setLoading(false);
        }
      }
    };

    fetchBaoCao();
    return () => controller.abort();
  }, [selectedYear]);

  // Fetch monthly comparison data for Reports tab
  useEffect(() => {
    const controller = new AbortController();

    const fetchSoSanhThang = async () => {
      try {
        setLoadingReports(true);
        const response = await baoCaoService.getSoSanhThang(selectedMonth, 6, controller.signal);
        if (!controller.signal.aborted) {
          setSoSanhThangData(response.data.data || []);
          setLoadingReports(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải báo cáo so sánh', message: getErrorMessage(error) });
          setLoadingReports(false);
        }
      }
    };

    fetchSoSanhThang();
    return () => controller.abort();
  }, [selectedMonth]);

  // Computed values from API data
  const roomStats = baoCaoData
    ? {
        total: baoCaoData.Kpi.TongSoPhong,
        occupied: Math.round((baoCaoData.Kpi.TongSoPhong * baoCaoData.Kpi.TyLeLapDay) / 100),
        vacant: Math.round(baoCaoData.Kpi.TongSoPhong * (1 - baoCaoData.Kpi.TyLeLapDay / 100)),
        occupancyRate: baoCaoData.Kpi.TyLeLapDay,
      }
    : { total: 0, occupied: 0, vacant: 0, occupancyRate: 0 };

  const revenueData = baoCaoData
    ? (() => {
        const currentMonthRevenue = baoCaoData.Kpi.DoanhThuThangHienTai;

        // Find current month number
        const now = new Date();
        const currentMonthNum = now.getMonth() + 1; // 1-12
        const lastMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;

        // Find last month revenue
        const lastMonthData = baoCaoData.DoanhThu12Thang.find(
          (item) => item.Thang === lastMonthNum
        );
        const lastMonthRevenue = lastMonthData?.DoanhThu || 0;

        const growth = lastMonthRevenue > 0
          ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

        return {
          currentMonth: currentMonthRevenue,
          lastMonth: lastMonthRevenue,
          growth,
          yearToDate: baoCaoData.Kpi.DoanhThuNam,
        };
      })()
    : { currentMonth: 0, lastMonth: 0, growth: 0, yearToDate: 0 };

  const monthlyRevenue = baoCaoData
    ? baoCaoData.DoanhThu12Thang.map((item) => ({
        month: `T${item.Thang}`,
        revenue: item.DoanhThu,
      }))
    : [];
  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m) => m.revenue)) : 1;

  const topRooms = baoCaoData
    ? baoCaoData.TopDoanhThuPhong.map((item) => ({
        room: item.TenPhong,
        revenue: item.TongDoanhThu,
        tenant: item.TenKhachThue,
      }))
    : [];

  const recentTransactions = baoCaoData
    ? baoCaoData.ThanhToanGanDay.map((item) => ({
        id: item.id,
        type: 'payment' as const,
        description: `Thu tiền ${item.TenPhong}`,
        amount: item.SoTien,
        date: item.NgayThanhToan,
      }))
    : [];

  // Computed values for Reports tab from soSanhThangData
  const currentData = soSanhThangData.length > 0 ? soSanhThangData[0] : null;
  const previousData = soSanhThangData.length > 1 ? soSanhThangData[1] : null;

  const revenueGrowth = currentData && previousData && previousData.DoanhThu > 0
    ? (((currentData.DoanhThu - previousData.DoanhThu) / previousData.DoanhThu) * 100).toFixed(1)
    : '0.0';

  // Generate month options for selector (last 12 months)
  const generateMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const value = `${year}-${month}`;
      const label = `Tháng ${parseInt(month)}/${year}`;
      options.push({ value, label });
    }
    return options;
  };
  const monthOptions = generateMonthOptions();

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
              className="hidden bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition whitespace-nowrap"
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
                      <option value="2025">2025</option>
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
                      {monthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-500">Chọn tháng để so sánh với 6 tháng trước</span>
                  </div>
                )}
              </div>
            </div>

            {activeTab === 'overview' && (
              <>
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}

                {!loading && !baoCaoData && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Không có dữ liệu báo cáo</p>
                  </div>
                )}

                {!loading && baoCaoData && (
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
                        <p className="text-2xl font-semibold text-gray-900">{roomStats.occupancyRate.toFixed(2)}%</p>
                        <p className="text-sm text-gray-500">{roomStats.occupied}/{roomStats.total} phòng</p>
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
                        <p className={`text-sm ${revenueData.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {revenueData.growth >= 0 ? '+' : ''}{revenueData.growth.toFixed(1)}% so với tháng trước
                        </p>
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
                        <p className="text-sm text-gray-500">Tính đến tháng {new Date().getMonth() + 1}</p>
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
                        <option value="2025">2025</option>
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
                      {recentTransactions.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">Chưa có giao dịch gần đây</p>
                      ) : (
                        recentTransactions.map((t) => (
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
                      ))
                      )}
                    </div>
                  </div>
                </div>
                </>
                )}
              </>
            )}

            {activeTab === 'reports' && (
              <>
                {loadingReports && (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}

                {!loadingReports && !currentData && (
                  <div className="text-center py-12 text-gray-500">
                    <p>Không có dữ liệu báo cáo cho tháng này</p>
                  </div>
                )}

                {!loadingReports && currentData && (
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Doanh thu</p>
                        <p className="text-2xl font-bold text-gray-900">{currentData.DoanhThu.toLocaleString('vi-VN')}đ</p>
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
                        <p className="text-2xl font-bold text-gray-900">{currentData.TyLeLapDay.toFixed(2)}%</p>
                        <p className="text-sm text-gray-500">{currentData.SoPhongDaThue}/{currentData.TongSoPhong} phòng</p>
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
                      {soSanhThangData.slice().reverse().map((d) => {
                        const maxRevenue = Math.max(...soSanhThangData.map((x) => x.DoanhThu));
                        return (
                        <div key={d.Thang} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-blue-500 rounded-t w-full"
                            style={{ height: `${maxRevenue > 0 ? (d.DoanhThu / maxRevenue) * 200 : 20}px`, minHeight: '20px' }}
                          />
                          <div className="text-xs text-gray-600 mt-2">T{d.Thang.split('-')[1]}</div>
                          <div className="text-xs font-medium text-gray-900">{(d.DoanhThu / 1_000_000).toFixed(0)}M</div>
                        </div>
                      )})}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lấp đầy</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      {soSanhThangData.slice().reverse().map((d) => (
                        <div key={d.Thang} className="flex flex-col items-center flex-1">
                          <div
                            className="bg-green-500 rounded-t w-full"
                            style={{ height: `${(d.TyLeLapDay / 100) * 200}px`, minHeight: '20px' }}
                          />
                          <div className="text-xs text-gray-600 mt-2">T{d.Thang.split('-')[1]}</div>
                          <div className="text-xs font-medium text-gray-900">{d.TyLeLapDay.toFixed(1)}%</div>
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
                        <span className="font-medium">{currentData.TongSoPhong}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phòng đã thuê</span>
                        <span className="font-medium text-green-600">{currentData.SoPhongDaThue}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Phòng trống</span>
                        <span className="font-medium text-orange-600">{currentData.TongSoPhong - currentData.SoPhongDaThue}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-600">Khách thuê mới</span>
                        <span className="font-medium text-blue-600">{currentData.SoKhachMoi}</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-600">Hợp đồng kết thúc</span>
                        <span className="font-medium text-red-600">{currentData.SoHopDongKetThuc}</span>
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
                        {soSanhThangData.map((d) => (
                          <tr key={d.Thang} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                Tháng {d.Thang.split('-')[1]}/{d.Thang.split('-')[0]}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-green-600 font-medium">{d.DoanhThu.toLocaleString('vi-VN')}đ</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{d.TyLeLapDay.toFixed(2)}%</div>
                              <div className="text-sm text-gray-500">{d.SoPhongDaThue}/{d.TongSoPhong} phòng</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{d.SoKhachMoi}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}