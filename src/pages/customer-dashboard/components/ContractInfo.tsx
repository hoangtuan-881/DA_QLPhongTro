import { useMemo, useState, useEffect } from "react";
import type { ReactNode } from "react";
import customerService, { type ThongTinHopDong } from '@/services/customer.service';
import { getErrorMessage } from '@/lib/http-client';
import { formatCurrency } from '@/lib/format-utils';
import { useToast } from '@/hooks/useToast';


/** ---------- Component ---------- */
export default function ContractInfo() {
  const [contractInfo, setContractInfo] = useState<ThongTinHopDong | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Fetch contract data
  useEffect(() => {
    const controller = new AbortController();

    const fetchContract = async () => {
      try {
        const response = await customerService.getContractInfo(controller.signal);
        if (!controller.signal.aborted) {
          setContractInfo(response.data.data);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          // 404 = không có hợp đồng (empty state sẽ xử lý) - không hiển thị toast
          if (error.response?.status === 404) {
            console.info('Khách thuê chưa có hợp đồng');
            setLoading(false);
            return;
          }

          // Chỉ hiển thị toast cho lỗi thực sự (500, network, etc.)
          console.error('Lỗi tải hợp đồng:', getErrorMessage(error));
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchContract();
    return () => controller.abort();
  }, []);

  // Map trạng thái sang tiếng Việt
  const mapTrangThai = (trangThai?: string) => {
    const statusMap: Record<string, string> = {
      'DangHieuLuc': 'Đang hiệu lực',
      'HetHan': 'Hết hạn',
      'DaHuy': 'Đã hủy',
      'SapHetHan': 'Sắp hết hạn'
    };
    return statusMap[trangThai || ''] || trangThai || 'N/A';
  };

  const toNumber = (value: any) =>
    typeof value === 'string'
      ? Number(value.replace(/\./g, '')) || 0
      : Number(value) || 0;

  const totalServices = useMemo(() => {
    if (!contractInfo) return 0;
    return contractInfo.DichVu.reduce((sum, dv) => {
      return sum + toNumber(dv.DonGiaApDung);
    }, 0);
  }, [contractInfo]);

  const totalMonthly = useMemo(() => {
    if (!contractInfo) return 0;
    return toNumber(contractInfo.TienThueHangThang) + totalServices;
  }, [contractInfo, totalServices]);


  const handleViewContract = () => {
    if (!contractInfo) return;
    const contractUrl = `/contracts/${contractInfo.SoHopDong}.pdf`;
    window.open(contractUrl, "_blank");
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
  if (!contractInfo) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="max-w-lg mx-auto text-center">
          <div className="mb-6">
            <i className="ri-file-text-line text-6xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Chưa có hợp đồng thuê
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn chưa có hợp đồng thuê phòng hiện tại hoặc hợp đồng đã hết hiệu lực.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start">
              <i className="ri-lightbulb-line text-amber-600 text-xl mr-3 mt-0.5"></i>
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Hướng dẫn</h4>
                <ul className="text-sm text-amber-800 space-y-1.5">
                  <li>• Liên hệ ban quản lý để ký hợp đồng mới</li>
                  <li>• Chuẩn bị CCCD/CMND và giấy tờ cần thiết</li>
                  <li>• Đọc kỹ điều khoản trước khi ký kết</li>
                  <li>• Giữ lại bản hợp đồng để theo dõi</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start text-left">
              <i className="ri-customer-service-line text-blue-600 text-xl mr-3 mt-0.5"></i>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Cần hỗ trợ?</h4>
                <p className="text-sm text-blue-800">
                  Liên hệ ban quản lý qua hotline <strong>1900 xxxx</strong> hoặc email{' '}
                  <strong>support@phongtro.com</strong> để được tư vấn chi tiết.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hợp đồng thuê</h1>
        <p className="text-gray-600">Thông tin chi tiết về hợp đồng của bạn</p>
      </div>

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
                <Row label="Số hợp đồng" value={contractInfo.SoHopDong} />
                <Row label="Phòng" value={contractInfo.TenPhong} />
                <Row label="Người thuê" value={contractInfo.TenKhachThue} />
                <Row label="Số điện thoại" value={contractInfo.SDT} />
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {mapTrangThai(contractInfo.TrangThai)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Thời hạn hợp đồng</h4>
              <div className="space-y-3">
                <Row label="Ngày ký" value={contractInfo.NgayKy} />
                <Row label="Bắt đầu" value={contractInfo.NgayBatDau} />
                <Row label="Kết thúc" value={contractInfo.NgayKetThuc} />
                <Row
                  label="Gia hạn tiếp theo"
                  value={contractInfo.NgayKetThuc}
                  valueClass="text-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Cột 2: Chi phí */}
          <div className="space-y-4">
            {/* Giá cơ bản */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Chi phí hàng tháng</h4>
              <div className="space-y-3">
                <Row
                  label="Tiền thuê phòng"
                  value={formatCurrency(contractInfo.TienThueHangThang)}
                  valueClass="text-green-600"
                />
              </div>
            </div>

            {/* Dịch vụ chi tiết */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Dịch vụ đăng ký</h4>
              <div className="space-y-3">
                {contractInfo.DichVu.length > 0 ? (
                  <>
                    {contractInfo.DichVu.map((dv, index) => (
                      <Row
                        key={index}
                        label={dv.TenDichVu}
                        value={`${formatCurrency(dv.DonGiaApDung)} / ${dv.DonViTinh}`}
                      />
                    ))}
                    <div className="flex justify-between border-t pt-3 mt-2">
                      <span className="text-gray-600">Tổng dịch vụ</span>
                      <span className="font-semibold">
                        {formatCurrency(totalServices)}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Chưa đăng ký dịch vụ nào</p>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">
                    TỔNG CỘNG / THÁNG
                  </span>
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(totalMonthly)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tiền cọc */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Tiền cọc</h4>
              <div className="space-y-3">
                <Row
                  label="Số tiền"
                  value={formatCurrency(contractInfo.TienCoc)}
                  valueClass="text-orange-600"
                />
                <div className="text-sm text-gray-600">
                  <i className="ri-information-line mr-1"></i>
                  Tiền cọc đã đóng khi ký hợp đồng.
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
              <li>• Hợp đồng sẽ hết hạn vào {contractInfo.NgayKetThuc}</li>
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

/** ---------- Row helper (kèm types để fix TS7031) ---------- */
interface RowProps {
  label: string;
  value: ReactNode;     // <- dùng ReactNode thay cho JSX.Element | string | number
  valueClass?: string;
}
function Row({ label, value, valueClass = "" }: RowProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className={`font-medium text-gray-900 ${valueClass}`}>{value}</span>
    </div>
  );
}
