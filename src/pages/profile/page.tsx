import { useState, useEffect } from 'react';
import AdminSidebar from '../dashboard/components/Sidebar';
import AdminHeader from '../dashboard/components/Header';
import CustomerSidebar from '../customer-dashboard/components/CustomerSidebar';
import CustomerHeader from '../customer-dashboard/components/CustomerHeader';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  profileService,
  NhanVienProfile,
  KhachThueProfile,
  UpdateNhanVienRequest,
  UpdateKhachThueRequest
} from '../../services/profile.service';
import { getErrorMessage } from '../../lib/http-client';


// Helper function to get role name from MaQuyen
const getRoleName = (maQuyen: number | undefined): string => {
  switch (maQuyen) {
    case 1:
      return 'Admin';
    case 2:
      return 'Nhân viên';
    case 3:
      return 'Khách thuê';
    default:
      return 'N/A';
  }
};

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<NhanVienProfile | KhachThueProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<NhanVienProfile | KhachThueProfile | null>(null);
  const toast = useToast();
  const { user, refreshUser } = useAuth();

  useDocumentTitle('Thông tin cá nhân');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setOriginalProfile(JSON.parse(JSON.stringify(data))); // Deep copy for cancellation
    } catch (error: any) {
      toast.error({
        title: 'Lỗi!',
        message: getErrorMessage(error) || 'Không thể tải thông tin profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setLoading(true);

      let updateData: UpdateNhanVienRequest | UpdateKhachThueRequest;

      if (profileService.isNhanVienProfile(profile)) {
        updateData = {
          HoTen: profile.HoTen,
          Email: profile.Email,
          SDT: profile.SDT,
          DiaChi: profile.DiaChi,
          NgaySinh: profile.NgaySinh,
          GioiTinh: profile.GioiTinh,
          CCCD: profile.CCCD,
          NgayCapCCCD: profile.NgayCapCCCD,
          NoiCapCCCD: profile.NoiCapCCCD
        };
      } else {
        updateData = {
          HoTen: profile.HoTen,
          Email: profile.Email,
          SDT1: profile.SDT1,
          DiaChiThuongTru: profile.DiaChiThuongTru,
          NgaySinh: profile.NgaySinh,
          CCCD: profile.CCCD,
          NgayCapCCCD: profile.NgayCapCCCD,
          NoiCapCCCD: profile.NoiCapCCCD
        };
      }

      const updatedProfile = await profileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setOriginalProfile(JSON.parse(JSON.stringify(updatedProfile))); // Update original state
      setIsEditing(false);

      await refreshUser();

      toast.success({
        title: 'Cập nhật thành công!',
        message: 'Thông tin cá nhân đã được lưu'
      });
    } catch (error: any) {
      toast.error({
        title: 'Lỗi!',
        message: getErrorMessage(error) || 'Không thể cập nhật profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error({ title: 'Lỗi!', message: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error({ title: 'Lỗi!', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      return;
    }

    try {
      setLoading(true);
      await profileService.changePassword({
        password_hien_tai: passwordForm.currentPassword,
        password_moi: passwordForm.newPassword,
        password_moi_confirmation: passwordForm.confirmPassword
      });

      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success({ title: 'Đổi mật khẩu thành công!', message: 'Mật khẩu của bạn đã được cập nhật' });
    } catch (error: any) {
      toast.error({ title: 'Lỗi!', message: getErrorMessage(error) || 'Không thể đổi mật khẩu' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast.error({ title: 'Chưa hỗ trợ!', message: 'Tính năng upload avatar đang được phát triển' });
    }
  };

  const isCustomer = user?.MaQuyen === 3;

  const LayoutSidebar = isCustomer ? CustomerSidebar : AdminSidebar;
  const LayoutHeader = isCustomer ? CustomerHeader : AdminHeader;

  if (loading && !profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <LayoutSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <LayoutHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <LayoutSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <LayoutHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-error-warning-line text-5xl text-red-500"></i>
              <p className="mt-4 text-gray-600">Không thể tải thông tin profile</p>
              <button
                onClick={fetchProfile}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Thử lại
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <LayoutSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <LayoutHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
              <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt bảo mật</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden">
                    {profileService.isKhachThueProfile(profile) && profile.HinhAnh ? (
                      <img src={profile.HinhAnh} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-indigo-600 font-bold text-2xl">
                        {profile?.HoTen?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700">
                      <i className="ri-camera-line text-white text-sm"></i>
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{profile?.HoTen || 'Chưa có tên'}</h2>
                  <p className="text-gray-600">{profile?.Email || 'Chưa cập nhật email'}</p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {profile?.TaiKhoan?.TenQuyen || profile?.taiKhoan?.TenQuyen || getRoleName(profile?.TaiKhoan?.MaQuyen || profile?.taiKhoan?.MaQuyen)}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      Tài khoản: {profile?.TaiKhoan?.TenDangNhap || profile?.taiKhoan?.TenDangNhap || 'N/A'}
                    </span>
                    <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                      (profile?.TaiKhoan?.TrangThaiTaiKhoan || profile?.taiKhoan?.TrangThaiTaiKhoan) === 'Hoạt động'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile?.TaiKhoan?.TrangThaiTaiKhoan || profile?.taiKhoan?.TrangThaiTaiKhoan || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
                      disabled={loading}
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Chỉnh sửa
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition duration-200 whitespace-nowrap"
                        disabled={loading}
                      >
                        Hủy
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap flex items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="ri-save-line mr-2"></i>
                            Lưu
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'personal' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <i className="ri-user-line mr-2"></i>
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'security' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <i className="ri-shield-line mr-2"></i>
                    Bảo mật
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    <i className="ri-history-line mr-2"></i>
                    Hoạt động
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                        <input
                          type="text"
                          name="HoTen"
                          value={profile.HoTen || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tên đăng nhập</label>
                        <input
                          type="text"
                          value={profile?.TaiKhoan?.TenDangNhap || profile?.taiKhoan?.TenDangNhap || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          name="Email"
                          value={profile.Email || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                          placeholder="Nhập email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                        <input
                          type="tel"
                          name={profileService.isNhanVienProfile(profile) ? 'SDT' : 'SDT1'}
                          value={(profileService.isNhanVienProfile(profile) ? profile.SDT : profile.SDT1) || ''}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                        <input
                          type="text"
                          value={profile?.TaiKhoan?.TenQuyen || profile?.taiKhoan?.TenQuyen || getRoleName(profile?.TaiKhoan?.MaQuyen || profile?.taiKhoan?.MaQuyen)}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="max-w-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại *</label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới *</label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới *</label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                        <button
                          onClick={handleChangePassword}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
                        >
                          Đổi mật khẩu
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
                    <p className="text-gray-600">Tính năng đang được phát triển.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}