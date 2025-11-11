import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import phongTroService, { PhongTro, PhongTroCreateInput, PhongTroUpdateInput } from '../../services/phong-tro.service';
import dayTroService, { DayTro, DayTroCreateInput, DayTroUpdateInput } from '../../services/day-tro.service';
import { getErrorMessage } from '../../lib/http-client';


export interface Building {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'services' | 'utilities' | 'other';
  isActive: boolean;
  usageCount: number;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  area: number;
  amenities: string[]; // Tiện nghi cơ bản của loại phòng này
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
}

export interface Room {
  id: string;
  number: string;
  building: string;
  type: string;
  area: number;
  price: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant?: {
    name: string;
    phone: string;
    phone2?: string;
    email: string;
    idCard: string;
    idCardDate: string;
    idCardPlace: string;
    address: string;
    birthDate: string;
    birthPlace: string;
    vehicleNumber?: string;
    notes?: string;
    contractStart: string;
    contractEnd: string;
  };
  members?: Member[];
  thietBis?: ThietBiPhong[];
  services: {
    electricity: boolean;
    water: boolean;
    internet: boolean;
    parking: boolean;
    laundry: boolean;
    cleaning: boolean;
    garbage: boolean;
  };
  facilities: string[];
  contractUrl?: string;
}
export interface Member {
  name: string;
  birthDate: string;
  birthPlace: string;
  gender: string;
  idCard: string;
  idCardDate: string;
  idCardPlace: string;
  address: string;
  phone: string;
  phone2?: string;
  email: string;
  vehicleNumber?: string;
  notes?: string;
}

// ===== EQUIPMENT MANAGEMENT SYSTEM =====
// TODO Backend: Implement ThietBi API endpoints (see checklist at bottom of file)
export type LoaiThietBi = 'NoiThat' | 'ThietBiDien' | 'DienTu' | 'AnToan' | 'Khac';

export interface ThietBi {
  MaThietBi: number;
  TenThietBi: string;
  MaThietBi_Code: string;
  LoaiThietBi: LoaiThietBi;
  MaDay: number;
  MaPhong: number;
  NgayMua: string;
  GiaMua: number;
  TinhTrang: 'Tot' | 'Binh_Thuong' | 'Kem' | 'Hu_Hong';
  BaoTriLanCuoi?: string;
  BaoTriLanSau?: string;
  BaoHanh?: string;
  GhiChu?: string;
}

export interface ThietBiPhong {
  MaThietBi: number;
  TenThietBi: string;
  MaThietBi_Code: string;
  LoaiThietBi: LoaiThietBi;
  SoLuong: number;
  GhiChu?: string;
}

export const danhSachThietBiMau: ThietBiPhong[] = [
  { MaThietBi: 1, TenThietBi: 'Bình chữa cháy khí CO2 5kg', MaThietBi_Code: 'CC002', LoaiThietBi: 'AnToan', SoLuong: 1 },
  { MaThietBi: 2, TenThietBi: 'Máy lạnh Midea Inverter 1HP', MaThietBi_Code: 'MAFA-09CDN8', LoaiThietBi: 'ThietBiDien', SoLuong: 1 },
  { MaThietBi: 3, TenThietBi: 'Router Wifi Mercusys', MaThietBi_Code: 'MW302R', LoaiThietBi: 'DienTu', SoLuong: 1 },
  { MaThietBi: 4, TenThietBi: 'Tủ quần áo', MaThietBi_Code: 'WD001', LoaiThietBi: 'NoiThat', SoLuong: 1 },
  { MaThietBi: 5, TenThietBi: 'Bảng nội quy', MaThietBi_Code: 'NQ001', LoaiThietBi: 'Khac', SoLuong: 1 }
];

export const mockBuildings: Building[] = [
  { id: '1', name: 'Dãy A', address: '17/2A Nguyễn Hữu Tiến, Tây Thạnh', description: '17/2A Nguyễn Hữu Tiến, Tây Thạnh' },
  { id: '2', name: 'Dãy B', address: '17/2B Nguyễn Hữu Tiến, Tây Thạnh', description: 'Dãy phòng VIP' },
  { id: '3', name: 'Dãy C', address: '17/2C Nguyễn Hữu Tiến, Tây Thạnh', description: 'Dãy phòng mới' },
  { id: '4', name: 'Dãy D', address: '17/2C Nguyễn Hữu Tiến, Tây Thạnh', description: 'Dãy phòng cao cấp' }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Điện',
    description: 'Dịch vụ điện theo số',
    price: 3500,
    unit: 'kWh',
    category: 'utilities',
    isActive: true,
    usageCount: 45
  },
  {
    id: '2',
    name: 'Nước',
    description: 'Dịch vụ nước theo người',
    price: 60000,
    unit: 'Người/Tháng',
    category: 'utilities',
    isActive: true,
    usageCount: 32
  },
  {
    id: '3',
    name: 'Internet 1',
    description: 'Dịch vụ internet chung cơ bản',
    price: 50000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 28
  },
  {
    id: '4',
    name: 'Internet 2',
    description: 'Dịch vụ internet riêng tốc độ cao',
    price: 100000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 15
  },
  {
    id: '5',
    name: 'Rác',
    description: 'Dịch vụ thu gom rác',
    price: 40000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 8
  },
  {
    id: '6',
    name: 'Gửi xe',
    description: 'Dịch vụ giữ xe, xếp xe',
    price: 100000,
    unit: 'Phòng/Tháng',
    category: 'services',
    isActive: true,
    usageCount: 8
  },
  {
    id: '7',
    name: 'Giặt sấy',
    description: 'Dịch vụ giặt sấy quần áo',
    price: 7500,
    unit: 'Kg',
    category: 'other',
    isActive: true, // <-- ĐÃ SỬA (từ false)
    usageCount: 8
  },
  {
    id: '8', // <-- ĐÃ THÊM
    name: 'Dọn phòng',
    description: 'Dịch vụ dọn vệ sinh phòng',
    price: 150000,
    unit: 'Lần',
    category: 'services',
    isActive: true,
    usageCount: 10
  }
];

export const mockRoomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Phòng thường',
    description: 'Phòng tiêu chuẩn dành cho sinh viên hoặc người đi làm, có gác lửng tiện lợi.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'], // Tiện nghi cơ bản
    totalRooms: 3,
    availableRooms: 1,
    occupiedRooms: 2,
    maintenanceRooms: 0
  },
  {
    id: '2',
    name: 'Phòng kiot',
    description: 'Phòng dạng kiot phù hợp cho hộ gia đình nhỏ hoặc kinh doanh tại nhà.',
    basePrice: 2700000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    maintenanceRooms: 0
  },
  {
    id: '3',
    name: 'Phòng ban công',
    description: 'Phòng có ban công rộng rãi, đón ánh sáng tự nhiên và gió trời.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát', 'Ban công'], // Thêm ban công
    totalRooms: 2,
    availableRooms: 0,
    occupiedRooms: 1,
    maintenanceRooms: 1
  },
  {
    id: '4',
    name: 'Phòng góc',
    description: 'Phòng nằm ở góc tòa nhà, tạo cảm giác riêng tư, yên tĩnh quanh năm.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 1,
    availableRooms: 1,
    occupiedRooms: 0,
    maintenanceRooms: 0
  },
  {
    id: '5',
    name: 'Phòng trệt',
    description: 'Phòng ở tầng trệt thuận tiện di chuyển, phù hợp với người lớn tuổi hoặc gia đình có trẻ nhỏ.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 1,
    availableRooms: 1,
    occupiedRooms: 0,
    maintenanceRooms: 0
  },
  {
    id: '6',
    name: 'Phòng tầng thượng',
    description: 'Phòng nằm ở tầng cao nhất, yên tĩnh, thoáng gió, có thể tận hưởng không khí mát mẻ vào buổi tối.',
    basePrice: 2500000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 1,
    availableRooms: 0,
    occupiedRooms: 1,
    maintenanceRooms: 0
  }
];

export const mockRooms: Room[] = [
  {
    id: '1',
    number: 'A101',
    building: 'Dãy A',
    type: 'Phòng thường',
    area: 25,
    price: 2600000,
    status: 'occupied',
    tenant: {
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      phone2: '0987654321',
      email: 'nguyenvana@email.com',
      idCard: '123456789',
      idCardDate: '2020-01-15',
      idCardPlace: 'CA Hà Nội',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      birthDate: '1995-05-20',
      birthPlace: 'Hà Nội',
      vehicleNumber: '29A1-12345',
      notes: 'Khách hàng thân thiết',
      contractStart: '2024-01-15',
      contractEnd: '2024-12-15'
    },
    members: [
      {
        name: 'Nguyễn Văn A',
        birthDate: '1995-05-20',
        birthPlace: 'Hà Nội', // <-- CẬP NHẬT
        gender: 'Nam',
        idCard: '123456789',
        idCardDate: '2020-01-15', // <-- CẬP NHẬT
        idCardPlace: 'CA Hà Nội', // <-- CẬP NHẬT
        address: '123 Đường ABC, Quận 1, TP.HCM',
        phone: '0901234567',
        phone2: '0987654321', // <-- CẬP NHẬT
        email: 'nguyenvana@email.com', // <-- CẬP NHẬT
        vehicleNumber: '29A1-12345',
        notes: 'Khách hàng thân thiết' // <-- CẬP NHẬT
      }
    ],
    services: {
      electricity: true,
      water: true,
      internet: true,
      parking: false,
      laundry: true,
      cleaning: false,
      garbage: true
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo'],
    contractUrl: '/contracts/contract-a101.pdf'
  },
  {
    id: '2',
    number: 'A102',
    building: 'Dãy A',
    type: 'Phòng trệt',
    area: 25,
    price: 2600000,
    status: 'available',
    services: {
      electricity: false,
      water: false,
      internet: false,
      parking: false,
      laundry: false,
      cleaning: false,
      garbage: false
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', '2 Giường', 'Tủ quần áo', 'Bàn học']
  },
  {
    id: '3',
    number: 'B201',
    building: 'Dãy B',
    type: 'Phòng ban công',
    area: 25,
    price: 2600000,
    status: 'maintenance',
    services: {
      electricity: false,
      water: false,
      internet: false,
      parking: false,
      laundry: false,
      cleaning: false,
      garbage: false
    },
    facilities: ['Gác', 'Kệ chén bát', 'Ban công', 'Điều hòa', 'Tủ lạnh', 'Giường đôi', 'Tủ quần áo', 'Bàn học']
  },
  {
    id: '4',
    number: 'B202',
    building: 'Dãy B',
    type: 'Phòng thường',
    area: 25,
    price: 2600000,
    status: 'occupied',
    tenant: {
      name: 'Trần Thị B',
      phone: '0912345678',
      phone2: '0976543210',
      email: 'tranthib@email.com',
      idCard: '987654321',
      idCardDate: '2019-08-10',
      idCardPlace: 'CA TP.HCM',
      address: '456 Đường XYZ, Quận 3, TP.HCM',
      birthDate: '1992-12-10',
      birthPlace: 'TP.HCM',
      vehicleNumber: '51F1-67890',
      notes: 'Có thú cưng',
      contractStart: '2024-02-01',
      contractEnd: '2024-12-31'
    },
    members: [
      {
        name: 'Trần Thị B',
        birthDate: '1992-12-10',
        birthPlace: 'TP.HCM', // <-- CẬP NHẬT
        gender: 'Nữ',
        idCard: '987654321',
        idCardDate: '2019-08-10', // <-- CẬP NHẬT
        idCardPlace: 'CA TP.HCM', // <-- CẬP NHẬT
        address: '456 Đường XYZ, Quận 3, TP.HCM',
        phone: '0912345678',
        phone2: '0976543210', // <-- CẬP NHẬT
        email: 'tranthib@email.com', // <-- CẬP NHẬT
        vehicleNumber: '51F1-67890',
        notes: 'Có thú cưng' // <-- CẬP NHẬT
      },
      {
        name: 'Nguyễn Văn C',
        birthDate: '1993-03-15',
        birthPlace: '', // <-- CẬP NHẬT
        gender: 'Nam',
        idCard: '456789123',
        idCardDate: '', // <-- CẬP NHẬT
        idCardPlace: '', // <-- CẬP NHẬT
        address: '789 Đường DEF, Quận 5, TP.HCM',
        phone: '0923456789',
        phone2: '', // <-- CẬP NHẬT
        email: '', // <-- CẬP NHẬT
        vehicleNumber: '51G1-11111',
        notes: '' // <-- CẬP NHẬT
      }
    ],
    services: {
      electricity: true,
      water: true,
      internet: true,
      parking: true,
      laundry: false,
      cleaning: true,
      garbage: true
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo'],
    contractUrl: '/contracts/contract-b202.pdf'
  },
  {
    id: '5',
    number: 'C301',
    building: 'Dãy C',
    type: 'Phòng góc',
    area: 25,
    price: 2600000,
    status: 'available',
    services: {
      electricity: false,
      water: false,
      internet: false,
      parking: false,
      laundry: false,
      cleaning: false,
      garbage: false
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', '2 Giường', 'Tủ quần áo']
  },
  {
    id: '6',
    number: 'C302',
    building: 'Dãy C',
    type: 'Phòng tầng thượng',
    area: 25,
    price: 2500000,
    status: 'occupied',
    tenant: {
      name: 'Lê Văn D',
      phone: '0934567890',
      phone2: '0965432109',
      email: 'levand@email.com',
      idCard: '456789123',
      idCardDate: '2021-03-20',
      idCardPlace: 'CA Đà Nẵng',
      address: '321 Đường GHI, Quận 7, TP.HCM',
      birthDate: '1988-07-25',
      birthPlace: 'Đà Nẵng',
      vehicleNumber: '43A1-22222',
      notes: 'Gia đình có trẻ nhỏ',
      contractStart: '2024-03-01',
      contractEnd: '2025-02-28'
    },
    members: [
      {
        name: 'Lê Văn D',
        birthDate: '1988-07-25',
        birthPlace: 'Đà Nẵng', // <-- CẬP NHẬT
        gender: 'Nam',
        idCard: '456789123',
        idCardDate: '2021-03-20', // <-- CẬP NHẬT
        idCardPlace: 'CA Đà Nẵng', // <-- CẬP NHẬT
        address: '321 Đường GHI, Quận 7, TP.HCM',
        phone: '0934567890',
        phone2: '0965432109', // <-- CẬP NHẬT
        email: 'levand@email.com', // <-- CẬP NHẬT
        vehicleNumber: '43A1-22222',
        notes: 'Gia đình có trẻ nhỏ' // <-- CẬP NHẬT
      },
      {
        name: 'Phạm Thị E',
        birthDate: '1990-11-12',
        birthPlace: '', // <-- CẬP NHẬT
        gender: 'Nữ',
        idCard: '789123456',
        idCardDate: '', // <-- CẬP NHẬT
        idCardPlace: '', // <-- CẬP NHẬT
        address: '321 Đường GHI, Quận 7, TP.HCM',
        phone: '0945678901',
        phone2: '', // <-- CẬP NHẬT
        email: '', // <-- CẬP NHẬT
        vehicleNumber: '43B1-33333',
        notes: '' // <-- CẬP NHẬT
      },
      {
        name: 'Lê Văn F',
        birthDate: '2015-06-08',
        birthPlace: '', // <-- CẬP NHẬT
        gender: 'Nam',
        idCard: '',
        idCardDate: '', // <-- CẬP NHẬT
        idCardPlace: '', // <-- CẬP NHẬT
        address: '321 Đường GHI, Quận 7, TP.HCM',
        phone: '',
        phone2: '', // <-- CẬP NHẬT
        email: '', // <-- CẬP NHẬT
        vehicleNumber: '',
        notes: '' // <-- CẬP NHẬT
      }
    ],
    services: {
      electricity: true,
      water: true,
      internet: true,
      parking: true,
      laundry: true,
      cleaning: true,
      garbage: true
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', 'Giường đôi', 'Tủ quần áo', 'Bàn học', 'Ban công', 'Tủ bếp'],
    contractUrl: '/contracts/contract-c302.pdf'
  },
  {
    id: '7',
    number: 'D401',
    building: 'Dãy D',
    type: 'Phòng thường',
    area: 25,
    price: 2600000,
    status: 'available',
    services: {
      electricity: false,
      water: false,
      internet: false,
      parking: false,
      laundry: false,
      cleaning: false,
      garbage: false
    },
    facilities: ['Gác', 'Kệ chén bát', 'Điều hòa', 'Tủ lạnh', 'Giường', 'Tủ quần áo', 'Bàn học']
  },
  {
    id: '8',
    number: 'D402',
    building: 'Dãy D',
    type: 'Phòng ban công',
    area: 25,
    price: 2600000,
    status: 'occupied',
    tenant: {
      name: 'Hoàng Thị E',
      phone: '0967890123',
      phone2: '0954321098',
      email: 'hoangthie@email.com',
      idCard: '789123456',
      idCardDate: '2020-12-05',
      idCardPlace: 'CA Hải Phòng',
      address: '654 Đường JKL, Quận 10, TP.HCM',
      birthDate: '1985-09-18',
      birthPlace: 'Hải Phòng',
      vehicleNumber: '15A1-44444',
      notes: 'Làm việc ca đêm',
      contractStart: '2024-01-01',
      contractEnd: '2024-12-31'
    },
    members: [
      {
        name: 'Hoàng Thị E',
        birthDate: '1985-09-18',
        birthPlace: 'Hải Phòng', // <-- CẬP NHẬT
        gender: 'Nữ',
        idCard: '789123456',
        idCardDate: '2020-12-05', // <-- CẬP NHẬT
        idCardPlace: 'CA Hải Phòng', // <-- CẬP NHẬT
        address: '654 Đường JKL, Quận 10, TP.HCM',
        phone: '0967890123',
        phone2: '0954321098', // <-- CẬP NHẬT
        email: 'hoangthie@email.com', // <-- CẬP NHẬT
        vehicleNumber: '15A1-44444',
        notes: 'Làm việc ca đêm' // <-- CẬP NHẬT
      }
    ],
    services: {
      electricity: true,
      water: true,
      internet: true,
      parking: true,
      laundry: true,
      cleaning: true,
      garbage: true
    },
    facilities: ['Gác', 'Kệ chén bát', 'Ban công', 'Điều hòa', 'Tủ lạnh', 'Giường đôi', 'Tủ quần áo', 'Bàn học', 'Tủ bếp', 'Máy giặt'],
    contractUrl: '/contracts/contract-d402.pdf'
  }
];

export default function Rooms() {
  // ====== STATE ======
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Phòng trọ data (từ API)
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedPhongTro, setSelectedPhongTro] = useState<PhongTro | null>(null);
  const [editingPhongTro, setEditingPhongTro] = useState<PhongTro | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false);
  const [showEditBuildingModal, setShowEditBuildingModal] = useState(false);
  const [showChangeRoomModal, setShowChangeRoomModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [detailActiveTab, setDetailActiveTab] = useState('basic');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');

  // Dãy trọ data (từ API)
  const [dayTros, setDayTros] = useState<DayTro[]>([]);
  const [loadingDayTros, setLoadingDayTros] = useState(true);
  const [editingDayTro, setEditingDayTro] = useState<DayTro | null>(null);
  const [newDayTro, setNewDayTro] = useState({
    TenDay: '',
    DiaChi: ''
  });

  // Change room states
  const [changeRoomData, setChangeRoomData] = useState<{ fromRoom: PhongTro | null; toRoom: string }>({ fromRoom: null, toRoom: '' });

  // Equipment states (TODO Backend: Populate from API when available)
  const [thietBisPhongMoi, setThietBisPhongMoi] = useState<ThietBiPhong[]>([]);
  const [thietBisPhongDangSua, setThietBisPhongDangSua] = useState<ThietBiPhong[]>([]);

  // Grid/List view and bulk operations
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => { },
    loading: false
  });

  const toast = useToast();

  // State cho form "Thêm Phòng Mới"
  const [newRoomData, setNewRoomData] = useState({
    number: '',
    building: '',
    type: mockRoomTypes[0]?.name || 'Phòng thường' // Lấy loại phòng đầu tiên làm mặc định
  });

  // ====== FETCH DATA ======
  useEffect(() => {
    const controller = new AbortController();

    const fetchPhongTros = async () => {
      try {
        const response = await phongTroService.getAll(controller.signal);
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

    fetchPhongTros();
    return () => controller.abort();
  }, [refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // Fetch Dãy Trọ
  useEffect(() => {
    const controller = new AbortController();

    const fetchDayTros = async () => {
      try {
        const response = await dayTroService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setDayTros(response.data.data || []);
          setLoadingDayTros(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải danh sách dãy trọ', message: getErrorMessage(error) });
          setLoadingDayTros(false);
        }
      }
    };

    fetchDayTros();
    return () => controller.abort();
  }, [refreshKey]);

  const refreshDayTros = () => {
    setLoadingDayTros(true);
    setRefreshKey(prev => prev + 1);
  };

  // ====== HELPERS ======
  const getStatusColor = (trangThai: string) => {
    switch (trangThai) {
      case 'Trống':
        return 'bg-green-100 text-green-800';
      case 'Đã cho thuê':
        return 'bg-blue-100 text-blue-800';
      case 'Bảo trì':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Lấy meta theo RoomType name để đồng bộ area/price nhanh
  const findRoomTypeMeta = (typeName: string) => mockRoomTypes.find(rt => rt.name === typeName);

  // ====== FILTER SOURCES ======
  // Đọc từ state "dayTros"
  const buildings = ['all', ...dayTros.map(d => d.TenDay)];

  // Loại phòng cố định theo mockRoomTypes (6 loại)
  const roomTypes = ['all', ...mockRoomTypes.map(rt => rt.name)];

  // Lọc phòng
  const filteredPhongTros = phongTros.filter(phongTro => {
    const matchesBuilding = activeTab === 'all' || phongTro.TenDay === activeTab;
    const matchesStatus = filterStatus === 'all' || phongTro.TrangThai === filterStatus;
    const matchesType = filterType === 'all' || phongTro.TenLoaiPhong === filterType;

    const term = searchTerm.trim().toLowerCase();
    const matchesSearch =
      term === '' ||
      phongTro.TenPhong.toLowerCase().includes(term) ||
      (phongTro.TenDay || '').toLowerCase().includes(term) ||
      (phongTro.TenLoaiPhong || '').toLowerCase().includes(term);

    return matchesBuilding && matchesStatus && matchesType && matchesSearch;
  });

  // ====== BULK SELECTION ======
  const handleSelectAll = () => {
    if (selectedRooms.length === filteredPhongTros.length) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(filteredPhongTros.map(phongTro => phongTro.MaPhong));
    }
  };

  const handleSelectRoom = (maPhong: number) => {
    setSelectedRooms(prev => (prev.includes(maPhong) ? prev.filter(id => id !== maPhong) : [...prev, maPhong]));
  };

  // ====== BULK OPS ======
  const handleBulkStatusChange = (newTrangThai: 'Trống' | 'Đã cho thuê' | 'Bảo trì') => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thay đổi trạng thái',
      message: `Bạn có chắc chắn muốn chuyển ${selectedRooms.length} phòng sang trạng thái "${newTrangThai}" không?`,
      type: 'warning',
      loading: false,
      onConfirm: async () => {
        try {
          // TODO: Call API to bulk update status
          // For now, just show success
          toast.success({
            title: 'Cập nhật thành công',
            message: `Đã chuyển ${selectedRooms.length} phòng sang trạng thái "${newTrangThai}"`
          });
          setSelectedRooms([]);
          setShowBulkActions(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          refreshData();
        } catch (error) {
          toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
      }
    });
  };

  const handleBulkDelete = () => {
    const occupiedPhongTros = phongTros.filter(phongTro => selectedRooms.includes(phongTro.MaPhong) && phongTro.TrangThai === 'Đã cho thuê');

    if (occupiedPhongTros.length > 0) {
      toast.error({
        title: 'Không thể xóa',
        message: `Có ${occupiedPhongTros.length} phòng đang được thuê. Vui lòng trả phòng trước khi xóa.`
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa phòng',
      message: `Bạn có chắc chắn muốn xóa ${selectedRooms.length} phòng không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          // Call API to bulk delete
          await Promise.all(selectedRooms.map(maPhong => phongTroService.delete(maPhong)));
          toast.success({
            title: 'Xóa thành công',
            message: `Đã xóa ${selectedRooms.length} phòng khỏi hệ thống`
          });
          setSelectedRooms([]);
          setShowBulkActions(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          refreshData();
        } catch (error) {
          toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
      }
    });
  };

  // ====== SINGLE ROOM OPS ======
  const handleDeleteRoom = (phongTro: PhongTro) => {
    if (phongTro.TrangThai === 'Đã cho thuê') {
      toast.error({
        title: 'Không thể xóa',
        message: 'Phòng đang được thuê. Vui lòng trả phòng trước khi xóa.'
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa phòng',
      message: `Bạn có chắc chắn muốn xóa phòng ${phongTro.TenPhong} không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          await phongTroService.delete(phongTro.MaPhong);
          toast.success({
            title: 'Xóa thành công',
            message: `Đã xóa phòng ${phongTro.TenPhong} khỏi hệ thống`
          });
          setSelectedPhongTro(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          refreshData();
        } catch (error) {
          toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
      }
    });
  };

  const handleViewContract = (contractUrl: string) => {
    window.open(contractUrl, '_blank');
  };

  const handleChangeRoom = (phongTro: PhongTro) => {
    setChangeRoomData({ fromRoom: phongTro, toRoom: '' });
    setShowChangeRoomModal(true);
  };

  const handleCheckOut = (phongTro: PhongTro) => {
    setSelectedPhongTro(phongTro);
    setShowCheckOutModal(true);
  };

  const handleEditRoom = (phongTro: PhongTro) => {
    setEditingPhongTro({ ...phongTro });
    setShowEditModal(true);
  };

  const handleEditDayTro = (tenDay: string) => {
    const dayTro = dayTros.find(d => d.TenDay === tenDay);
    if (dayTro) {
      setEditingDayTro({ ...dayTro });
      setShowEditBuildingModal(true);
    }
  };

  const handleDeleteDayTro = (tenDay: string) => {
    // Tìm dãy trọ
    const dayTro = dayTros.find(d => d.TenDay === tenDay);
    if (!dayTro) return;

    // Kiểm tra xem dãy có phòng nào không
    const phongTrosInDayTro = phongTros.filter(phongTro => phongTro.TenDay === tenDay);
    if (phongTrosInDayTro.length > 0) {
      toast.error({
        title: 'Không thể xóa',
        message: `Dãy "${tenDay}" vẫn còn ${phongTrosInDayTro.length} phòng. Không thể xóa.`
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa dãy phòng',
      message: `Bạn có chắc chắn muốn xóa ${tenDay} không? Dãy này hiện không có phòng.`,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          await dayTroService.deleteDayTro(dayTro.MaDay);
          toast.success({
            title: 'Xóa thành công',
            message: `Đã xóa ${tenDay} khỏi hệ thống`
          });
          // Nếu đang ở tab dãy vừa xóa thì chuyển về "Tất cả"
          setActiveTab('all');
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
          refreshDayTros();
        } catch (error) {
          toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
        }
      }
    });
  };

  const handleAddRoomToBuilding = (buildingName: string) => {
    // Cập nhật state cho form "Thêm Phòng"
    setNewRoomData({
      number: '',
      building: buildingName,
      type: mockRoomTypes[0]?.name || 'Phòng thường'
    });
    setShowAddModal(true);
    // Không cần setSelectedBuilding nữa
  };

  // Chuyển phòng: chuyển tenant/members/dịch vụ từ phòng A → phòng B (phòng B phải available)
  const handleConfirmChangeRoom = async () => {
    const from = changeRoomData.fromRoom;
    const toNumber = changeRoomData.toRoom;
    if (!from || !toNumber) return;

    try {
      // TODO: Call API to change room
      // For now, just show success
      toast.success({
        title: 'Chuyển phòng thành công',
        message: `Đã chuyển khách từ phòng ${from.TenPhong} sang phòng ${toNumber}`
      });
      setShowChangeRoomModal(false);
      setChangeRoomData({ fromRoom: null, toRoom: '' });
      refreshData();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  // Trả phòng: clear tenant/members, set available
  const handleConfirmCheckOut = async () => {
    if (!selectedPhongTro) return;

    try {
      // TODO: Call API to checkout
      // For now, just show success
      toast.success({
        title: 'Trả phòng thành công',
        message: `Đã xác nhận trả phòng ${selectedPhongTro.TenPhong}. Phòng sẽ chuyển về trạng thái trống.`
      });
      setShowCheckOutModal(false);
      setSelectedPhongTro(null);
      refreshData();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  // Lưu phòng: ghi lại thay đổi từ editingPhongTro
  const handleSaveRoom = async () => {
    if (!editingPhongTro) return;

    try {
      const updateData: PhongTroUpdateInput = {
        MaDay: editingPhongTro.MaDay,
        MaLoaiPhong: editingPhongTro.MaLoaiPhong,
        TenPhong: editingPhongTro.TenPhong,
        DonGiaCoBan: editingPhongTro.DonGiaCoBan,
        DienTich: editingPhongTro.DienTich,
        TrangThai: editingPhongTro.TrangThai,
        MoTa: editingPhongTro.MoTa,
        TienNghi: editingPhongTro.TienNghi
      };

      await phongTroService.update(editingPhongTro.MaPhong, updateData);
      toast.success({
        title: 'Cập nhật thành công',
        message: 'Đã lưu thông tin phòng thành công!'
      });
      setShowEditModal(false);
      setEditingPhongTro(null);
      refreshData();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  const handleSaveDayTro = async () => {
    if (!editingDayTro) return;

    try {
      const updateData: DayTroUpdateInput = {
        TenDay: editingDayTro.TenDay,
        DiaChi: editingDayTro.DiaChi
      };

      await dayTroService.updateDayTro(editingDayTro.MaDay, updateData);
      toast.success({
        title: 'Cập nhật thành công',
        message: `Đã lưu thông tin dãy ${editingDayTro.TenDay}!`
      });
      setShowEditBuildingModal(false);
      setEditingDayTro(null);
      refreshDayTros();
      refreshData(); // Refresh rooms to get updated building names
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  const handleAddDayTro = async () => {
    if (!newDayTro.TenDay.trim() || !newDayTro.DiaChi.trim()) {
      toast.error({ title: 'Lỗi', message: 'Tên dãy và địa chỉ không được để trống.' });
      return;
    }
    if (dayTros.some(d => d.TenDay.trim().toLowerCase() === newDayTro.TenDay.trim().toLowerCase())) {
      toast.error({ title: 'Lỗi', message: 'Tên dãy này đã tồn tại.' });
      return;
    }

    try {
      const createData: DayTroCreateInput = {
        TenDay: newDayTro.TenDay.trim(),
        DiaChi: newDayTro.DiaChi.trim()
      };

      await dayTroService.createDayTro(createData);
      toast.success({
        title: 'Thêm thành công',
        message: `Đã thêm dãy ${createData.TenDay} thành công!`
      });

      setShowAddBuildingModal(false);
      setNewDayTro({ TenDay: '', DiaChi: '' }); // Reset form
      refreshDayTros();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  // Thêm phòng mới
  const handleAddRoom = async () => {
    if (!newRoomData.number.trim() || !newRoomData.building || !newRoomData.type) {
      toast.error({ title: 'Lỗi', message: 'Vui lòng điền đủ Số phòng, Dãy, và Loại phòng.' });
      return;
    }
    if (phongTros.some(p => p.TenPhong.toLowerCase() === newRoomData.number.trim().toLowerCase())) {
      toast.error({ title: 'Lỗi', message: `Số phòng "${newRoomData.number}" đã tồn tại.` });
      return;
    }

    // Tìm thông tin từ loại phòng
    const meta = findRoomTypeMeta(newRoomData.type);
    if (!meta) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy loại phòng.' });
      return;
    }

    // TODO: Get MaDay and MaLoaiPhong from backend API
    // For now, we'll use placeholder values
    const building = buildingList.find(b => b.name === newRoomData.building);
    if (!building) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy dãy phòng.' });
      return;
    }

    try {
      const createData: PhongTroCreateInput = {
        MaDay: parseInt(building.id), // TODO: This needs to be correct ID from backend
        MaLoaiPhong: parseInt(meta.id), // TODO: This needs to be correct ID from backend
        TenPhong: newRoomData.number.trim(),
        DonGiaCoBan: meta.basePrice,
        DienTich: meta.area,
        TrangThai: 'Trống',
        MoTa: null,
        TienNghi: meta.amenities
      };

      await phongTroService.create(createData);
      toast.success({
        title: 'Thêm thành công',
        message: `Đã thêm phòng ${newRoomData.number} vào ${newRoomData.building}!`
      });

      setShowAddModal(false);
      // Reset form
      setNewRoomData({
        number: '',
        building: '',
        type: mockRoomTypes[0]?.name || 'Phòng thường'
      });
      refreshData();
    } catch (error) {
      toast.error({ title: 'Lỗi', message: getErrorMessage(error) });
    }
  };

  // ====== TABS COUNT ======
  const tabButtons = [
    { id: 'all', label: 'Tất cả', count: phongTros.length },
    ...buildings
      .filter(b => b !== 'all')
      .map(building => ({
        id: building,
        label: building,
        count: phongTros.filter(p => p.TenDay === building).length
      }))
  ];

  // Danh sách phòng trống dùng cho "Đổi phòng"
  const availablePhongTros = phongTros.filter(phongTro => phongTro.TrangThai === 'Trống');


  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phòng</h1>
                <p className="text-gray-600">Quản lý thông tin các phòng trọ theo dãy</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddBuildingModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-building-line mr-2"></i>
                  Thêm dãy phòng
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Thêm phòng mới
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {tabButtons.map((tab) => (
                    <div key={tab.id} className="flex items-center">
                      <button
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        {tab.label}
                        <span
                          className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          {tab.count}
                        </span>
                      </button>

                      {/* Building Actions */}
                      {tab.id !== 'all' && activeTab === tab.id && (
                        <div className="flex items-center ml-4 space-x-2">
                          <button
                            onClick={() => handleAddRoomToBuilding(tab.id)}
                            className="text-green-600 hover:text-green-800 cursor-pointer"
                            title="Thêm phòng"
                          >
                            <i className="ri-add-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleEditDayTro(tab.id)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Sửa dãy"
                          >
                            <i className="ri-edit-line text-lg"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteDayTro(tab.id)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Xóa dãy"
                          >
                            <i className="ri-delete-bin-line text-lg"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Advanced Filters */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Bộ lọc nâng cao</h3>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-4">
                    {selectedRooms.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Đã chọn {selectedRooms.length} phòng</span>
                        <button
                          onClick={() => setShowBulkActions(!showBulkActions)}
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-sm hover:bg-indigo-200 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-settings-3-line mr-1"></i>
                          Thao tác hàng loạt
                        </button>
                      </div>
                    )}

                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`px-3 py-1 rounded-md text-sm cursor-pointer ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <i className="ri-grid-line mr-1"></i>
                        Lưới
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 rounded-md text-sm cursor-pointer ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <i className="ri-list-unordered mr-1"></i>
                        Danh sách
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions Panel */}
                {showBulkActions && selectedRooms.length > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-indigo-900">Thao tác hàng loạt ({selectedRooms.length} phòng)</h4>
                      <button
                        onClick={() => setShowBulkActions(false)}
                        className="text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleBulkStatusChange('Trống')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-check-line mr-1"></i>
                        Chuyển thành trống
                      </button>
                      <button
                        onClick={() => handleBulkStatusChange('Bảo trì')}
                        className="bg-orange-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-orange-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-tools-line mr-1"></i>
                        Chuyển thành bảo trì
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        Xóa tất cả
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
                    <input
                      type="text"
                      placeholder="Số phòng, tên khách..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm"
                    >
                      <option value="all">Tất cả loại</option>
                      {roomTypes
                        .filter((t) => t !== 'all')
                        .map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="Trống">Phòng trống</option>
                      <option value="Đã cho thuê">Đã thuê</option>
                      <option value="Bảo trì">Bảo trì</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setFilterType('all');
                        setFilterStatus('all');
                      }}
                      className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-refresh-line mr-1"></i>
                      Đặt lại
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Select All Checkbox */}
            {!loading && filteredPhongTros.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm mb-4 p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRooms.length === filteredPhongTros.length}
                    onChange={handleSelectAll}
                    className="mr-3 h-4 w-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Chọn tất cả ({filteredPhongTros.length} phòng)</span>
                </label>
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredPhongTros.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-inbox-line text-6xl text-gray-300"></i>
                <p className="text-gray-500 mt-4">Không tìm thấy phòng nào</p>
              </div>
            )}

            {/* Rooms Display */}
            {!loading && viewMode === 'grid' && (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPhongTros.map((phongTro) => (
                  <div key={phongTro.MaPhong} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedRooms.includes(phongTro.MaPhong)}
                            onChange={() => handleSelectRoom(phongTro.MaPhong)}
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{phongTro.TenPhong}</h3>
                            <p className="text-sm text-gray-600">• {phongTro.TenLoaiPhong}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phongTro.TrangThai)}`}>
                          {phongTro.TrangThai}
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Diện tích:</span>
                          <span className="text-sm font-medium">{phongTro.DienTich}m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Giá thuê:</span>
                          <span className="text-sm font-medium text-green-600">
                            {(phongTro.GiaThueHienTai || phongTro.DonGiaCoBan).toLocaleString('vi-VN')}đ/tháng
                          </span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Tiện nghi:</p>
                        <div className="flex flex-wrap gap-1">
                          {phongTro.TienNghi.slice(0, 3).map((tienNghi, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tienNghi}
                            </span>
                          ))}
                          {phongTro.TienNghi.length > 3 && (
                            <span className="text-xs text-gray-500">+{phongTro.TienNghi.length - 3} khác</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedPhongTro(phongTro)}
                            className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleEditRoom(phongTro)}
                            className="px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                        </div>

                        {/* Quick Actions */}
                        {phongTro.TrangThai === 'Đã cho thuê' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleChangeRoom(phongTro)}
                              className="flex-1 bg-orange-50 text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-100 text-sm font-medium cursor-pointer"
                            >
                              <i className="ri-exchange-line mr-1"></i>
                              Đổi phòng
                            </button>
                            <button
                              onClick={() => handleCheckOut(phongTro)}
                              className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 text-sm font-medium cursor-pointer"
                            >
                              <i className="ri-logout-box-line mr-1"></i>
                              Trả phòng
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {!loading && viewMode === 'list' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedRooms.length === filteredPhongTros.length}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-indigo-600 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dãy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diện tích</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá thuê</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPhongTros.map((phongTro) => (
                        <tr key={phongTro.MaPhong} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedRooms.includes(phongTro.MaPhong)}
                              onChange={() => handleSelectRoom(phongTro.MaPhong)}
                              className="h-4 w-4 text-indigo-600 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{phongTro.TenPhong}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{phongTro.TenDay}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{phongTro.TenLoaiPhong}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{phongTro.DienTich}m²</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">{(phongTro.GiaThueHienTai || phongTro.DonGiaCoBan).toLocaleString('vi-VN')}đ</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phongTro.TrangThai)}`}>
                              {phongTro.TrangThai}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedPhongTro(phongTro)}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                title="Chi tiết"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                              <button
                                onClick={() => handleEditRoom(phongTro)}
                                className="text-blue-600 hover:text-blue-900 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              {phongTro.TrangThai === 'Đã cho thuê' && (
                                <>
                                  <button
                                    onClick={() => handleChangeRoom(phongTro)}
                                    className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                    title="Đổi phòng"
                                  >
                                    <i className="ri-exchange-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleCheckOut(phongTro)}
                                    className="text-red-600 hover:text-red-900 cursor-pointer"
                                    title="Trả phòng"
                                  >
                                    <i className="ri-logout-box-line"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {filteredRooms.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Không tìm thấy phòng nào phù hợp với bộ lọc</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Room Detail Modal */}
      {selectedPhongTro && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedPhongTro(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết phòng {selectedPhongTro.TenPhong}</h2>
                <button onClick={() => setSelectedPhongTro(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* Detail Content */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thông tin phòng</h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Số phòng:</span>
                        <span className="font-medium">{selectedPhongTro.TenPhong}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dãy:</span>
                        <span className="font-medium">{selectedPhongTro.TenDay}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Loại phòng:</span>
                        <span className="font-medium">{selectedPhongTro.TenLoaiPhong}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diện tích:</span>
                        <span className="font-medium">{selectedPhongTro.DienTich}m²</span>
                        </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá thuê:</span>
                        <span className="font-medium text-green-600">
                          {(selectedPhongTro.GiaThueHienTai || selectedPhongTro.DonGiaCoBan).toLocaleString('vi-VN')}đ/tháng
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPhongTro.TrangThai)}`}>
                          {selectedPhongTro.TrangThai}
                        </span>
                      </div>
                      {selectedPhongTro.MoTa && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Mô tả:</span>
                          <p className="text-sm mt-1">{selectedPhongTro.MoTa}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Tiện nghi</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedPhongTro.TienNghi.map((tienNghi, index) => (
                          <div key={index} className="flex items-center">
                            <i className="ri-check-line text-green-500 mr-2"></i>
                            <span className="text-sm">{tienNghi}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleEditRoom(selectedPhongTro)}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={() => handleDeleteRoom(selectedPhongTro)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Xóa phòng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Building Modal */}
      {showEditBuildingModal && editingBuilding && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditBuildingModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa dãy phòng</h2>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDayTro();
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dãy phòng</label>
                  <input
                    type="text"
                    value={editingBuilding.name}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={editingBuilding.address || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, address: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Nhập địa chỉ của dãy nhà..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    value={editingBuilding.description || ''}
                    onChange={(e) => setEditingBuilding({ ...editingBuilding, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditBuildingModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Building Modal */}
      {showAddBuildingModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddBuildingModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm dãy phòng mới</h2>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddDayTro();
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dãy phòng</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Dãy E"
                    value={newBuilding.name}
                    onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Nhập địa chỉ của dãy nhà..."
                    value={newBuilding.address}
                    onChange={(e) => setNewBuilding({ ...newBuilding, address: e.target.value })}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Mô tả về dãy phòng..."
                    value={newBuilding.description}
                    onChange={(e) => setNewBuilding({ ...newBuilding, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddBuildingModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap"
                  >
                    Thêm dãy phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setShowAddModal(false)}
            ></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Thêm phòng mới {selectedBuilding && `- ${selectedBuilding}`}
              </h2>

              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddRoom();
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số phòng
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="A101"
                    value={newRoomData.number}
                    onChange={(e) => setNewRoomData({ ...newRoomData, number: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dãy phòng
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    value={newRoomData.building}
                    onChange={(e) => setNewRoomData({ ...newRoomData, building: e.target.value })}
                    required
                  >
                    <option value="" disabled>-- Chọn dãy --</option>
                    {buildingList // Đọc từ state
                      .map((building) => (
                        <option key={building.id} value={building.name}>
                          {building.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Loại phòng
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    value={newRoomData.type}
                    onChange={(e) => setNewRoomData({ ...newRoomData, type: e.target.value })}
                    required
                  >
                    {roomTypes
                      .filter((t) => t !== 'all')
                      .map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Diện tích & giá sẽ tự lấy từ loại phòng khi lưu.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      // Không cần reset selectedBuilding
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Thêm phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa phòng {editingRoom.number}</h2>

              {/* Edit Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8" aria-label="Edit Tabs">
                  <button
                    onClick={() => setDetailActiveTab('basic')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${detailActiveTab === 'basic'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Thông tin cơ bản
                  </button>
                  <button
                    onClick={() => setDetailActiveTab('tenant')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${detailActiveTab === 'tenant'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Khách thuê
                  </button>
                  <button
                    onClick={() => setDetailActiveTab('services')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${detailActiveTab === 'services'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Dịch vụ
                  </button>
                  <button
                    onClick={() => setDetailActiveTab('members')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${detailActiveTab === 'members'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Thành viên
                  </button>
                  <button
                    onClick={() => setDetailActiveTab('thietbi')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${detailActiveTab === 'thietbi'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Thiết bị
                  </button>
                </nav>
              </div>

              {/* Edit Content */}
              <div className="space-y-6">
                {detailActiveTab === 'basic' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số phòng</label>
                        <input
                          type="text"
                          value={editingRoom.number}
                          onChange={(e) => {
                            const newType = e.target.value;
                            const meta = findRoomTypeMeta(newType);
                            setEditingRoom({
                              ...editingRoom,
                              type: newType,
                              // Tự động cập nhật giá và diện tích theo loại phòng mới
                              area: meta ? meta.area : editingRoom.area,
                              price: meta ? meta.basePrice : editingRoom.price,
                            });
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dãy phòng</label>
                        <select
                          value={editingRoom.building}
                          onChange={(e) => setEditingRoom({ ...editingRoom, building: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          {buildings
                            .filter((b) => b !== 'all')
                            .map((building) => (
                              <option key={building} value={building}>
                                {building}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                        <select
                          value={editingRoom.type}
                          onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          {roomTypes
                            .filter((t) => t !== 'all')
                            .map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Diện tích & giá sẽ khớp theo loại phòng khi lưu.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                        <input
                          type="number"
                          value={editingRoom.area}
                          readOnly
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá thuê (VNĐ)</label>
                        <input
                          type="number"
                          value={editingRoom.price}
                          readOnly
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                        <select
                          value={editingRoom.status}
                          onChange={(e) =>
                            setEditingRoom({ ...editingRoom, status: e.target.value as 'available' | 'occupied' | 'maintenance' })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="available">Trống</option>
                          <option value="occupied">Đã thuê</option>
                          <option value="maintenance">Bảo trì</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Tiện nghi</h3>
                      <div>
                        <textarea
                          value={editingRoom.facilities.join(', ')}
                          onChange={(e) =>
                            setEditingRoom({
                              ...editingRoom,
                              facilities: e.target.value.split(', ').filter((f) => f.trim()),
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          rows={8}
                          placeholder="Điều hòa, Tủ lạnh, Giường..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                      </div>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'tenant' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thông tin khách thuê</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.name || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), name: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                          <input
                            type="date"
                            value={editingRoom.tenant?.birthDate || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), birthDate: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nơi sinh</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.birthPlace || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), birthPlace: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CMND/CCCD</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.idCard || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), idCard: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cấp</label>
                          <input
                            type="date"
                            value={editingRoom.tenant?.idCardDate || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), idCardDate: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nơi cấp</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.idCardPlace || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), idCardPlace: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại 1</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.phone || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), phone: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại 2</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.phone2 || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), phone2: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={editingRoom.tenant?.email || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), email: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
                          <input
                            value={editingRoom.tenant?.address || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), address: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Số xe</label>
                          <input
                            type="text"
                            value={editingRoom.tenant?.vehicleNumber || ''}
                            onChange={(e) =>
                              setEditingRoom({
                                ...editingRoom,
                                tenant: { ...(editingRoom.tenant || ({} as any)), vehicleNumber: e.target.value },
                              })
                            }
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                          />
                        </div>
                        <div className="block text-sm font-medium text-gray-700 mb-1">Ghi chú khác</div>
                        <input
                          value={editingRoom.tenant?.notes || ''}
                          onChange={(e) =>
                            setEditingRoom({
                              ...editingRoom,
                              tenant: { ...(editingRoom.tenant || ({} as any)), notes: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'services' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Dịch vụ sử dụng</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.electricity}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, electricity: e.target.checked } })
                            }
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Điện</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.water}
                            onChange={(e) => setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, water: e.target.checked } })}
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Nước</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.internet}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, internet: e.target.checked } })
                            }
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Internet</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.parking}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, parking: e.target.checked } })
                            }
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Gửi xe</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.laundry}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, laundry: e.target.checked } })
                            }
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Giặt sấy</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingRoom.services.cleaning}
                            onChange={(e) =>
                              setEditingRoom({ ...editingRoom, services: { ...editingRoom.services, cleaning: e.target.checked } })
                            }
                            className="mr-3 h-4 w-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm">Dọn phòng</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'members' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thành viên trong phòng</h3>
                    <div className="space-y-4">
                      {editingRoom.members?.map((member, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          {/* --- HÀNG 1: THÔNG TIN CÁ NHÂN --- */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Họ tên
                              </label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, name: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày sinh
                              </label>
                              <input
                                type="date"
                                value={member.birthDate}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, birthDate: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Giới tính
                              </label>
                              <select
                                value={member.gender}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, gender: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm"
                              >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                              </select>
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nơi sinh
                              </label>
                              <input
                                type="text"
                                value={member.birthPlace || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, birthPlace: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          {/* --- HÀNG 2: CMND/CCCD --- */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                CMND/CCCD
                              </label>
                              <input
                                type="text"
                                value={member.idCard}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, idCard: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày cấp
                              </label>
                              <input
                                type="date"
                                value={member.idCardDate || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, idCardDate: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nơi cấp
                              </label>
                              <input
                                type="text"
                                value={member.idCardPlace || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, idCardPlace: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          {/* --- HÀNG 3: LIÊN HỆ & XE --- */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điện thoại 1
                              </label>
                              <input
                                type="text"
                                value={member.phone}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, phone: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Điện thoại 2
                              </label>
                              <input
                                type="text"
                                value={member.phone2 || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, phone2: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                              </label>
                              <input
                                type="email"
                                value={member.email || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, email: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Số xe
                              </label>
                              <input
                                type="text"
                                value={member.vehicleNumber || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, vehicleNumber: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                          </div>

                          {/* --- HÀNG 4: ĐỊA CHỈ & GHI CHÚ --- */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Địa chỉ
                              </label>
                              <input
                                type="text"
                                value={member.address}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, address: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ghi chú
                              </label>
                              <textarea
                                value={member.notes || ''}
                                onChange={(e) => {
                                  const newMembers = [...(editingRoom.members || [])];
                                  newMembers[index] = { ...member, notes: e.target.value };
                                  setEditingRoom({ ...editingRoom, members: newMembers });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                rows={2}
                              ></textarea>
                            </div>
                          </div>

                          {/* Nút Xóa */}
                          <div className="flex justify-end mt-3">
                            <button
                              onClick={() => {
                                const newMembers =
                                  editingRoom.members?.filter((_, i) => i !== index) || [];
                                setEditingRoom({ ...editingRoom, members: newMembers });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                            >
                              <i className="ri-delete-bin-line mr-1"></i>
                              Xóa thành viên
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          // Khởi tạo một thành viên mới với ĐẦY ĐỦ các trường
                          const newMember: Member = {
                            name: '',
                            birthDate: '',
                            birthPlace: '', // <-- THÊM
                            gender: 'Nam',
                            idCard: '',
                            idCardDate: '', // <-- THÊM
                            idCardPlace: '', // <-- THÊM
                            address: '',
                            phone: '',
                            phone2: '', // <-- THÊM
                            email: '', // <-- THÊM
                            vehicleNumber: '',
                            notes: '', // <-- THÊM
                          };

                          const newMembers = [...(editingRoom.members || []), newMember];
                          setEditingRoom({ ...editingRoom, members: newMembers });
                        }}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <i className="ri-add-line mr-2"></i>
                        Thêm thành viên mới
                      </button>
                    </div>
                  </div>
                )}

                {detailActiveTab === 'thietbi' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thiết bị của phòng</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <i className="ri-information-line text-blue-600 text-xl mr-3 mt-0.5"></i>
                          <div className="flex-1">
                            <p className="text-sm text-blue-800 font-medium mb-1">Tính năng đang phát triển</p>
                            <p className="text-sm text-blue-700">
                              Quản lý thiết bị phòng sẽ được kích hoạt sau khi Backend implement API.
                              <br />
                              <span className="font-medium">TODO Backend:</span> Tạo bảng <code className="bg-blue-100 px-1 rounded">thiet_bi</code> và endpoints CRUD.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Preview UI - sẽ hoạt động sau khi có API */}
                      <div className="opacity-50 pointer-events-none">
                        <div className="border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-700 mb-3">Danh sách thiết bị hiện có</h4>
                          <div className="text-sm text-gray-500 italic text-center py-8 bg-gray-50 rounded">
                            Chưa có dữ liệu từ Backend
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-400 cursor-not-allowed"
                        >
                          <i className="ri-add-line mr-2"></i>
                          Thêm thiết bị (cần Backend API)
                        </button>
                      </div>

                      {/* Danh sách thiết bị mẫu tham khảo */}
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="font-medium text-gray-700 mb-3">Danh sách thiết bị mẫu (tham khảo)</h4>
                        <div className="space-y-2">
                          {danhSachThietBiMau.map((tb) => (
                            <div key={tb.MaThietBi} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{tb.TenThietBi}</p>
                                <p className="text-xs text-gray-500">Mã: {tb.MaThietBi_Code} | Loại: {tb.LoaiThietBi}</p>
                              </div>
                              <span className="text-sm text-gray-600">SL: {tb.SoLuong}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveRoom}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Room Modal */}
      {showChangeRoomModal && changeRoomData.fromRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowChangeRoomModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Đổi phòng cho khách thuê</h2>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin hiện tại</h3>
                  <p className="text-sm text-gray-600">
                    Phòng: <span className="font-medium">{changeRoomData.fromRoom.number}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Khách thuê: <span className="font-medium">{changeRoomData.fromRoom.tenant?.name}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phòng mới</label>
                  <select
                    value={changeRoomData.toRoom}
                    onChange={(e) => setChangeRoomData({ ...changeRoomData, toRoom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="">-- Chọn phòng trống --</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.number}>
                        {room.number} - {room.type} - {room.price.toLocaleString('vi-VN')}đ/tháng
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lý do đổi phòng</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Nhập lý do đổi phòng..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày chuyển</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowChangeRoomModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmChangeRoom}
                  disabled={!changeRoomData.toRoom}
                  className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 cursor-pointer whitespace-nowrap"
                >
                  Xác nhận đổi phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {showCheckOutModal && selectedRoom && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCheckOutModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Xác nhận trả phòng</h2>

              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Thông tin phòng</h3>
                  <p className="text-sm text-gray-600">
                    Phòng: <span className="font-medium">{selectedRoom.number}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Khách thuê: <span className="font-medium">{selectedRoom.tenant?.name}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Hợp đồng đến:{' '}
                    <span className="font-medium">
                      {selectedRoom.tenant?.contractEnd
                        ? new Date(selectedRoom.tenant.contractEnd).toLocaleDateString('vi-VN')
                        : '-'}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày trả phòng</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiền cọc hoàn trả</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="5000000" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Tình trạng phòng, thiết bị..."></textarea>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <i className="ri-warning-line text-yellow-600 mr-2 mt-0.5"></i>
                    <p className="text-sm text-yellow-800">Sau khi xác nhận, phòng sẽ chuyển về trạng thái trống và có thể cho thuê lại.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCheckOutModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmCheckOut}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap"
                >
                  Xác nhận trả phòng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </div>
  );

}

/*
 * ============================================================================
 * BACKEND IMPLEMENTATION CHECKLIST - EQUIPMENT MANAGEMENT SYSTEM
 * ============================================================================
 *
 * Frontend đã implement Equipment UI (tab "Thiết bị") và interfaces.
 * Backend cần implement các bước sau để kích hoạt tính năng:
 *
 * ## 1. DATABASE SCHEMA
 *
 * ### Bảng: `thiet_bi`
 * ```sql
 * CREATE TABLE thiet_bi (
 *   MaThietBi INT PRIMARY KEY AUTO_INCREMENT,
 *   TenThietBi VARCHAR(255) NOT NULL,
 *   MaThietBi_Code VARCHAR(50) UNIQUE,
 *   LoaiThietBi ENUM('NoiThat', 'ThietBiDien', 'DienTu', 'AnToan', 'Khac'),
 *   MaDay INT,
 *   MaPhong INT,
 *   NgayMua DATE,
 *   GiaMua DECIMAL(15,2),
 *   TinhTrang ENUM('Tot', 'Binh_Thuong', 'Kem', 'Hu_Hong'),
 *   BaoTriLanCuoi DATE NULL,
 *   BaoTriLanSau DATE NULL,
 *   BaoHanh VARCHAR(255) NULL,
 *   GhiChu TEXT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   FOREIGN KEY (MaDay) REFERENCES day_tro(MaDay) ON DELETE CASCADE,
 *   FOREIGN KEY (MaPhong) REFERENCES phong_tro(MaPhong) ON DELETE CASCADE
 * );
 * ```
 *
 * ## 2. MODEL (Laravel)
 *
 * File: `app/Models/ThietBi.php`
 * - Relationships: `belongsTo(DayTro)`, `belongsTo(PhongTro)`
 * - Casts: 'TienNghi' => 'array' (nếu cần)
 * - fillable: [...all fields...]
 *
 * ## 3. REPOSITORY PATTERN
 *
 * ### Interface: `app/Repositories/ThietBi/ThietBiRepositoryInterface.php`
 * ```php
 * interface ThietBiRepositoryInterface {
 *   public function getAll();
 *   public function getById($id);
 *   public function getByPhong($maPhong);
 *   public function getByDay($maDay);
 *   public function create(array $data);
 *   public function update($id, array $data);
 *   public function delete($id);
 * }
 * ```
 *
 * ### Implementation: `app/Repositories/ThietBi/ThietBiRepository.php`
 *
 * ## 4. SERVICE LAYER
 *
 * File: `app/Services/ThietBiService.php`
 * - NEVER call Model directly
 * - Use Repository for all data operations
 *
 * ## 5. RESOURCE (API Response)
 *
 * File: `app/Http/Resources/ThietBiResource.php`
 * ```php
 * return [
 *   'MaThietBi' => $this->MaThietBi,
 *   'TenThietBi' => $this->TenThietBi,
 *   'MaThietBi_Code' => $this->MaThietBi_Code,
 *   'LoaiThietBi' => $this->LoaiThietBi,
 *   'SoLuong' => $this->SoLuong,
 *   'GhiChu' => $this->GhiChu,
 *   // NO timestamps in response
 * ];
 * ```
 *
 * ## 6. CONTROLLER
 *
 * File: `app/Http/Controllers/ThietBiController.php`
 * - index() - GET /api/thiet-bi
 * - show($id) - GET /api/thiet-bi/{id}
 * - getByPhong($maPhong) - GET /api/phong-tro/{id}/thiet-bi
 * - store(Request) - POST /api/thiet-bi
 * - update(Request, $id) - PUT /api/thiet-bi/{id}
 * - destroy($id) - DELETE /api/thiet-bi/{id}
 *
 * ## 7. ROUTES
 *
 * File: `routes/api.php`
 * ```php
 * Route::apiResource('thiet-bi', ThietBiController::class);
 * Route::get('phong-tro/{id}/thiet-bi', [ThietBiController::class, 'getByPhong']);
 * ```
 *
 * ## 8. UPDATE PhongTroResource
 *
 * Add to PhongTroResource:
 * ```php
 * 'thietBis' => ThietBiResource::collection($this->whenLoaded('thietBis'))
 * ```
 *
 * ## 9. VALIDATION
 *
 * File: `app/Http/Requests/ThietBi/StoreThietBiRequest.php`
 * - TenThietBi: required|string|max:255
 * - MaThietBi_Code: nullable|string|max:50|unique:thiet_bi
 * - LoaiThietBi: required|in:NoiThat,ThietBiDien,DienTu,AnToan,Khac
 * - MaPhong: required|exists:phong_tro,MaPhong
 * - etc.
 *
 * ## 10. FRONTEND UPDATES (After Backend Ready)
 *
 * - Remove "Tính năng đang phát triển" notice in rooms/page.tsx line 2655
 * - Remove `opacity-50 pointer-events-none` from preview UI (line 2670)
 * - Enable "Thêm thiết bị" button
 * - Connect state to API:
 *   - Fetch: `thietBiService.getByPhong(phongId)`
 *   - Create: `thietBiService.create(data)`
 *   - Update: `thietBiService.update(id, data)`
 *   - Delete: `thietBiService.delete(id)`
 *
 * ============================================================================
 * IMPORTANT RULES:
 * - Backend MUST use Vietnamese naming (MaThietBi, TenThietBi, etc.)
 * - Frontend will use data AS-IS, NO mapping
 * - Follow Repository Pattern (Interface → Impl → Service → Controller)
 * - NO timestamps in API responses
 * - Use i18n for error messages: __('messages.thiet_bi.created')
 * ============================================================================
 */
