import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import thongBaoService from '../../services/thongBaoHeThongService';
import phongTroService, { PhongTro } from '../../services/phong-tro.service';
import { ThongBaoHeThong, ThongBaoHeThongCreateInput } from '../../types/thong-bao';
import { getErrorMessage } from '../../lib/http-client';

export default function Notifications() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { success, error, warning } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  // Loading & Data states
  const [loading, setLoading] = useState(true);
  const [phongTros, setPhongTros] = useState<PhongTro[]>([]);
  const [thongBaos, setThongBaos] = useState<ThongBaoHeThong[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Tabs theo trạng thái
  const [statusTab, setStatusTab] = useState<'all' | 'sent' | 'scheduled' | 'draft'>('all');

  // Modal & Form states
  const [showModal, setShowModal] = useState(false);
  const [selectedThongBao, setSelectedThongBao] = useState<ThongBaoHeThong | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'general' | 'urgent' | 'maintenance' | 'payment'>('all');

  // Inline scheduling cho bản nháp
  const [scheduleEditId, setScheduleEditId] = useState<number | null>(null);
  const [scheduleValue, setScheduleValue] = useState<string>('');

  // ✅ Fetch data với AbortController
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const [thongBaoRes, phongTroRes] = await Promise.all([
          thongBaoService.getAll(controller.signal),
          phongTroService.getAll(controller.signal),
        ]);

        if (!controller.signal.aborted) {
          setThongBaos(thongBaoRes.data.data || []);
          setPhongTros(phongTroRes.data.data || []);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải dữ liệu', message: getErrorMessage(err) });
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => controller.abort();
  }, [refreshKey]);

  const refreshData = () => {
    setLoading(true);
    setRefreshKey((prev) => prev + 1);
  };

  const filteredThongBaos = thongBaos.filter((thongBao) => {
    const matchesSearch =
      thongBao.TieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thongBao.NoiDung.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || thongBao.LoaiThongBao === typeFilter;
    return matchesSearch && matchesType;
  });

  const listByTab =
    statusTab === 'all' ? filteredThongBaos : filteredThongBaos.filter((n) => n.TrangThai === statusTab);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'general':
        return 'Chung';
      case 'urgent':
        return 'Khẩn cấp';
      case 'maintenance':
        return 'Bảo trì';
      case 'payment':
        return 'Thanh toán';
      default:
        return type;
    }
  };

  const handleSendThongBao = (thongBao: ThongBaoHeThong) => {
    setConfirmMessage(`Bạn có chắc chắn muốn gửi thông báo "${thongBao.TieuDe}" không?`);
    setConfirmAction(() => async () => {
      try {
        await thongBaoService.update(thongBao.MaThongBao, { TrangThai: 'sent' });
        success({ title: `Đã gửi thông báo "${thongBao.TieuDe}" thành công!` });
        setShowConfirmDialog(false);
        refreshData();
      } catch (err) {
        error({ title: 'Lỗi gửi thông báo', message: getErrorMessage(err) });
      }
    });
    setShowConfirmDialog(true);
  };

  const handleDeleteThongBao = (thongBao: ThongBaoHeThong) => {
    setConfirmMessage(`Bạn có chắc chắn muốn xóa thông báo "${thongBao.TieuDe}" không? Hành động này không thể hoàn tác.`);
    setConfirmAction(() => async () => {
      try {
        await thongBaoService.delete(thongBao.MaThongBao);
        success({ title: `Đã xóa thông báo "${thongBao.TieuDe}" thành công!` });
        setShowConfirmDialog(false);
        refreshData();
      } catch (err) {
        error({ title: 'Lỗi xóa thông báo', message: getErrorMessage(err) });
      }
    });
    setShowConfirmDialog(true);
  };

  const handleAddThongBao = async (formData: ThongBaoHeThongCreateInput) => {
    if (!formData.TieuDe || !formData.NoiDung) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    if (formData.DoiTuongNhan === 'specific' && (!formData.CacPhongNhan || formData.CacPhongNhan.length === 0)) {
      error({ title: 'Vui lòng chọn ít nhất một phòng!' });
      return;
    }

    try {
      await thongBaoService.create(formData);
      setShowModal(false);

      if (formData.TrangThai === 'sent') {
        success({ title: `Đã tạo và gửi thông báo "${formData.TieuDe}" thành công!` });
      } else if (formData.TrangThai === 'scheduled') {
        success({ title: `Đã lên lịch gửi thông báo "${formData.TieuDe}" thành công!` });
      } else {
        success({ title: `Đã lưu bản nháp thông báo "${formData.TieuDe}" thành công!` });
      }
      refreshData();
    } catch (err) {
      error({ title: 'Lỗi tạo thông báo', message: getErrorMessage(err) });
    }
  };

  const handleUpdateThongBao = async (formData: ThongBaoHeThongCreateInput) => {
    if (!selectedThongBao || !formData.TieuDe || !formData.NoiDung) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    try {
      await thongBaoService.update(selectedThongBao.MaThongBao, formData);
      setShowModal(false);
      setSelectedThongBao(null);
      success({ title: `Đã cập nhật thông báo "${formData.TieuDe}" thành công!` });
      refreshData();
    } catch (err) {
      error({ title: 'Lỗi cập nhật thông báo', message: getErrorMessage(err) });
    }
  };

  const handleBulkSendThongBaos = () => {
    const draftThongBaos = thongBaos.filter((n) => n.TrangThai === 'draft');
    if (draftThongBaos.length === 0) {
      warning({ title: 'Không có thông báo nháp nào để gửi!' });
      return;
    }

    setConfirmMessage(`Bạn có chắc chắn muốn gửi tất cả ${draftThongBaos.length} thông báo nháp không?`);
    setConfirmAction(() => async () => {
      try {
        await Promise.all(
          draftThongBaos.map((tb) => thongBaoService.update(tb.MaThongBao, { TrangThai: 'sent' }))
        );
        success({ title: `Đã gửi ${draftThongBaos.length} thông báo thành công!` });
        setShowConfirmDialog(false);
        refreshData();
      } catch (err) {
        error({ title: 'Lỗi gửi thông báo', message: getErrorMessage(err) });
      }
    });
    setShowConfirmDialog(true);
  };

  // Helpers
  const nowPlus1HourLocalString = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleQuickPlus1Hour = async (thongBao: ThongBaoHeThong) => {
    const t = nowPlus1HourLocalString();
    const formatted = t.replace('T', ' ').replace(/-/g, '/');
    try {
      await thongBaoService.update(thongBao.MaThongBao, {
        TrangThai: 'scheduled',
        ThoiGianHenGio: formatted,
      });
      success({ title: 'Đã đặt lịch sau 1 giờ' });
      refreshData();
    } catch (err) {
      error({ title: 'Lỗi đặt lịch', message: getErrorMessage(err) });
    }
  };

  const openScheduleForDraft = (id: number) => {
    setScheduleEditId(id);
    setScheduleValue(nowPlus1HourLocalString());
  };

  const saveScheduleForDraft = async (id: number) => {
    if (!scheduleValue) {
      error({ title: 'Vui lòng chọn thời gian gửi.' });
      return;
    }
    const formatted = scheduleValue.replace('T', ' ').replace(/-/g, '/');
    try {
      await thongBaoService.update(id, {
        TrangThai: 'scheduled',
        ThoiGianHenGio: formatted,
      });
      setScheduleEditId(null);
      setScheduleValue('');
      success({ title: 'Đã đặt lịch gửi cho bản nháp.' });
      refreshData();
    } catch (err) {
      error({ title: 'Lỗi đặt lịch', message: getErrorMessage(err) });
    }
  };

  const cancelScheduleEdit = () => {
    setScheduleEditId(null);
    setScheduleValue('');
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý thông báo</h1>
                <p className="text-gray-600">Tạo và quản lý thông báo gửi đến khách thuê</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleBulkSendThongBaos}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 whitespace-nowrap flex items-center"
                >
                  <i className="ri-send-plane-line mr-2"></i>
                  Gửi tất cả nháp
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap flex items-center"
                >
                  <i className="ri-add-line mr-2"></i>
                  Tạo thông báo
                </button>
              </div>
            </div>

            {/* Tabs trạng thái */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  {([
                    { key: 'all', label: 'Tất cả' },
                    { key: 'sent', label: `Đã gửi (${thongBaos.filter((n) => n.TrangThai === 'sent').length})` },
                    { key: 'scheduled', label: `Đang lên lịch (${thongBaos.filter((n) => n.TrangThai === 'scheduled').length})` },
                    { key: 'draft', label: `Nháp (${thongBaos.filter((n) => n.TrangThai === 'draft').length})` },
                  ] as const).map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setStatusTab(t.key)}
                      className={`py-3 px-6 border-b-2 font-medium text-sm cursor-pointer ${
                        statusTab === t.key
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="p-4">
                <span className="text-sm text-gray-500">
                  Hiển thị theo nhóm trạng thái. Bạn vẫn có thể tìm kiếm hoặc lọc theo loại ở bên dưới.
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatCard icon="ri-notification-line" color="blue" label="Tổng thông báo" value={thongBaos.length} />
              <StatCard icon="ri-send-plane-line" color="green" label="Đã gửi" value={thongBaos.filter((n) => n.TrangThai === 'sent').length} />
              <StatCard icon="ri-calendar-schedule-line" color="yellow" label="Đã lên lịch" value={thongBaos.filter((n) => n.TrangThai === 'scheduled').length} />
              <StatCard icon="ri-draft-line" color="purple" label="Bản nháp" value={thongBaos.filter((n) => n.TrangThai === 'draft').length} />
            </div>

            {/* Filters: chỉ tìm kiếm + loại */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm theo tiêu đề, nội dung..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    {[
                      { value: 'all', label: 'Tất cả loại' },
                      { value: 'general', label: 'Thông báo chung' },
                      { value: 'urgent', label: 'Khẩn cấp' },
                      { value: 'maintenance', label: 'Bảo trì' },
                      { value: 'payment', label: 'Thanh toán' },
                    ].map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                  >
                    Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {listByTab.map((thongBao) => {
                const isDraft = thongBao.TrangThai === 'draft';
                const isScheduled = thongBao.TrangThai === 'scheduled';

                return (
                  <div key={thongBao.MaThongBao} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{thongBao.TieuDe}</h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(thongBao.LoaiThongBao)}`}>
                            {getTypeText(thongBao.LoaiThongBao)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">{thongBao.NoiDung}</p>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span>
                            <i className="ri-user-line mr-1"></i>
                            {thongBao.DoiTuongNhan === 'all'
                              ? 'Tất cả'
                              : `${thongBao.CacPhongNhan?.length ?? 0} phòng`}
                          </span>
                          <span>
                            <i className="ri-calendar-line mr-1"></i>
                            Tạo lúc: {thongBao.ThoiGianTao}
                          </span>

                          {thongBao.TrangThai === 'sent' && (
                            <>
                              <span>
                                <i className="ri-send-plane-line mr-1"></i>
                                Đã gửi: {thongBao.ThoiGianGui}
                              </span>
                              <span>
                                <i className="ri-eye-line mr-1"></i>
                                {thongBao.SoNguoiDoc}/{thongBao.TongSoNguoiNhan} đã đọc
                              </span>
                            </>
                          )}

                          {isScheduled && thongBao.ThoiGianHenGio && (
                            <span>
                              <i className="ri-time-line mr-1"></i>
                              Gửi lúc: {thongBao.ThoiGianHenGio}
                            </span>
                          )}

                          {isDraft && (
                            <span className="italic">
                              <i className="ri-draft-line mr-1"></i>
                              Bản nháp
                            </span>
                          )}
                        </div>

                        {/* Inline schedule editor cho Nháp */}
                        {isDraft && scheduleEditId === thongBao.MaThongBao && (
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <input
                              type="datetime-local"
                              value={scheduleValue}
                              onChange={(e) => setScheduleValue(e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <button
                              onClick={() => saveScheduleForDraft(thongBao.MaThongBao)}
                              className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-indigo-700"
                            >
                              Lưu lịch
                            </button>
                            <button
                              onClick={cancelScheduleEdit}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setSelectedThongBao(thongBao);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Chỉnh sửa"
                        >
                          <i className="ri-edit-line"></i>
                        </button>

                        {/* Gửi ngay (chỉ cho nháp) */}
                        {isDraft && (
                          <button
                            onClick={() => handleSendThongBao(thongBao)}
                            className="text-green-600 hover:text-green-900"
                            title="Gửi ngay"
                          >
                            <i className="ri-send-plane-line"></i>
                          </button>
                        )}

                        {/* Đặt giờ (chỉ cho nháp) */}
                        {isDraft && (
                          <button
                            onClick={() => openScheduleForDraft(thongBao.MaThongBao)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Đặt giờ gửi"
                          >
                            <i className="ri-time-line"></i>
                          </button>
                        )}

                        {/* Nhanh +1 giờ (chỉ cho đang lên lịch) */}
                        {isScheduled && (
                          <button
                            onClick={() => handleQuickPlus1Hour(thongBao)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Đặt lại: gửi sau 1 giờ"
                          >
                            <i className="ri-timer-line"></i>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteThongBao(thongBao)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {listByTab.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm text-gray-500">
                  Không có thông báo phù hợp.
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Notification Modal */}
        {showModal && (
          <NotificationModal
            thongBao={selectedThongBao}
            phongTros={phongTros}
            onClose={() => {
              setShowModal(false);
              setSelectedThongBao(null);
            }}
            onSubmit={selectedThongBao ? handleUpdateThongBao : handleAddThongBao}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận thao tác"
          message={confirmMessage}
          onConfirm={confirmAction}
          onClose={() => setShowConfirmDialog(false)}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value }: { icon: string; color: 'blue' | 'green' | 'yellow' | 'purple'; label: string; value: number }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  } as const;
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`w-12 h-12 ${colorMap[color].split(' ')[0]} rounded-lg flex items-center justify-center`}>
          <i className={`${icon} ${colorMap[color].split(' ')[1]} text-xl`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================
   NotificationModal
   ========================= */
interface NotificationModalProps {
  thongBao?: ThongBaoHeThong | null;
  phongTros: PhongTro[];
  onClose: () => void;
  onSubmit: (data: ThongBaoHeThongCreateInput) => void;
}

function NotificationModal({ thongBao, phongTros, onClose, onSubmit }: NotificationModalProps) {
  const [formData, setFormData] = useState<ThongBaoHeThongCreateInput>({
    TieuDe: thongBao?.TieuDe || '',
    NoiDung: thongBao?.NoiDung || '',
    LoaiThongBao: thongBao?.LoaiThongBao || 'general',
    DoiTuongNhan: thongBao?.DoiTuongNhan || 'all',
    TrangThai: thongBao?.TrangThai || 'draft',
    ThoiGianHenGio: thongBao?.ThoiGianHenGio || '',
  });

  // --- State chọn phòng giống Bulk Invoice ---
  const [selectedBuilding, setSelectedBuilding] = useState<'all' | string>('all');
  const [phongState, setPhongState] = useState<(PhongTro & { selected: boolean })[]>([]);

  // khởi tạo phongState và pre-select nếu đang sửa
  useEffect(() => {
    const init = phongTros.map((p) => ({
      ...p,
      selected:
        thongBao?.DoiTuongNhan === 'specific' ? (thongBao?.CacPhongNhan || []).includes(p.MaPhong) : false,
    }));
    setPhongState(init);
  }, [phongTros, thongBao?.MaThongBao]);

  const getBuildings = useMemo(() => {
    const set = new Set(phongTros.map((p) => p.TenDay || 'Unknown'));
    return Array.from(set).sort();
  }, [phongTros]);

  const filteredPhongs = useMemo(() => {
    return phongState.filter((p) => (selectedBuilding === 'all' ? true : (p.TenDay || 'Unknown') === selectedBuilding));
  }, [phongState, selectedBuilding]);

  const allFilteredSelected = filteredPhongs.length > 0 && filteredPhongs.every((p) => p.selected);

  const toggleSelectAllFiltered = () => {
    setPhongState((prev) =>
      prev.map((p) =>
        selectedBuilding === 'all' || (p.TenDay || 'Unknown') === selectedBuilding ? { ...p, selected: !allFilteredSelected } : p
      )
    );
  };

  const togglePhong = (maPhong: number) => {
    setPhongState((prev) => prev.map((p) => (p.MaPhong === maPhong ? { ...p, selected: !p.selected } : p)));
  };

  const selectedPhongs = phongState.filter((p) => p.selected);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: ThongBaoHeThongCreateInput = {
      ...formData,
      CacPhongNhan: formData.DoiTuongNhan === 'specific' ? selectedPhongs.map((p) => p.MaPhong) : undefined,
    };

    if (submitData.DoiTuongNhan === 'specific' && (!submitData.CacPhongNhan || submitData.CacPhongNhan.length === 0)) {
      alert('Vui lòng chọn ít nhất một phòng.');
      return;
    }

    onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-[500] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-[1099px] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {thongBao ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Tiêu đề, loại, nội dung + trạng thái/schedule sang bên trái */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
                  <input
                    type="text"
                    required
                    value={formData.TieuDe}
                    onChange={(e) => setFormData({ ...formData, TieuDe: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Nhập tiêu đề thông báo"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại thông báo *</label>
                    <select
                      required
                      value={formData.LoaiThongBao}
                      onChange={(e) => setFormData({ ...formData, LoaiThongBao: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                    >
                      <option value="general">Thông báo chung</option>
                      <option value="urgent">Khẩn cấp</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="payment">Thanh toán</option>
                    </select>
                  </div>

                  {/* Trạng thái chuyển sang cột trái để cân layout */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={formData.TrangThai}
                      onChange={(e) => setFormData({ ...formData, TrangThai: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus-border-transparent text-sm pr-8"
                    >
                      <option value="draft">Lưu bản nháp</option>
                      <option value="sent">Gửi ngay</option>
                      <option value="scheduled">Lên lịch gửi</option>
                    </select>
                  </div>
                </div>

                {formData.TrangThai === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian gửi</label>
                    <input
                      type="datetime-local"
                      value={formData.ThoiGianHenGio}
                      onChange={(e) => setFormData({ ...formData, ThoiGianHenGio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
                  <textarea
                    required
                    rows={6}
                    value={formData.NoiDung}
                    onChange={(e) => setFormData({ ...formData, NoiDung: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="Nhập nội dung thông báo"
                  />
                </div>
              </div>

              {/* Khối chọn đối tượng nhận (giống Bulk Room Selection) */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng nhận *</label>
                  <select
                    required
                    value={formData.DoiTuongNhan}
                    onChange={(e) => setFormData({ ...formData, DoiTuongNhan: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
                  >
                    <option value="all">Tất cả khách thuê</option>
                    <option value="specific">Phòng cụ thể</option>
                  </select>
                </div>

                {formData.DoiTuongNhan === 'specific' && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">Chọn phòng nhận thông báo</h3>
                      <div className="flex gap-2">
                        <select
                          value={selectedBuilding}
                          onChange={(e) => setSelectedBuilding(e.target.value as any)}
                          className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
                        >
                          <option value="all">Tất cả dãy</option>
                          {getBuildings.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={toggleSelectAllFiltered}
                          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                        >
                          {allFilteredSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border rounded-lg overflow-hidden">
                      <div className="overflow-x-auto max-h-72">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left">
                                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAllFiltered} className="text-blue-600" />
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dãy</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {filteredPhongs.map((p) => (
                              <tr key={p.MaPhong} className={`hover:bg-gray-50 ${p.selected ? 'bg-blue-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <input type="checkbox" checked={p.selected} onChange={() => togglePhong(p.MaPhong)} className="text-blue-600" />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.TenDay}</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.TenPhong}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{p.TrangThai}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm">
                        <span className="text-gray-600">Số phòng đã chọn:</span>
                        <span className="font-semibold text-green-700 ml-2">{selectedPhongs.length}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                {thongBao ? 'Cập nhật' : 'Tạo thông báo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
