import { useState, useEffect } from 'react';
import Header from '../dashboard/components/Header';
import Sidebar from '../dashboard/components/Sidebar';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import { useToast } from '../../hooks/useToast';
import khachThueService, { KhachThue, KhachThueCreateInput, KhachThueUpdateInput } from '../../services/khach-thue.service';
import { getErrorMessage } from '../../lib/http-client';

export default function TenantsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [khachThues, setKhachThues] = useState<KhachThue[]>([]);
  const [selectedKhachThue, setSelectedKhachThue] = useState<KhachThue | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingKhachThue, setEditingKhachThue] = useState<KhachThue | null>(null);
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newKhachThueVehicles, setNewKhachThueVehicles] = useState<string[]>([]);
  const [newKhachThueVehiclePlate, setNewKhachThueVehiclePlate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [newKhachThue, setNewKhachThue] = useState<Partial<KhachThueCreateInput>>({
    HoTen: '',
    SDT1: '',
    SDT2: '',
    Email: '',
    VaiTro: 'TIỀM_NĂNG',
    CCCD: '',
    NgayCapCCCD: '',
    NoiCapCCCD: '',
    DiaChiThuongTru: '',
    NgaySinh: '',
    NoiSinh: '',
    GhiChu: '',
    TenDangNhap: '',
    password: 'password123'
  });

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    type: 'info' as 'danger' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: () => { },
    loading: false
  });

  const toast = useToast();

  // Fetch khach thue from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchKhachThues = async () => {
      try {
        const response = await khachThueService.getAll(controller.signal);

        if (!controller.signal.aborted) {
          setKhachThues(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchKhachThues();

    return () => controller.abort();
  }, [refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const getVaiTroColor = (vaiTro: string) => {
    switch (vaiTro) {
      case 'KHÁCH_CHÍNH':
        return 'bg-blue-100 text-blue-800';
      case 'THÀNH_VIÊN':
        return 'bg-green-100 text-green-800';
      case 'TIỀM_NĂNG':
        return 'bg-yellow-100 text-yellow-800';
      case 'ĐÃ_DỌN_ĐI':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVaiTroText = (vaiTro: string) => {
    switch (vaiTro) {
      case 'KHÁCH_CHÍNH':
        return 'Khách chính';
      case 'THÀNH_VIÊN':
        return 'Thành viên';
      case 'TIỀM_NĂNG':
        return 'Tiềm năng';
      case 'ĐÃ_DỌN_ĐI':
        return 'Đã dọn đi';
      default:
        return vaiTro;
    }
  };

  const filteredKhachThues = khachThues.filter(khachThue => {
    const matchesStatus = filterStatus === 'all' || khachThue.VaiTro === filterStatus;
    const matchesSearch =
      khachThue.HoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      khachThue.SDT1.includes(searchTerm) ||
      (khachThue.TenPhong && khachThue.TenPhong.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleEditKhachThue = (khachThue: KhachThue) => {
    setEditingKhachThue({ ...khachThue, xes: khachThue.xes || [] });
    setNewVehiclePlate('');
    setShowEditModal(true);
  };

  const handleAddVehicle = () => {
    if (!editingKhachThue || !newVehiclePlate.trim()) return;

    const newXe = {
      MaXe: Date.now(), // Temporary ID for new vehicles
      MaKhachThue: editingKhachThue.MaKhachThue,
      BienSoXe: newVehiclePlate.trim(),
      GhiChu: null
    };

    setEditingKhachThue({
      ...editingKhachThue,
      xes: [...(editingKhachThue.xes || []), newXe]
    });
    setNewVehiclePlate('');
  };

  const handleRemoveVehicle = (maXe: number) => {
    if (!editingKhachThue) return;

    setEditingKhachThue({
      ...editingKhachThue,
      xes: (editingKhachThue.xes || []).filter(xe => xe.MaXe !== maXe)
    });
  };

  const handleAddNewKhachThueVehicle = () => {
    if (!newKhachThueVehiclePlate.trim()) return;

    setNewKhachThueVehicles([...newKhachThueVehicles, newKhachThueVehiclePlate.trim()]);
    setNewKhachThueVehiclePlate('');
  };

  const handleRemoveNewKhachThueVehicle = (index: number) => {
    setNewKhachThueVehicles(newKhachThueVehicles.filter((_, i) => i !== index));
  };

  const handleDeleteKhachThue = (khachThue: KhachThue) => {
    setConfirmDialog({
      isOpen: true,
      type: 'danger',
      title: 'Xác nhận xóa khách thuê',
      message: `Bạn có chắc chắn muốn xóa khách thuê "${khachThue.HoTen}" không? Hành động này không thể hoàn tác.`,
      onConfirm: () => confirmDeleteKhachThue(khachThue),
      loading: false
    });
  };

  const confirmDeleteKhachThue = async (khachThue: KhachThue) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await khachThueService.delete(khachThue.MaKhachThue);
      setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      toast.success({
        title: 'Xóa thành công',
        message: `Đã xóa khách thuê "${khachThue.HoTen}" khỏi hệ thống`
      });
      refreshData();
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      toast.error({
        title: 'Lỗi xóa khách thuê',
        message: getErrorMessage(error)
      });
    }
  };

  const handleAddKhachThue = (formData: KhachThueCreateInput) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận thêm khách thuê',
      message: `Bạn có chắc chắn muốn thêm khách thuê "${formData.HoTen}" không?`,
      onConfirm: () => confirmAddKhachThue(formData),
      loading: false
    });
  }

  const confirmAddKhachThue = async (formData: KhachThueCreateInput) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await khachThueService.create(formData);
      setShowAddModal(false);
      setNewKhachThue({
        HoTen: '',
        SDT1: '',
        SDT2: '',
        Email: '',
        VaiTro: 'TIỀM_NĂNG',
        CCCD: '',
        NgayCapCCCD: '',
        NoiCapCCCD: '',
        DiaChiThuongTru: '',
        NgaySinh: '',
        NoiSinh: '',
        GhiChu: '',
        TenDangNhap: '',
        password: 'password123'
      });
      setNewKhachThueVehicles([]);
      setNewKhachThueVehiclePlate('');
      setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      toast.success({ title: 'Thêm thành công', message: `Đã thêm khách thuê "${formData.HoTen}" vào hệ thống` });
      refreshData();
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      toast.error({
        title: 'Lỗi thêm khách thuê',
        message: getErrorMessage(error)
      });
    }
  };

  const handleEditKhachThueConfirm = (formData: KhachThueUpdateInput) => {
    setConfirmDialog({
      isOpen: true,
      type: 'info',
      title: 'Xác nhận cập nhật thông tin',
      message: `Bạn có chắc chắn muốn lưu thay đổi thông tin của "${formData.HoTen}" không?`,
      onConfirm: () => confirmEditKhachThue(formData),
      loading: false
    });
  };

  const confirmEditKhachThue = async (formData: KhachThueUpdateInput) => {
    if (!editingKhachThue) return;

    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await khachThueService.update(editingKhachThue.MaKhachThue, formData);
      setShowEditModal(false);
      setEditingKhachThue(null);
      setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      toast.success({
        title: 'Cập nhật thành công',
        message: `Đã cập nhật thông tin của "${formData.HoTen}"`
      });
      refreshData();
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      toast.error({
        title: 'Lỗi cập nhật',
        message: getErrorMessage(error)
      });
    }
  };

  const handleVaiTroChange = (khachThue: KhachThue, newVaiTro: string) => {
    setConfirmDialog({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận thay đổi vai trò',
      message: `Bạn có chắc chắn muốn chuyển vai trò của "${khachThue.HoTen}" sang "${getVaiTroText(newVaiTro)}" không?`,
      onConfirm: () => confirmVaiTroChange(khachThue, newVaiTro),
      loading: false
    });
  };

  const confirmVaiTroChange = async (khachThue: KhachThue, newVaiTro: string) => {
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      await khachThueService.update(khachThue.MaKhachThue, { VaiTro: newVaiTro });
      setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
      toast.success({
        title: 'Cập nhật vai trò thành công',
        message: `Đã chuyển vai trò của "${khachThue.HoTen}" sang "${getVaiTroText(newVaiTro)}"`
      });
      refreshData();
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, loading: false }));
      toast.error({
        title: 'Lỗi cập nhật vai trò',
        message: getErrorMessage(error)
      });
    }
  };

  const closeConfirmDialog = () => {
    if (!confirmDialog.loading) {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSaveKhachThue = () => {
    if (!editingKhachThue) return;
    handleEditKhachThueConfirm(editingKhachThue);
  };

  const handleCreateKhachThue = () => {
    if (!newKhachThue.HoTen || !newKhachThue.SDT1 || !newKhachThue.Email) {
      toast.error({
        title: 'Lỗi thêm khách thuê',
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
      return;
    }
    // Auto-generate username if not provided
    const finalData: KhachThueCreateInput = {
      ...newKhachThue as KhachThueCreateInput,
      TenDangNhap: newKhachThue.TenDangNhap || `user_${Date.now()}`,
      SoXe: 0,
      MaPhong: null,
      MaLoaiXe: null,
      MaTaiKhoan: null,
      HinhAnh: null,
    };
    handleAddKhachThue(finalData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách thuê</h1>
                <p className="text-gray-600">Quản lý thông tin khách thuê phòng trọ</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-add-line mr-2"></i>
                Thêm khách thuê
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="KHÁCH_CHÍNH">Khách chính</option>
                  <option value="THÀNH_VIÊN">Thành viên</option>
                  <option value="TIỀM_NĂNG">Tiềm năng</option>
                  <option value="ĐÃ_DỌN_ĐI">Đã dọn đi</option>
                </select>
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, số điện thoại, phòng..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-refresh-line mr-1"></i>
                  Đặt lại
                </button>
              </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Liên hệ &amp; Địa chỉ thường trú
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phòng đã ở
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredKhachThues.map(khachThue => (
                      <tr key={khachThue.MaKhachThue} className="hover:bg-gray-50">
                        {/* 1) Khách thuê */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {khachThue.HoTen.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{khachThue.HoTen}</div>
                              {khachThue.CCCD && (
                                <div className="text-xs text-gray-500">CCCD: {khachThue.CCCD}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2) Liên hệ & Địa chỉ thường trú */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {khachThue.SDT1}
                            {khachThue.SDT2 && <span> • {khachThue.SDT2}</span>}
                          </div>
                          <div className="text-sm text-gray-500">{khachThue.Email || '-'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            <span className="font-medium"></span>{' '}
                            {khachThue.DiaChiThuongTru || '-'}
                          </div>
                          {khachThue.xes && khachThue.xes.length > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              <span className="font-medium">Xe: </span>
                              {khachThue.xes.slice(0, 2).map(xe => xe.BienSoXe).join(', ')}
                              {khachThue.xes.length > 2 && '...'}
                            </div>
                          )}
                        </td>

                        {/* 3) Phòng đã ở */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{khachThue.TenPhong || '-'}</div>
                          <div className="text-xs text-gray-500 max-w-56 truncate">
                            <span className="font-medium">Dãy</span>{' '}
                            {khachThue.DiaChiDay || '-'}
                          </div>
                        </td>

                        {/* 5) Vai trò */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVaiTroColor(
                              khachThue.VaiTro
                            )}`}
                          >
                            {getVaiTroText(khachThue.VaiTro)}
                          </span>
                        </td>

                        {/* 6) Thao tác */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedKhachThue(khachThue);
                                setShowDetailModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <i className="ri-eye-line"></i>
                            </button>
                            <button
                              onClick={() => {
                                setEditingKhachThue(khachThue);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={() => handleDeleteKhachThue(khachThue)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {!loading && filteredKhachThues.length === 0 && (
              <div className="text-center py-12">
                <i className="ri-search-line text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-500">Không tìm thấy khách thuê nào phù hợp với bộ lọc</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Khach Thue Detail Modal */}
      {selectedKhachThue && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedKhachThue(null)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Chi tiết khách thuê - {selectedKhachThue.HoTen}
                </h2>
                <button
                  onClick={() => setSelectedKhachThue(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
                  <div className="space-y-3 bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-medium">{selectedKhachThue.HoTen}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày sinh:</span>
                      <span className="font-medium">
                        {selectedKhachThue.NgaySinh
                          ? new Date(selectedKhachThue.NgaySinh).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nơi sinh:</span>
                      <span className="font-medium">{selectedKhachThue.NoiSinh || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CMND/CCCD:</span>
                      <span className="font-medium">{selectedKhachThue.CCCD || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày cấp:</span>
                      <span className="font-medium">
                        {selectedKhachThue.NgayCapCCCD
                          ? new Date(selectedKhachThue.NgayCapCCCD).toLocaleDateString('vi-VN')
                          : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nơi cấp:</span>
                      <span className="font-medium">{selectedKhachThue.NoiCapCCCD || '-'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                  <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điện thoại 1:</span>
                      <span className="font-medium">{selectedKhachThue.SDT1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Điện thoại 2:</span>
                      <span className="font-medium">{selectedKhachThue.SDT2 || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{selectedKhachThue.Email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Địa chỉ thường trú:</span>
                      <span className="font-medium text-right">{selectedKhachThue.DiaChiThuongTru || '-'}</span>
                    </div>
                    {selectedKhachThue.GhiChu && (
                      <div>
                        <span className="text-gray-600">Ghi chú:</span>
                        <p className="font-medium mt-1">{selectedKhachThue.GhiChu}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vehicles Section */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Phương tiện</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biển số xe:</span>
                    <span className="font-medium text-right">
                      {selectedKhachThue.xes && selectedKhachThue.xes.length > 0
                        ? selectedKhachThue.xes.map(xe => xe.BienSoXe).join(', ')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => {
                    setEditingKhachThue(selectedKhachThue);
                    setShowEditModal(true);
                    setSelectedKhachThue(null);
                  }}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-edit-line mr-2"></i>
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    handleDeleteKhachThue(selectedKhachThue);
                    setSelectedKhachThue(null);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-close-circle-line mr-2"></i>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Khach Thue Modal */}
      {showEditModal && editingKhachThue && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thông tin khách thuê</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={editingKhachThue.HoTen}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, HoTen: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={editingKhachThue.NgaySinh || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, NgaySinh: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi sinh
                      </label>
                      <input
                        type="text"
                        value={editingKhachThue.NoiSinh || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, NoiSinh: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CMND/CCCD
                      </label>
                      <input
                        type="text"
                        value={editingKhachThue.CCCD || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, CCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        value={editingKhachThue.NgayCapCCCD || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, NgayCapCCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi cấp
                      </label>
                      <input
                        type="text"
                        value={editingKhachThue.NoiCapCCCD || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, NoiCapCCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="CA Hà Nội"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 1 *
                      </label>
                      <input
                        type="tel"
                        value={editingKhachThue.SDT1}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, SDT1: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 2
                      </label>
                      <input
                        type="tel"
                        value={editingKhachThue.SDT2 || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, SDT2: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={editingKhachThue.Email || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, Email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ thường trú
                      </label>
                      <textarea
                        value={editingKhachThue.DiaChiThuongTru || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, DiaChiThuongTru: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phương tiện
                      </label>

                      {/* List of existing vehicles */}
                      {editingKhachThue.xes && editingKhachThue.xes.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {editingKhachThue.xes.map((xe) => (
                            <div key={xe.MaXe} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                              <i className="ri-motorbike-line text-gray-600"></i>
                              <span className="flex-1 text-sm font-medium text-gray-900">{xe.BienSoXe}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveVehicle(xe.MaXe)}
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                title="Xóa xe"
                              >
                                <i className="ri-close-line text-lg"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new vehicle */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newVehiclePlate}
                          onChange={e => setNewVehiclePlate(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddVehicle())}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Nhập biển số xe mới..."
                        />
                        <button
                          type="button"
                          onClick={handleAddVehicle}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Thêm hoặc xóa phương tiện</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú khác
                      </label>
                      <textarea
                        value={editingKhachThue.GhiChu || ''}
                        onChange={e => setEditingKhachThue({ ...editingKhachThue, GhiChu: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Thông tin bổ sung..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveKhachThue}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Khach Thue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm khách thuê mới</h2>

              <form className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin cá nhân</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        value={newKhachThue.HoTen}
                        onChange={e => setNewKhachThue({ ...newKhachThue, HoTen: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày sinh
                      </label>
                      <input
                        type="date"
                        value={newKhachThue.NgaySinh || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, NgaySinh: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi sinh
                      </label>
                      <input
                        type="text"
                        value={newKhachThue.NoiSinh || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, NoiSinh: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Hà Nội"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CMND/CCCD
                      </label>
                      <input
                        type="text"
                        value={newKhachThue.CCCD || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, CCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="123456789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ngày cấp
                      </label>
                      <input
                        type="date"
                        value={newKhachThue.NgayCapCCCD || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, NgayCapCCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nơi cấp
                      </label>
                      <input
                        type="text"
                        value={newKhachThue.NoiCapCCCD || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, NoiCapCCCD: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="CA Hà Nội"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Thông tin liên hệ</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 1 *
                      </label>
                      <input
                        type="tel"
                        value={newKhachThue.SDT1}
                        onChange={e => setNewKhachThue({ ...newKhachThue, SDT1: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0901234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Điện thoại 2
                      </label>
                      <input
                        type="tel"
                        value={newKhachThue.SDT2 || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, SDT2: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="0987654321"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={newKhachThue.Email || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, Email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ thường trú
                      </label>
                      <textarea
                        value={newKhachThue.DiaChiThuongTru || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, DiaChiThuongTru: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="123 Đường ABC, Quận 1, TP.HCM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phương tiện
                      </label>

                      {/* List of vehicles */}
                      {newKhachThueVehicles.length > 0 && (
                        <div className="space-y-2 mb-3">
                          {newKhachThueVehicles.map((plate, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                              <i className="ri-motorbike-line text-gray-600"></i>
                              <span className="flex-1 text-sm font-medium text-gray-900">{plate}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveNewKhachThueVehicle(index)}
                                className="text-red-600 hover:text-red-700 cursor-pointer"
                                title="Xóa xe"
                              >
                                <i className="ri-close-line text-lg"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add new vehicle */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newKhachThueVehiclePlate}
                          onChange={e => setNewKhachThueVehiclePlate(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddNewKhachThueVehicle())}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="Nhập biển số xe..."
                        />
                        <button
                          type="button"
                          onClick={handleAddNewKhachThueVehicle}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-add-line"></i>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Thêm biển số xe (có thể thêm sau)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ghi chú khác
                      </label>
                      <textarea
                        value={newKhachThue.GhiChu || ''}
                        onChange={e => setNewKhachThue({ ...newKhachThue, GhiChu: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={2}
                        placeholder="Thông tin bổ sung..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-close-line mr-2"></i>
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateKhachThue}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                  >
                    <i className="ri-user-add-line mr-2"></i>
                    Thêm khách thuê
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </div>
  );
}