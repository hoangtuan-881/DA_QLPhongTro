import roomStatusService, {
  RoomStatusResponse,
  ThongTinPhong,
  ThongTinHopDong,
  NguoiThue,
  ThietBi,
  DichVuDangKy
} from '@/services/roomStatusService';
import { getErrorMessage } from '@/lib/http-client';
import { formatCurrency } from '@/lib/format-utils';
import { useToast } from '@/hooks/useToast';

export default function RoomStatus() {
  const [loading, setLoading] = useState(true);
  const [thongTinPhong, setThongTinPhong] = useState<ThongTinPhong | null>(null);
  const [thongTinHopDong, setThongTinHopDong] = useState<ThongTinHopDong | null>(null);
  const [danhSachNguoiThue, setDanhSachNguoiThue] = useState<NguoiThue[]>([]);
  const [thietBi, setThietBi] = useState<ThietBi[]>([]);
  const [dichVuDangKy, setDichVuDangKy] = useState<DichVuDangKy[]>([]);
  const toast = useToast();

  useEffect(() => {
    const controller = new AbortController();

    const fetchRoomStatus = async () => {
      try {
        const response = await roomStatusService.getRoomStatus(controller.signal);
        if (!controller.signal.aborted) {
          // Backend wraps in { data: {...} }, so we need response.data.data
          const data = response.data.data;
          setThongTinPhong(data.ThongTinPhong);
          setThongTinHopDong(data.ThongTinHopDong || null);
          setDanhSachNguoiThue(data.DanhSachNguoiThue || []);
          setThietBi(data.ThietBi || []);
          setDichVuDangKy(data.DichVuDangKy || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Lỗi tải trạng thái phòng:', getErrorMessage(error));
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchRoomStatus();
    return () => controller.abort();
  }, []);

  // Tìm người thuê chính và thành viên
  const mainTenant = danhSachNguoiThue.find(nt => nt.VaiTro === 'KHÁCH_CHÍNH');
  const members = danhSachNguoiThue.filter(nt => nt.VaiTro === 'THÀNH_VIÊN');

  // Format date từ YYYY-MM-DD hoặc ISO string thành DD/MM/YYYY
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    // Handle ISO format: "2004-10-03T00:00:00.000000Z" → "2004-10-03"
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  // Map trạng thái hợp đồng sang tiếng Việt
  const mapTrangThai = (trangThai?: string) => {
    const statusMap: Record<string, string> = {
      'DangHieuLuc': 'Đang hiệu lực',
      'HetHan': 'Hết hạn',
      'DaHuy': 'Đã hủy',
      'SapHetHan': 'Sắp hết hạn'
    };
    return statusMap[trangThai || ''] || trangThai || 'N/A';
  };

  // Lấy chữ cái đầu tiên của tên
  const getInitial = (hoTen: string) => {
    return hoTen.charAt(0).toUpperCase();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Empty state
  if (!thongTinPhong) {
    return (
      <div className="text-center py-12">
        <i className="ri-home-4-line text-6xl text-gray-400 mb-4"></i>
        <p className="text-gray-500">Không tìm thấy thông tin phòng</p>
      </div>
    );
  }

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
              <span className="font-medium text-gray-900">{thongTinPhong.TenPhong}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tầng:</span>
              <span className="font-medium text-gray-900">Tầng {thongTinPhong.Tang}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Diện tích:</span>
              <span className="font-medium text-gray-900">{thongTinPhong.DienTich}m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Loại phòng:</span>
              <span className="font-medium text-gray-900">{thongTinPhong.TenLoaiPhong}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Giá thuê:</span>
              <span className="font-medium text-green-600">{formatCurrency(thongTinPhong.GiaThue)}/tháng</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tiền cọc:</span>
              <span className="font-medium text-orange-600">{formatCurrency(thongTinHopDong?.TienCoc || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ngày vào ở:</span>
              <span className="font-medium text-gray-900">{formatDate(thongTinHopDong?.NgayBatDau)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {mapTrangThai(thongTinHopDong?.TrangThai)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <i className="ri-lightbulb-line text-indigo-600 mr-2"></i>
              Tiện nghi
            </h4>
            {thietBi.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                {thietBi.map((item) => (
                  <li key={item.MaThietBi}>
                    {item.TenThietBi} {item.SoLuong > 1 && `(x${item.SoLuong})`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Chưa có thông tin</p>
            )}
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
              <i className="ri-service-line text-indigo-600 mr-2"></i>
              Dịch vụ
            </h4>
            {dichVuDangKy.length > 0 ? (
              <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                {dichVuDangKy.map((item) => (
                  <li key={item.MaDichVu}>
                    {item.TenDichVu} ({formatCurrency(item.DonGiaApDung)}/{item.DonViTinh})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Chưa có thông tin</p>
            )}
          </div>
        </div>

      </div>

      {/* Người thuê chính */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-user-star-line text-indigo-600 mr-2"></i>
          Người thuê chính
        </h3>

        {mainTenant ? (
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{getInitial(mainTenant.HoTen)}</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{mainTenant.HoTen}</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <i className="ri-phone-line mr-2"></i>
                  {mainTenant.SDT1}
                </p>
                <p className="flex items-center">
                  <i className="ri-mail-line mr-2"></i>
                  {mainTenant.Email || 'N/A'}
                </p>
                <p className="flex items-center">
                  <i className="ri-calendar-line mr-2"></i>
                  Vào ở: {formatDate(thongTinHopDong?.NgayBatDau)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                Chủ hợp đồng
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có thông tin người thuê chính</p>
        )}
      </div>

      {/* Thành viên trong phòng */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i className="ri-team-line text-indigo-600 mr-2"></i>
          Thành viên trong phòng ({members.length})
        </h3>

        {members.length > 0 ? (
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.MaKhachThue} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">{getInitial(member.HoTen)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{member.HoTen}</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="flex items-center">
                      <i className="ri-phone-line mr-2"></i>
                      {member.SDT1}
                    </p>
                    <p className="flex items-center">
                      <i className="ri-mail-line mr-2"></i>
                      {member.Email || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <p>Ngày sinh: {formatDate(member.NgaySinh)}</p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                    Thành viên
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Chưa có thành viên khác</p>
        )}
      </div>
    </div>
  );
}