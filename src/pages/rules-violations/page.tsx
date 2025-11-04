
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../dashboard/components/Sidebar';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

interface Rule {
  id: number;
  title: string;
  content: string;
  category: string;
  isActive: boolean;
  createdAt: string;
}

interface Violation {
  id: number;
  tenantName: string;
  roomNumber: string;
  ruleTitle: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'escalated';
  reportedAt: string;
  resolvedAt?: string;
  fine?: number;
}

export default function RulesViolations() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'violations'>('rules');
  const { success, error, warning } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  // FIX: Khởi tạo dữ liệu giả lập cho nội quy và vi phạm để tránh lỗi "rules is not defined"
  const [rules, setRules] = useState<Rule[]>([
    { id: 1, title: 'Giữ vệ sinh khu vực chung', content: 'Luôn giữ sạch sẽ hành lang, nhà vệ sinh, bếp chung.', category: 'Vệ sinh', isActive: true, createdAt: '2024-10-01' },
    { id: 2, title: 'Giữ yên lặng sau 22:00', content: 'Không gây ồn ào, tránh ảnh hưởng đến người khác.', category: 'Sinh hoạt', isActive: true, createdAt: '2024-10-02' },
    { id: 3, title: 'Không hút thuốc trong nhà', content: 'Hút thuốc chỉ được phép ở khu vực ngoài trời.', category: 'An ninh', isActive: true, createdAt: '2024-10-03' },
    { id: 4, title: 'Sử dụng điện nước tiết kiệm', content: 'Tắt điện khi không sử dụng, tiết kiệm nước.', category: 'Tiện ích', isActive: true, createdAt: '2024-10-04' },
    { id: 5, title: 'Không nuôi thú cưng', content: 'Không mang thú cưng vào khu nhà.', category: 'Khác', isActive: false, createdAt: '2024-10-05' }
  ]);
  const [violations, setViolations] = useState<Violation[]>([
    { id: 1, tenantName: 'Nguyễn Văn A', roomNumber: '302', ruleTitle: 'Giữ yên lặng sau 22:00', description: 'Bật nhạc to sau 23h', severity: 'medium', status: 'pending', reportedAt: '2024-10-11 22:45', fine: 200000 },
    { id: 2, tenantName: 'Trần Thị B', roomNumber: '204', ruleTitle: 'Giữ vệ sinh khu vực chung', description: 'Vứt rác không đúng nơi quy định', severity: 'low', status: 'resolved', reportedAt: '2024-10-10 09:20', resolvedAt: '2024-10-12 10:00', fine: 100000 },
    { id: 3, tenantName: 'Lê Văn C', roomNumber: '105', ruleTitle: 'Không hút thuốc trong nhà', description: 'Hút thuốc trong hành lang', severity: 'high', status: 'escalated', reportedAt: '2024-10-09 18:10', fine: 500000 }
  ]);

  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);

  const ruleCategories = ['Sinh hoạt', 'Vệ sinh', 'An ninh', 'Tiện ích', 'Khác'];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'escalated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddRule = (ruleData: any) => {
    if (!ruleData.title || !ruleData.content || !ruleData.category) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    const newRule: Rule = {
      id: rules.length + 1,
      ...ruleData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setRules([...rules, newRule]);
    setShowRuleModal(false);
    success({ title: `Đã thêm nội quy "${ruleData.title}" thành công!` });
  };

  const handleUpdateRule = (ruleData: any) => {
    if (!selectedRule || !ruleData.title || !ruleData.content || !ruleData.category) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setRules(rules.map(rule => 
      rule.id === selectedRule.id ? { ...rule, ...ruleData } : rule
    ));
    setShowRuleModal(false);
    setSelectedRule(null);
    success({ title: `Đã cập nhật nội quy "${ruleData.title}" thành công!` });
  };

  const handleDeleteRule = (rule: Rule) => {
    setConfirmMessage(`Bạn có chắc chắn muốn xóa nội quy "${rule.title}" không? Hành động này không thể hoàn tác.`);
    setConfirmAction(() => () => {
      setRules(rules.map(r => r.id === rule.id ? {...r, isActive: false} : r));
      success({ title: `Đã xóa nội quy "${rule.title}" thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleAddViolation = (violationData: any) => {
    if (!violationData.tenantName || !violationData.roomNumber || !violationData.ruleTitle || !violationData.description) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    const newViolation: Violation = {
      id: violations.length + 1,
      ...violationData,
      reportedAt: new Date().toLocaleString()
    };
    setViolations([...violations, newViolation]);
    setShowViolationModal(false);
    success({ title: `Đã tạo báo cáo vi phạm cho "${violationData.tenantName}" thành công!` });
  };

  const handleUpdateViolation = (violationData: any) => {
    if (!selectedViolation || !violationData.tenantName || !violationData.roomNumber || !violationData.ruleTitle || !violationData.description) {
      error({ title: 'Vui lòng điền đầy đủ thông tin bắt buộc!' });
      return;
    }

    setViolations(violations.map(violation => 
      violation.id === selectedViolation.id ? { ...violation, ...violationData } : violation
    ));
    setShowViolationModal(false);
    setSelectedViolation(null);
    success({ title: `Đã cập nhật vi phạm của "${violationData.tenantName}" thành công!` });
  };

  const handleDeleteViolation = (violation: Violation) => {
    setConfirmMessage(`Bạn có chắc chắn muốn xóa báo cáo vi phạm của "${violation.tenantName}" không? Hành động này không thể hoàn tác.`);
    setConfirmAction(() => () => {
      setViolations(violations.filter(v => v.id !== violation.id));
      success({ title: `Đã xóa báo cáo vi phạm của "${violation.tenantName}" thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleResolveViolation = (violation: Violation) => {
    setConfirmMessage(`Bạn có chắc chắn muốn đánh dấu vi phạm của "${violation.tenantName}" là đã giải quyết không?`);
    setConfirmAction(() => () => {
      setViolations(violations.map(v => 
        v.id === violation.id ? {...v, status: 'resolved', resolvedAt: new Date().toLocaleString()} : v
      ));
      success({ title: `Đã giải quyết vi phạm của "${violation.tenantName}" thành công!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleEscalateViolation = (violation: Violation) => {
    setConfirmMessage(`Bạn có chắc chắn muốn leo thang vi phạm của "${violation.tenantName}" không?`);
    setConfirmAction(() => () => {
      setViolations(violations.map(v => 
        v.id === violation.id ? {...v, status: 'escalated'} : v
      ));
      warning({ title: `Đã leo thang vi phạm của "${violation.tenantName}"!` });
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-menu-line text-xl"></i>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">Nội quy & Vi phạm</h1>
              </div>
              <button
                onClick={() => activeTab === 'rules' ? setShowRuleModal(true) : setShowViolationModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap flex items-center"
              >
                <i className="ri-add-line mr-2"></i>
                {activeTab === 'rules' ? 'Thêm nội quy' : 'Báo cáo vi phạm'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('rules')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'rules'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-file-list-3-line mr-2"></i>
                    Nội quy ({rules.filter(r => r.isActive).length})
                  </button>
                  <button
                    onClick={() => setActiveTab('violations')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'violations'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-alert-line mr-2"></i>
                    Vi phạm ({violations.filter(v => v.status === 'pending').length})
                  </button>
                </nav>
              </div>
            </div>

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                {ruleCategories.map(category => {
                  const categoryRules = rules.filter(rule => rule.category === category && rule.isActive);
                  if (categoryRules.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                      </div>
                      <div className="p-6">
                        <div className="space-y-4">
                          {categoryRules.map(rule => (
                            <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">{rule.title}</h4>
                                  <p className="text-sm text-gray-600">{rule.content}</p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button
                                    onClick={() => {
                                      setSelectedRule(rule);
                                      setShowRuleModal(true);
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteRule(rule)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Violations Tab */}
            {activeTab === 'violations' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Khách thuê
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vi phạm
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mức độ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phạt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {violations.map((violation) => (
                        <tr key={violation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-indigo-600 font-medium text-sm">
                                  {violation.tenantName.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{violation.tenantName}</div>
                                <div className="text-sm text-gray-500">Phòng {violation.roomNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{violation.ruleTitle}</div>
                            <div className="text-sm text-gray-500">{violation.description}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(violation.severity)}`}>
                              {violation.severity === 'low' ? 'Nhẹ' : violation.severity === 'medium' ? 'Trung bình' : 'Nghiêm trọng'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {violation.fine ? (
                              <span className="text-sm font-medium text-red-600">
                                {violation.fine.toLocaleString()}đ
                              </span>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(violation.status)}`}>
                              {violation.status === 'pending' ? 'Chờ xử lý' : 
                               violation.status === 'resolved' ? 'Đã giải quyết' : 'Đã leo thang'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {violation.reportedAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedViolation(violation);
                                  setShowViolationModal(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <i className="ri-eye-line"></i>
                              </button>
                              {violation.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleResolveViolation(violation)}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <i className="ri-check-line"></i>
                                  </button>
                                  <button
                                    onClick={() => handleEscalateViolation(violation)}
                                    className="text-orange-600 hover:text-orange-900"
                                  >
                                    <i className="ri-arrow-up-line"></i>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDeleteViolation(violation)}
                                className="text-red-600 hover:text-red-900 cursor-pointer"
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
              </div>
            )}
          </div>
        </main>

        {/* Modals */}
        {showRuleModal && (
          <RuleModal
            rule={selectedRule}
            categories={ruleCategories}
            onClose={() => {
              setShowRuleModal(false);
              setSelectedRule(null);
            }}
            onSubmit={selectedRule ? handleUpdateRule : handleAddRule}
          />
        )}

        {showViolationModal && (
          <ViolationModal
            violation={selectedViolation}
            rules={rules.filter(r => r.isActive)}
            onClose={() => {
              setShowViolationModal(false);
              setSelectedViolation(null);
            }}
            onSubmit={selectedViolation ? handleUpdateViolation : handleAddViolation}
          />
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Xác nhận thao tác"
          message={confirmMessage}
          type="danger"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmDialog(false)}
        />
      </div>
    </div>
  );
}

// Modal Props and Components

interface RuleModalProps {
  rule?: Rule | null;
  categories: string[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function RuleModal({ rule, categories, onClose, onSubmit }: RuleModalProps) {
  const [formData, setFormData] = useState({
    title: rule?.title || '',
    content: rule?.content || '',
    category: rule?.category || categories[0],
    isActive: rule?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {rule ? 'Chỉnh sửa nội quy' : 'Thêm nội quy mới'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Nhập tiêu đề nội quy"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-8"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung *</label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border.transparent text-sm"
                placeholder="Nhập nội dung chi tiết của nội quy"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Áp dụng nội quy này
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
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
                {rule ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ViolationModalProps {
  violation?: Violation | null;
  rules: Rule[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function ViolationModal({ violation, rules, onClose, onSubmit }: ViolationModalProps) {
  const [formData, setFormData] = useState({
    tenantName: violation?.tenantName || '',
    roomNumber: violation?.roomNumber || '',
    ruleTitle: violation?.ruleTitle || '',
    description: violation?.description || '',
    severity: violation?.severity || 'low',
    status: violation?.status || 'pending',
    fine: violation?.fine || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {violation ? 'Chi tiết vi phạm' : 'Báo cáo vi phạm'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên khách thuê *</label>
              <input
                type="text"
                required
                value={formData.tenantName}
                onChange={(e) => setFormData({...formData, tenantName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border.transparent text-sm"
                placeholder="Nhập tên khách thuê"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số phòng *</label>
              <input
                type="text"
                required
                value={formData.roomNumber}
                onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border.transparent text-sm"
                placeholder="Nhập số phòng"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nội quy vi phạm *</label>
              <select
                required
                value={formData.ruleTitle}
                onChange={(e) => setFormData({...formData, ruleTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border.transparent text-sm pr-8"
              >
                <option value="">Chọn nội quy</option>
                {rules.map(rule => (
                  <option key={rule.id} value={rule.title}>{rule.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả vi phạm *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus.border.transparent text-sm"
                placeholder="Mô tả chi tiết hành vi vi phạm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ nghiêm trọng *</label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({...formData, severity: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus.border.transparent text-sm pr-8"
              >
                <option value="low">Nhẹ</option>
                <option value="medium">Trung bình</option>
                <option value="high">Nghiêm trọng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tiền phạt (đ)</label>
              <input
                type="number"
                min="0"
                value={formData.fine}
                onChange={(e) => setFormData({...formData, fine: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus.border.transparent text-sm"
                placeholder="Nhập số tiền phạt"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
              >
                Hủy
              </button>
              {violation ? (
                <button
                  onClick={handleUpdateViolation}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-save-line mr-2"></i>
                  Lưu thay đổi
                </button>
              ) : (
                <button
                  onClick={handleCreateViolation}
                  className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap flex items-center justify-center"
                >
                  <i className="ri-file-add-line mr-2"></i>
                  Tạo báo cáo
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
