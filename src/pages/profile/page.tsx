
import { useState, useEffect } from 'react';
import Sidebar from '../dashboard/components/Sidebar';
import Header from '../dashboard/components/Header';
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

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  idCard: string;
  idCardIssueDate: string;
  idCardIssuePlace: string;
}

export default function Profile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<NhanVienProfile | KhachThueProfile | null>(null);
  const toast = useToast();
  const { refreshUser } = useAuth();

  // Set page title
  useDocumentTitle('Thông tin cá nhân');

  const [editForm, setEditForm] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    idCard: '',
    idCardIssueDate: '',
    idCardIssuePlace: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);

      // Map backend data to form
      if (profileService.isNhanVienProfile(data)) {
        setEditForm({
          fullName: data.HoTen || '',
          email: data.Email || '',
          phone: data.SDT || '',
          address: data.DiaChi || '',
          dateOfBirth: data.NgaySinh || '',
          gender: data.GioiTinh || '',
          idCard: data.CCCD || '',
          idCardIssueDate: data.NgayCapCCCD || '',
          idCardIssuePlace: data.NoiCapCCCD || ''
        });
      } else if (profileService.isKhachThueProfile(data)) {
        setEditForm({
          fullName: data.HoTen || '',
          email: data.Email || '',
          phone: data.SDT1 || '',
          address: data.DiaChiThuongTru || '',
          dateOfBirth: data.NgaySinh || '',
          gender: '',
          idCard: data.CCCD || '',
          idCardIssueDate: data.NgayCapCCCD || '',
          idCardIssuePlace: data.NoiCapCCCD || ''
        });
      }
    } catch (error: any) {
      toast.error({
        title: 'Lỗi!',
        message: error.response?.data?.message || 'Không thể tải thông tin profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      if (!profile) return;

      let updateData: UpdateNhanVienRequest | UpdateKhachThueRequest;

      if (profileService.isNhanVienProfile(profile)) {
        updateData = {
          HoTen: editForm.fullName,
          Email: editForm.email,
          SDT: editForm.phone,
          DiaChi: editForm.address,
          NgaySinh: editForm.dateOfBirth,
          GioiTinh: editForm.gender,
          CCCD: editForm.idCard,
          NgayCapCCCD: editForm.idCardIssueDate,
          NoiCapCCCD: editForm.idCardIssuePlace
        };
      } else {
        updateData = {
          HoTen: editForm.fullName,
          Email: editForm.email,
          SDT1: editForm.phone,
          DiaChiThuongTru: editForm.address,
          NgaySinh: editForm.dateOfBirth,
          CCCD: editForm.idCard,
          NgayCapCCCD: editForm.idCardIssueDate,
          NoiCapCCCD: editForm.idCardIssuePlace
        };
      }

      const updatedProfile = await profileService.updateProfile(updateData);
      setProfile(updatedProfile);
      setIsEditing(false);

      // Refresh user in AuthContext to update header
      await refreshUser();

      toast.success({
        title: 'Cập nhật thành công!',
        message: 'Thông tin cá nhân đã được lưu'
      });
    } catch (error: any) {
      toast.error({
        title: 'Lỗi!',
        message: error.response?.data?.message || 'Không thể cập nhật profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error({
        title: 'Lỗi!',
        message: 'Mật khẩu xác nhận không khớp'
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error({
        title: 'Lỗi!',
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
      return;
    }

    try {
      setLoading(true);
      await profileService.changePassword({
        password_hien_tai: passwordForm.currentPassword,
        password_moi: passwordForm.newPassword,
        password_moi_confirmation: passwordForm.confirmPassword
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success({
        title: 'Đổi mật khẩu thành công!',
        message: 'Mật khẩu của bạn đã được cập nhật'
      });
    } catch (error: any) {
      toast.error({
        title: 'Lỗi!',
        message: error.response?.data?.message || 'Không thể đổi mật khẩu'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement avatar upload to backend
      toast.error({
        title: 'Chưa hỗ trợ!',
        message: 'Tính năng upload avatar đang được phát triển'
      });
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
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
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
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
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
              <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt bảo mật</p>
            </div>

            {/* Profile Header */}
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{profile?.HoTen || 'Chưa có tên'}</h2>
                  <p className="text-gray-600">
                    {profileService.isNhanVienProfile(profile) ? profile.Email : profile?.Email || 'Chưa cập nhật email'}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {profile?.taiKhoan?.TenQuyen || 'N/A'}
                    </span>
                    <span className="ml-3 text-sm text-gray-500">
                      Tài khoản: {profile?.taiKhoan?.TenDangNhap || 'N/A'}
                    </span>
                    <span className={`ml-3 text-xs px-2 py-1 rounded-full ${
                      profile?.taiKhoan?.TrangThaiTaiKhoan === 'Hoạt động'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile?.taiKhoan?.TrangThaiTaiKhoan || 'N/A'}
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
                        onClick={() => {
                          setIsEditing(false);
                          fetchProfile();
                        }}
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

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'personal'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-user-line mr-2"></i>
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'security'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-shield-line mr-2"></i>
                    Bảo mật
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === 'activity'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <i className="ri-history-line mr-2"></i>
                    Hoạt động
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên đăng nhập
                        </label>
                        <input
                          type="text"
                          value={profile?.taiKhoan?.TenDangNhap || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                          placeholder="Nhập email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div>
                      {/* Ẩn tạm thời - Uncomment để bật lại */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          value={editForm.dateOfBirth}
                          onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div> */}
                      {/* {profileService.isNhanVienProfile(profile) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Giới tính
                          </label>
                          <select
                            value={editForm.gender}
                            onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50 pr-8"
                          >
                            <option value="">-- Chọn giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                          </select>
                        </div>
                      )} */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CMND/CCCD
                        </label>
                        <input
                          type="text"
                          value={editForm.idCard}
                          onChange={(e) => setEditForm({...editForm, idCard: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                          placeholder="Nhập số CMND/CCCD"
                        />
                      </div> */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày cấp CCCD
                        </label>
                        <input
                          type="date"
                          value={editForm.idCardIssueDate}
                          onChange={(e) => setEditForm({...editForm, idCardIssueDate: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        />
                      </div> */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nơi cấp CCCD
                        </label>
                        <input
                          type="text"
                          value={editForm.idCardIssuePlace}
                          onChange={(e) => setEditForm({...editForm, idCardIssuePlace: e.target.value})}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                          placeholder="Nhập nơi cấp CCCD"
                        />
                      </div> */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vai trò
                        </label>
                        <input
                          type="text"
                          value={profile?.taiKhoan?.TenQuyen || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                        />
                      </div>
                    </div>
                    {/* Ẩn tạm thời - Uncomment để bật lại */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Địa chỉ
                      </label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                        disabled={!isEditing}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm disabled:bg-gray-50"
                        placeholder="Nhập địa chỉ"
                      />
                    </div> */}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="max-w-md">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Đổi mật khẩu</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại *
                          </label>
                          <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới *
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                            placeholder="Nhập mật khẩu mới"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới *
                          </label>
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
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Bảo mật tài khoản</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <i className="ri-shield-check-line text-green-600 text-xl mr-3"></i>
                            <div>
                              <div className="font-medium text-gray-900">Xác thực hai yếu tố</div>
                              <div className="text-sm text-gray-600">Bảo vệ tài khoản bằng xác thực 2FA</div>
                            </div>
                          </div>
                          <span className="text-sm text-green-600 font-medium">Đã bật</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <i className="ri-mail-line text-gray-600 text-xl mr-3"></i>
                            <div>
                              <div className="font-medium text-gray-900">Thông báo đăng nhập</div>
                              <div className="text-sm text-gray-600">Nhận email khi có đăng nhập từ thiết bị mới</div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">Đã tắt</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Hoạt động gần đây</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-login-circle-line text-green-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Đăng nhập thành công</div>
                          <div className="text-sm text-gray-600">Từ địa chỉ IP: 192.168.1.100</div>
                          <div className="text-xs text-gray-500 mt-1">20/01/2024 09:30</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-edit-line text-blue-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Cập nhật thông tin cá nhân</div>
                          <div className="text-sm text-gray-600">Thay đổi số điện thoại</div>
                          <div className="text-xs text-gray-500 mt-1">19/01/2024 14:20</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <i className="ri-key-line text-yellow-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Đổi mật khẩu</div>
                          <div className="text-sm text-gray-600">Mật khẩu đã được cập nhật thành công</div>
                          <div className="text-xs text-gray-500 mt-1">18/01/2024 16:45</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <i className="ri-error-warning-line text-red-600"></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Đăng nhập thất bại</div>
                          <div className="text-sm text-gray-600">Sai mật khẩu từ IP: 192.168.1.55</div>
                          <div className="text-xs text-gray-500 mt-1">17/01/2024 22:15</div>
                        </div>
                      </div>
                    </div>
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
