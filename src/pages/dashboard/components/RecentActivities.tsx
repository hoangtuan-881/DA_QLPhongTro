import { RecentActivity } from '@/services/dashboard.service';

interface RecentActivitiesProps {
  data: RecentActivity[];
}

export default function RecentActivities({ data }: RecentActivitiesProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Chưa có hoạt động nào
        </div>
      </div>
    );
  }

  const activities = data.map((activity, index) => ({
    id: index + 1,
    type: activity.LoaiHoatDong,
    title: activity.TieuDe,
    description: activity.MoTa,
    time: activity.ThoiGianHienThi,
    icon: activity.Icon,
    color: activity.Color
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
        <button className="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
          Xem tất cả
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
              <i className={`${activity.icon} text-lg`}></i>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.description}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
