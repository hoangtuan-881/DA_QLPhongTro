import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import phongTroService, { PhongTro, getStatusColor, mapTrangThaiToStatus } from '../../services/phong-tro.service';
import datCocService, { PhieuDatCocCreateInput } from '../../services/dat-coc.service';
import { useToast } from '../../hooks/useToast';
import { getErrorMessage } from '../../lib/http-client';
import { getImageUrl } from '../../lib/image-helper';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <i className="ri-home-4-fill text-white text-lg"></i>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">MHOME</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/landlords"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium hidden md:block"
              >
                Dành cho chủ trọ
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 whitespace-nowrap"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Tìm phòng trọ lý tưởng
              <span className="text-indigo-600 block">An toàn - Tiện nghi - Nhanh chóng</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Hệ thống phòng trọ chuyên nghiệp với nhiều lựa chọn đã được xác thực. Tìm tổ ấm của bạn ngay hôm nay.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/customer-dashboard"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                Xem trải nghiệm khách thuê
              </Link>
              <Link
                to="/dashboard"
                className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition duration-200 whitespace-nowrap"
              >
                Bạn là chủ trọ?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Phòng trống trên trang chủ (mặc định 6, bấm xem tất cả để bung ngay trên Home) */}
      <section className="py-12 bg-white">
        <RoomsOnHome />
      </section>

      {/* Lợi ích cho khách thuê */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">An tâm sống cùng Hệ thống</h2>
            <p className="text-xl text-gray-600">Trải nghiệm dịch vụ phòng trọ chuyên nghiệp, minh bạch và an toàn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: 'ri-shield-check-line', title: 'An ninh 24/7', description: 'Camera, cửa vân tay, bảo vệ đảm bảo an toàn.' },
              { icon: 'ri-file-text-line', title: 'Minh bạch hợp đồng', description: 'Hợp đồng điện tử rõ ràng, không phí ẩn.' },
              { icon: 'ri-wifi-line', title: 'Tiện ích đầy đủ', description: 'Wifi nhanh, nội thất cơ bản, giặt sấy tiện lợi.' },
              { icon: 'ri-tools-line', title: 'Hỗ trợ kỹ thuật', description: 'Xử lý sự cố điện, nước nhanh chóng.' },
              { icon: 'ri-customer-service-2-line', title: 'Dịch vụ chuyên nghiệp', description: 'Quản lý thân thiện, hỗ trợ suốt quá trình ở.' },
              { icon: 'ri-community-line', title: 'Vị trí thuận tiện', description: 'Phủ khắp các quận trung tâm, gần trường & văn phòng.' },
            ].map((f, idx) => (
              <div key={idx} className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${f.icon} text-2xl text-indigo-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA dành cho chủ trọ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 text-center">
              <i className="ri-building-4-line text-indigo-600 text-9xl"></i>
            </div>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Bạn là chủ trọ?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Tối ưu hóa lợi nhuận và giảm tải vận hành: tìm khách, quản lý hợp đồng, bảo trì — tất cả trong một.
              </p>
              <Link
                to="/landlords"
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition duration-200 inline-block whitespace-nowrap"
              >
                Tìm hiểu thêm
              </Link>
              <Link
                to="/landlords"
                className="ml-4 border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition duration-200 inline-block whitespace-nowrap"
              >
                Xem Demo Quản lý
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="ri-home-4-fill text-white text-lg"></i>
                </div>
                <span className="ml-3 text-xl font-bold">MHOMES</span>
              </div>
              <p className="text-gray-400">Hệ thống quản lý phòng trọ thông minh và hiệu quả</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Quản lý phòng</a></li>
                <li><a href="#" className="hover:text-white">Thanh toán</a></li>
                <li><Link to="/test-toast" className="hover:text-white">Báo cáo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">Hướng dẫn</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: hoangtuan251001@gmail.com</li>
                <li>Hotline: 0376476800</li>
                <li>Địa chỉ: 17/2A Nguyễn Hữu Tiến, Tây Thạnh, TP.HCM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hệ thống quản lý phòng trọ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** ====== RoomsOnHome: hiển thị 6 phòng, bấm xem tất cả để bung ngay trên Home ====== */
function RoomsOnHome() {
  const [showAll, setShowAll] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedPhong, setSelectedPhong] = useState<PhongTro | null>(null);
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const toast = useToast();
  const { t } = useTranslation();

  const initialDepositState = {
    HoTenNguoiDat: '',
    SoDienThoaiNguoiDat: '',
    EmailNguoiDat: '',
    NgayDuKienVaoO: '',
    GhiChu: '',
  };
  const [depositInfo, setDepositInfo] = useState(initialDepositState);

  const fetchPhongTrong = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const response = await phongTroService.getPublicPhongTrong(signal);
      if (!signal.aborted) {
        setPhongTros(response.data.data || []);
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
        console.error('Error fetching rooms:', error);
        toast.error({ title: 'Lỗi', message: 'Không thể tải danh sách phòng.' });
      }
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchPhongTrong(controller.signal);
    return () => controller.abort();
  }, [refreshKey, fetchPhongTrong]);

  const refreshRooms = () => {
    setRefreshKey(prev => prev + 1);
  };

  const visiblePhongs = showAll ? phongTros : phongTros.slice(0, 6);
  const formatPrice = (n: number | null) => (n || 0).toLocaleString('vi-VN');

  const handleViewDetail = (phong: PhongTro) => {
    setSelectedPhong(phong);
    setShowDetailModal(true);
  };

  const handleDeposit = (phong: PhongTro) => {
    setSelectedPhong(phong);
    setDepositInfo(initialDepositState); // Reset form when opening
    setShowDepositModal(true);
  };

  const handleDepositInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDepositInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhong) return;

    const payload: PhieuDatCocCreateInput = {
      MaPhong: selectedPhong.MaPhong,
      ...depositInfo,
      TienDatCoc: selectedPhong.DonGiaCoBan || 0,
    };

    try {
      await datCocService.createPublic(payload);
      toast.success({
        title: t('messages.success.deposit_created_title', 'Đặt cọc thành công!'),
        message: t('messages.success.deposit_created_message', 'Chúng tôi sẽ liên hệ với bạn sớm nhất để xác nhận.'),
      });
      setShowDepositModal(false);
      refreshRooms();
    } catch (error) {
      toast.error({
        title: t('common.error', 'Lỗi'),
        message: getErrorMessage(error),
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Đang tải danh sách phòng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Phòng còn trống</h2>
        <div className="flex items-center gap-3">
          {!showAll && phongTros.length > 6 && (
            <button onClick={() => setShowAll(true)} className="text-indigo-600 hover:text-indigo-700 font-medium">
              Xem tất cả ({phongTros.length})
            </button>
          )}
          {showAll && (
            <button onClick={() => setShowAll(false)} className="text-gray-600 hover:text-gray-800 font-medium">
              Thu gọn
            </button>
          )}
        </div>
      </div>

      {phongTros.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-search-line text-gray-400 text-6xl mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có phòng trống</h3>
          <p className="text-gray-600">Hãy quay lại sau nhé!</p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visiblePhongs.map((phong) => (
              <div key={phong.MaPhong} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="relative h-48 bg-gray-200">
                  {getImageUrl(phong.HinhAnh) ? (
                    <img
                      src={getImageUrl(phong.HinhAnh)!}
                      alt={`Phòng ${phong.TenPhong} - Dãy ${phong.TenDay || ''}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Hide image on error and show placeholder
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector('.placeholder-icon');
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = 'flex';
                          }
                        }
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <div
                    className="placeholder-icon absolute inset-0 flex items-center justify-center"
                    style={{ display: getImageUrl(phong.HinhAnh) ? 'none' : 'flex' }}
                  >
                    <i className="ri-image-line text-gray-400 text-4xl" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(mapTrangThaiToStatus(phong.TrangThai))}`}
                    >
                      {phong.TrangThai}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-black/60 text-white px-2 py-1 rounded text-xs">{phong.HinhAnh ? '1' : '0'} ảnh</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Phòng {phong.TenPhong}</h3>
                      <p className="text-gray-600">
                        {phong.TenLoaiPhong || 'Chưa có loại'} • Dãy {phong.TenDay || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{formatPrice(phong.DonGiaCoBan)} VNĐ</p>
                      <p className="text-sm text-gray-500">/tháng</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-ruler-line mr-2"></i>Diện tích: {phong.DienTich || 'N/A'}m²
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <i className="ri-calendar-line mr-2"></i>
                      Có thể vào: Vào ngay hôm nay
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-grow">{phong.MoTa || 'Chưa có mô tả'}</p>

                  <div className="flex space-x-2 mt-auto">
                    <button
                      onClick={() => handleViewDetail(phong)}
                      className="flex-1 px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleDeposit(phong)}
                      disabled={phong.TrangThai !== 'Trống'}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {phong.TrangThai === 'Trống' ? 'Đặt cọc' : phong.TrangThai}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {phongTros.length > 6 && (
            <div className="text-center mt-8">
              {!showAll ? (
                <button onClick={() => setShowAll(true)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  Xem tất cả ({phongTros.length})
                </button>
              ) : (
                <button onClick={() => setShowAll(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  Thu gọn
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết phòng */}
      {showDetailModal && selectedPhong && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Phòng {selectedPhong.TenPhong}</h3>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trái */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Thông tin cơ bản</h4>
                    <div className="space-y-2">
                      <Row label="Số phòng" value={selectedPhong.TenPhong} />
                      <Row label="Dãy" value={selectedPhong.TenDay || 'N/A'} />
                      <Row label="Loại phòng" value={selectedPhong.TenLoaiPhong || 'Chưa có loại'} />
                      <Row label="Diện tích" value={`${selectedPhong.DienTich || 'N/A'}m²`} />
                      <Row
                        label="Trạng thái"
                        value={
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getStatusColor(mapTrangThaiToStatus(selectedPhong.TrangThai))}`}
                          >
                            {selectedPhong.TrangThai}
                          </span>
                        }
                      />
                      <Row label="Có thể vào" value="Vào ngay hôm nay" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Chi phí</h4>
                    <div className="space-y-2">
                      <Row label="Giá thuê" value={<span className="text-green-600 font-medium">{formatPrice(selectedPhong.DonGiaCoBan)} VNĐ/tháng</span>} />
                      {selectedPhong.GiaThueHienTai && (
                        <Row label="Giá thuê hiện tại" value={<span className="text-blue-600 font-medium">{formatPrice(selectedPhong.GiaThueHienTai)} VNĐ/tháng</span>} />
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Mô tả</h4>
                    <p className="text-gray-700">{selectedPhong.MoTa || 'Chưa có mô tả'}</p>
                  </div>
                </div>

                {/* Phải */}
                <div className="space-y-4">
                  {selectedPhong.TienNghi && selectedPhong.TienNghi.length > 0 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Tiện nghi</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPhong.TienNghi.map((a, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-700">
                            <i className="ri-check-line text-green-600 mr-2" />
                            {a}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPhong.dichVuDangKy && selectedPhong.dichVuDangKy.length > 0 && (
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Dịch vụ đăng ký</h4>
                      <div className="space-y-2 text-sm">
                        {selectedPhong.dichVuDangKy.map((dv: any, i: number) => (
                          <div key={i} className="flex justify-between">
                            <span className="flex items-center text-gray-700">
                              <i className="ri-check-line text-green-600 mr-2" />
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

                  {selectedPhong.dayTro && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Vị trí</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-700">
                          <i className="ri-map-pin-line text-indigo-600 mr-2" />
                          {selectedPhong.dayTro.DiaChi}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button onClick={() => setShowDetailModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Đóng
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    if (selectedPhong) handleDeposit(selectedPhong);
                  }}
                  disabled={selectedPhong.TrangThai !== 'Trống'}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {selectedPhong.TrangThai === 'Trống' ? 'Đặt cọc ngay' : 'Phòng đã có người'}
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
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              <form onSubmit={handleSubmitDeposit} className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin phòng</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Row label="Phòng" value={selectedPhong.TenPhong} />
                    <Row label="Diện tích" value={`${selectedPhong.DienTich || 'N/A'}m²`} />
                    <Row label="Giá cọc" value={<span className="text-green-600 font-medium">{formatPrice(selectedPhong.DonGiaCoBan)} VNĐ</span>} />
                    <Row label="Dãy" value={selectedPhong.TenDay || 'N/A'} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field name="HoTenNguoiDat" label="Họ và tên *" type="text" required placeholder="Nhập họ và tên" value={depositInfo.HoTenNguoiDat} onChange={handleDepositInfoChange} />
                  <Field name="SoDienThoaiNguoiDat" label="Số điện thoại *" type="tel" required placeholder="Nhập số điện thoại" value={depositInfo.SoDienThoaiNguoiDat} onChange={handleDepositInfoChange} />
                </div>

                <Field name="EmailNguoiDat" label="Email" type="email" placeholder="Nhập email" value={depositInfo.EmailNguoiDat} onChange={handleDepositInfoChange} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến vào ở *</label>
                  <input
                    name="NgayDuKienVaoO"
                    type="date"
                    required
                    value={depositInfo.NgayDuKienVaoO}
                    onChange={handleDepositInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea
                    name="GhiChu"
                    rows={3}
                    value={depositInfo.GhiChu}
                    onChange={handleDepositInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Ghi chú thêm (không bắt buộc)"
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <i className="ri-alert-line text-amber-600 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-2">Lưu ý quan trọng</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Tiền cọc tương đương 01 tháng tiền phòng.</li>
                        <li>• Sau khi đặt cọc, bạn có 3 ngày để hoàn tất ký hợp đồng.</li>
                        <li>• Quá hạn không ký, tiền cọc sẽ không được hoàn lại.</li>
                        <li>• Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</li>
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

function Field(props: React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> & { label: string }) {
  const { label, className, ...rest } = props;
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input {...rest} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${className || ''}`} />
    </div>
  );
}
