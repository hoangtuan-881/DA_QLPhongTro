
export default function StatsCards() {
  const stats = [
    {
      title: 'Tổng số phòng',
      value: '48',
      change: '+2',
      changeType: 'increase',
      icon: 'ri-home-4-line',
      color: 'bg-blue-500'
    },
    {
      title: 'Phòng đã thuê',
      value: '42',
      change: '+5',
      changeType: 'increase',
      icon: 'ri-user-line',
      color: 'bg-green-500'
    },
    {
      title: 'Phòng trống',
      value: '6',
      change: '-3',
      changeType: 'decrease',
      icon: 'ri-home-line',
      color: 'bg-yellow-500'
    },
    {
      title: 'Doanh thu tháng',
      value: '125.5M',
      change: '+12%',
      changeType: 'increase',
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
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
              </div>
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
