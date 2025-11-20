import { useState, type ReactNode, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import ToastContainer from '../../components/base/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import noiQuyService, { type NoiQuy } from '../../services/noi-quy.service';
import viPhamService, { type ViPham, type ViPhamCreate, type ViPhamUpdate } from '../../services/vi-pham.service';
import khachThueService, { type KhachThueListItem } from '../../services/khach-thue.service';
import { getErrorMessage } from '../../lib/http-client';

export default function Rules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'violations'>('rules');
  const { user } = useAuth();

  // NoiQuy state
  const [noiQuys, setNoiQuys] = useState<NoiQuy[]>([]);
  const [loadingNoiQuys, setLoadingNoiQuys] = useState(true);
  const [noiQuyRefreshKey, setNoiQuyRefreshKey] = useState(0);
  const [selectedNoiQuy, setSelectedNoiQuy] = useState<NoiQuy | null>(null);

  // ViPham state
  const [violations, setViolations] = useState<ViPham[]>([]);
  const [loadingViolations, setLoadingViolations] = useState(false);
  const [violationRefreshKey, setViolationRefreshKey] = useState(0);
  const [selectedViolation, setSelectedViolation] = useState<ViPham | null>(null);

  // Tenant state for form
  const [allTenants, setAllTenants] = useState<KhachThueListItem[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);


  const { success, error, warning, info } = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string | ReactNode;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => { }
  });

  // ===== Data Fetching
  useEffect(() => {
    const controller = new AbortController();
    const fetchNoiQuy = async () => {
      setLoadingNoiQuys(true);
      try {
        const response = await noiQuyService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setNoiQuys(response.data.data || []);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải dữ liệu Nội quy', message: getErrorMessage(err) });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingNoiQuys(false);
        }
      }
    };

    fetchNoiQuy();
    return () => controller.abort();
  }, [noiQuyRefreshKey, error]);

  useEffect(() => {
    if (activeTab !== 'violations') return;

    const controller = new AbortController();
    const fetchViPham = async () => {
      setLoadingViolations(true);
      try {
        const response = await viPhamService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          setViolations(response.data.data || []);
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          error({ title: 'Lỗi tải dữ liệu Vi phạm', message: getErrorMessage(err) });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingViolations(false);
        }
      }
    };

    fetchViPham();
    return () => controller.abort();
  }, [activeTab, violationRefreshKey, error]);


  const refreshNoiQuyData = () => setNoiQuyRefreshKey(prev => prev + 1);
  const refreshViPhamData = () => setViolationRefreshKey(prev => prev + 1);


  // ===== Form Add/Edit Rule
  const [editingNoiQuy, setEditingNoiQuy] = useState<NoiQuy | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const emptyNoiQuyForm = {
    TieuDe: '',
    NoiDung: '',
    PhanLoai: '' as '' | NoiQuy['PhanLoai'],
    TrangThai: true
  };
  const [noiQuyForm, setNoiQuyForm] = useState<Omit<NoiQuy, 'MaNoiQuy'>>(emptyNoiQuyForm);
  const resetNoiQuyForm = () => setNoiQuyForm(emptyNoiQuyForm);

  // ===== Form Add Violation
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [isSubmittingViolation, setIsSubmittingViolation] = useState(false);
  const emptyViolationForm: ViPhamCreate = {
    MaKhachThue: 0,
    MaNoiQuy: 0,
    MoTa: '',
    MucDo: 'nhe',
    NgayBaoCao: new Date().toISOString().split('T')[0],
    GhiChu: '',
  };
  const [violationForm, setViolationForm] = useState<ViPhamCreate>(emptyViolationForm);
  const resetViolationForm = () => {
    setViolationForm(emptyViolationForm);
  };

  // Fetch tenants when "Add Violation" modal is opened
  useEffect(() => {
    if (!showAddViolationModal || allTenants.length > 0) return;

    const controller = new AbortController();
    const fetchTenants = async () => {
      setLoadingTenants(true);
      try {
        const response = await khachThueService.getAll(controller.signal);
        if (!controller.signal.aborted) {
          const tenantsWithRooms = response.data.data.filter(t => t.MaPhong);
          setAllTenants(tenantsWithRooms);
        }
      } catch (err) {
        error({ title: 'Lỗi tải danh sách khách thuê', message: getErrorMessage(err) });
      } finally {
        if (!controller.signal.aborted) {
          setLoadingTenants(false);
        }
      }
    };

    fetchTenants();
    return () => controller.abort();
  }, [showAddViolationModal, allTenants.length, error]);


  // ===== Helpers (chips text/color)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chung': return 'bg-gray-100 text-gray-800';
      case 'an_toan': return 'bg-red-100 text-red-800';
      case 'tieng_on': return 'bg-purple-100 text-purple-800';
      case 've_sinh': return 'bg-green-100 text-green-800';
      case 'khach_tham': return 'bg-blue-100 text-blue-800';
      case 'thanh_toan': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'chung': return 'Chung';
      case 'an_toan': return 'An toàn';
      case 'tieng_on': return 'Tiếng ồn';
      case 've_sinh': return 'Vệ sinh';
      case 'khach_tham': return 'Khách thăm';
      case 'thanh_toan': return 'Thanh toán';
      default: return category;
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'nhe': return 'bg-green-100 text-green-800';
      case 'vua': return 'bg-yellow-100 text-yellow-800';
      case 'nghiem_trong': return 'bg-orange-100 text-orange-800';
      case 'rat_nghiem_trong': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'nhe': return 'Nhẹ';
      case 'vua': return 'Vừa';
      case 'nghiem_trong': return 'Nghiêm trọng';
      case 'rat_nghiem_trong': return 'Rất nghiêm trọng';
      default: return severity;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'da_bao_cao': return 'bg-yellow-100 text-yellow-800';
      case 'da_canh_cao': return 'bg-blue-100 text-blue-800';
      case 'da_giai_quyet': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'da_bao_cao': return 'Đã báo cáo';
      case 'da_canh_cao': return 'Đã cảnh báo';
      case 'da_giai_quyet': return 'Đã giải quyết';
      default: return status;
    }
  };

  // ===== Rule Actions
  const openAddRule = () => { resetNoiQuyForm(); setEditingNoiQuy(null); setShowAddRuleModal(true); };

  const openEditRule = (noiQuy: NoiQuy) => {
    setEditingNoiQuy(noiQuy);
    setNoiQuyForm({
      TieuDe: noiQuy.TieuDe,
      NoiDung: noiQuy.NoiDung,
      PhanLoai: noiQuy.PhanLoai,
      TrangThai: noiQuy.TrangThai
    });
    setShowAddRuleModal(true);
    setSelectedNoiQuy(null); // Close detail modal
  };

  const handleRuleFormSubmit = async () => {
    if (!noiQuyForm.TieuDe || !noiQuyForm.NoiDung || !noiQuyForm.PhanLoai) {
      error({ title: 'Thiếu thông tin', message: 'Điền đủ Tiêu đề, Mô tả, Danh mục.' });
      return;
    }

    try {
      if (editingNoiQuy) {
        await noiQuyService.update(editingNoiQuy.MaNoiQuy, noiQuyForm);
        success({ title: 'Thành công', message: 'Cập nhật nội quy thành công.' });
      } else {
        await noiQuyService.create(noiQuyForm);
        success({ title: 'Thành công', message: 'Thêm mới nội quy thành công.' });
      }
      setShowAddRuleModal(false);
      setEditingNoiQuy(null);
      resetNoiQuyForm();
      refreshNoiQuyData();
    } catch (err) {
      error({ title: 'Đã có lỗi xảy ra', message: getErrorMessage(err) });
    }
  };


  const toggleRuleActive = async (noiQuy: NoiQuy) => {
    const newStatus = !noiQuy.TrangThai;
    setConfirmDialog({
      show: true,
      title: `${newStatus ? 'Kích hoạt' : 'Tạm dừng'} nội quy`,
      message: <>Bạn muốn {newStatus ? 'kích hoạt' : 'tạm dừng'} <b>"{noiQuy.TieuDe}"</b>?</>,
      type: 'warning',
      onConfirm: async () => {
        try {
          await noiQuyService.update(noiQuy.MaNoiQuy, { TrangThai: newStatus });
          success({ title: 'Thành công', message: `Đã ${newStatus ? 'kích hoạt' : 'tạm dừng'} nội quy.` });
          refreshNoiQuyData();
          setSelectedNoiQuy(null); // Close detail modal if open
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
        } finally {
          setConfirmDialog(d => ({ ...d, show: false }));
        }
      }
    });
  };

  const handleDeleteRule = (noiQuy: NoiQuy) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa nội quy',
      message: (
        <span>
          Bạn có chắc muốn xóa nội quy <b>"{noiQuy.TieuDe}"</b>? Hành động này không thể hoàn tác.
        </span>
      ),
      type: 'danger',
      onConfirm: async () => {
        try {
          await noiQuyService.delete(noiQuy.MaNoiQuy);
          success({ title: 'Thành công', message: 'Đã xóa nội quy.' });
          refreshNoiQuyData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
        } finally {
          setConfirmDialog(d => ({ ...d, show: false }));
        }
      }
    });
  };

  // ===== Violation Actions
  const openAddViolation = () => {
    resetViolationForm();
    setShowAddViolationModal(true);
  };

  const handleViolationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (violationForm.MaKhachThue === 0 || violationForm.MaNoiQuy === 0 || !violationForm.MoTa) {
      error({ title: 'Thiếu thông tin', message: 'Vui lòng điền đầy đủ các trường bắt buộc.' });
      return;
    }

    setIsSubmittingViolation(true);
    try {
      await viPhamService.create(violationForm);
      success({ title: 'Thành công', message: 'Đã báo cáo vi phạm.' });
      setShowAddViolationModal(false);
      refreshViPhamData();
    } catch (err) {
      error({ title: 'Lỗi', message: getErrorMessage(err) });
    } finally {
      setIsSubmittingViolation(false);
    }
  };


  const handleUpdateViolationStatus = async (violation: ViPham, newStatus: ViPham['TrangThai']) => {
    const statusText = getStatusText(newStatus);
    setConfirmDialog({
        show: true,
        title: `Xác nhận ${statusText}`,
        message: <>Chuyển trạng thái vi phạm của <b>{violation.khachThue.HoTen}</b> thành "{statusText}"?</>,
        type: 'warning',
        onConfirm: async () => {
            try {
                const payload: ViPhamUpdate = { TrangThai: newStatus };
                if (newStatus === 'da_giai_quyet') {
                    payload.NgayGiaiQuyet = new Date().toISOString().split('T')[0];
                }
                await viPhamService.update(violation.MaViPham, payload);
                success({ title: 'Thành công', message: 'Cập nhật trạng thái vi phạm thành công.' });
                refreshViPhamData();
                setSelectedViolation(null); // Close the detail modal
            } catch (err) {
                error({ title: 'Lỗi', message: getErrorMessage(err) });
            } finally {
                setConfirmDialog(d => ({ ...d, show: false }));
            }
        }
    });
};


  const handleDeleteViolation = (violation: ViPham) => {
    setConfirmDialog({
      show: true,
      title: 'Xoá vi phạm',
      message: <>Xoá vi phạm của <b>{violation.khachThue.HoTen}</b>? Hành động không thể hoàn tác.</>,
      type: 'danger',
      onConfirm: async () => {
        try {
          await viPhamService.delete(violation.MaViPham);
          success({ title: 'Thành công', message: 'Đã xóa vi phạm.' });
          refreshViPhamData();
        } catch (err) {
          error({ title: 'Lỗi', message: getErrorMessage(err) });
        } finally {
          setConfirmDialog(d => ({ ...d, show: false }));
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
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý nội quy</h1>
                <p className="text-gray-600">Quản lý nội quy và vi phạm</p>
              </div>
              <button
                onClick={() => activeTab === 'rules' ? openAddRule() : openAddViolation()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center whitespace-nowrap cursor-pointer"
              >
                <i className="ri-add-line mr-2"></i>
                {activeTab === 'rules' ? 'Thêm nội quy' : 'Báo cáo vi phạm'}
              </button>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('rules')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'rules'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      } cursor-pointer`}
                  >
                    Nội quy
                  </button>
                  <button
                    onClick={() => setActiveTab('violations')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === 'violations'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                      } cursor-pointer`}
                  >
                    Vi phạm
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === 'rules' && (
              <>
                {/* Rules Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg"><i className="ri-file-list-3-line text-blue-600 text-xl"></i></div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng nội quy</p>
                        <p className="text-2xl font-bold text-gray-900">{noiQuys.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg"><i className="ri-check-line text-green-600 text-xl"></i></div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Đang áp dụng</p>
                        <p className="text-2xl font-bold text-gray-900">{noiQuys.filter(r => r.TrangThai).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg"><i className="ri-error-warning-line text-red-600 text-xl"></i></div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Vi phạm tháng này</p>
                        <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {loadingNoiQuys ? (
                    <div className="p-6 text-center">Đang tải...</div>
                  ) : noiQuys.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Chưa có nội quy nào.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội quy</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {noiQuys.map((noiQuy) => (
                            <tr key={noiQuy.MaNoiQuy} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{noiQuy.TieuDe}</div>
                                  <div className="text-sm text-gray-500 mt-1">{noiQuy.NoiDung}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(noiQuy.PhanLoai)}`}>{getCategoryText(noiQuy.PhanLoai)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${noiQuy.TrangThai ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{noiQuy.TrangThai ? 'Đang áp dụng' : 'Tạm dừng'}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button onClick={() => setSelectedNoiQuy(noiQuy)} className="p-2 rounded-md text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 cursor-pointer" title="Chi tiết nội quy"><i className="ri-eye-line text-lg"></i></button>
                                  <button onClick={() => openEditRule(noiQuy)} className="p-2 rounded-md text-green-600 hover:text-green-900 hover:bg-green-50 cursor-pointer" title="Sửa nội quy"><i className="ri-edit-line text-lg"></i></button>
                                  <button onClick={() => toggleRuleActive(noiQuy)} className={`p-2 rounded-md hover:bg-gray-50 cursor-pointer ${noiQuy.TrangThai ? 'text-yellow-600 hover:text-yellow-700' : 'text-teal-600 hover:text-teal-700'}`} title={noiQuy.TrangThai ? 'Tạm dừng nội quy' : 'Kích hoạt nội quy'}><i className={noiQuy.TrangThai ? 'ri-pause-line text-lg' : 'ri-play-line text-lg'}></i></button>
                                  <button onClick={() => handleDeleteRule(noiQuy)} className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer" title="Xóa nội quy"><i className="ri-delete-bin-line text-lg"></i></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'violations' && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {loadingViolations ? (
                  <div className="p-6 text-center">Đang tải...</div>
                ) : violations.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">Chưa có vi phạm nào.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vi phạm</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách thuê</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày báo cáo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {violations.map((violation) => (
                          <tr key={violation.MaViPham} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{violation.noiQuy.TieuDe}</div>
                                <div className="text-sm text-gray-500 mt-1">{violation.MoTa}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{violation.khachThue.HoTen}</div>
                                <div className="text-sm text-gray-500">{violation.khachThue.phongTro?.dayTro?.TenDay} - {violation.khachThue.phongTro?.TenPhong}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.MucDo)}`}>{getSeverityText(violation.MucDo)}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.TrangThai)}`}>{getStatusText(violation.TrangThai)}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{violation.NgayBaoCao}</div>
                              <div className="text-sm text-gray-500">Bởi: {violation.nguoiBaoCao?.HoTen}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button onClick={() => setSelectedViolation(violation)} className="p-2 rounded-md text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 cursor-pointer" title="Chi tiết vi phạm"><i className="ri-eye-line text-lg"></i></button>
                                {violation.TrangThai === 'da_bao_cao' && (<button onClick={() => handleUpdateViolationStatus(violation, 'da_canh_cao')} className="p-2 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer" title="Cảnh báo"><i className="ri-notification-3-line text-lg"></i></button>)}
                                {(violation.TrangThai === 'da_bao_cao' || violation.TrangThai === 'da_canh_cao') && (<button onClick={() => handleUpdateViolationStatus(violation, 'da_giai_quyet')} className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50 cursor-pointer" title="Đánh dấu đã giải quyết"><i className="ri-check-double-line text-lg"></i></button>)}
                                <button onClick={() => handleDeleteViolation(violation)} className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer" title="Xoá"><i className="ri-delete-bin-6-line text-lg"></i></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Violation Detail Modal */}
      {selectedViolation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedViolation(null)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết vi phạm</h2>
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Khách thuê:</span>
                    <span className="font-medium ml-2">{selectedViolation.khachThue.HoTen}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dãy:</span>
                    <span className="font-medium ml-2">{selectedViolation.khachThue.phongTro?.dayTro?.TenDay}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{selectedViolation.khachThue.phongTro?.TenPhong}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Nội quy vi phạm:</span>
                  <span className="font-medium ml-2">{selectedViolation.noiQuy.TieuDe}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mô tả vi phạm:</span>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedViolation.MoTa}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Mức độ:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedViolation.MucDo)}`}>
                      {getSeverityText(selectedViolation.MucDo)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedViolation.TrangThai)}`}>
                      {getStatusText(selectedViolation.TrangThai)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Ngày báo cáo:</span>
                    <span className="font-medium ml-2">{new Date(selectedViolation.NgayBaoCao).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Người báo cáo:</span>
                    <span className="font-medium ml-2">{selectedViolation.nguoiBaoCao?.HoTen}</span>
                  </div>
                </div>
                {selectedViolation.GhiChu && (
                  <div>
                    <span className="text-gray-600">Ghi chú:</span>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedViolation.GhiChu}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedViolation.TrangThai === 'da_bao_cao' && (
                  <>
                    <button
                      onClick={() => handleUpdateViolationStatus(selectedViolation, 'da_canh_cao')}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 cursor-pointer whitespace-nowrap">
                      Cảnh báo
                    </button>
                  </>
                )}

                {selectedViolation.TrangThai === 'da_canh_cao' && (
                  <button
                    onClick={() => handleUpdateViolationStatus(selectedViolation, 'da_giai_quyet')}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap">
                    Đánh dấu đã giải quyết
                  </button>
                )}

                <button
                  onClick={() => handleDeleteViolation(selectedViolation)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap">
                  Xoá
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals and Toasts */}
      {selectedNoiQuy && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedNoiQuy(null)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-gray-900">Chi tiết nội quy</h2><button onClick={() => setSelectedNoiQuy(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><i className="ri-close-line text-xl"></i></button></div>
              <div className="space-y-4">
                <div><span className="text-gray-600">Tiêu đề:</span><span className="font-medium ml-2">{selectedNoiQuy.TieuDe}</span></div>
                <div><span className="text-gray-600">Mô tả:</span><p className="mt-1 text-gray-900">{selectedNoiQuy.NoiDung}</p></div>
                <div><span className="text-gray-600">Danh mục:</span><span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedNoiQuy.PhanLoai)}`}>{getCategoryText(selectedNoiQuy.PhanLoai)}</span></div>
                <div><span className="text-gray-600">Trạng thái:</span><span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedNoiQuy.TrangThai ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedNoiQuy.TrangThai ? 'Đang áp dụng' : 'Tạm dừng'}</span></div>
              </div>
              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button onClick={() => openEditRule(selectedNoiQuy)} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">Chỉnh sửa</button>
                <button onClick={() => toggleRuleActive(selectedNoiQuy)} className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${selectedNoiQuy.TrangThai ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>{selectedNoiQuy.TrangThai ? 'Tạm dừng' : 'Kích hoạt'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(showAddRuleModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => { setShowAddRuleModal(false); setEditingNoiQuy(null); }}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{editingNoiQuy ? 'Chỉnh sửa nội quy' : 'Thêm nội quy mới'}</h2>
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label><input type="text" value={noiQuyForm.TieuDe} onChange={e => setNoiQuyForm({ ...noiQuyForm, TieuDe: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tiêu đề nội quy" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label><textarea value={noiQuyForm.NoiDung} onChange={e => setNoiQuyForm({ ...noiQuyForm, NoiDung: e.target.value })} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Mô tả chi tiết nội quy..."></textarea></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label><select value={noiQuyForm.PhanLoai} onChange={e => setNoiQuyForm({ ...noiQuyForm, PhanLoai: e.target.value as NoiQuy['PhanLoai'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"><option value="">Chọn danh mục</option><option value="chung">Chung</option><option value="an_toan">An toàn</option><option value="tieng_on">Tiếng ồn</option><option value="ve_sinh">Vệ sinh</option><option value="khach_tham">Khách thăm</option><option value="thanh_toan">Thanh toán</option></select></div>
                <label className="inline-flex items-center"><input type="checkbox" checked={noiQuyForm.TrangThai} onChange={e => setNoiQuyForm({ ...noiQuyForm, TrangThai: e.target.checked })} className="mr-2" /><span className="text-sm text-gray-700">Đang áp dụng</span></label>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => { setShowAddRuleModal(false); setEditingNoiQuy(null); resetNoiQuyForm(); }} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                  <button type="button" onClick={handleRuleFormSubmit} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">{editingNoiQuy ? 'Cập nhật' : 'Thêm nội quy'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddViolationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddViolationModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo vi phạm</h2>
              {loadingTenants ? <div className="text-center p-8">Đang tải danh sách khách thuê...</div> : (
                <form className="space-y-4" onSubmit={handleViolationSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê vi phạm *</label>
                      <select
                        value={violationForm.MaKhachThue}
                        onChange={e => setViolationForm(v => ({ ...v, MaKhachThue: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                      >
                        <option value={0}>Chọn khách thuê</option>
                        {allTenants.map(t => (
                          <option key={t.MaKhachThue} value={t.MaKhachThue}>
                            {t.HoTen} ({t.TenPhong})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy vi phạm *</label>
                      <select
                        value={violationForm.MaNoiQuy}
                        onChange={e => setViolationForm(v => ({ ...v, MaNoiQuy: Number(e.target.value) }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                        <option value={0}>Chọn nội quy</option>
                        {noiQuys.map(r => <option key={r.MaNoiQuy} value={r.MaNoiQuy}>{r.TieuDe}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ *</label>
                      <select
                        value={violationForm.MucDo}
                        onChange={e => setViolationForm(v => ({ ...v, MucDo: e.target.value as ViPhamCreate['MucDo'] }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                        <option value="nhe">Nhẹ</option>
                        <option value="vua">Vừa</option>
                        <option value="nghiem_trong">Nghiêm trọng</option>
                        <option value="rat_nghiem_trong">Rất nghiêm trọng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vi phạm *</label>
                      <input
                        type="date"
                        value={violationForm.NgayBaoCao}
                        onChange={e => setViolationForm(v => ({ ...v, NgayBaoCao: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả vi phạm *</label>
                    <textarea
                      value={violationForm.MoTa}
                      onChange={e => setViolationForm(v => ({ ...v, MoTa: e.target.value }))}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Mô tả chi tiết hành vi vi phạm..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowAddViolationModal(false)} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap">Hủy</button>
                    <button type="submit" disabled={isSubmittingViolation} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap disabled:opacity-50">{isSubmittingViolation ? 'Đang gửi...' : 'Báo cáo vi phạm'}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={confirmDialog.show} title={confirmDialog.title} message={confirmDialog.message} type={confirmDialog.type} onConfirm={confirmDialog.onConfirm} onClose={() => setConfirmDialog(d => ({ ...d, show: false }))} />
      <ToastContainer />
    </div>
  );
}
