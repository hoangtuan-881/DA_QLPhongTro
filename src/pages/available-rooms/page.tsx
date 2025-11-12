import { useState } from 'react';
import CustomerHeader from '../customer-dashboard/components/CustomerHeader';
import CustomerSidebar from '../customer-dashboard/components/CustomerSidebar';

export type Room = {
  id: number;
  number: string;
  building: string;
  area: number;
  type: string;
  price: number;
  deposit: number;
  description: string;
  amenities: string[];
  services: { name: string; price: number; unit: string }[];
  nearbyFacilities: string[];
  images: string[];
  status: 'Trống' | 'Sắp trống';
  availableFrom: string; // YYYY-MM-DD
};

// DỮ LIỆU DÙNG CHUNG CHO HOME + TRANG NÀY
export const availableRooms: Room[] = [
  {
    id: 1,
    number: 'B205',
    building: 'A',
    area: 25,
    type: 'Phòng ban công',
    price: 2_600_000,
    deposit: 2_600_000,
    description: 'Phòng studio rộng rãi, đầy đủ nội thát, view đẹp',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Bàn học', 'Wifi'],
    services: [
      { name: 'Điện', price: 3500, unit: 'đ/kwh' },
      { name: 'Nước', price: 60000, unit: 'đ/người' },
      { name: 'Rác', price: 40000, unit: 'đ/phòng' },
      { name: 'Gửi xe', price: 100000, unit: 'đ/xe' },
      { name: 'Internet', price: 50000, unit: 'đ/phòng' },
    ],
    nearbyFacilities: ['Siêu thị Co.opmart (200m)', 'Trường ĐH Kinh tế (500m)', 'Bệnh viện (300m)', 'Ngân hàng Vietcombank (150m)'],
    images: ['/images/room1_1.jpg', '/images/room1_2.jpg', '/images/room1_3.jpg'],
    status: 'Trống',
    availableFrom: '2024-12-15',
  },
  {
    id: 2,
    number: 'A301',
    building: 'B',
    area: 25,
    type: 'Phòng thường',
    price: 2_600_000,
    deposit: 2_600_000,
    description: 'Phòng tiêu chuẩn, thoáng mát, gần trung tâm',
    amenities: ['Điều hòa', 'Giường', 'Tủ quần áo', 'Bàn học'],
    services: [
      { name: 'Điện', price: 3500, unit: 'đ/kwh' },
      { name: 'Nước', price: 60000, unit: 'đ/người' },
      { name: 'Rác', price: 40000, unit: 'đ/phòng' },
      { name: 'Gửi xe', price: 100000, unit: 'đ/xe' },
      { name: 'Internet', price: 50000, unit: 'đ/phòng' },
    ],
    nearbyFacilities: ['Chợ Bến Thành (1km)', 'Trung tâm thương mại (800m)', 'Trạm xe buýt (100m)'],
    images: ['/images/room2_1.jpg', '/images/room2_2.jpg'],
    status: 'Trống',
    availableFrom: '2024-12-20',
  },
  {
    id: 3,
    number: 'B201',
    building: 'C',
    area: 35,
    type: 'Phòng góc',
    price: 2_600_000,
    deposit: 2_600_000,
    description: 'Phòng tiêu chuẩn, thoáng mát, gần trung tâm',
    amenities: ['Điều hòa', 'Tủ lạnh', 'Máy giặt riêng', 'Giường King', 'Tủ quần áo', 'Bàn làm việc', 'Ban công'],
    services: [
      { name: 'Điện', price: 3500, unit: 'đ/kwh' },
      { name: 'Nước', price: 60000, unit: 'đ/người' },
      { name: 'Rác', price: 40000, unit: 'đ/phòng' },
      { name: 'Gửi xe', price: 100000, unit: 'đ/xe' },
      { name: 'Internet', price: 50000, unit: 'đ/phòng' },
    ],
    nearbyFacilities: ['Metro Thanh Xuân (300m)', 'Vincom Center (400m)', 'Công viên Cầu Giấy (200m)', 'Starbucks (250m)'],
    images: ['/images/room3_1.jpg', '/images/room3_2.jpg', '/images/room3_3.jpg', '/images/room3_4.jpg'],
    status: 'Sắp trống',
    availableFrom: '2025-01-01',
  },
  {
    id: 4,
    number: 'A404',
    building: 'D',
    area: 25,
    type: 'Phòng góc',
    price: 2_600_000,
    deposit: 2_600_000,
    description: 'Phòng tiêu chuẩn, thoáng mát, gần trung tâm',
    amenities: ['Điều hòa', 'Tủ lạnh mini', 'Giường', 'Góc bếp nhỏ', 'Tủ quần áo'],
    services: [
      { name: 'Điện', price: 3500, unit: 'đ/kwh' },
      { name: 'Nước', price: 60000, unit: 'đ/người' },
      { name: 'Rác', price: 40000, unit: 'đ/phòng' },
      { name: 'Gửi xe', price: 100000, unit: 'đ/xe' },
      { name: 'Internet', price: 50000, unit: 'đ/phòng' },
    ],
    nearbyFacilities: ['Đại học Bách Khoa (600m)', 'Big C (500m)', 'Café Highlands (300m)'],
    images: ['/images/room4_1.jpg', '/images/room4_2.jpg'],
    status: 'Trống',
    availableFrom: '2024-12-18',
  },
];

export default function AvailableRoomsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const formatPrice = (n: number) => n.toLocaleString('vi-VN');

  const handleViewDetail = (room: Room) => {
    setSelectedRoom(room);
    setShowDetailModal(true);
  };

  const handleDeposit = (room: Room) => {
    setSelectedRoom(room);
    setShowDepositModal(true);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDepositModal(false);
    setSelectedRoom(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <CustomerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <CustomerHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Phòng còn trống</h1>
              <p className="text-gray-600 mt-1">Danh sách các phòng có thể thuê</p>
            </div>

            {/* Danh sách phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Ảnh */}
                  <div className="relative h-48 bg-gray-200">
                    {room.images?.length ? (
                      <img
                        src={room.images[0]}
                        alt={`Phòng ${room.number} - ${room.building}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-image-line text-gray-400 text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${room.status === 'Trống' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {room.status}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">
                        {room.images?.length || 0} ảnh
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Phòng {room.number}</h3>
                        <p className="text-gray-600">
                          {room.type} • {room.building}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatPrice(room.price)} VNĐ</p>
                        <p className="text-sm text-gray-500">/tháng</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-ruler-line mr-2"></i>
                        Diện tích: {room.area}m²
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-money-dollar-circle-line mr-2"></i>
                        Cọc: {formatPrice(room.deposit)} VNĐ
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-calendar-line mr-2"></i>
                        Có thể vào: {room.status === 'Trống' ? 'Vào ngay hôm nay' : room.availableFrom}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">{room.description}</p>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(room)}
                        className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleDeposit(room)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Đặt cọc
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {availableRooms.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-search-line text-gray-400 text-6xl mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phòng nào</h3>
                <p className="text-gray-600">Hiện tại không có phòng trống</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal chi tiết phòng */}
      {showDetailModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Phòng {selectedRoom.number}</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trái */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                    <div className="space-y-2">
                      <Row label="Số phòng" value={selectedRoom.number} />
                      <Row label="Dãy" value={String(selectedRoom.building)} />
                      <Row label="Loại phòng" value={selectedRoom.type} />
                      <Row label="Diện tích" value={`${selectedRoom.area}m²`} />
                      <Row
                        label="Trạng thái"
                        value={
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${selectedRoom.status === 'Trống' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {selectedRoom.status}
                          </span>
                        }
                      />
                      <Row label="Có thể vào" value={selectedRoom.status === 'Trống' ? 'Vào ngay hôm nay' : selectedRoom.availableFrom} />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chi phí</h4>
                    <div className="space-y-2">
                      <Row label="Giá thuê" value={<span className="text-green-600 font-medium">{formatPrice(selectedRoom.price)} VNĐ/tháng</span>} />
                      <Row label="Tiền cọc" value={<span className="text-orange-600 font-medium">{formatPrice(selectedRoom.deposit)} VNĐ</span>} />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả</h4>
                    <p className="text-gray-700">{selectedRoom.description}</p>
                  </div>
                </div>

                {/* Phải */}
                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Tiện nghi</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedRoom.amenities.map((amenity, i) => (
                        <div key={i} className="flex items-center text-sm text-gray-700">
                          <i className="ri-check-line text-green-600 mr-2"></i>
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Dịch vụ</h4>
                    <div className="space-y-2 text-sm">
                      {selectedRoom.services.map((s, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="flex items-center text-gray-700">
                            <i className="ri-check-line text-green-600 mr-2"></i>
                            {s.name}
                          </span>
                          <span className="font-medium text-gray-900">
                            {typeof s.price === 'number' ? `${formatPrice(s.price)} ${s.unit}` : `${s.price} ${s.unit}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Tiện ích xung quanh</h4>
                    <div className="space-y-2 text-sm">
                      {selectedRoom.nearbyFacilities.map((f: string, i: number) => (
                        <div key={i} className="flex items-center text-gray-700">
                          <i className="ri-map-pin-line text-indigo-600 mr-2"></i>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeposit(selectedRoom);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Đặt cọc ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đặt cọc */}
      {showDepositModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Đặt cọc phòng {selectedRoom.number}</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitDeposit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin phòng</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Row label="Phòng" value={selectedRoom.number} />
                    <Row label="Diện tích" value={`${selectedRoom.area}m²`} />
                    <Row label="Giá thuê" value={<span className="text-green-600 font-medium">{formatPrice(selectedRoom.price)} VNĐ</span>} />
                    <Row label="Tiền cọc" value={<span className="text-orange-600 font-medium">{formatPrice(selectedRoom.deposit)} VNĐ</span>} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Họ và tên *" type="text" required placeholder="Nhập họ và tên" />
                  <Field label="Số điện thoại *" type="tel" required placeholder="Nhập số điện thoại" />
                </div>

                <Field label="Email" type="email" placeholder="Nhập email" />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến vào ở *</label>
                  <input
                    type="date"
                    required
                    min={selectedRoom.availableFrom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ghi chú thêm (không bắt buộc)"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="ri-alert-line text-amber-600 mr-3 mt-0.5"></i>
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">Lưu ý quan trọng</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Cọc hoàn khi kết thúc hợp đồng (trừ phát sinh)</li>
                        <li>• Sau khi đặt cọc, bạn có 3 ngày để hoàn tất ký hợp đồng</li>
                        <li>• Quá hạn không ký, tiền cọc sẽ không hoàn</li>
                        <li>• Vui lòng kiểm tra kỹ thông tin trước khi xác nhận</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowDepositModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Hủy
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Xác nhận đặt cọc
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...rest} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className || ''}`} />
    </div>
  );
}
