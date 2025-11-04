
export default function RoomChart() {
  const roomData = [
    { floor: 'Tầng 1', total: 12, occupied: 10, vacant: 2 },
    { floor: 'Tầng 2', total: 12, occupied: 11, vacant: 1 },
    { floor: 'Tầng 3', total: 12, occupied: 9, vacant: 3 },
    { floor: 'Tầng 4', total: 12, occupied: 12, vacant: 0 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Tình trạng phòng theo tầng</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Đã thuê</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
            <span className="text-gray-600">Trống</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {roomData.map((floor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">{floor.floor}</span>
              <span className="text-sm text-gray-500">{floor.occupied}/{floor.total}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(floor.occupied / floor.total) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{floor.occupied} phòng đã thuê</span>
              <span>{floor.vacant} phòng trống</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Tỷ lệ lấp đầy</p>
            <p className="text-2xl font-bold text-green-600">87.5%</p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="87.5, 100"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
