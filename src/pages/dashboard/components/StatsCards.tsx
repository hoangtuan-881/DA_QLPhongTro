import { DashboardStats } from '@/services/dashboard.service';

interface StatsCardsProps {
  data: DashboardStats | null;
}

export default function StatsCards({ data }: StatsCardsProps) {
  if (!data) {
    return null;
  }

  // Format currency (VND)
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    }
    if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';
    }
    return amount.toString();
  };

  const stats = [
    {
      title: 'Tổng số phòng',
      value: data.TongSoPhong.toString(),
      change: '',
      changeType: 'neutral',
      icon: 'ri-home-4-line',
      color: 'bg-blue-500'
    },
    {
      title: 'Phòng đã thuê',
      value: data.PhongDaThue.toString(),
      change: data.ThayDoiPhongThue >= 0 ? `+${data.ThayDoiPhongThue}` : data.ThayDoiPhongThue.toString(),
      changeType: data.ThayDoiPhongThue >= 0 ? 'increase' : 'decrease',
      icon: 'ri-user-line',
      color: 'bg-green-500'
    },
    {
      title: 'Phòng trống',
      value: data.PhongTrong.toString(),
      change: data.ThayDoiPhongTrong >= 0 ? `+${data.ThayDoiPhongTrong}` : data.ThayDoiPhongTrong.toString(),
      changeType: data.ThayDoiPhongTrong <= 0 ? 'increase' : 'decrease', // Phòng trống giảm = tốt
      icon: 'ri-home-line',
      color: 'bg-yellow-500'
    },
    {
      title: 'Doanh thu tháng',
      value: formatCurrency(data.DoanhThuThang),
      change: data.ThayDoiDoanhThu >= 0 ? `+${data.ThayDoiDoanhThu.toFixed(1)}%` : `${data.ThayDoiDoanhThu.toFixed(1)}%`,
      changeType: data.ThayDoiDoanhThu >= 0 ? 'increase' : 'decrease',
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <i className={`${stat.icon} text-white text-xl`}></i>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
