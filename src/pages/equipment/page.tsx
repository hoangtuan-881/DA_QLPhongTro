import { useMemo, useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface Equipment {
  id: string;
  name: string;
  code: string;
  category: 'furniture' | 'appliance' | 'electronics' | 'safety' | 'other';
  block: string;
  room: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  lastMaintenance?: string;
  nextMaintenance?: string;
  warranty?: string;
  notes?: string;
}

const mockEquipment: Equipment[] = [
  { id: '1', name: 'Bình chữa cháy khí CO2 24kg', code: 'CC001', category: 'safety', block: 'A', room: 'A101', purchaseDate: '2023-06-15', purchasePrice: 3700000, condition: 'good', lastMaintenance: '2024-01-15', nextMaintenance: '2024-07-15', warranty: '2025-06-15', notes: 'Bảo dưỡng định kỳ 6 tháng/lần' },
  { id: '2', name: 'Bình chữa cháy khí CO2 5kg', code: 'CC002', category: 'safety', block: 'A', room: 'A101', purchaseDate: '2023-06-20', purchasePrice: 680000, condition: 'good', lastMaintenance: '2024-02-10', warranty: '2025-06-20', notes: 'Bảo dưỡng định kỳ 6 tháng/lần' },
  { id: '3', name: 'Router Wifi Chuẩn N Mercusys', code: 'MW302R', category: 'electronics', block: 'A', room: 'A101', purchaseDate: '2023-05-10', purchasePrice: 210000, condition: 'good' },
  { id: '4', name: 'Máy lạnh Midea Inverter 1', code: 'MAFA-09CDN8', category: 'appliance', block: 'A', room: 'A102', purchaseDate: '2023-07-05', purchasePrice: 5290000, condition: 'fair', lastMaintenance: '2024-01-20', nextMaintenance: '2024-04-20', warranty: '2024-07-05', notes: 'Cần thay ống đồng' },
  { id: '5', name: 'Tủ quần áo', code: 'WD001', category: 'furniture', block: 'A', room: 'A102', purchaseDate: '2023-05-15', purchasePrice: 800000, condition: 'good' },
  { id: '6', name: 'Bảng nội quy', code: 'NQ001', category: 'other', block: 'A', room: 'Hành lang', purchaseDate: '2023-04-10', purchasePrice: 450000, condition: 'good', nextMaintenance: '2024-04-10', notes: 'Không' }
];

export default function Equipment() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'placement'>('inventory');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [placementBlock, setPlacementBlock] = useState<string>('all');
  const [placementStatus, setPlacementStatus] = useState<'all' | 'ok' | 'need_maintenance'>('all');
  const [placementSearch, setPlacementSearch] = useState<string>('');
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState<Equipment | null>(null);
  const [equipments, setEquipments] = useState<Equipment[]>(mockEquipment);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [detailContext, setDetailContext] = useState<'inventory' | 'placement' | null>(null);

  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  } | null>(null);

  const toast = useToast();

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    code: '',
    category: '',
    block: '',
    room: '',
    purchaseDate: '',
    purchasePrice: 0,
    condition: 'good',
    warranty: '',
    notes: ''
  });

  const [maintenanceRequest, setMaintenanceRequest] = useState({
    type: 'routine',
    description: '',
    priority: 'medium',
    scheduledDate: '',
    estimatedCost: 0,
    assignedTo: '',
    notes: ''
  });

  /** ====== HELPERS ====== */
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'furniture': return 'bg-blue-100 text-blue-800';
      case 'appliance': return 'bg-green-100 text-green-800';
      case 'electronics': return 'bg-purple-100 text-purple-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'furniture': return 'Nội thất';
      case 'appliance': return 'Thiết bị điện';
      case 'electronics': return 'Điện tử';
      case 'safety': return 'An toàn';
      case 'other': return 'Khác';
      default: return category;
    }
  };
  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getConditionText = (condition: string) => {
    switch (condition) {
      case 'good': return 'Tốt';
      case 'fair': return 'Khá';
      case 'poor': return 'Kém';
      case 'damaged': return 'Hỏng';
      default: return condition;
    }
  };

  const isMaintenanceDue = (nextMaintenance?: string) => {
    if (!nextMaintenance) return false;
    const today = new Date();
    const maintenanceDate = new Date(nextMaintenance);
    const diffTime = maintenanceDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  // Tình trạng thiết bị trong phòng: cần bảo trì nếu gần hạn hoặc condition kém/hỏng
  const getPlacementStatus = (e: Equipment) => {
    const need = isMaintenanceDue(e.nextMaintenance) || e.condition === 'poor' || e.condition === 'damaged';
    return need ? 'need_maintenance' : 'ok';
  };

  /** ====== FILTERED DATA ====== */
  const inventoryFiltered = useMemo(() => {
    return equipments.filter(item => {
      const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
      const q = (search || '').toLowerCase().trim();
      const searchMatch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.notes || '').toLowerCase().includes(q);
      return categoryMatch && searchMatch;
    });
  }, [equipments, filterCategory, search]);

  type PlacementRow = {
    id: string;
    block: string;
    room: string;
    deviceName: string;
    code: string;
    status: 'ok' | 'need_maintenance';
    original: Equipment;
  };

  const placementRows: PlacementRow[] = useMemo(() => {
    return equipments.map(e => ({
      id: e.id,
      block: e.block,
      room: e.room,
      deviceName: e.name,
      code: e.code,
      status: getPlacementStatus(e),
      original: e
    }));
  }, [equipments]);

  const uniqueBlocks = useMemo(() => {
    const set = new Set<string>();
    placementRows.forEach(r => set.add(r.block));
    return Array.from(set);
  }, [placementRows]);

  const placementFiltered = useMemo(() => {
    return placementRows.filter(r => {
      const blockMatch = placementBlock === 'all' || r.block === placementBlock;
      const statusMatch = placementStatus === 'all' || r.status === placementStatus;
      const q = (placementSearch || '').toLowerCase().trim();
      const searchMatch =
        !q ||
        r.deviceName.toLowerCase().includes(q) ||
        r.room.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q);
      return blockMatch && statusMatch && searchMatch;
    });
  }, [placementRows, placementBlock, placementStatus, placementSearch]);

  const showConfirm = (action: {
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }) => {
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };
  const handleConfirm = () => {
    if (confirmAction) confirmAction.onConfirm();
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleEdit = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setNewEquipment({
      name: equipment.name,
      code: equipment.code,
      category: equipment.category,
      block: equipment.block,
      room: equipment.room,
      purchaseDate: equipment.purchaseDate,
      purchasePrice: equipment.purchasePrice,
      condition: equipment.condition,
      warranty: equipment.warranty || '',
      notes: equipment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (equipment: Equipment) => {
    showConfirm({
      title: 'Xác nhận xóa thiết bị',
      message: `Bạn có chắc chắn muốn xóa thiết bị "${equipment.name}" (Mã: ${equipment.code}) không? Hành động này không thể hoàn tác.`,
      onConfirm: () => confirmDelete(equipment),
      type: 'danger'
    });
  };
  const confirmDelete = (equipment: Equipment) => {
    setEquipments(prev => prev.filter(e => e.id !== equipment.id));
    toast.success({ title: 'Đã xóa thiết bị', message: `Đã xóa "${equipment.name}" (${equipment.code})` });
  };

  const handleMaintenance = (equipment: Equipment) => {
    setMaintenanceEquipment(equipment);
    setMaintenanceRequest({
      type: 'routine',
      description: '',
      priority: 'medium',
      scheduledDate: '',
      estimatedCost: 0,
      assignedTo: '',
      notes: ''
    });
    setShowMaintenanceModal(true);
  };

  const resetForm = () => {
    setNewEquipment({
      name: '',
      code: '',
      category: '',
      block: '',
      room: '',
      purchaseDate: '',
      purchasePrice: 0,
      condition: 'good',
      warranty: '',
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!newEquipment.name || !newEquipment.code || !newEquipment.category || !newEquipment.block || !newEquipment.room) {
      toast.error({ title: 'Lỗi', message: 'Vui lòng điền đầy đủ tên, mã, danh mục, dãy, phòng!' });
      return;
    }
    showConfirm({
      title: 'Xác nhận thêm thiết bị',
      message: `Bạn có chắc muốn thêm "${newEquipment.name}" - Phòng ${newEquipment.room}?`,
      type: 'info',
      onConfirm: () => {
        const toCreate: Equipment = {
          id: Date.now().toString(),
          name: newEquipment.name,
          code: newEquipment.code,
          category: newEquipment.category as Equipment['category'],
          block: newEquipment.block,
          room: newEquipment.room,
          purchaseDate: newEquipment.purchaseDate,
          purchasePrice: newEquipment.purchasePrice,
          condition: newEquipment.condition as Equipment['condition'],
          warranty: newEquipment.warranty || undefined,
          notes: newEquipment.notes || undefined
        };
        setEquipments(prev => [toCreate, ...prev]);
        setShowAddModal(false);
        resetForm();
        toast.success({ title: 'Thêm thiết bị thành công', message: `Đã thêm "${toCreate.name}"` });
      }
    });
  };

  const handleUpdate = () => {
    if (!editingEquipment || !newEquipment.name || !newEquipment.code || !newEquipment.category || !newEquipment.room) {
      toast.error({ title: 'Lỗi cập nhật thiết bị', message: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }
    showConfirm({
      title: 'Xác nhận cập nhật',
      message: `Lưu thay đổi cho "${newEquipment.name}"?`,
      type: 'info',
      onConfirm: () => {
        setEquipments(prev => prev.map(e =>
          e.id === editingEquipment.id
            ? {
              ...e,
              name: newEquipment.name,
              code: newEquipment.code,
              category: newEquipment.category as Equipment['category'],
              block: newEquipment.block,
              room: newEquipment.room,
              purchaseDate: newEquipment.purchaseDate,
              purchasePrice: newEquipment.purchasePrice,
              condition: newEquipment.condition as Equipment['condition'],
              warranty: newEquipment.warranty || undefined,
              notes: newEquipment.notes || undefined
            }
            : e
        ));
        setShowEditModal(false);
        setEditingEquipment(null);
        resetForm();
        toast.success({ title: 'Cập nhật thiết bị thành công', message: `Đã cập nhật "${newEquipment.name}"` });
      }
    });
  };

  const handleCreateMaintenance = () => {
    if (!maintenanceRequest.description || !maintenanceRequest.scheduledDate) {
      toast.error({ title: 'Lỗi tạo yêu cầu bảo trì', message: 'Vui lòng nhập mô tả và ngày thực hiện!' });
      return;
    }
    const typeText =
      maintenanceRequest.type === 'routine' ? 'bảo trì định kỳ' :
        maintenanceRequest.type === 'repair' ? 'sửa chữa' : 'thay thế';

    showConfirm({
      title: 'Xác nhận tạo yêu cầu bảo trì',
      message: `Tạo yêu cầu ${typeText} cho "${maintenanceEquipment?.name}" vào ${new Date(maintenanceRequest.scheduledDate).toLocaleDateString('vi-VN')}?`,
      type: 'info',
      onConfirm: () => {
        if (maintenanceEquipment) {
          setEquipments(prev => prev.map(e =>
            e.id === maintenanceEquipment.id
              ? {
                ...e,
                nextMaintenance: maintenanceRequest.scheduledDate,
                notes: maintenanceRequest.notes ? `${e.notes ? e.notes + ' | ' : ''}${maintenanceRequest.notes}` : e.notes
              }
              : e
          ));
        }
        setShowMaintenanceModal(false);
        setMaintenanceEquipment(null);
        setMaintenanceRequest({
          type: 'routine',
          description: '',
          priority: 'medium',
          scheduledDate: '',
          estimatedCost: 0,
          assignedTo: '',
          notes: ''
        });
        toast.success({ title: 'Đã tạo yêu cầu bảo trì', message: `Đã ${typeText} cho "${maintenanceEquipment?.name}"` });
      }
    });
  };

  /** ====== RENDER ====== */
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thiết bị</h1>
                <p className="text-gray-600">Quản lý thiết bị và thiết bị theo phòng</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i> Thêm thiết bị
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Thiết bị hiện có
                  </button>
                  <button
                    onClick={() => setActiveTab('placement')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'placement' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Thiết bị theo phòng
                  </button>
                </nav>
              </div>
            </div>

            {/* Stats (chung) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg"><i className="ri-tools-line text-blue-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tổng thiết bị</p>
                    <p className="text-2xl font-bold text-gray-900">{equipments.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg"><i className="ri-checkbox-circle-line text-green-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tình trạng tốt</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {equipments.filter(e => e.condition === 'good').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg"><i className="ri-time-line text-yellow-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cần bảo trì (gần hạn)</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {equipments.filter(e => e.nextMaintenance && isMaintenanceDue(e.nextMaintenance)).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg"><i className="ri-error-warning-line text-red-600 text-xl"></i></div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Hỏng/Kém</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {equipments.filter(e => e.condition === 'damaged' || e.condition === 'poor').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FILTERS theo TAB */}
            {activeTab === 'inventory' ? (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả danh mục</option>
                    <option value="furniture">Nội thất</option>
                    <option value="appliance">Thiết bị điện</option>
                    <option value="electronics">Điện tử</option>
                    <option value="safety">An toàn</option>
                    <option value="other">Khác</option>
                  </select>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên, mã, ghi chú..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-wrap gap-4">
                  <select
                    value={placementBlock}
                    onChange={(e) => setPlacementBlock(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả dãy</option>
                    {uniqueBlocks.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                  <select
                    value={placementStatus}
                    onChange={(e) => setPlacementStatus(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="all">Tất cả tình trạng</option>
                    <option value="ok">Bình thường</option>
                    <option value="need_maintenance">Cần bảo trì</option>
                  </select>
                  <input
                    type="text"
                    value={placementSearch}
                    onChange={(e) => setPlacementSearch(e.target.value)}
                    placeholder="Tìm theo phòng / thiết bị / mã..."
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-64"
                  />
                </div>
              </div>
            )}

            {/* TABLES theo TAB */}
            {activeTab === 'inventory' ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên thiết bị</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá mua</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inventoryFiltered.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{e.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{e.code}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(e.category)}`}>
                              {getCategoryText(e.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{e.purchasePrice.toLocaleString('vi-VN')}đ</div>
                            <div className="text-xs text-gray-500">{new Date(e.purchaseDate).toLocaleDateString('vi-VN')}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{e.notes || <span className="text-gray-400 italic">—</span>}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setDetailContext('inventory'); setSelectedEquipment(e); }}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <i className="ri-eye-line"></i>
                              </button>

                              <button
                                onClick={() => handleEdit(e)}
                                className="text-green-600 hover:text-green-900 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(e)}
                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                title="Xóa thiết bị"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {inventoryFiltered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Không có thiết bị phù hợp bộ lọc.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dãy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phòng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thiết bị</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tình trạng</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {placementFiltered.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{row.block}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{row.room}</td>
                          <td className="px-6 py-4 text-sm">
                            <div className="text-gray-900 font-medium">{row.deviceName}</div>
                            <div className="text-gray-500">{row.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {row.status === 'need_maintenance' ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Cần bảo trì</span>
                            ) : (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Bình thường</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => { setDetailContext('placement'); setSelectedEquipment(row.original); }}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <i className="ri-eye-line"></i>
                              </button>

                              <button
                                onClick={() => handleEdit(row.original)}
                                className="text-green-600 hover:text-green-900 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <i className="ri-edit-line"></i>
                              </button>
                              <button
                                onClick={() => handleMaintenance(row.original)}
                                className="text-orange-600 hover:text-orange-900 cursor-pointer"
                                title="Bảo trì"
                              >
                                <i className="ri-tools-line"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(row.original)}
                                className="text-red-600 hover:text-red-900 cursor-pointer"
                                title="Xóa"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {placementFiltered.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Không có thiết bị phù hợp bộ lọc.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* === Detail Modal === */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => { setSelectedEquipment(null); setDetailContext(null); }}
            ></div>

            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {detailContext === 'inventory' ? 'Chi tiết thiết bị (Thông tin chung)' : 'Chi tiết thiết bị'}
                </h2>
                <button
                  onClick={() => { setSelectedEquipment(null); setDetailContext(null); }}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              {/* ========== INVENTORY VIEW: chỉ thông tin chung ========== */}
              {detailContext === 'inventory' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tên thiết bị:</span>
                          <span className="font-medium">{selectedEquipment.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mã thiết bị:</span>
                          <span className="font-medium">{selectedEquipment.code}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEquipment.category)}`}>
                            {getCategoryText(selectedEquipment.category)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Mua sắm</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Ngày mua:</span>
                          <span className="font-medium">{new Date(selectedEquipment.purchaseDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Giá mua:</span>
                          <span className="font-medium text-green-600">
                            {selectedEquipment.purchasePrice.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        {selectedEquipment.warranty && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bảo hành đến:</span>
                            <span className="font-medium">
                              {new Date(selectedEquipment.warranty).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedEquipment.notes && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEquipment.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <button
                      onClick={() => handleEdit(selectedEquipment)}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEquipment)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Xóa thiết bị
                    </button>
                  </div>
                </>
              )}

              {/* ========== PLACEMENT VIEW: chi tiết đầy đủ như hiện có ========== */}
              {detailContext === 'placement' && (
                <>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Thông tin cơ bản</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Tên thiết bị:</span><span className="font-medium">{selectedEquipment.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Mã thiết bị:</span><span className="font-medium">{selectedEquipment.code}</span></div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Danh mục:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEquipment.category)}`}>
                            {getCategoryText(selectedEquipment.category)}
                          </span>
                        </div>
                        <div className="flex justify-between"><span className="text-gray-600">Dãy:</span><span className="font-medium">{selectedEquipment.block}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Phòng:</span><span className="font-medium">{selectedEquipment.room}</span></div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tình trạng:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedEquipment.condition)}`}>
                            {getConditionText(selectedEquipment.condition)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Mua sắm & bảo trì</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-600">Ngày mua:</span><span className="font-medium">{new Date(selectedEquipment.purchaseDate).toLocaleDateString('vi-VN')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Giá mua:</span><span className="font-medium text-green-600">{selectedEquipment.purchasePrice.toLocaleString('vi-VN')}đ</span></div>
                        {selectedEquipment.warranty && (<div className="flex justify-between"><span className="text-gray-600">Bảo hành đến:</span><span className="font-medium">{new Date(selectedEquipment.warranty).toLocaleDateString('vi-VN')}</span></div>)}
                        {selectedEquipment.lastMaintenance && (<div className="flex justify-between"><span className="text-gray-600">Bảo trì lần cuối:</span><span className="font-medium">{new Date(selectedEquipment.lastMaintenance).toLocaleDateString('vi-VN')}</span></div>)}
                        {selectedEquipment.nextMaintenance && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Bảo trì tiếp theo:</span>
                            <span className={`font-medium ${isMaintenanceDue(selectedEquipment.nextMaintenance) ? 'text-red-600' : 'text-gray-900'}`}>
                              {new Date(selectedEquipment.nextMaintenance).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedEquipment.notes && (
                    <div className="mt-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedEquipment.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    <button onClick={() => handleEdit(selectedEquipment)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Chỉnh sửa</button>
                    <button onClick={() => handleMaintenance(selectedEquipment)} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">Tạo yêu cầu bảo trì</button>
                    <button onClick={() => handleDelete(selectedEquipment)} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer">Xóa thiết bị</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm thiết bị mới</h2>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                    <input type="text" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Điều hòa Daikin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input type="text" value={newEquipment.code} onChange={(e) => setNewEquipment({ ...newEquipment, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="AC001" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select value={newEquipment.category} onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="">Chọn danh mục</option>
                      <option value="furniture">Nội thất</option>
                      <option value="appliance">Thiết bị điện</option>
                      <option value="electronics">Điện tử</option>
                      <option value="safety">An toàn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                    <input
                      type="text"
                      value={newEquipment.block}
                      onChange={(e) => setNewEquipment({ ...newEquipment, block: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A / B / C..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <input
                      type="text"
                      value={newEquipment.room}
                      onChange={(e) => setNewEquipment({ ...newEquipment, room: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A101 / 101 / P101..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input type="date" value={newEquipment.purchaseDate} onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input type="number" value={newEquipment.purchasePrice} onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="8500000" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select value={newEquipment.condition} onChange={(e) => setNewEquipment({ ...newEquipment, condition: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="good">Tốt</option>
                      <option value="fair">Khá</option>
                      <option value="poor">Kém</option>
                      <option value="damaged">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                    <input type="date" value={newEquipment.warranty} onChange={(e) => setNewEquipment({ ...newEquipment, warranty: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={newEquipment.notes} onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú về thiết bị..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Thêm thiết bị</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowEditModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Chỉnh sửa thiết bị</h2>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị *</label>
                    <input type="text" value={newEquipment.name} onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị *</label>
                    <input type="text" value={newEquipment.code} onChange={(e) => setNewEquipment({ ...newEquipment, code: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                    <select value={newEquipment.category} onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="">Chọn danh mục</option>
                      <option value="furniture">Nội thất</option>
                      <option value="appliance">Thiết bị điện</option>
                      <option value="electronics">Điện tử</option>
                      <option value="safety">An toàn</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                {/* Add & Edit modal – NEW field */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dãy *</label>
                    <input
                      type="text"
                      value={newEquipment.block}
                      onChange={(e) => setNewEquipment({ ...newEquipment, block: e.target.value.toUpperCase() })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A / B / C..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phòng *</label>
                    <input
                      type="text"
                      value={newEquipment.room}
                      onChange={(e) => setNewEquipment({ ...newEquipment, room: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="A101 / 101 / P101..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày mua *</label>
                    <input type="date" value={newEquipment.purchaseDate} onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá mua (VNĐ) *</label>
                    <input type="number" value={newEquipment.purchasePrice} onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select value={newEquipment.condition} onChange={(e) => setNewEquipment({ ...newEquipment, condition: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="good">Tốt</option>
                      <option value="fair">Khá</option>
                      <option value="poor">Kém</option>
                      <option value="damaged">Hỏng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                    <input type="date" value={newEquipment.warranty} onChange={(e) => setNewEquipment({ ...newEquipment, warranty: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={newEquipment.notes} onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowEditModal(false); setEditingEquipment(null); resetForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleUpdate} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer">Cập nhật</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && maintenanceEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMaintenanceModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tạo yêu cầu bảo trì</h2>

              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Thông tin thiết bị</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-600">Tên thiết bị:</span><span className="font-medium ml-2">{maintenanceEquipment.name}</span></div>
                  <div><span className="text-gray-600">Mã thiết bị:</span><span className="font-medium ml-2">{maintenanceEquipment.code}</span></div>
                  <div><span className="text-gray-600">Phòng:</span><span className="font-medium ml-2">{maintenanceEquipment.room}</span></div>
                  <div><span className="text-gray-600">Tình trạng:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${getConditionColor(maintenanceEquipment.condition)}`}>
                      {getConditionText(maintenanceEquipment.condition)}
                    </span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại bảo trì *</label>
                    <select value={maintenanceRequest.type} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, type: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="routine">Bảo trì định kỳ</option>
                      <option value="repair">Sửa chữa</option>
                      <option value="replacement">Thay thế</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ ưu tiên *</label>
                    <select value={maintenanceRequest.priority} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, priority: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                  <textarea value={maintenanceRequest.description} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, description: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Mô tả chi tiết vấn đề..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày dự kiến thực hiện *</label>
                    <input type="date" value={maintenanceRequest.scheduledDate} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, scheduledDate: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chi phí ước tính (VNĐ)</label>
                    <input type="number" value={maintenanceRequest.estimatedCost} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, estimatedCost: parseInt(e.target.value) || 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="500000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người phụ trách</label>
                  <input type="text" value={maintenanceRequest.assignedTo} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, assignedTo: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tên kỹ thuật viên / đơn vị" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
                  <textarea value={maintenanceRequest.notes} onChange={(e) => setMaintenanceRequest({ ...maintenanceRequest, notes: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} placeholder="Ghi chú thêm..." />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowMaintenanceModal(false); setMaintenanceEquipment(null); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer">Hủy</button>
                  <button type="button" onClick={handleCreateMaintenance} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer">Tạo yêu cầu bảo trì</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmDialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        onConfirm={handleConfirm}
        onClose={() => setShowConfirmDialog(false)}
        type={confirmAction?.type}
      />
    </div>
  );
}
