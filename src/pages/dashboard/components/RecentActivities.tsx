
export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: 'payment',
      title: 'Thanh toán tiền phòng',
      description: 'Nguyễn Văn A - Phòng 101',
      time: '2 giờ trước',
      icon: 'ri-money-dollar-circle-line',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 2,
      type: 'booking',
      title: 'Đặt phòng mới',
      description: 'Trần Thị B - Phòng 205',
      time: '4 giờ trước',
      icon: 'ri-calendar-check-line',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 3,
      type: 'maintenance',
      title: 'Yêu cầu bảo trì',
      description: 'Sửa chữa điều hòa - Phòng 303',
      time: '6 giờ trước',
      icon: 'ri-tools-line',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 4,
      type: 'contract',
      title: 'Gia hạn hợp đồng',
      description: 'Lê Văn C - Phòng 102',
      time: '1 ngày trước',
      icon: 'ri-file-text-line',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 5,
      type: 'violation',
      title: 'Vi phạm nội quy',
      description: 'Tiếng ồn - Phòng 401',
      time: '2 ngày trước',
      icon: 'ri-shield-check-line',
      color: 'bg-red-100 text-red-600'
    }
  ];

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
