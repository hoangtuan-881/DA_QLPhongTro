import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import phongTroService, { PhongTro, PhongTroCreateInput, PhongTroUpdateInput } from '../../services/phong-tro.service';
import dayTroService, { DayTro, DayTroCreateInput, DayTroUpdateInput } from '../../services/day-tro.service';
import loaiPhongService, { LoaiPhong } from '../../services/loai-phong.service';
import dichVuService, { DichVu } from '../../services/dich-vu.service';
import loaiDichVuService, { LoaiDichVu } from '../../services/loai-dich-vu.service';
import thietBiService, { ThietBi, ThietBiCreateInput } from '../../services/thiet-bi.service';
import khachThueService, { KhachThue } from '../../services/khach-thue.service';
import { getErrorMessage } from '../../lib/http-client';



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

  // Dãy trọ data (từ API)
  const [dayTros, setDayTros] = useState<DayTro[]>([]);
  const [loadingDayTros, setLoadingDayTros] = useState(true);
  const [editingDayTro, setEditingDayTro] = useState<DayTro | null>(null);
  const [newDayTro, setNewDayTro] = useState({
    TenDay: '',
    DiaChi: ''
  });

  // Loại phòng data (từ API)
  const [loaiPhongs, setLoaiPhongs] = useState<LoaiPhong[]>([]);
  const [loadingLoaiPhongs, setLoadingLoaiPhongs] = useState(true);

  // Dịch vụ data (từ API)
  const [dichVus, setDichVus] = useState<DichVu[]>([]);
  const [loadingDichVus, setLoadingDichVus] = useState(true);

  // Loại dịch vụ data (từ API - for service selection)
  const [loaiDichVus, setLoaiDichVus] = useState<LoaiDichVu[]>([]);
  const [loadingLoaiDichVus, setLoadingLoaiDichVus] = useState(false);
  const [selectedDichVuIds, setSelectedDichVuIds] = useState<number[]>([]);

  // Thiết bị data (từ API)
  const [thietBis, setThietBis] = useState<ThietBi[]>([]);
  const [loadingThietBis, setLoadingThietBis] = useState(false);

  // Khách thuê data for editing (fetched from API when edit modal opens)
  const [editingKhachThueChinh, setEditingKhachThueChinh] = useState<KhachThue | null>(null);
  const [editingThanhViens, setEditingThanhViens] = useState<KhachThue[]>([]);
  const [loadingKhachThue, setLoadingKhachThue] = useState(false);

  // Change room states
  const [changeRoomData, setChangeRoomData] = useState<{ fromRoom: PhongTro | null; toRoom: string }>({ fromRoom: null, toRoom: '' });

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
    type: '' // Sẽ được set sau khi fetch loaiPhongs
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

  // Fetch Loại Phòng
  useEffect(() => {
    const controller = new AbortController();

    const fetchLoaiPhongs = async () => {
      try {
        const response = await loaiPhongService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          const data = response.data.data || [];
          setLoaiPhongs(data);
          setLoadingLoaiPhongs(false);

          // Set default room type cho form nếu có data
          if (data.length > 0 && !newRoomData.type) {
            setNewRoomData(prev => ({ ...prev, type: data[0].TenLoaiPhong }));
          }
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải danh sách loại phòng', message: getErrorMessage(error) });
          setLoadingLoaiPhongs(false);
        }
      }
    };

    fetchLoaiPhongs();
    return () => controller.abort();
  }, []);

  // Fetch Dịch Vụ
  useEffect(() => {
    const controller = new AbortController();

    const fetchDichVus = async () => {
      try {
        const response = await dichVuService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setDichVus(response.data.data || []);
          setLoadingDichVus(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải danh sách dịch vụ', message: getErrorMessage(error) });
          setLoadingDichVus(false);
        }
      }
    };

    fetchDichVus();
    return () => controller.abort();
  }, []);

  // Fetch Thiết Bị khi xem chi tiết phòng
  useEffect(() => {
    if (!selectedPhongTro || detailActiveTab !== 'thietbi') {
      return;
    }

    const controller = new AbortController();
    setLoadingThietBis(true);

    const fetchThietBis = async () => {
      try {
        const response = await thietBiService.getByPhong(selectedPhongTro.MaPhong, controller.signal);
        if (!controller.signal.aborted) {
          setThietBis(response.data.data || []);
          setLoadingThietBis(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({ title: 'Lỗi tải danh sách thiết bị', message: getErrorMessage(error) });
          setLoadingThietBis(false);
        }
      }
    };

    fetchThietBis();
    return () => controller.abort();
  }, [selectedPhongTro, detailActiveTab]);

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

  // Lấy meta theo LoaiPhong name để đồng bộ area/price nhanh
  const findRoomTypeMeta = (typeName: string) => loaiPhongs.find(lp => lp.TenLoaiPhong === typeName);

  // ====== FILTER SOURCES ======
  // Đọc từ state "dayTros"
  const buildings = ['all', ...dayTros.map(d => d.TenDay)];

  // Loại phòng từ API
  const roomTypes = ['all', ...loaiPhongs.map(lp => lp.TenLoaiPhong)];

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
          // Loop qua từng phòng và update status
          await Promise.all(
            selectedRooms.map(maPhong =>
              phongTroService.update(maPhong, { TrangThai: newTrangThai })
            )
          );
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

  const handleEditRoom = async (phongTro: PhongTro) => {
    setEditingPhongTro({ ...phongTro });
    setShowEditModal(true);

    // Fetch loại dịch vụ for service selection
    setLoadingLoaiDichVus(true);
    try {
      const response = await loaiDichVuService.getAll();
      setLoaiDichVus(response.data.data || []);

      // Set selected services based on current dichVuDangKy
      const currentDichVuIds = (phongTro.dichVuDangKy || []).map((dv: any) => dv.MaLoaiDV);
      setSelectedDichVuIds(currentDichVuIds);
    } catch (error) {
      console.error('Error fetching loai dich vu:', error);
    } finally {
      setLoadingLoaiDichVus(false);
    }
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
      type: loaiPhongs[0]?.TenLoaiPhong || ''
    });
    setShowAddModal(true);
    // Không cần setSelectedBuilding nữa
  };

  // Chuyển phòng: chuyển tenant/members/dịch vụ từ phòng A → phòng B (phòng B phải available)
  const handleConfirmChangeRoom = async () => {
    const from = changeRoomData.fromRoom;
    const toNumber = changeRoomData.toRoom;
    if (!from || !toNumber) return;

    // Tìm phòng đích
    const toPhong = phongTros.find(p => p.TenPhong === toNumber);
    if (!toPhong) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy phòng đích' });
      return;
    }

    if (toPhong.TrangThai !== 'Trống') {
      toast.error({ title: 'Không thể đổi', message: 'Phòng đích không ở trạng thái trống.' });
      return;
    }

    try {
      // Update phòng cũ về trạng thái trống
      await phongTroService.update(from.MaPhong, { TrangThai: 'Trống' });

      // Update phòng mới sang trạng thái đã cho thuê
      await phongTroService.update(toPhong.MaPhong, { TrangThai: 'Đã cho thuê' });

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
      // Update phòng về trạng thái trống
      await phongTroService.update(selectedPhongTro.MaPhong, { TrangThai: 'Trống' });

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
      const updateData: any = {
        MaDay: editingPhongTro.MaDay,
        MaLoaiPhong: editingPhongTro.MaLoaiPhong,
        TenPhong: editingPhongTro.TenPhong,
        DonGiaCoBan: editingPhongTro.DonGiaCoBan,
        DienTich: editingPhongTro.DienTich,
        TrangThai: editingPhongTro.TrangThai,
        MoTa: editingPhongTro.MoTa,
        TienNghi: editingPhongTro.TienNghi
      };

      // Thêm thông tin khách thuê chính (nếu có)
      const khachChinh = editingPhongTro.khachThue?.find((k: any) => k.VaiTro === 'KHACH_CHINH');
      if (khachChinh) {
        updateData.khachThueChinh = {
          HoTen: khachChinh.HoTen,
          CCCD: khachChinh.CCCD,
          SDT1: khachChinh.SDT1,
          SDT2: khachChinh.SDT2,
          Email: khachChinh.Email,
          NgaySinh: khachChinh.NgaySinh,
          NoiSinh: khachChinh.NoiSinh,
          BienSoXe: khachChinh.BienSoXe,
          DiaChiThuongTru: khachChinh.DiaChiThuongTru,
          GhiChu: khachChinh.GhiChu
        };
      }

      // Thêm danh sách dịch vụ đã chọn (luôn gửi, kể cả mảng rỗng để xóa hết)
      updateData.dichVuIds = selectedDichVuIds;

      // Dùng API cập nhật đầy đủ
      await phongTroService.capNhatDayDu(editingPhongTro.MaPhong, updateData);
      toast.success({
        title: 'Cập nhật thành công',
        message: 'Đã lưu thông tin phòng và khách thuê!'
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

    // Tìm thông tin từ loại phòng (từ API)
    const loaiPhong = findRoomTypeMeta(newRoomData.type);
    if (!loaiPhong) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy loại phòng.' });
      return;
    }

    // Tìm dãy trọ từ API data
    const dayTro = dayTros.find(d => d.TenDay === newRoomData.building);
    if (!dayTro) {
      toast.error({ title: 'Lỗi', message: 'Không tìm thấy dãy phòng.' });
      return;
    }

    try {
      const createData: PhongTroCreateInput = {
        MaDay: dayTro.MaDay,
        MaLoaiPhong: loaiPhong.MaLoaiPhong,
        TenPhong: newRoomData.number.trim(),
        DonGiaCoBan: loaiPhong.DonGiaCoBan,
        DienTich: loaiPhong.DienTich,
        TrangThai: 'Trống',
        MoTa: null,
        TienNghi: loaiPhong.TienNghi
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
        type: loaiPhongs[0]?.TenLoaiPhong || ''
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

            {filteredPhongTros.length === 0 && (
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
      {showEditBuildingModal && editingDayTro && (
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
                    value={editingDayTro.TenDay}
                    onChange={(e) => setEditingDayTro({ ...editingDayTro, TenDay: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    value={editingDayTro.DiaChi || ''}
                    onChange={(e) => setEditingDayTro({ ...editingDayTro, DiaChi: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Nhập địa chỉ của dãy nhà..."
                    required
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
                    value={newDayTro.TenDay}
                    onChange={(e) => setNewDayTro({ ...newDayTro, TenDay: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Nhập địa chỉ của dãy nhà..."
                    value={newDayTro.DiaChi}
                    onChange={(e) => setNewDayTro({ ...newDayTro, DiaChi: e.target.value })}
                    required
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
                    {dayTros.map((dayTro) => (
                      <option key={dayTro.MaDay} value={dayTro.TenDay}>
                        {dayTro.TenDay}
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
      {showEditModal && editingPhongTro && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa phòng {editingPhongTro.TenPhong}</h2>

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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên phòng</label>
                    <input
                      type="text"
                      value={editingPhongTro.TenPhong}
                      onChange={(e) =>
                        setEditingPhongTro({
                          ...editingPhongTro,
                          TenPhong: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dãy trọ</label>
                    <select
                      value={editingPhongTro.MaDay}
                      onChange={(e) =>
                        setEditingPhongTro({ ...editingPhongTro, MaDay: parseInt(e.target.value) })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      {dayTros.map((dayTro) => (
                        <option key={dayTro.MaDay} value={dayTro.MaDay}>
                          {dayTro.TenDay}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại phòng</label>
                    <select
                      value={editingPhongTro.MaLoaiPhong}
                      onChange={(e) => {
                        const newMaLoaiPhong = parseInt(e.target.value);
                        const loaiPhong = loaiPhongs.find(lp => lp.MaLoaiPhong === newMaLoaiPhong);
                        setEditingPhongTro({
                          ...editingPhongTro,
                          MaLoaiPhong: newMaLoaiPhong,
                          // Tự động cập nhật giá và diện tích theo loại phòng mới
                          DienTich: loaiPhong ? loaiPhong.DienTich : editingPhongTro.DienTich,
                          DonGiaCoBan: loaiPhong ? loaiPhong.DonGiaCoBan : editingPhongTro.DonGiaCoBan,
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      {loaiPhongs.map((loaiPhong) => (
                        <option key={loaiPhong.MaLoaiPhong} value={loaiPhong.MaLoaiPhong}>
                          {loaiPhong.TenLoaiPhong}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Diện tích & giá sẽ tự động cập nhật theo loại phòng.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                    <input
                      type="number"
                      value={editingPhongTro.DienTich || ''}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn giá cơ bản (VNĐ)</label>
                    <input
                      type="number"
                      value={editingPhongTro.DonGiaCoBan}
                      readOnly
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <select
                      value={editingPhongTro.TrangThai}
                      onChange={(e) =>
                        setEditingPhongTro({ ...editingPhongTro, TrangThai: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="Trống">Trống</option>
                      <option value="Đã cho thuê">Đã cho thuê</option>
                      <option value="Bảo trì">Bảo trì</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Thông tin bổ sung</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      value={editingPhongTro.MoTa || ''}
                      onChange={(e) =>
                        setEditingPhongTro({
                          ...editingPhongTro,
                          MoTa: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={4}
                      placeholder="Nhập mô tả phòng..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                    <textarea
                      value={editingPhongTro.TienNghi?.join(', ') || ''}
                      onChange={(e) =>
                        setEditingPhongTro({
                          ...editingPhongTro,
                          TienNghi: e.target.value.split(',').map(s => s.trim()).filter(s => s),
                        })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      rows={6}
                      placeholder="Điều hòa, Tủ lạnh, Giường..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                  </div>
                </div>
              </div>
                )}

                {detailActiveTab === 'tenant' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thông tin khách thuê chính</h3>
                    {editingPhongTro.khachThue && editingPhongTro.khachThue.filter((k: any) => k.VaiTro === 'KHACH_CHINH').length > 0 ? (
                      (() => {
                        const khachChinh = editingPhongTro.khachThue.find((k: any) => k.VaiTro === 'KHACH_CHINH');
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Họ tên */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                              <input
                                type="text"
                                value={khachChinh?.HoTen || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, HoTen: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* CCCD */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">CCCD</label>
                              <input
                                type="text"
                                value={khachChinh?.CCCD || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, CCCD: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Điện thoại 1 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại 1</label>
                              <input
                                type="text"
                                value={khachChinh?.SDT1 || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, SDT1: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Điện thoại 2 */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại 2</label>
                              <input
                                type="text"
                                value={khachChinh?.SDT2 || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, SDT2: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <input
                                type="email"
                                value={khachChinh?.Email || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, Email: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Ngày sinh */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                              <input
                                type="date"
                                value={khachChinh?.NgaySinh || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, NgaySinh: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Nơi sinh */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nơi sinh</label>
                              <input
                                type="text"
                                value={khachChinh?.NoiSinh || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, NoiSinh: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Biển số xe */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Biển số xe</label>
                              <input
                                type="text"
                                value={khachChinh?.BienSoXe || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, BienSoXe: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                              />
                            </div>

                            {/* Địa chỉ thường trú - full width */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ thường trú</label>
                              <textarea
                                value={khachChinh?.DiaChiThuongTru || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, DiaChiThuongTru: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                rows={2}
                              />
                            </div>

                            {/* Ghi chú - full width */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                              <textarea
                                value={khachChinh?.GhiChu || ''}
                                onChange={(e) => {
                                  const updatedKhachThue = editingPhongTro.khachThue.map((k: any) =>
                                    k.VaiTro === 'KHACH_CHINH' ? { ...k, GhiChu: e.target.value } : k
                                  );
                                  setEditingPhongTro({ ...editingPhongTro, khachThue: updatedKhachThue });
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                rows={3}
                              />
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-gray-500 italic">Chưa có khách thuê chính. Vui lòng tạo khách thuê tại module "Khách thuê" trước.</p>
                    )}
                  </div>
                )}

                {detailActiveTab === 'services' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Dịch vụ đăng ký</h3>
                    <p className="text-sm text-gray-500 mb-4">Chọn các dịch vụ mà phòng này đăng ký sử dụng:</p>

                    {loadingLoaiDichVus ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : loaiDichVus.length > 0 ? (
                      <div className="space-y-3">
                        {loaiDichVus.map((loaiDV) => (
                          <label
                            key={loaiDV.MaLoaiDV}
                            className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedDichVuIds.includes(loaiDV.MaLoaiDV)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedDichVuIds([...selectedDichVuIds, loaiDV.MaLoaiDV]);
                                } else {
                                  setSelectedDichVuIds(selectedDichVuIds.filter(id => id !== loaiDV.MaLoaiDV));
                                }
                              }}
                              className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{loaiDV.TenDichVu}</div>
                              <div className="text-sm text-gray-600">
                                {loaiDV.DonGiaMacDinh ? (
                                  <>Đơn giá: {loaiDV.DonGiaMacDinh.toLocaleString('vi-VN')}đ/{loaiDV.DonViTinh || 'đơn vị'}</>
                                ) : (
                                  <>Đơn vị tính: {loaiDV.DonViTinh || 'N/A'}</>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Không có dịch vụ nào để chọn</p>
                    )}

                    <div className="mt-4 text-sm text-gray-500">
                      Đã chọn: <span className="font-medium text-indigo-600">{selectedDichVuIds.length}</span> dịch vụ
                    </div>
                  </div>
                )}

                {detailActiveTab === 'members' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thành viên trong phòng</h3>
                    <p className="text-sm text-gray-500 mb-4 italic">Hiển thị thành viên. Quản lý tại module "Khách thuê".</p>
                    {editingPhongTro.khachThue && editingPhongTro.khachThue.filter((k: any) => k.VaiTro === 'THANH_VIEN').length > 0 ? (
                      <div className="space-y-3">
                        {editingPhongTro.khachThue.filter((k: any) => k.VaiTro === 'THANH_VIEN').map((member: any, idx: number) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{member.HoTen}</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>CCCD: {member.CCCD || '-'}</div>
                              <div>SĐT: {member.SDT1 || '-'}</div>
                              <div>Ngày sinh: {member.NgaySinh || '-'}</div>
                              <div>Xe: {member.BienSoXe || '-'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Chưa có thành viên</p>
                    )}
                  </div>
                )}

                {detailActiveTab === 'thietbi' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Thiết bị phòng</h3>
                    <p className="text-sm text-gray-500 mb-4 italic">Hiển thị thiết bị. Quản lý tại module "Thiết bị".</p>
                    {loadingThietBis ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-gray-500 mt-2">Đang tải...</p>
                      </div>
                    ) : thietBis.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Tên</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Loại</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Tình trạng</th>
                              <th className="px-4 py-2 text-left text-xs text-gray-500 uppercase">Ghi chú</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {thietBis.map((tb: ThietBi) => (
                              <tr key={tb.MaThietBi}>
                                <td className="px-4 py-2 text-sm">{tb.TenThietBi}</td>
                                <td className="px-4 py-2 text-sm">{tb.LoaiThietBi}</td>
                                <td className="px-4 py-2 text-sm">{tb.TinhTrang}</td>
                                <td className="px-4 py-2 text-sm">{tb.GhiChu || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Chưa có thiết bị</p>
                    )}
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
                    Phòng: <span className="font-medium">{changeRoomData.fromRoom.TenPhong}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Khách thuê: <span className="font-medium">{changeRoomData.fromRoom.khachThue?.[0]?.HoTen || 'Chưa có khách'}</span>
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
                    {phongTros.filter(p => p.TrangThai === 'Trống').map((phongTro) => (
                      <option key={phongTro.MaPhong} value={phongTro.TenPhong}>
                        {phongTro.TenPhong} - {phongTro.TenLoaiPhong} - {(phongTro.GiaThueHienTai || phongTro.DonGiaCoBan).toLocaleString('vi-VN')}đ/tháng
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
