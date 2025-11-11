/**
 * User Menu Component
 * Dropdown menu hiển thị thông tin user và nút logout
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      toast.success({
        title: 'Đăng xuất thành công',
        message: 'Hẹn gặp lại bạn!'
      });
    } catch (error: any) {
      toast.error({
        title: 'Lỗi đăng xuất',
        message: error.message || 'Không thể đăng xuất. Vui lòng thử lại.'
      });
      setIsLoggingOut(false);
    }
  };

  // Get user display name (support both camelCase and snake_case from backend)
  const displayName =
    user?.nhanVien?.HoTen ||
    user?.nhan_vien?.HoTen ||
    user?.khachThue?.HoTen ||
    user?.khach_thue?.HoTen ||
    user?.TenDangNhap;

  // Get user avatar (placeholder)
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'User')}&background=4f46e5&color=fff`;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-10 h-10 rounded-full"
        />
        <div className="text-left hidden md:block">
          <p className="text-sm font-medium text-gray-900">{displayName}</p>
          <p className="text-xs text-gray-500">{user?.TenQuyen}</p>
        </div>
        <i className={`ri-arrow-down-s-line text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900">{displayName}</p>
            <p className="text-xs text-gray-500 mt-1">@{user?.TenDangNhap}</p>
            <div className="flex items-center mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user?.TenQuyen}
                <i className="ri-shield-user-line ml-1"></i>
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <i className="ri-user-line mr-3 text-gray-500"></i>
              Thông tin cá nhân
            </Link>
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-3"></i>
                  Đang đăng xuất...
                </>
              ) : (
                <>
                  <i className="ri-logout-box-line mr-3"></i>
                  Đăng xuất
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
