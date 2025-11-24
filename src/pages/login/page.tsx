
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getDefaultRouteForRole } from '@/router/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  // Set page title
  useDocumentTitle('Đăng nhập');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const [errors, setErrors] = useState({
    username: '',
    password: ''
  });

  const [touched, setTouched] = useState({
    username: false,
    password: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (username: string) => {
    if (!username) {
      return 'Vui lòng nhập tên đăng nhập';
    }
    if (username.length < 3) {
      return 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Vui lòng nhập mật khẩu';
    }
    if (password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return '';
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });

    if (field === 'username') {
      setErrors({ ...errors, username: validateUsername(formData.username) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(formData.password) });
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when user starts typing
    if (field !== 'remember' && touched[field as keyof typeof touched]) {
      if (field === 'username') {
        setErrors({ ...errors, username: validateUsername(value as string) });
      } else if (field === 'password') {
        setErrors({ ...errors, password: validatePassword(value as string) });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);

    setErrors({
      username: usernameError,
      password: passwordError
    });

    setTouched({
      username: true,
      password: true
    });

    if (!usernameError && !passwordError) {
      setIsSubmitting(true);

      try {
        const user = await login({
          TenDangNhap: formData.username,
          password: formData.password,
          remember: formData.remember
        });

        toast.success({
          title: 'Đăng nhập thành công!',
          message: 'Chào mừng bạn quay trở lại'
        });

        // Navigate to appropriate dashboard based on user role
        const defaultRoute = getDefaultRouteForRole(user);
        navigate(defaultRoute);
      } catch (error: any) {
        toast.error({
          title: 'Đăng nhập thất bại',
          message: error.message || 'Vui lòng kiểm tra lại thông tin đăng nhập'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Nút quay về trang chủ */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
      >
        <i className="ri-arrow-left-line mr-2"></i>
        <span className="font-medium">Về trang chủ</span>
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-home-4-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phòng trọ</h1>
          <p className="text-gray-600">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-user-line text-gray-400"></i>
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.username && touched.username
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                onBlur={() => handleBlur('username')}
                disabled={isSubmitting}
              />
            </div>
            {errors.username && touched.username && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.username}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-lock-line text-gray-400"></i>
              </div>
              <input
                type="password"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.password && touched.password
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                disabled={isSubmitting}
              />
            </div>
            {errors.password && touched.password && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={formData.remember}
                onChange={(e) => handleChange('remember', e.target.checked)}
                disabled={isSubmitting}
              />
              <span className="ml-2 text-sm text-gray-600">Ghi nhớ đăng nhập</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <i className="ri-loader-4-line animate-spin mr-2"></i>
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
