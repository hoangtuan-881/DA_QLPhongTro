import { useState, useEffect } from 'react';
import phongTroService, { PhongTro, getStatusText, getStatusColor, mapTrangThaiToStatus } from '../../services/phong-tro.service';
import { getErrorMessage } from '../../lib/http-client';
import { useToast } from '../../hooks/useToast';

export default function AvailableRoomsPage() {
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPhong, setSelectedPhong] = useState<PhongTro | null>(null);
  const toast = useToast();

  // Fetch phòng trống từ API
  useEffect(() => {
    const controller = new AbortController();

    const fetchPhongTrong = async () => {
      try {
        const response = await phongTroService.getByTrangThai('Trống', controller.signal);
        if (!controller.signal.aborted) {
          setPhongTros(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(error) });
          setLoading(false);
        }
      }
    };

    fetchPhongTrong();
    return () => controller.abort();
  }, []);

  const formatPrice = (n: number | null) => (n || 0).toLocaleString('vi-VN');

  const handleViewDetail = (phong: PhongTro) => {
    setSelectedPhong(phong);
    setShowDetailModal(true);
  };

  const handleDeposit = (phong: PhongTro) => {
    setSelectedPhong(phong);
    setShowDepositModal(true);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success({ title: 'Thành công', message: 'Đặt cọc phòng thành công! Chúng tôi sẽ liên hệ bạn sớm.' });
    setShowDepositModal(false);
    setSelectedPhong(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Đang tải danh sách phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Phòng còn trống</h1>
            <p className="text-gray-600 mt-1">Danh sách các phòng có thể thuê ({phongTros.length} phòng)</p>
          </div>

          {/* Danh sách phòng */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {phongTros.map((phong) => {
              const status = mapTrangThaiToStatus(phong.TrangThai);
              return (
                <div key={phong.MaPhong} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Ảnh placeholder */}
                  <div className="relative h-48 bg-gray-200">
                    {phong.HinhAnh ? (
                      <img
                        src={phong.HinhAnh}
                        alt={`Phòng ${phong.TenPhong}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <i className="ri-image-line text-gray-400 text-4xl"></i>
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Phòng {phong.TenPhong}</h3>
                        <p className="text-gray-600">
                          {phong.TenLoaiPhong || 'Phòng tiêu chuẩn'} • {phong.TenDay || 'Dãy A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{formatPrice(phong.DonGiaCoBan)} VNĐ</p>
                        <p className="text-sm text-gray-500">/tháng</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-ruler-line mr-2"></i>
                        Diện tích: {phong.DienTich ? `${phong.DienTich}m²` : 'Chưa cập nhật'}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-money-dollar-circle-line mr-2"></i>
                        Cọc: {formatPrice(phong.GiaThueHienTai || phong.DonGiaCoBan)} VNĐ
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <i className="ri-calendar-line mr-2"></i>
                        Có thể vào: Vào ngay hôm nay
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                      {phong.MoTa || 'Phòng trọ tiện nghi, đầy đủ nội thất, phù hợp sinh viên và người đi làm.'}
                    </p>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(phong)}
                        className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => handleDeposit(phong)}
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Đặt cọc
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {phongTros.length === 0 && (
            <div className="text-center py-12">
              <i className="ri-search-line text-gray-400 text-6xl mb-4"></i>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phòng nào</h3>
              <p className="text-gray-600">Hiện tại không có phòng trống</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal chi tiết phòng */}
      {showDetailModal && selectedPhong && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Phòng {selectedPhong.TenPhong}</h3>
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
                      <Row label="Số phòng" value={selectedPhong.TenPhong} />
                      <Row label="Dãy" value={selectedPhong.TenDay || 'Chưa cập nhật'} />
                      <Row label="Loại phòng" value={selectedPhong.TenLoaiPhong || 'Phòng tiêu chuẩn'} />
                      <Row label="Diện tích" value={selectedPhong.DienTich ? `${selectedPhong.DienTich}m²` : 'Chưa cập nhật'} />
                      <Row
                        label="Trạng thái"
                        value={
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(mapTrangThaiToStatus(selectedPhong.TrangThai))}`}>
                            {getStatusText(mapTrangThaiToStatus(selectedPhong.TrangThai))}
                          </span>
                        }
                      />
                      <Row label="Có thể vào" value="Vào ngay hôm nay" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chi phí</h4>
                    <div className="space-y-2">
                      <Row
                        label="Giá thuê"
                        value={<span className="text-green-600 font-medium">{formatPrice(selectedPhong.DonGiaCoBan)} VNĐ/tháng</span>}
                      />
                      <Row
                        label="Tiền cọc"
                        value={<span className="text-orange-600 font-medium">{formatPrice(selectedPhong.GiaThueHienTai || selectedPhong.DonGiaCoBan)} VNĐ</span>}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả</h4>
                    <p className="text-gray-700">
                      {selectedPhong.MoTa || 'Phòng trọ tiện nghi, đầy đủ nội thất, phù hợp sinh viên và người đi làm.'}
                    </p>
                  </div>
                </div>

                {/* Phải */}
                <div className="space-y-4">
                  {selectedPhong.TienNghi && selectedPhong.TienNghi.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Tiện nghi</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPhong.TienNghi.map((amenity, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-700">
                            <i className="ri-check-line text-green-600 mr-2"></i>
                            {amenity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPhong.dichVuDangKy && selectedPhong.dichVuDangKy.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Dịch vụ</h4>
                      <div className="space-y-2 text-sm">
                        {selectedPhong.dichVuDangKy.map((dv, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="flex items-center text-gray-700">
                              <i className="ri-check-line text-green-600 mr-2"></i>
                              {dv.loaiDichVu?.TenDichVu || 'Dịch vụ'}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatPrice(dv.DonGiaApDung)} {dv.loaiDichVu?.DonViTinh || 'VNĐ'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Liên hệ</h4>
                    <p className="text-sm text-gray-700">
                      Để biết thêm thông tin chi tiết, vui lòng liên hệ ban quản lý hoặc đặt cọc để được tư vấn trực tiếp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDeposit(selectedPhong);
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
      {showDepositModal && selectedPhong && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Đặt cọc phòng {selectedPhong.TenPhong}</h3>
                <button onClick={() => setShowDepositModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmitDeposit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin phòng</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Row label="Phòng" value={selectedPhong.TenPhong} />
                    <Row label="Diện tích" value={selectedPhong.DienTich ? `${selectedPhong.DienTich}m²` : 'N/A'} />
                    <Row
                      label="Giá thuê"
                      value={<span className="text-green-600 font-medium">{formatPrice(selectedPhong.DonGiaCoBan)} VNĐ</span>}
                    />
                    <Row
                      label="Tiền cọc"
                      value={<span className="text-orange-600 font-medium">{formatPrice(selectedPhong.GiaThueHienTai || selectedPhong.DonGiaCoBan)} VNĐ</span>}
                    />
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
                  <button
                    type="button"
                    onClick={() => setShowDepositModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
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
