import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface RoomType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  area: number;
  amenities: string[];
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
}

const mockRoomTypes: RoomType[] = [
  {
    id: '1',
    name: 'Phòng thường',
    description: 'Phòng tiêu chuẩn dành cho sinh viên hoặc người đi làm, có gác lửng tiện lợi.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 30,
    availableRooms: 0,
    occupiedRooms: 30,
    maintenanceRooms: 0
  },
  {
    id: '2',
    name: 'Phòng kiot',
    description: 'Phòng dạng kiot phù hợp cho hộ gia đình nhỏ hoặc kinh doanh tại nhà.',
    basePrice: 2700000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 2,
    availableRooms: 0,
    occupiedRooms: 2,
    maintenanceRooms: 0
  },
  {
    id: '3',
    name: 'Phòng ban công',
    description: 'Phòng có ban công rộng rãi, đón ánh sáng tự nhiên và gió trời.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 6,
    availableRooms: 1,
    occupiedRooms: 5,
    maintenanceRooms: 0
  },
  {
    id: '4',
    name: 'Phòng góc',
    description: 'Phòng nằm ở góc tòa nhà, tạo cảm giác riêng tư, yên tĩnh quanh năm.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 6,
    availableRooms: 0,
    occupiedRooms: 6,
    maintenanceRooms: 0
  },
  {
    id: '5',
    name: 'Phòng trệt',
    description: 'Phòng ở tầng trệt thuận tiện di chuyển, phù hợp với người lớn tuổi hoặc gia đình có trẻ nhỏ.',
    basePrice: 2600000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 4,
    availableRooms: 0,
    occupiedRooms: 4,
    maintenanceRooms: 0
  },
  {
    id: '6',
    name: 'Phòng tầng thượng',
    description: 'Phòng nằm ở tầng cao nhất, yên tĩnh, thoáng gió, có thể tận hưởng không khí mát mẻ vào buổi tối.',
    basePrice: 2500000,
    area: 25,
    amenities: ['Gác', 'Kệ chén bát'],
    totalRooms: 6,
    availableRooms: 0,
    occupiedRooms: 6,
    maintenanceRooms: 0
  }
];

export default function RoomTypes() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(mockRoomTypes);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'danger' | 'warning' | 'info',
    onConfirm: () => { },
    loading: false
  });

  const toast = useToast();

  const handleAddRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amenitiesText = formData.get('amenities') as string;

    const newRoomType: RoomType = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      basePrice: parseInt(formData.get('basePrice') as string),
      area: parseInt(formData.get('area') as string),
      amenities: amenitiesText.split(',').map(item => item.trim()).filter(item => item),
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      maintenanceRooms: 0
    };


    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận thêm loại phòng',
      message: `Bạn có chắc chắn muốn thêm loại phòng "${newRoomType.name}" không?`,
      type: 'info',
      loading: false,
      onConfirm: () => {
        setRoomTypes([...roomTypes, newRoomType]);
        setShowAddModal(false);
        toast.success({
          title: 'Thêm thành công',
          message: `Đã thêm loại phòng "${newRoomType.name}" vào hệ thống`
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleEditRoomType = (roomType: RoomType) => {
    setEditingRoomType({ ...roomType });
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoomType) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const amenitiesText = formData.get('amenities') as string;

    const updatedRoomType: RoomType = {
      ...editingRoomType,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      basePrice: parseInt(formData.get('basePrice') as string),
      area: parseInt(formData.get('area') as string),
      amenities: amenitiesText.split(',').map(item => item.trim()).filter(item => item)
    };



    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận cập nhật thông tin loại phòng',
      message: `Bạn có chắc chắn muốn cập nhật thông tin loại phòng "${editingRoomType.name}" không?`,
      type: 'info',
      loading: false,
      onConfirm: () => {
        setRoomTypes(roomTypes.map(rt => rt.id === editingRoomType.id ? updatedRoomType : rt));
        setShowEditModal(false);
        setEditingRoomType(null);
        toast.success({
          title: 'Cập nhật thành công',
          message: `Đã cập nhật thông tin loại phòng "${updatedRoomType.name}"`
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const handleDeleteRoomType = (roomType: RoomType) => {
    if (roomType.totalRooms > 0) {
      toast.error({
        title: 'Không thể xóa',
        message: `Loại phòng "${roomType.name}" đang có ${roomType.totalRooms} phòng. Vui lòng xóa tất cả phòng thuộc loại này trước.`
      });
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Xác nhận xóa loại phòng',
      message: `Bạn có chắc chắn muốn xóa loại phòng "${roomType.name}" không? Hành động này không thể hoàn tác.`,
      type: 'danger',
      loading: false,
      onConfirm: () => {
        setRoomTypes(roomTypes.filter(rt => rt.id !== roomType.id));
        toast.error({
          title: 'Xóa thành công',
          message: `Đã xóa loại phòng "${roomType.name}" khỏi hệ thống`
        });
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      }
    });
  };

  const getStatusColor = (available: number, total: number) => {
    if (total === 0) return 'bg-gray-100 text-gray-800';
    const ratio = available / total;
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
                    <p className="text-2xl font-semibold text-gray-900">{roomTypes.length}</p>
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
                      {roomTypes.reduce((sum, rt) => sum + rt.totalRooms, 0)}
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
                      {roomTypes.reduce((sum, rt) => sum + rt.availableRooms, 0)}
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
                      {roomTypes.length > 0
                        ? (roomTypes.reduce((sum, rt) => sum + rt.basePrice, 0) / roomTypes.length / 1000000).toFixed(1)
                        : 0}M
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Types Grid */}
            {roomTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomTypes.map((roomType) => (
                  <div key={roomType.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{roomType.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{roomType.description}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRoomType(roomType)}
                            className="text-blue-600 hover:text-blue-800 cursor-pointer"
                            title="Chỉnh sửa"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteRoomType(roomType)}
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
                            {roomType.basePrice.toLocaleString('vi-VN')}đ/tháng
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Diện tích:</span>
                          <span className="text-sm font-medium">{roomType.area}m²</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Tiện nghi:</p>
                        <div className="flex flex-wrap gap-1">
                          {roomType.amenities.slice(0, 4).map((amenity, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                          {roomType.amenities.length > 4 && (
                            <span className="text-xs text-gray-500">+{roomType.amenities.length - 4} khác</span>
                          )}
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Tình trạng phòng</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(roomType.availableRooms, roomType.totalRooms)}`}>
                            {roomType.availableRooms}/{roomType.totalRooms} trống
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-blue-600 font-medium">{roomType.occupiedRooms}</div>
                            <div className="text-gray-500">Đã thuê</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-600 font-medium">{roomType.availableRooms}</div>
                            <div className="text-gray-500">Trống</div>
                          </div>
                          <div className="text-center">
                            <div className="text-orange-600 font-medium">{roomType.maintenanceRooms}</div>
                            <div className="text-gray-500">Bảo trì</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
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
          </div>
        </main>
      </div>

      {/* Add Room Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thêm loại phòng mới</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddRoomType} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="VD: Phòng đơn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      name="basePrice"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="3500000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²) *</label>
                    <input
                      type="number"
                      name="area"
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Mô tả chi tiết về loại phòng..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                  <textarea
                    name="amenities"
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

      {/* Edit Room Type Modal */}
      {showEditModal && editingRoomType && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chỉnh sửa loại phòng</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại phòng *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingRoomType.name}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      name="basePrice"
                      required
                      defaultValue={editingRoomType.basePrice}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²) *</label>
                    <input
                      type="number"
                      name="area"
                      required
                      defaultValue={editingRoomType.area}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    defaultValue={editingRoomType.description}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    rows={3}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiện nghi</label>
                  <textarea
                    name="amenities"
                    defaultValue={editingRoomType.amenities.join(', ')}
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