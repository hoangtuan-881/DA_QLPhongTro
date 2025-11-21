
import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import RecentActivities from './components/RecentActivities';
import RoomChart from './components/RoomChart';
import { useAuth } from '@/contexts/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useToast } from '@/hooks/useToast';
import dashboardService, {
  DashboardStats,
  RoomStatusByBuilding,
  RecentActivity,
} from '@/services/dashboard.service';
import { getErrorMessage } from '@/lib/http-client';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [roomStatusData, setRoomStatusData] = useState<RoomStatusByBuilding | null>(null);
  const [activitiesData, setActivitiesData] = useState<RecentActivity[]>([]);
  const { user } = useAuth();
  const toast = useToast();

  useDocumentTitle('Trang chủ');

  // Fetch all dashboard data
  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all 3 endpoints in parallel
        const [statsResponse, roomStatusResponse, activitiesResponse] = await Promise.all([
          dashboardService.getStats(controller.signal),
          dashboardService.getRoomStatusByBuilding(controller.signal),
          dashboardService.getRecentActivities(5, controller.signal),
        ]);

        if (!controller.signal.aborted) {
          setStatsData(statsResponse.data.data || null);
          setRoomStatusData(roomStatusResponse.data.data || null);
          setActivitiesData(activitiesResponse.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({
            title: 'Lỗi tải dữ liệu dashboard',
            message: getErrorMessage(error),
          });
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => controller.abort();
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Tổng quan
                </h1>
                <p className="text-gray-600">
                  Chào mừng trở lại, {user?.nhanVien?.HoTen || user?.khachThue?.HoTen || user?.TenDangNhap}! 👋
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  <StatsCards data={statsData} />

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <RoomChart data={roomStatusData} />
                    <RecentActivities data={activitiesData} />
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
