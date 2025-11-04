
import { useState } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';

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
  status: 'reported' | 'warned' | 'resolved' | 'escalated';
  reportDate: string;
  reportedBy: string;
  resolvedDate?: string;
  fine?: number;
  notes?: string;
}

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
    description: 'Khách thăm phải đăng ký và không được ở qua đêm quá 3 ngày/tháng',
    category: 'visitors',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '4',
    title: 'An toàn cháy nổ',
    description: 'Không sử dụng thiết bị điện công suất cao, không nấu ăn trong phòng',
    category: 'safety',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  },
  {
    id: '5',
    title: 'Thanh toán tiền thuê',
    description: 'Thanh toán tiền thuê trước ngày 5 hàng tháng',
    category: 'payment',
    isActive: true,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-01'
  }
];

const mockViolations: Violation[] = [
  {
    id: '1',
    tenantName: 'Nguyễn Văn A',
    room: 'P101',
    ruleTitle: 'Giờ giấc sinh hoạt',
    description: 'Mở nhạc to sau 23:00, ảnh hưởng đến phòng bên cạnh',
    severity: 'moderate',
    status: 'warned',
    reportDate: '2024-03-15',
    reportedBy: 'Trần Thị B (P102)',
    notes: 'Đã nhắc nhở, khách thuê cam kết không tái phạm'
  },
  {
    id: '2',
    tenantName: 'Lê Văn C',
    room: 'P105',
    ruleTitle: 'Vệ sinh chung',
    description: 'Để rác ở hành lang, không dọn dẹp sau khi sử dụng',
    severity: 'minor',
    status: 'resolved',
    reportDate: '2024-03-10',
    reportedBy: 'Quản lý tòa nhà',
    resolvedDate: '2024-03-12'
  },
  {
    id: '3',
    tenantName: 'Phạm Thị D',
    room: 'P301',
    ruleTitle: 'Thanh toán tiền thuê',
    description: 'Chậm thanh toán tiền thuê tháng 3/2024',
    severity: 'serious',
    status: 'escalated',
    reportDate: '2024-03-08',
    reportedBy: 'Hệ thống',
    fine: 200000,
    notes: 'Đã quá hạn 3 ngày, áp dụng phí phạt'
  },
  {
    id: '4',
    tenantName: 'Hoàng Văn E',
    room: 'P203',
    ruleTitle: 'An toàn cháy nổ',
    description: 'Sử dụng bếp gas trong phòng',
    severity: 'critical',
    status: 'reported',
    reportDate: '2024-03-20',
    reportedBy: 'Bảo vệ tòa nhà'
  }
];

export default function Rules() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'violations'>('rules');
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAddViolationModal, setShowAddViolationModal] = useState(false);

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
                onClick={() => activeTab === 'rules' ? setShowAddRuleModal(true) : setShowAddViolationModal(true)}
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
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'rules'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    } cursor-pointer`}
                  >
                    Nội quy
                  </button>
                  <button
                    onClick={() => setActiveTab('violations')}
                    className={`py-3 px-6 border-b-2 font-medium text-sm ${
                      activeTab === 'violations'
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
                        <p className="text-2xl font-bold text-gray-900">{mockRules.length}</p>
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
                          {mockRules.filter(r => r.isActive).length}
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
                        <p className="text-2xl font-bold text-gray-900">{mockViolations.length}</p>
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
                        {mockRules.map((rule) => (
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
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedRule(rule)}
                                  className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                <button className="text-green-600 hover:text-green-900 cursor-pointer">
                                  Sửa
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <i className="ri-error-warning-line text-yellow-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockViolations.filter(v => v.status === 'reported').length}
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
                          {mockViolations.filter(v => v.status === 'warned').length}
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
                          {mockViolations.filter(v => v.status === 'resolved').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <i className="ri-alert-line text-red-600 text-xl"></i>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Leo thang</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {mockViolations.filter(v => v.status === 'escalated').length}
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
                        {mockViolations.map((violation) => (
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
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedViolation(violation)}
                                  className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                                {violation.status === 'reported' && (
                                  <button className="text-green-600 hover:text-green-900 cursor-pointer">
                                    Xử lý
                                  </button>
                                )}
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
                  <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedRule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
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
                <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">
                  Chỉnh sửa
                </button>
                <button className={`flex-1 px-4 py-2 rounded-lg cursor-pointer whitespace-nowrap ${
                  selectedRule.isActive 
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
                {selectedViolation.fine && (
                  <div>
                    <span className="text-gray-600">Phí phạt:</span>
                    <span className="font-medium text-red-600 ml-2">{selectedViolation.fine.toLocaleString('vi-VN')}đ</span>
                  </div>
                )}
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
                    <button className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 cursor-pointer whitespace-nowrap">
                      Cảnh báo
                    </button>
                    <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap">
                      Phạt tiền
                    </button>
                  </>
                )}
                {selectedViolation.status === 'warned' && (
                  <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer whitespace-nowrap">
                    Đánh dấu đã giải quyết
                  </button>
                )}
                <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap">
                  Chỉnh sửa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddRuleModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Thêm nội quy mới</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tiêu đề nội quy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} placeholder="Mô tả chi tiết nội quy..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                    <option value="">Chọn danh mục</option>
                    <option value="general">Chung</option>
                    <option value="safety">An toàn</option>
                    <option value="noise">Tiếng ồn</option>
                    <option value="cleanliness">Vệ sinh</option>
                    <option value="visitors">Khách thăm</option>
                    <option value="payment">Thanh toán</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                  >
                    Thêm nội quy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Violation Modal */}
      {showAddViolationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddViolationModal(false)}></div>
            <div className="relative bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo vi phạm</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách thuê</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="">Chọn khách thuê</option>
                      <option value="1">Nguyễn Văn A - P101</option>
                      <option value="2">Trần Thị B - P202</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội quy vi phạm</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="">Chọn nội quy</option>
                      <option value="1">Giờ giấc sinh hoạt</option>
                      <option value="2">Vệ sinh chung</option>
                      <option value="3">Khách thăm</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ nghiêm trọng</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8">
                      <option value="minor">Nhẹ</option>
                      <option value="moderate">Vừa</option>
                      <option value="serious">Nghiêm trọng</option>
                      <option value="critical">Rất nghiêm trọng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày vi phạm</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả vi phạm</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={4} placeholder="Mô tả chi tiết hành vi vi phạm..."></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Người báo cáo</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Tên người báo cáo" />
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
    </div>
  );
}
