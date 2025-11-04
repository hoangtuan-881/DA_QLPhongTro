
import { useState } from 'react';

export default function RoomStatus() {
  const [roomDetails] = useState({
    roomNumber: '101A',
    floor: '1',
    area: '25m²',
    type: 'Studio',
    rentPrice: '4,500,000',
    deposit: '9,000,000',
    utilities: 'Điện, nước, wifi, giường, tủ, bàn',
    moveInDate: '2024-01-15',
    status: 'Đang thuê'
  });

  const [roommates] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0912345678',
      email: 'nguyenvana@email.com',
      role: 'Người thuê chính',
      moveInDate: '2024-01-15',
      avatar: 'A'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0987654321',
      email: 'tranthib@email.com',
      role: 'Thành viên',
      moveInDate: '2024-02-01',
      avatar: 'B'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      phone: '0923456789',
      email: 'levanc@email.com',
      role: 'Thành viên',
      moveInDate: '2024-02-15',
      avatar: 'C'
    }
  ]);

  const mainTenant = roommates.find(r => r.role === 'Người thuê chính');
  const members = roommates.filter(r => r.role === 'Thành viên');

  return (
    <div className="space-y-6">
      {/* Thông tin phòng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-home-4-line text-indigo-600 mr-2"></i>
          Thông tin phòng
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Số phòng:</span>
              <span className="font-medium text-gray-900">{roomDetails.roomNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tầng:</span>
              <span className="font-medium text-gray-900">Tầng {roomDetails.floor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diện tích:</span>
              <span className="font-medium text-gray-900">{roomDetails.area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loại phòng:</span>
              <span className="font-medium text-gray-900">{roomDetails.type}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá thuê:</span>
              <span className="font-medium text-green-600">{roomDetails.rentPrice} VNĐ/tháng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiền cọc:</span>
              <span className="font-medium text-orange-600">{roomDetails.deposit} VNĐ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày vào ở:</span>
              <span className="font-medium text-gray-900">{roomDetails.moveInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {roomDetails.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <span className="text-gray-600">Tiện nghi:</span>
          <p className="mt-1 text-gray-900">{roomDetails.utilities}</p>
        </div>
      </div>

      {/* Người thuê chính */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-user-star-line text-indigo-600 mr-2"></i>
          Người thuê chính
        </h3>
        
        {mainTenant && (
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{mainTenant.avatar}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{mainTenant.name}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <i className="ri-phone-line mr-2"></i>
                  {mainTenant.phone}
                </p>
                <p className="flex items-center">
                  <i className="ri-mail-line mr-2"></i>
                  {mainTenant.email}
                </p>
                <p className="flex items-center">
                  <i className="ri-calendar-line mr-2"></i>
                  Vào ở: {mainTenant.moveInDate}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Chủ hợp đồng
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Thành viên trong phòng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-team-line text-indigo-600 mr-2"></i>
          Thành viên trong phòng ({members.length})
        </h3>
        
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">{member.avatar}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center">
                    <i className="ri-phone-line mr-2"></i>
                    {member.phone}
                  </p>
                  <p className="flex items-center">
                    <i className="ri-mail-line mr-2"></i>
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p>Vào ở: {member.moveInDate}</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
