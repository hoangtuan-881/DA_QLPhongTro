import { useMemo, useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import dichVuService, { DichVu, DichVuCreateInput } from '../../services/dich-vu.service';
import { getErrorMessage } from '../../lib/http-client';

export default function Services() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [dichVus, setDichVus] = useState<DichVu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // UI states
  const [filterDanhMuc, setFilterDanhMuc] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedDichVu, setSelectedDichVu] = useState<DichVu | null>(null);
  const [editingDichVu, setEditingDichVu] = useState<DichVu | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '' as React.ReactNode,
    type: 'info' as 'danger' | 'warning' | 'info',
    loading: false,
    onConfirm: () => { }
  });

  // Form
  const emptyForm: Partial<DichVuCreateInput> = { TenDichVu: '', MoTa: '', DonGia: 0, DonViTinh: '', DanhMuc: 'Dịch vụ', TrangThaiHoatDong: true };
  const [newDichVu, setNewDichVu] = useState<Partial<DichVuCreateInput>>(emptyForm);

  // Helpers
  const getDanhMucColor = (danhMuc: string) => {
    switch (danhMuc) {
      case 'Dịch vụ': return 'bg-blue-100 text-blue-800';
      case 'Tiện ích': return 'bg-purple-100 text-purple-800';
      case 'Khác': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Lọc & search dựa trên dichVus
  const filteredDichVus = useMemo(() => {
    let data = dichVus;
    if (filterDanhMuc !== 'all') data = data.filter(dv => dv.DanhMuc === filterDanhMuc);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(dv =>
        dv.TenDichVu.toLowerCase().includes(q) ||
        dv.MoTa.toLowerCase().includes(q)
      );
    }
    return data;
  }, [dichVus, filterDanhMuc, search]);

  // Fetch dich vus from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchDichVus = async () => {
      try {
        const response = await dichVuService.getAll({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setDichVus(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        // Only show error toast for non-cancelled requests
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching dich vus:', error);
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchDichVus();

    // Cleanup: abort request if component unmounts or refreshKey changes
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const refreshDichVus = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const resetForm = () => setNewDichVu(emptyForm);

  // ===== Thêm =====
  const handleOpenAdd = () => { resetForm(); setShowAddModal(true); };
  const handleSubmitAdd = () => {
    if (!newDichVu.TenDichVu || !newDichVu.MoTa || !newDichVu.DanhMuc || !newDichVu.DonViTinh || !newDichVu.DonGia || newDichVu.DonGia <= 0) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thêm dịch vụ',
      message: <>Bạn có chắc muốn thêm dịch vụ <strong>{newDichVu.TenDichVu}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.createService(newDichVu as DichVuCreateInput);
          setShowAddModal(false);
          resetForm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Đã thêm dịch vụ', message: `Thêm "${newDichVu.TenDichVu}" thành công.` });
          refreshDichVus();
        } catch (error) {
          console.error('Error creating dich vu:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi thêm dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Sửa =====
  const handleEdit = (dichVu: DichVu) => {
    setEditingDichVu(dichVu);
    setNewDichVu({
      TenDichVu: dichVu.TenDichVu,
      MoTa: dichVu.MoTa,
      DonGia: dichVu.DonGia,
      DonViTinh: dichVu.DonViTinh,
      DanhMuc: dichVu.DanhMuc,
      TrangThaiHoatDong: dichVu.TrangThaiHoatDong
    });
    setShowEditModal(true);
  };
  const handleSubmitEdit = () => {
    if (!editingDichVu) return;
    if (!newDichVu.TenDichVu || !newDichVu.MoTa || !newDichVu.DanhMuc || !newDichVu.DonViTinh || !newDichVu.DonGia || newDichVu.DonGia <= 0) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật dịch vụ',
      message: <>Cập nhật thông tin dịch vụ <strong>{editingDichVu.TenDichVu}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.updateService(editingDichVu.MaDichVu, newDichVu);
          setShowEditModal(false);
          setEditingDichVu(null);
          resetForm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Đã cập nhật', message: `Cập nhật "${newDichVu.TenDichVu}" thành công.` });
          setShowDetailModal(false);
          setSelectedDichVu(null);
          refreshDichVus();
        } catch (error) {
          console.error('Error updating dich vu:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi cập nhật dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Xóa =====
  const handleDelete = (dichVu: DichVu) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa dịch vụ',
      message: <>Bạn có chắc muốn xóa <strong>{dichVu.TenDichVu}</strong>? Hành động này không thể hoàn tác.</>,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.deleteService(dichVu.MaDichVu);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.error({ title: 'Đã xóa', message: `Đã xóa dịch vụ "${dichVu.TenDichVu}".` });
          setShowDetailModal(false);
          setSelectedDichVu(null);
          refreshDichVus();
        } catch (error) {
          console.error('Error deleting dich vu:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi xóa dịch vụ',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  // ===== Toggle trạng thái =====
  const toggleDichVuStatus = (dichVu: DichVu) => {
    const next = !dichVu.TrangThaiHoatDong;
    setConfirmDialog({
      isOpen: true,
      title: `${next ? 'Kích hoạt' : 'Tạm dừng'} dịch vụ`,
      message: <>Bạn muốn {next ? 'kích hoạt' : 'tạm dừng'} <strong>{dichVu.TenDichVu}</strong>?</>,
      type: 'warning',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await dichVuService.toggleStatus(dichVu.MaDichVu);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({
            title: next ? 'Đã kích hoạt' : 'Đã tạm dừng',
            message: `"${dichVu.TenDichVu}" đã được ${next ? 'kích hoạt' : 'tạm dừng'}.`
          });
          setShowDetailModal(false);
          setSelectedDichVu(null);
          refreshDichVus();
        } catch (error) {
          console.error('Error toggling dich vu status:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({
            title: 'Lỗi thay đổi trạng thái',
            message: getErrorMessage(error)
          });
        }
      }
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
                <p className="text-gray-600">Quản lý các dịch vụ đi kèm</p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i> Thêm dịch vụ
              </button>
            </div>

            {/* Tabs: chỉ còn Danh sách dịch vụ */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button className="py-3 px-6 border-b-2 font-medium text-sm border-indigo-500 text-indigo-600 cursor-default">
                    Danh sách dịch vụ
                  </button>
                </nav>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterDanhMuc}
                  onChange={(e) => setFilterDanhMuc(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="Dịch vụ">Dịch vụ</option>
                  <option value="Tiện ích">Tiện ích</option>
                  <option value="Khác">Khác</option>
                </select>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm dịch vụ..."
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && dichVus.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <i className="ri-service-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có dịch vụ nào</h3>
                <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm dịch vụ đầu tiên</p>
                <button
                  onClick={handleOpenAdd}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i> Thêm dịch vụ
                </button>
              </div>
            )}

            {/* No Results State */}
            {!loading && dichVus.length > 0 && filteredDichVus.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center col-span-full">
                <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy dịch vụ</h3>
                <p className="text-gray-600">Thử điều chỉnh bộ lọc hoặc tìm kiếm của bạn</p>
              </div>
            )}

            {/* Dich Vu Grid */}
            {!loading && filteredDichVus.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDichVus.map((dichVu) => (
                <div key={dichVu.MaDichVu} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{dichVu.TenDichVu}</h3>
                        <p className="text-sm text-gray-600 mt-1">{dichVu.MoTa}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDanhMucColor(dichVu.DanhMuc)}`}>
                          {dichVu.DanhMuc}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Giá:</span>
                        <span className="text-sm font-medium text-green-600">
                          {dichVu.DonGia.toLocaleString('vi-VN')}đ/{dichVu.DonViTinh}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Số phòng đang sử dụng:</span>
                        <span className="text-sm font-medium">{dichVu.SoLuongSuDung}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <span className={`text-sm font-medium ${dichVu.TrangThaiHoatDong ? 'text-green-600' : 'text-red-600'}`}>
                          {dichVu.TrangThaiHoatDong ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedDichVu(dichVu); setShowDetailModal(true); }}
                        className="flex-1 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <i className="ri-eye-line mr-1"></i> Chi tiết
                      </button>
                      <button
                        onClick={() => handleEdit(dichVu)}
                        className="px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(dichVu)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                        title="Xóa dịch vụ"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDichVu && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowDetailModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết dịch vụ</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between"><span className="text-gray-600">Tên dịch vụ:</span><span className="font-medium">{selectedDichVu.TenDichVu}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Mô tả:</span><span className="font-medium">{selectedDichVu.MoTa}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDanhMucColor(selectedDichVu.DanhMuc)}`}>
                    {selectedDichVu.DanhMuc}
                  </span>
                </div>
                <div className="flex justify-between"><span className="text-gray-600">Giá:</span><span className="font-medium text-green-600">{selectedDichVu.DonGia.toLocaleString('vi-VN')}đ/{selectedDichVu.DonViTinh}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Số phòng đang sử dụng:</span><span className="font-medium">{selectedDichVu.SoLuongSuDung}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Trạng thái:</span><span className={`font-medium ${selectedDichVu.TrangThaiHoatDong ? 'text-green-600' : 'text-red-600'}`}>{selectedDichVu.TrangThaiHoatDong ? 'Hoạt động' : 'Tạm dừng'}</span></div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => handleEdit(selectedDichVu)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Chỉnh sửa</button>
                <button onClick={() => toggleDichVuStatus(selectedDichVu)} className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap text-white ${selectedDichVu.TrangThaiHoatDong ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{selectedDichVu.TrangThaiHoatDong ? 'Tạm dừng' : 'Kích hoạt'}</button>
                <button onClick={() => handleDelete(selectedDichVu)} className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 cursor-pointer whitespace-nowrap">Xóa dịch vụ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm dịch vụ mới</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input type="text" value={newDichVu.TenDichVu} onChange={(e) => setNewDichVu({ ...newDichVu, TenDichVu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea value={newDichVu.MoTa} onChange={(e) => setNewDichVu({ ...newDichVu, MoTa: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input type="number" value={newDichVu.DonGia} onChange={(e) => setNewDichVu({ ...newDichVu, DonGia: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input type="text" value={newDichVu.DonViTinh} onChange={(e) => setNewDichVu({ ...newDichVu, DonViTinh: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select value={newDichVu.DanhMuc} onChange={(e) => setNewDichVu({ ...newDichVu, DanhMuc: e.target.value as DichVu['DanhMuc'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                    <option value="">Chọn danh mục</option>
                    <option value="Dịch vụ">Dịch vụ</option>
                    <option value="Tiện ích">Tiện ích</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={newDichVu.TrangThaiHoatDong} onChange={(e) => setNewDichVu({ ...newDichVu, TrangThaiHoatDong: e.target.checked })} className="mr-2" />
                    <span className="text-sm text-gray-700">Kích hoạt dịch vụ ngay</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                  <button type="button" onClick={handleSubmitAdd} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Thêm dịch vụ</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingDichVu && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa dịch vụ</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên dịch vụ *</label>
                  <input type="text" value={newDichVu.TenDichVu} onChange={(e) => setNewDichVu({ ...newDichVu, TenDichVu: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea value={newDichVu.MoTa} onChange={(e) => setNewDichVu({ ...newDichVu, MoTa: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ) *</label>
                    <input type="number" value={newDichVu.DonGia} onChange={(e) => setNewDichVu({ ...newDichVu, DonGia: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị *</label>
                    <input type="text" value={newDichVu.DonViTinh} onChange={(e) => setNewDichVu({ ...newDichVu, DonViTinh: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select value={newDichVu.DanhMuc} onChange={(e) => setNewDichVu({ ...newDichVu, DanhMuc: e.target.value as DichVu['DanhMuc'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                    <option value="Dịch vụ">Dịch vụ</option>
                    <option value="Tiện ích">Tiện ích</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" checked={newDichVu.TrangThaiHoatDong} onChange={(e) => setNewDichVu({ ...newDichVu, TrangThaiHoatDong: e.target.checked })} className="mr-2" />
                    <span className="text-sm text-gray-700">Dịch vụ đang hoạt động</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingDichVu(null); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                  <button type="button" onClick={handleSubmitEdit} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Cập nhật</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog dùng chung */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        loading={confirmDialog.loading}
      />
    </div>
  );
}
