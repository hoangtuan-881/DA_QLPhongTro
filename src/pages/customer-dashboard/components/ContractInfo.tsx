
import { useState } from 'react';

export default function ContractInfo() {
  const [contractInfo] = useState({
    contractNumber: 'HD001-2024',
    roomNumber: '101A',
    tenant: 'Nguyễn Văn A',
    phone: '0912345678',
    startDate: '2024-01-15',
    endDate: '2025-01-14',
    rentPrice: '4,500,000',
    deposit: '9,000,000',
    electricPrice: '3,500',
    waterPrice: '25,000',
    servicePrice: '500,000',
    status: 'Đang hiệu lực',
    signDate: '2024-01-10',
    nextRenewal: '2025-01-14'
  });

  const handleViewContract = () => {
    // Tạo URL giả lập cho file PDF hợp đồng
    const contractUrl = `/contracts/${contractInfo.contractNumber}.pdf`;
    window.open(contractUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Thông tin hợp đồng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <i className="ri-file-text-line text-indigo-600 mr-2"></i>
            Thông tin hợp đồng thuê
          </h3>
          <button
            onClick={handleViewContract}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            <i className="ri-file-pdf-line mr-2"></i>
            Xem hợp đồng đầy đủ
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cột 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số hợp đồng:</span>
                  <span className="font-medium text-gray-900">{contractInfo.contractNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phòng:</span>
                  <span className="font-medium text-gray-900">{contractInfo.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Người thuê:</span>
                  <span className="font-medium text-gray-900">{contractInfo.tenant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số điện thoại:</span>
                  <span className="font-medium text-gray-900">{contractInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {contractInfo.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Thời hạn hợp đồng</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày ký:</span>
                  <span className="font-medium text-gray-900">{contractInfo.signDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bắt đầu:</span>
                  <span className="font-medium text-gray-900">{contractInfo.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kết thúc:</span>
                  <span className="font-medium text-gray-900">{contractInfo.endDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gia hạn tiếp theo:</span>
                  <span className="font-medium text-orange-600">{contractInfo.nextRenewal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cột 2: Chi phí */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Chi phí hàng tháng</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tiền thuê phòng:</span>
                  <span className="font-medium text-green-600">{contractInfo.rentPrice} VNĐ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá điện:</span>
                  <span className="font-medium text-gray-900">{contractInfo.electricPrice} VNĐ/kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá nước:</span>
                  <span className="font-medium text-gray-900">{contractInfo.waterPrice} VNĐ/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí dịch vụ:</span>
                  <span className="font-medium text-gray-900">{contractInfo.servicePrice} VNĐ</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Tiền cọc</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền:</span>
                  <span className="font-medium text-orange-600">{contractInfo.deposit} VNĐ</span>
                </div>
                <div className="text-sm text-gray-600">
                  <i className="ri-information-line mr-1"></i>
                  Tương đương 2 tháng tiền thuê
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lưu ý quan trọng */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start">
          <i className="ri-alert-line text-amber-600 mr-3 mt-0.5"></i>
          <div>
            <h4 className="font-medium text-amber-800 mb-2">Lưu ý quan trọng</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Hợp đồng sẽ hết hạn vào {contractInfo.endDate}</li>
              <li>• Vui lòng liên hệ ban quản lý trước 30 ngày để gia hạn</li>
              <li>• Tiền cọc sẽ được hoàn trả khi kết thúc hợp đồng (trừ các khoản phát sinh)</li>
              <li>• Mọi thay đổi cần được ghi nhận bằng văn bản</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
