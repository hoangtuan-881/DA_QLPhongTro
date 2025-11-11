import { useMemo, useState } from "react";
import type { ReactNode } from "react";


/** ---------- Types ---------- */
type InternetPackageKey = "internet1" | "internet2";

interface Electricity {
  unitPrice: number;   // VND/kWh
  usageKwh: number;    // kWh/tháng
}
interface Water {
  unitPrice: number;   // VND/người/tháng
  people: number;
}
interface Internet {
  packages: Record<InternetPackageKey, number>; // { internet1: 50_000, internet2: 100_000 }
  selected: InternetPackageKey;                 // "internet1" | "internet2"
  perRoom: boolean;
}
interface Trash {
  feePerRoom: number;
}
interface Parking {
  feePerVehicle: number;
  vehicles: number;
}
interface Services {
  electricity: Electricity;
  water: Water;
  internet: Internet;
  trash: Trash;
  parking: Parking;
}

interface ContractInfoModel {
  contractNumber: string;
  roomNumber: string;
  tenant: string;
  phone: string;

  status: string;
  signDate: string;
  startDate: string;
  endDate: string;
  nextRenewal: string;

  rentPrice: number; // VND/tháng
  services: Services;
}

/** ---------- Component ---------- */
export default function ContractInfo() {
  // Dùng _setContractInfo để tránh warning TS6133 khi chưa dùng tới setter
  const [contractInfo, _setContractInfo] = useState<ContractInfoModel>({
    contractNumber: "HD001-2024",
    roomNumber: "A401",
    tenant: "Nguyễn Văn An",
    phone: "0912345678",

    // Trạng thái & thời hạn
    status: "Đang hiệu lực",
    signDate: "2024-01-10",
    startDate: "2024-01-15",
    endDate: "2025-01-14",
    nextRenewal: "2025-01-14",

    // Giá cơ bản (để số)
    rentPrice: 2_500_000, // VND/tháng

    // Cấu hình dịch vụ
    services: {
      electricity: {
        unitPrice: 3_500,  // VND/kWh
        usageKwh: 120,       // kWh/tháng (mock)
      },
      water: {
        unitPrice: 60_000, // VND/người/tháng
        people: 1,         // mock
      },
      internet: {
        packages: {
          internet1: 50_000,   // gói chung
          internet2: 100_000,  // gói riêng
        },
        selected: "internet1", // "internet1" | "internet2"
        perRoom: true,
      },
      trash: {
        feePerRoom: 40_000,    // VND/phòng/tháng
      },
      parking: {
        feePerVehicle: 100_000,// VND/xe/tháng
        vehicles: 1,           // mock
      },
    },
  });

  // Deposit = tiền phòng 1 tháng
  const deposit = contractInfo.rentPrice;

  // ✅ fix TS7006: thêm kiểu tham số
  const formatVND = (n: number) =>
    (n ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  const bill = useMemo(() => {
    const { rentPrice, services } = contractInfo;
    const elec =
      (services.electricity.unitPrice || 0) *
      (services.electricity.usageKwh || 0);

    const water =
      (services.water.unitPrice || 0) * (services.water.people || 0);

    // ✅ fix TS7053: selected gõ kiểu union -> index an toàn
    const selected: InternetPackageKey = services.internet.selected;
    const internet = services.internet.packages[selected] || 0;

    const trash = services.trash.feePerRoom || 0;

    const parking =
      (services.parking.feePerVehicle || 0) *
      (services.parking.vehicles || 0);

    const subtotalServices = elec + water + internet + trash + parking;
    const total = rentPrice + subtotalServices;

    return {
      breakdown: {
        rent: rentPrice,
        electricity: elec,
        water,
        internet,
        trash,
        parking,
      },
      subtotalServices,
      total,
    };
  }, [contractInfo]);

  const handleViewContract = () => {
    const contractUrl = `/contracts/${contractInfo.contractNumber}.pdf`;
    window.open(contractUrl, "_blank");
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
                <Row label="Số hợp đồng" value={contractInfo.contractNumber} />
                <Row label="Phòng" value={contractInfo.roomNumber} />
                <Row label="Người thuê" value={contractInfo.tenant} />
                <Row label="Số điện thoại" value={contractInfo.phone} />
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
                <Row label="Ngày ký" value={contractInfo.signDate} />
                <Row label="Bắt đầu" value={contractInfo.startDate} />
                <Row label="Kết thúc" value={contractInfo.endDate} />
                <Row
                  label="Gia hạn tiếp theo"
                  value={contractInfo.nextRenewal}
                  valueClass="text-orange-600"
                />
              </div>
            </div>
          </div>

          {/* Cột 2: Chi phí */}
          <div className="space-y-4">
            {/* Giá cơ bản */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Chi phí tháng trước</h4>
              <div className="space-y-3">
                <Row
                  label="Tiền thuê phòng"
                  value={formatVND(bill.breakdown.rent)}
                  valueClass="text-green-600"
                />
              </div>
            </div>

            {/* Dịch vụ chi tiết */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Dịch vụ</h4>
              <div className="space-y-3">
                <Row
                  label="Điện"
                  value={`${formatVND(
                    contractInfo.services.electricity.unitPrice
                  )} / kWh × ${contractInfo.services.electricity.usageKwh || 0} kWh = ${formatVND(
                    bill.breakdown.electricity
                  )}`}
                />
                <Row
                  label="Nước"
                  value={`${formatVND(
                    contractInfo.services.water.unitPrice
                  )} / người × ${contractInfo.services.water.people || 0} = ${formatVND(
                    bill.breakdown.water
                  )}`}
                />
                <Row
                  label="Internet"
                  value={`${contractInfo.services.internet.selected === "internet1"
                    ? "Gói chung (Internet 1)"
                    : "Gói riêng (Internet 2)"
                    } = ${formatVND(bill.breakdown.internet)} / phòng`}
                />
                <Row
                  label="Rác"
                  value={`${formatVND(
                    contractInfo.services.trash.feePerRoom
                  )} / phòng = ${formatVND(bill.breakdown.trash)}`}
                />
                <Row
                  label="Gửi xe"
                  value={`${formatVND(
                    contractInfo.services.parking.feePerVehicle
                  )} / xe × ${contractInfo.services.parking.vehicles || 0} = ${formatVND(
                    bill.breakdown.parking
                  )}`}
                />
                <div className="flex justify-between border-t pt-3 mt-2">
                  <span className="text-gray-600">Tổng dịch vụ</span>
                  <span className="font-semibold">
                    {formatVND(bill.subtotalServices)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-900 font-medium">
                    TỔNG CỘNG / THÁNG
                  </span>
                  <span className="font-bold text-indigo-600">
                    {formatVND(bill.total)}
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
                  value={formatVND(deposit)}
                  valueClass="text-orange-600"
                />
                <div className="text-sm text-gray-600">
                  <i className="ri-information-line mr-1"></i>
                  Tiền cọc = 1 tháng tiền thuê (tự động theo giá phòng).
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
