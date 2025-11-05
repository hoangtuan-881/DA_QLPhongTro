import { useState, type ReactNode } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import ConfirmDialog from '../../components/base/ConfirmDialog';
import ToastContainer from '../../components/base/ToastContainer';
import { useToast } from '../../hooks/useToast';

interface Rule {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'safety' | 'noise' | 'cleanliness' | 'visitors' | 'payment';
  isActive: boolean;
  createdDate: string;
  lastUpdated: string;
}

interface Violation {
  id: string;
  tenantName: string;
  room: string;
  ruleTitle: string;
  description: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  status: 'reported' | 'warned' | 'resolved';
  reportDate: string;
  reportedBy: string;
  resolvedDate?: string;
  notes?: string;
}
type Tenant = { name: string; room: string };

const tenants: Tenant[] = [
  { name: 'Đoàn Phan Khánh Huyền', room: 'A101' },
  { name: 'Lê Trọng Tấn', room: 'A105' },
  { name: 'Phạm Thị Huyền Yến', room: 'A301' },
  { name: 'Hoàng Văn Kim', room: 'A203' },
];

const mockRules: Rule[] = [
  {
    id: '1',
    title: 'Giờ giấc sinh hoạt',
    description: 'Không gây tiếng ồn sau 22:00 và trước 6:00 hàng ngày',
    category: 'noise',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '2',
    title: 'Vệ sinh chung',
    description: 'Giữ gìn vệ sinh khu vực chung, không vứt rác bừa bãi',
    category: 'cleanliness',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-02-15'
  },
  {
    id: '3',
    title: 'Khách thăm',
    description: 'Khách thăm phải đăng ký và không được ở qua đêm',
    category: 'visitors',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '4',
    title: 'An toàn cháy nổ',
    description: 'Sử dụng thiết bị điện tránh chập cháy, gây nổ hoặc hỏa hoạn',
    category: 'safety',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '5',
    title: 'Thanh toán tiền thuê',
    description: 'Thanh toán tiền thuê từ ngày 1 đến ngày 5 hàng tháng',
    category: 'payment',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  }
];

const mockViolations: Violation[] = [
  {
    id: '1',
    tenantName: 'Đoàn Phan Khánh Huyền',
    room: 'A101',
    ruleTitle: 'Giờ giấc sinh hoạt',
    description: 'Mở nhạc to sau 23:00, ảnh hưởng đến phòng bên cạnh',
    severity: 'moderate',
    status: 'warned',
    reportDate: '2024-03-15',
    reportedBy: 'Hồng Diên',
    notes: 'Đã nhắc nhở, khách thuê cam kết không tái phạm'
  },
  {
    id: '2',
    tenantName: 'Lê Trọng Tấn',
    room: 'A105',
    ruleTitle: 'Vệ sinh chung',
    description: 'Vứt rác sai quy định',
    severity: 'minor',
    status: 'resolved',
    reportDate: '2024-03-10',
    reportedBy: 'Quản lý',
    resolvedDate: '2024-03-12'
  },
  {
    id: '3',
    tenantName: 'Phạm Thị Huyền Yến',
    room: 'A301',
    ruleTitle: 'Thanh toán tiền thuê',
    description: 'Chậm thanh toán tiền thuê tháng 3/2024',
    severity: 'serious',
    status: 'resolved',
    reportDate: '2024-03-08',
    reportedBy: 'Quản lý',
    notes: 'Đã quá hạn 3 ngày'
  },
  {
    id: '4',
    tenantName: 'Hoàng Văn Kim',
    room: 'A203',
    ruleTitle: 'An toàn cháy nổ',
    description: 'Bắn pháo trong phòng',
    severity: 'critical',
    status: 'reported',
    reportDate: '2024-03-20',
    reportedBy: 'Quản lý'
  }
];

export default function Rules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'violations'>('rules');
  const [rules, setRules] = useState<Rule[]>(mockRules);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);
  const [violations, setViolations] = useState<Violation[]>(mockViolations);

  // toast & confirm
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

  // ===== Form Add/Edit Rule
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const emptyRuleForm = {
    title: '',
    description: '',
    category: '' as '' | Rule['category'],
    isActive: true
  };
  const [ruleForm, setRuleForm] = useState<typeof emptyRuleForm>(emptyRuleForm);
  const resetRuleForm = () => setRuleForm(emptyRuleForm);

  const emptyViolationForm = {
    tenantName: '',
    room: '',
    ruleTitle: '',
    description: '',
    severity: 'minor' as Violation['severity'],
    reportDate: new Date().toISOString().slice(0, 10),
    reportedBy: '',
  };
  const [violationForm, setViolationForm] = useState<typeof emptyViolationForm>(emptyViolationForm);
  const resetViolationForm = () => setViolationForm(emptyViolationForm);

  // ===== Helpers (chips text/color)
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-gray-100 text-gray-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'noise': return 'bg-purple-100 text-purple-800';
      case 'cleanliness': return 'bg-green-100 text-green-800';
      case 'visitors': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return 'Chung';
      case 'safety': return 'An toàn';
      case 'noise': return 'Tiếng ồn';
      case 'cleanliness': return 'Vệ sinh';
      case 'visitors': return 'Khách thăm';
      case 'payment': return 'Thanh toán';
      default: return category;
    }
  };
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'serious': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'minor': return 'Nhẹ';
      case 'moderate': return 'Vừa';
      case 'serious': return 'Nghiêm trọng';
      case 'critical': return 'Rất nghiêm trọng';
      default: return severity;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-yellow-100 text-yellow-800';
      case 'warned': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'reported': return 'Đã báo cáo';
      case 'warned': return 'Đã cảnh báo';
      case 'resolved': return 'Đã giải quyết';
      case 'escalated': return 'Đã leo thang';
      default: return status;
    }
  };

  // ===== Rule Actions
  const openAddRule = () => { resetRuleForm(); setEditingRule(null); setShowAddRuleModal(true); };

  const openEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleForm({
      title: rule.title,
      description: rule.description,
      category: rule.category,
      isActive: rule.isActive
    });
    setShowAddRuleModal(true);
  };

  const submitAddRule = () => {
    if (!ruleForm.title || !ruleForm.description || !ruleForm.category) {
      error({ title: 'Thiếu thông tin', message: 'Điền đủ Tiêu đề, Mô tả, Danh mục.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Xác nhận thêm nội quy',
      message: <>Thêm nội quy <b>"{ruleForm.title}"</b>?</>,
      type: 'info',
      onConfirm: () => {
        const today = new Date().toISOString().slice(0, 10);
        const created: Rule = {
          id: Date.now().toString(),
          title: ruleForm.title,
          description: ruleForm.description,
          category: ruleForm.category as Rule['category'],
          isActive: ruleForm.isActive,
          createdDate: today,
          lastUpdated: today
        };
        setRules(prev => [created, ...prev]);
        setShowAddRuleModal(false);
        resetRuleForm();
        setConfirmDialog(d => ({ ...d, show: false }));
        success({ title: 'Đã thêm nội quy', message: created.title });
      }
    });
  };

  const submitEditRule = () => {
    if (!editingRule) return;
    if (!ruleForm.title || !ruleForm.description || !ruleForm.category) {
      error({ title: 'Thiếu thông tin', message: 'Điền đủ Tiêu đề, Mô tả, Danh mục.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Cập nhật nội quy',
      message: <>Cập nhật <b>"{editingRule.title}"</b>?</>,
      type: 'info',
      onConfirm: () => {
        const today = new Date().toISOString().slice(0, 10);
        setRules(prev => prev.map(r =>
          r.id === editingRule.id
            ? {
              ...r,
              title: ruleForm.title,
              description: ruleForm.description,
              category: ruleForm.category as Rule['category'],
              isActive: ruleForm.isActive,
              lastUpdated: today
            }
            : r
        ));
        setEditingRule(null);
        resetRuleForm();
        setSelectedRule(null);
        setShowAddRuleModal(false);
        setConfirmDialog(d => ({ ...d, show: false }));
        info({ title: 'Đã cập nhật', message: 'Cập nhật nội quy thành công.' });
      }
    });
  };

  const toggleRuleActive = (rule: Rule) => {
    const next = !rule.isActive;
    setConfirmDialog({
      show: true,
      title: `${next ? 'Kích hoạt' : 'Tạm dừng'} nội quy`,
      message: <>Bạn muốn {next ? 'kích hoạt' : 'tạm dừng'} <b>"{rule.title}"</b>?</>,
      type: 'warning',
      onConfirm: () => {
        const today = new Date().toISOString().slice(0, 10);
        setRules(prev => prev.map(r => r.id === rule.id ? { ...r, isActive: next, lastUpdated: today } : r));
        setConfirmDialog(d => ({ ...d, show: false }));
        setSelectedRule(cur => (cur && cur.id === rule.id ? null : cur));
        success({ title: next ? 'Đã kích hoạt' : 'Đã tạm dừng' });
      }
    });
  };

  const handleDeleteRule = (rule: Rule) => {
    setConfirmDialog({
      show: true,
      title: 'Xóa nội quy',
      message: (
        <span>
          Bạn có chắc muốn xóa nội quy <b>"{rule.title}"</b>? Hành động này không thể hoàn tác.
        </span>
      ),
      type: 'danger',
      onConfirm: () => {
        setRules(prev => prev.filter(r => r.id !== rule.id));
        setConfirmDialog(d => ({ ...d, show: false }));
        error({ title: 'Đã xóa nội quy', message: rule.title });
      }
    });
  };

  const openAddViolation = () => { resetViolationForm(); setShowAddViolationModal(true); };

  const submitAddViolation = () => {
    // kiểm tra tối thiểu
    if (!violationForm.tenantName || !violationForm.room || !violationForm.ruleTitle || !violationForm.description || !violationForm.reportedBy) {
      error({ title: 'Thiếu thông tin', message: 'Điền đủ: Khách thuê, Phòng, Nội quy, Mô tả, Người báo cáo.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Xác nhận báo cáo vi phạm',
      message: <>Tạo báo cáo cho <b>{violationForm.tenantName}</b>?</>,
      type: 'info',
      onConfirm: () => {
        const created: Violation = {
          id: Date.now().toString(),
          tenantName: violationForm.tenantName,
          room: violationForm.room,
          ruleTitle: violationForm.ruleTitle,
          description: violationForm.description,
          severity: violationForm.severity,
          status: 'reported',
          reportDate: violationForm.reportDate,
          reportedBy: violationForm.reportedBy,
        };
        setViolations(prev => [created, ...prev]);
        setShowAddViolationModal(false);
        resetViolationForm();
        setConfirmDialog(d => ({ ...d, show: false }));
        success({ title: 'Đã tạo báo cáo', message: created.ruleTitle });
      }
    });
  };

  const updateViolation = (id: string, patch: Partial<Violation>) => {
    setViolations(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
    // nếu đang mở modal chi tiết, sync lại
    setSelectedViolation(prev => prev && prev.id === id ? { ...prev, ...patch } : prev);
  };

  // ——— Cảnh báo
  const handleWarn = (v: Violation) => {
    if (v.status !== 'reported') {
      info({ title: 'Không thể cảnh báo', message: 'Chỉ cảnh báo khi trạng thái là Chờ xử lý.' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Gửi cảnh báo',
      message: <>Gửi cảnh báo cho <b>{v.tenantName}</b>?</>,
      type: 'warning',
      onConfirm: () => {
        updateViolation(v.id, { status: 'warned' });
        setConfirmDialog(d => ({ ...d, show: false }));
        success({ title: 'Đã cảnh báo' });
      }
    });
  };

  // ——— Đánh dấu đã giải quyết
  const handleResolve = (v: Violation) => {
    if (v.status === 'resolved') {
      info({ title: 'Đã ở trạng thái giải quyết' });
      return;
    }
    setConfirmDialog({
      show: true,
      title: 'Đánh dấu đã giải quyết',
      message: <>Đánh dấu vi phạm của <b>{v.tenantName}</b> là đã giải quyết?</>,
      type: 'info',
      onConfirm: () => {
        updateViolation(v.id, { status: 'resolved', resolvedDate: new Date().toISOString().slice(0, 10) });
        setConfirmDialog(d => ({ ...d, show: false }));
        success({ title: 'Đã giải quyết' });
      }
    });
  };

  // ——— Xoá vi phạm
  const handleDeleteViolation = (v: Violation) => {
    setConfirmDialog({
      show: true,
      title: 'Xoá vi phạm',
      message: <>Xoá vi phạm của <b>{v.tenantName}</b>? Hành động không thể hoàn tác.</>,
      type: 'danger',
      onConfirm: () => {
        setViolations(prev => prev.filter(x => x.id !== v.id));
        setSelectedViolation(prev => (prev && prev.id === v.id ? null : prev));
        setConfirmDialog(d => ({ ...d, show: false }));
        error({ title: 'Đã xoá vi phạm' });
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
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <i className="ri-file-list-3-line text-blue-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Tổng nội quy</p>
                        <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <i className="ri-check-line text-green-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Đang áp dụng</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {rules.filter(r => r.isActive).length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <i className="ri-error-warning-line text-red-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Vi phạm tháng này</p>
                        <p className="text-2xl font-bold text-gray-900">{violations.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rules List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nội quy
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Danh mục
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cập nhật lần cuối
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rules.map((rule) => (
                          <tr key={rule.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{rule.title}</div>
                                <div className="text-sm text-gray-500 mt-1">{rule.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(rule.category)}`}>
                                {getCategoryText(rule.category)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                {rule.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(rule.lastUpdated).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Chi tiết */}
                                <button
                                  onClick={() => setSelectedRule(rule)}
                                  className="p-2 rounded-md text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 cursor-pointer"
                                  title="Chi tiết nội quy"
                                  aria-label="Chi tiết nội quy"
                                >
                                  <i className="ri-eye-line text-lg"></i>
                                  <span className="sr-only">Chi tiết</span>
                                </button>
                                {/* Sửa */}
                                <button
                                  onClick={() => openEditRule(rule)}
                                  className="p-2 rounded-md text-green-600 hover:text-green-900 hover:bg-green-50 cursor-pointer"
                                  title="Sửa nội quy"
                                  aria-label="Sửa nội quy"
                                >
                                  <i className="ri-edit-line text-lg"></i>
                                  <span className="sr-only">Sửa</span>
                                </button>
                                {/* Bật/Tắt */}
                                <button
                                  onClick={() => toggleRuleActive(rule)}
                                  className={`p-2 rounded-md hover:bg-gray-50 cursor-pointer ${rule.isActive ? 'text-yellow-600 hover:text-yellow-700' : 'text-teal-600 hover:text-teal-700'}`}
                                  title={rule.isActive ? 'Tạm dừng nội quy' : 'Kích hoạt nội quy'}
                                  aria-label="Toggle"
                                >
                                  <i className={rule.isActive ? 'ri-pause-line text-lg' : 'ri-play-line text-lg'}></i>
                                  <span className="sr-only">Toggle</span>
                                </button>
                                {/* Xóa */}
                                <button
                                  onClick={() => handleDeleteRule(rule)}
                                  className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer"
                                  title="Xóa nội quy"
                                  aria-label="Xóa nội quy"
                                >
                                  <i className="ri-delete-bin-line text-lg"></i>
                                  <span className="sr-only">Xóa</span>
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'violations' && (
              <>
                {/* Violations Stats */}
                {/* Violations Stats – giãn cách giống Rules Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <i className="ri-error-warning-line text-yellow-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {violations.filter(v => v.status === 'reported').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <i className="ri-notification-line text-blue-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Đã cảnh báo</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {violations.filter(v => v.status === 'warned').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <i className="ri-check-line text-green-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {violations.filter(v => v.status === 'resolved').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Violations Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vi phạm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Khách thuê
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mức độ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày báo cáo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thao tác
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {violations.map((violation) => (
                          <tr key={violation.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{violation.ruleTitle}</div>
                                <div className="text-sm text-gray-500 mt-1">{violation.description}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{violation.tenantName}</div>
                                <div className="text-sm text-gray-500">{violation.room}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                                {getSeverityText(violation.severity)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                                {getStatusText(violation.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(violation.reportDate).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="text-sm text-gray-500">
                                Bởi: {violation.reportedBy}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {/* Chi tiết */}
                                <button
                                  onClick={() => setSelectedViolation(violation)}
                                  className="p-2 rounded-md text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 cursor-pointer"
                                  title="Chi tiết vi phạm"
                                  aria-label="Chi tiết vi phạm"
                                >
                                  <i className="ri-eye-line text-lg"></i>
                                  <span className="sr-only">Chi tiết</span>
                                </button>

                                {/* Cảnh báo (khi reported) */}
                                {violation.status === 'reported' && (
                                  <button
                                    onClick={() => handleWarn(violation)}
                                    className="p-2 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 cursor-pointer"
                                    title="Cảnh báo"
                                    aria-label="Cảnh báo"
                                  >
                                    <i className="ri-notification-3-line text-lg"></i>
                                    <span className="sr-only">Cảnh báo</span>
                                  </button>
                                )}

                                {/* Đánh dấu đã giải quyết (khi warned hoặc reported) */}
                                {(violation.status === 'warned' || violation.status === 'reported') && (
                                  <button
                                    onClick={() => handleResolve(violation)}
                                    className="p-2 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50 cursor-pointer"
                                    title="Đánh dấu đã giải quyết"
                                    aria-label="Giải quyết"
                                  >
                                    <i className="ri-check-double-line text-lg"></i>
                                    <span className="sr-only">Giải quyết</span>
                                  </button>
                                )}

                                {/* Xoá */}
                                <button
                                  onClick={() => handleDeleteViolation(violation)}
                                  className="p-2 rounded-md text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer"
                                  title="Xoá"
                                  aria-label="Xoá"
                                >
                                  <i className="ri-delete-bin-6-line text-lg"></i>
                                  <span className="sr-only">Xoá</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Rule Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedRule(null)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Chi tiết nội quy</h2>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-gray-600">Tiêu đề:</span>
                  <span className="font-medium ml-2">{selectedRule.title}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mô tả:</span>
                  <p className="mt-1 text-gray-900">{selectedRule.description}</p>
                </div>
                <div>
                  <span className="text-gray-600">Danh mục:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedRule.category)}`}>
                    {getCategoryText(selectedRule.category)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${selectedRule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedRule.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium ml-2">{new Date(selectedRule.createdDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cập nhật lần cuối:</span>
                    <span className="font-medium ml-2">{new Date(selectedRule.lastUpdated).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  onClick={() => openEditRule(selectedRule)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => toggleRuleActive(selectedRule)}
                  className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${selectedRule.isActive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}>
                  {selectedRule.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <span className="font-medium ml-2">{selectedViolation.tenantName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phòng:</span>
                    <span className="font-medium ml-2">{selectedViolation.room}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Nội quy vi phạm:</span>
                  <span className="font-medium ml-2">{selectedViolation.ruleTitle}</span>
                </div>
                <div>
                  <span className="text-gray-600">Mô tả vi phạm:</span>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedViolation.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Mức độ:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedViolation.severity)}`}>
                      {getSeverityText(selectedViolation.severity)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedViolation.status)}`}>
                      {getStatusText(selectedViolation.status)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Ngày báo cáo:</span>
                    <span className="font-medium ml-2">{new Date(selectedViolation.reportDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Người báo cáo:</span>
                    <span className="font-medium ml-2">{selectedViolation.reportedBy}</span>
                  </div>
                </div>
                {selectedViolation.notes && (
                  <div>
                    <span className="text-gray-600">Ghi chú:</span>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedViolation.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                {selectedViolation.status === 'reported' && (
                  <>
                    <button
                      onClick={() => handleWarn(selectedViolation)}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 cursor-pointer whitespace-nowrap">
                      Cảnh báo
                    </button>
                  </>
                )}

                {selectedViolation.status === 'warned' && (
                  <button
                    onClick={() => handleResolve(selectedViolation)}
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

      {/* Add/Edit Rule Modal (dùng chung) */}
      {(showAddRuleModal) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => { setShowAddRuleModal(false); setEditingRule(null); }}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingRule ? 'Chỉnh sửa nội quy' : 'Thêm nội quy mới'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <input
                    type="text"
                    value={ruleForm.title}
                    onChange={e => setRuleForm({ ...ruleForm, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Tiêu đề nội quy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                  <textarea
                    value={ruleForm.description}
                    onChange={e => setRuleForm({ ...ruleForm, description: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Mô tả chi tiết nội quy..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục *</label>
                  <select
                    value={ruleForm.category}
                    onChange={e => setRuleForm({ ...ruleForm, category: e.target.value as Rule['category'] })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="general">Chung</option>
                    <option value="safety">An toàn</option>
                    <option value="noise">Tiếng ồn</option>
                    <option value="cleanliness">Vệ sinh</option>
                    <option value="visitors">Khách thăm</option>
                    <option value="payment">Thanh toán</option>
                  </select>
                </div>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={ruleForm.isActive}
                    onChange={e => setRuleForm({ ...ruleForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Đang áp dụng</span>
                </label>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowAddRuleModal(false); setEditingRule(null); resetRuleForm(); }}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  {editingRule ? (
                    <button
                      type="button"
                      onClick={submitEditRule}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                    >
                      Cập nhật
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitAddRule}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                    >
                      Thêm nội quy
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Violation Modal (giữ nguyên – mock) */}
      {showAddViolationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddViolationModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo vi phạm</h2>

              <form className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitAddViolation();
                }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê</label>
                    <select
                      value={violationForm.tenantName}
                      onChange={e => {
                        const name = e.target.value;
                        const t = tenants.find(x => x.name === name);
                        setViolationForm(v => ({
                          ...v,
                          tenantName: name,
                          room: t?.room ?? '',  // <-- tự điền phòng theo tên
                        }));
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8"
                    >
                      <option value="">Chọn khách thuê</option>
                      {tenants.map(t => (
                        <option key={t.name} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phòng
                      </label>
                      <input
                        type="text"
                        value={violationForm.room}
                        readOnly
                        className="w-full border border-gray-200 bg-gray-50 text-gray-700 rounded-lg px-3 py-2"
                        placeholder="Chưa chọn khách thuê"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy vi phạm</label>
                    <select
                      value={violationForm.ruleTitle}
                      onChange={e => setViolationForm(v => ({ ...v, ruleTitle: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="">Chọn nội quy</option>
                      {rules.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ nghiêm trọng</label>
                    <select
                      value={violationForm.severity}
                      onChange={e => setViolationForm(v => ({ ...v, severity: e.target.value as Violation['severity'] }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="minor">Nhẹ</option>
                      <option value="moderate">Vừa</option>
                      <option value="serious">Nghiêm trọng</option>
                      <option value="critical">Rất nghiêm trọng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vi phạm</label>
                    <input
                      type="date"
                      value={violationForm.reportDate}
                      onChange={e => setViolationForm(v => ({ ...v, reportDate: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả vi phạm</label>
                  <textarea
                    value={violationForm.description}
                    onChange={e => setViolationForm(v => ({ ...v, description: e.target.value }))}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Mô tả chi tiết hành vi vi phạm..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người báo cáo</label>
                  <input
                    type="text"
                    value={violationForm.reportedBy}
                    onChange={e => setViolationForm(v => ({ ...v, reportedBy: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Tên người báo cáo"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddViolationModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Báo cáo vi phạm
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Global dialogs/toasts */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(d => ({ ...d, show: false }))}
      />
      <ToastContainer />
    </div>
  );
}
