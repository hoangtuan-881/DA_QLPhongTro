import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import loaiPhongService, { LoaiPhong } from '../../services/loai-phong.service';
import { getErrorMessage } from '../../lib/http-client';

export default function RoomTypes() {
  const toast = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [loaiPhongs, setLoaiPhongs] = useState<LoaiPhong[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLoaiPhong, setEditingLoaiPhong] = useState<LoaiPhong | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '' as React.ReactNode,
    type: 'info' as 'danger' | 'warning' | 'info',
    loading: false,
    onConfirm: () => { }
  });

  // Fetch data from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchLoaiPhongs = async () => {
      try {
        const response = await loaiPhongService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setLoaiPhongs(response.data.data || []);
          setLoading(false);
        }
      } catch (error: any) {
        // Only show error toast for non-cancelled requests
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching loai phongs:', error);
          toast.error({
            title: 'Lỗi tải dữ liệu',
            message: getErrorMessage(error)
          });
          setLoading(false);
        }
      }
    };

    fetchLoaiPhongs();

    // Cleanup: abort request if component unmounts or refreshKey changes
    return () => {
      controller.abort();
    };
  }, [refreshKey]);

  const refreshLoaiPhongs = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  // ===== Thêm loại phòng =====
  const handleAddLoaiPhong = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amenitiesText = formData.get('TienNghi') as string;
    const donGia = parseFloat(formData.get('DonGiaCoBan') as string);

    const newData = {
      TenLoaiPhong: formData.get('TenLoaiPhong') as string,
      MoTa: formData.get('MoTa') as string,
      DonGiaCoBan: isNaN(donGia) ? 0 : donGia,
      DienTich: parseFloat(formData.get('DienTich') as string) || null,
      TienNghi: amenitiesText ? amenitiesText.split(',').map(item => item.trim()).filter(item => item) : [],
    };

    if (!newData.TenLoaiPhong || newData.DonGiaCoBan === null) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thêm loại phòng',
      message: <>Bạn có chắc muốn thêm loại phòng <strong>{newData.TenLoaiPhong}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await loaiPhongService.create(newData);
          setShowAddModal(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Thành công', message: 'Đã thêm loại phòng' });
          refreshLoaiPhongs();
        } catch (error) {
          console.error('Error creating loai phong:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({ title: 'Lỗi thêm loại phòng', message: getErrorMessage(error) });
        }
      }
    });
  };

  // ===== Sửa loại phòng =====
  const handleEdit = (loaiPhong: LoaiPhong) => {
    setEditingLoaiPhong(loaiPhong);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoaiPhong) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const amenitiesText = formData.get('TienNghi') as string;
    const donGia = parseFloat(formData.get('DonGiaCoBan') as string);

    const updatedData = {
      TenLoaiPhong: formData.get('TenLoaiPhong') as string,
      MoTa: formData.get('MoTa') as string,
      DonGiaCoBan: isNaN(donGia) ? 0 : donGia,
      DienTich: parseFloat(formData.get('DienTich') as string) || null,
      TienNghi: amenitiesText ? amenitiesText.split(',').map(item => item.trim()).filter(item => item) : [],
    };

    if (!updatedData.TenLoaiPhong || updatedData.DonGiaCoBan === null) {
      toast.error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật',
      message: <>Cập nhật thông tin loại phòng <strong>{editingLoaiPhong.TenLoaiPhong}</strong>?</>,
      type: 'info',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await loaiPhongService.update(editingLoaiPhong.MaLoaiPhong, updatedData);
          setShowEditModal(false);
          setEditingLoaiPhong(null);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.success({ title: 'Đã cập nhật', message: 'Cập nhật loại phòng thành công' });
          refreshLoaiPhongs();
        } catch (error) {
          console.error('Error updating loai phong:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({ title: 'Lỗi cập nhật', message: getErrorMessage(error) });
        }
      }
    });
  };

  // ===== Xóa loại phòng =====
  const handleDeleteLoaiPhong = (loaiPhong: LoaiPhong) => {
    if (loaiPhong.TongSoPhong > 0) {
      toast.error({
        title: 'Không thể xóa',
        message: `Loại phòng "${loaiPhong.TenLoaiPhong}" đang có ${loaiPhong.TongSoPhong} phòng. Vui lòng xóa tất cả phòng thuộc loại này trước.`
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa loại phòng',
      message: <>Bạn có chắc muốn xóa <strong>{loaiPhong.TenLoaiPhong}</strong>? Hành động này không thể hoàn tác.</>,
      type: 'danger',
      loading: false,
      onConfirm: async () => {
        try {
          setConfirmDialog(prev => ({ ...prev, loading: true }));
          await loaiPhongService.delete(loaiPhong.MaLoaiPhong);
          setConfirmDialog(prev => ({ ...prev, isOpen: false, loading: false }));
          toast.error({ title: 'Đã xóa', message: `Đã xóa loại phòng "${loaiPhong.TenLoaiPhong}"` });
          refreshLoaiPhongs();
        } catch (error) {
          console.error('Error deleting loai phong:', error);
          setConfirmDialog(prev => ({ ...prev, loading: false }));
          toast.error({ title: 'Lỗi xóa', message: getErrorMessage(error) });
        }
      }
    });
  };

  const getStatusColor = (SoPhongTrong: number, TongSoPhong: number) => {
    if (TongSoPhong === 0) return 'bg-gray-100 text-gray-800';
    const ratio = SoPhongTrong / TongSoPhong;
    if (ratio > 0.5) return 'bg-green-100 text-green-800';
    if (ratio > 0.2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý loại phòng</h1>
                <p className="text-gray-600">Quản lý các loại phòng và thông tin chi tiết</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                Thêm loại phòng
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <i className="ri-price-tag-3-line text-indigo-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng loại phòng</p>
                    <p className="text-2xl font-semibold text-gray-900">{loaiPhongs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="ri-building-line text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng phòng</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loaiPhongs.reduce((sum, lp) => sum + lp.TongSoPhong, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="ri-check-line text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Phòng trống</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loaiPhongs.reduce((sum, lp) => sum + lp.SoPhongTrong, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <i className="ri-money-dollar-circle-line text-orange-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {loaiPhongs.length > 0
                        ? (loaiPhongs.reduce((sum, lp) => sum + lp.DonGiaCoBan, 0) / loaiPhongs.length / 1000000).toFixed(1)
                        : 0}M
                    </p>
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

            {/* Empty State */}
            {!loading && loaiPhongs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-price-tag-3-line text-gray-400 text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có loại phòng nào</h3>
                <p className="text-gray-600 mb-4">Bắt đầu bằng cách thêm loại phòng đầu tiên</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Thêm loại phòng
                </button>
              </div>
            )}

            {/* Loai Phong Grid */}
            {!loading && loaiPhongs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loaiPhongs.map((loaiPhong) => (
                  <div key={loaiPhong.MaLoaiPhong} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{loaiPhong.TenLoaiPhong}</h3>
                          <p className="text-sm text-gray-600 mt-1">{loaiPhong.MoTa}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(loaiPhong)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteLoaiPhong(loaiPhong)}
                            className="text-red-600 hover:text-red-800 cursor-pointer"
                            title="Xóa"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Giá cơ bản:</span>
                          <span className="text-sm font-medium text-green-600">
                            {loaiPhong.DonGiaCoBan.toLocaleString('vi-VN')}đ/tháng
                          </span>
                        </div>
                        {loaiPhong.DienTich && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Diện tích:</span>
                            <span className="text-sm font-medium">{loaiPhong.DienTich}m²</span>
                          </div>
                        )}
                      </div>

                      {loaiPhong.TienNghi.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Tiện nghi:</p>
                          <div className="flex flex-wrap gap-1">
                            {loaiPhong.TienNghi.slice(0, 4).map((amenity, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {amenity}
                              </span>
                            ))}
                            {loaiPhong.TienNghi.length > 4 && (
                              <span className="text-xs text-gray-500">+{loaiPhong.TienNghi.length - 4} khác</span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Tình trạng phòng</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loaiPhong.SoPhongTrong, loaiPhong.TongSoPhong)}`}>
                            {loaiPhong.SoPhongTrong}/{loaiPhong.TongSoPhong} trống
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-blue-600 font-medium">{loaiPhong.SoPhongDaThue}</div>
                            <div className="text-gray-500">Đã thuê</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-600 font-medium">{loaiPhong.SoPhongTrong}</div>
                            <div className="text-gray-500">Trống</div>
                          </div>
                          <div className="text-center">
                            <div className="text-orange-600 font-medium">{loaiPhong.SoPhongBaoTri}</div>
                            <div className="text-gray-500">Bảo trì</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thêm loại phòng mới</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddLoaiPhong} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng *</label>
                    <input
                      type="text"
                      name="TenLoaiPhong"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="VD: Phòng đơn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      name="DonGiaCoBan"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="3500000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                    <input
                      type="number"
                      name="DienTich"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="MoTa"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Mô tả chi tiết về loại phòng..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                  <textarea
                    name="TienNghi"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Điều hòa, Tủ lạnh, Giường, Tủ quần áo, Bàn học..."
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Thêm loại phòng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingLoaiPhong && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa loại phòng</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng *</label>
                    <input
                      type="text"
                      name="TenLoaiPhong"
                      required
                      defaultValue={editingLoaiPhong.TenLoaiPhong}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      name="DonGiaCoBan"
                      required
                      defaultValue={editingLoaiPhong.DonGiaCoBan}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
                    <input
                      type="number"
                      name="DienTich"
                      defaultValue={editingLoaiPhong.DienTich || ''}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="MoTa"
                    defaultValue={editingLoaiPhong.MoTa}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                  <textarea
                    name="TienNghi"
                    defaultValue={editingLoaiPhong.TienNghi.join(', ')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Phân cách bằng dấu phẩy</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Lưu thay đổi
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
