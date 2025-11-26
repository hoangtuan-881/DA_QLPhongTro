import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
import { useToast } from '../../hooks/useToast';
import { caiDatHeThongService } from '../../services/cai-dat-he-thong.service';
import { getErrorMessage } from '../../lib/http-client';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoBackup: boolean;
  backupTime: string;
  maintenanceMode: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;
}

interface PricingSettings {
  gia_dien: string;
  gia_nuoc_nguoi: string;
}

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Hệ thống quản lý trọ',
    siteDescription: 'Quản lý nhà trọ hiện đại và tiện lợi',
    contactEmail: 'contact@tro.com',
    contactPhone: '0901234567',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VNĐ',
    language: 'vi',
    dateFormat: 'dd/MM/yyyy',
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupTime: '02:00',
    maintenanceMode: false,
    maxLoginAttempts: 5,
    sessionTimeout: 30
  });

  const [pricingSettings, setPricingSettings] = useState<PricingSettings>({
    gia_dien: '3500',
    gia_nuoc_nguoi: '60000'
  });

  const [originalPricing, setOriginalPricing] = useState<PricingSettings>({
    gia_dien: '3500',
    gia_nuoc_nguoi: '60000'
  });

  // Fetch pricing settings from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchPricingSettings = async () => {
      try {
        setLoading(true);
        const response = await caiDatHeThongService.getAll(controller.signal);

        if (!controller.signal.aborted && response.data.data) {
          const settingsMap: Record<string, string> = {};
          response.data.data.forEach((setting) => {
            settingsMap[setting.KeyCaiDat] = setting.GiaTri;
          });

          const newPricing: PricingSettings = {
            gia_dien: settingsMap['gia_dien'] || '3500',
            gia_nuoc_nguoi: settingsMap['gia_nuoc_nguoi'] || '60000'
          };

          setPricingSettings(newPricing);
          setOriginalPricing(newPricing);
        }
      } catch (error: any) {
        if (error.name !== 'CanceledError' && error.code !== 'ERR_CANCELED') {
          console.error('Error fetching pricing settings:', error);
          toast.error({
            title: 'Lỗi tải cài đặt',
            message: getErrorMessage(error)
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPricingSettings();

    return () => controller.abort();
  }, []);

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handlePricingChange = (key: keyof PricingSettings, value: string) => {
    setPricingSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);

      // Save pricing settings if on pricing tab
      if (activeTab === 'pricing') {
        await caiDatHeThongService.updateBulk([
          { key: 'gia_dien', value: pricingSettings.gia_dien },
          { key: 'gia_nuoc_nguoi', value: pricingSettings.gia_nuoc_nguoi }
        ]);

        setOriginalPricing(pricingSettings);
        toast.success({
          title: 'Lưu cài đặt thành công!',
          message: 'Giá dịch vụ đã được cập nhật'
        });
      } else {
        // Simulate API call for other settings
        await new Promise(resolve => setTimeout(resolve, 500));
        toast.success({
          title: 'Lưu cài đặt thành công!',
          message: 'Tất cả thay đổi đã được áp dụng'
        });
      }

      setHasChanges(false);
    } catch (error: any) {
      toast.error({
        title: 'Lỗi lưu cài đặt',
        message: getErrorMessage(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục cài đặt mặc định?')) {
      if (activeTab === 'pricing') {
        setPricingSettings(originalPricing);
      } else {
        setSettings({
          siteName: 'Hệ thống quản lý trọ',
          siteDescription: 'Quản lý nhà trọ hiện đại và tiện lợi',
          contactEmail: 'contact@tro.com',
          contactPhone: '0901234567',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          timezone: 'Asia/Ho_Chi_Minh',
          currency: 'VNĐ',
          language: 'vi',
          dateFormat: 'dd/MM/yyyy',
          emailNotifications: true,
          smsNotifications: false,
          autoBackup: true,
          backupTime: '02:00',
          maintenanceMode: false,
          maxLoginAttempts: 5,
          sessionTimeout: 30
        });
      }
      setHasChanges(true);
      toast.info({
        title: 'Đã khôi phục cài đặt',
        message: 'Vui lòng lưu để áp dụng thay đổi'
      });
    }
  };

  const tabs = [
    { id: 'general', name: 'Chung', icon: 'ri-settings-line' },
    { id: 'notifications', name: 'Thông báo', icon: 'ri-notification-line' },
    { id: 'security', name: 'Bảo mật', icon: 'ri-shield-line' },
    { id: 'pricing', name: 'Giá dịch vụ', icon: 'ri-money-dollar-circle-line' },
    { id: 'system', name: 'Hệ thống', icon: 'ri-computer-line' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Cài đặt hệ thống</h1>
                <p className="text-gray-600">Quản lý cấu hình và tùy chỉnh hệ thống</p>
              </div>

              {hasChanges && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      if (activeTab === 'pricing') {
                        setPricingSettings(originalPricing);
                      }
                      setHasChanges(false);
                      toast.info({
                        title: 'Đã hủy thay đổi',
                        message: 'Cài đặt đã được khôi phục'
                      });
                    }}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                    disabled={loading}
                  >
                    Hủy thay đổi
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="ri-save-line mr-2"></i>
                    {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <div className="lg:w-64">
                <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition duration-200 whitespace-nowrap ${activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <i className={`${tab.icon} mr-3`}></i>
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin chung</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tên hệ thống
                            </label>
                            <input
                              type="text"
                              value={settings.siteName}
                              onChange={(e) => handleSettingChange('siteName', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email liên hệ
                            </label>
                            <input
                              type="email"
                              value={settings.contactEmail}
                              onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số điện thoại
                            </label>
                            <input
                              type="tel"
                              value={settings.contactPhone}
                              onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả hệ thống
                          </label>
                          <textarea
                            value={settings.siteDescription}
                            onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Địa chỉ liên hệ trực tiếp
                          </label>
                          <textarea
                            value={settings.address}
                            onChange={(e) => handleSettingChange('address', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt thông báo</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Thông báo email</div>
                              <div className="text-sm text-gray-600">Gửi thông báo qua email</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.emailNotifications}
                                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Thông báo ứng dụng</div>
                              <div className="text-sm text-gray-600">Gửi thông báo qua ứng dụng</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.smsNotifications}
                                onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt bảo mật</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Số lần đăng nhập sai tối đa
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={settings.maxLoginAttempts}
                              onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-6">
                          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Chế độ bảo trì</div>
                              <div className="text-sm text-gray-600">Tạm thời khóa hệ thống để bảo trì</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.maintenanceMode}
                                onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pricing Settings */}
                  {activeTab === 'pricing' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt giá dịch vụ</h3>
                        <p className="text-sm text-gray-600 mb-6">
                          Cấu hình giá điện và nước được sử dụng khi tạo hóa đơn tự động
                        </p>

                        {loading && (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          </div>
                        )}

                        {!loading && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center mb-3">
                                <i className="ri-flashlight-line text-2xl text-blue-600 mr-3"></i>
                                <div>
                                  <div className="font-medium text-gray-900">Giá điện</div>
                                  <div className="text-xs text-gray-600">VNĐ/kWh</div>
                                </div>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={pricingSettings.gia_dien}
                                onChange={(e) => handlePricingChange('gia_dien', e.target.value)}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Nhập giá điện"
                              />
                              <p className="text-xs text-gray-600 mt-2">
                                Giá hiện tại: {parseInt(pricingSettings.gia_dien).toLocaleString('vi-VN')} VNĐ/kWh
                              </p>
                            </div>

                            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                              <div className="flex items-center mb-3">
                                <i className="ri-drop-line text-2xl text-cyan-600 mr-3"></i>
                                <div>
                                  <div className="font-medium text-gray-900">Giá nước</div>
                                  <div className="text-xs text-gray-600">VNĐ/người/tháng</div>
                                </div>
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="1000"
                                value={pricingSettings.gia_nuoc_nguoi}
                                onChange={(e) => handlePricingChange('gia_nuoc_nguoi', e.target.value)}
                                className="w-full px-3 py-2 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                placeholder="Nhập giá nước"
                              />
                              <p className="text-xs text-gray-600 mt-2">
                                Giá hiện tại: {parseInt(pricingSettings.gia_nuoc_nguoi).toLocaleString('vi-VN')} VNĐ/người
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex">
                            <i className="ri-information-line text-yellow-600 mr-3 flex-shrink-0 mt-1"></i>
                            <div className="text-sm text-gray-700">
                              <p className="font-medium mb-1">Lưu ý</p>
                              <ul className="list-disc list-inside space-y-1 text-gray-600">
                                <li>Thay đổi giá sẽ áp dụng cho các hóa đơn mới được tạo</li>
                                <li>Hóa đơn đã tạo sẽ giữ nguyên giá tại thời điểm xuất</li>
                                <li>Giá được lưu vào database, không cần deploy code để thay đổi</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* System Settings */}
                  {activeTab === 'system' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Cài đặt hệ thống</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">Sao lưu tự động</div>
                              <div className="text-sm text-gray-600">Tự động sao lưu dữ liệu hằng ngày</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.autoBackup}
                                onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                          {settings.autoBackup && (
                            <div className="ml-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Thời gian sao lưu
                              </label>
                              <input
                                type="time"
                                value={settings.backupTime}
                                onChange={(e) => handleSettingChange('backupTime', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                              />
                            </div>
                          )}
                        </div>

                        <div className="mt-8 pt-6 border-t">
                          <h4 className="text-md font-medium text-gray-900 mb-4">Thao tác hệ thống</h4>
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={handleResetSettings}
                              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                            >
                              <i className="ri-restart-line mr-2"></i>
                              Khôi phục mặc định
                            </button>
                            <button
                              onClick={() => {
                                toast.info({
                                  title: 'Đang sao lưu...',
                                  message: 'Quá trình sao lưu sẽ hoàn thành trong vài phút'
                                });
                              }}
                              className="border border-green-300 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 transition duration-200 whitespace-nowrap"
                            >
                              <i className="ri-download-line mr-2"></i>
                              Sao lưu ngay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
