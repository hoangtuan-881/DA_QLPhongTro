
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false
  });

  const validateFullName = (name: string) => {
    if (!name.trim()) {
      return 'Vui lòng nhập họ và tên';
    }
    if (name.trim().length < 2) {
      return 'Họ và tên phải có ít nhất 2 ký tự';
    }
    return '';
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Vui lòng nhập email';
    }
    if (!emailRegex.test(email)) {
      return 'Hãy nhập email hoặc số điện thoại';
    }
    return '';
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phone) {
      return 'Vui lòng nhập số điện thoại';
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return 'Số điện thoại không hợp lệ';
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

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return 'Vui lòng xác nhận mật khẩu';
    }
    if (confirmPassword !== password) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(formData.fullName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      case 'password':
        error = validatePassword(formData.password);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(formData.confirmPassword, formData.password);
        break;
    }
    
    setErrors({ ...errors, [field]: error });
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (touched[field as keyof typeof touched]) {
      let error = '';
      switch (field) {
        case 'fullName':
          error = validateFullName(value);
          break;
        case 'email':
          error = validateEmail(value);
          break;
        case 'phone':
          error = validatePhone(value);
          break;
        case 'password':
          error = validatePassword(value);
          // Also revalidate confirm password if it was touched
          if (touched.confirmPassword) {
            const confirmError = validateConfirmPassword(formData.confirmPassword, value);
            setErrors({ ...errors, [field]: error, confirmPassword: confirmError });
            return;
          }
          break;
        case 'confirmPassword':
          error = validateConfirmPassword(value, formData.password);
          break;
      }
      
      setErrors({ ...errors, [field]: error });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
    
    setErrors({
      fullName: fullNameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError
    });
    
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    });
    
    if (!fullNameError && !emailError && !phoneError && !passwordError && !confirmPasswordError) {
      // Xử lý đăng ký sẽ được thêm sau khi kết nối Supabase
      console.log('Register data:', formData);
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
            <i className="ri-user-add-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo tài khoản</h1>
          <p className="text-gray-600">Đăng ký tài khoản quản lý phòng trọ</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-user-line text-gray-400"></i>
              </div>
              <input
                type="text"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.fullName && touched.fullName 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
              />
            </div>
            {errors.fullName && touched.fullName && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.fullName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-mail-line text-gray-400"></i>
              </div>
              <input
                type="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email && touched.email 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Nhập email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
            </div>
            {errors.email && touched.email && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-phone-line text-gray-400"></i>
              </div>
              <input
                type="tel"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.phone && touched.phone 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
              />
            </div>
            {errors.phone && touched.phone && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.phone}</span>
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
              />
            </div>
            {errors.password && touched.password && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-lock-line text-gray-400"></i>
              </div>
              <input
                type="password"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.confirmPassword && touched.confirmPassword 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300'
                }`}
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{errors.confirmPassword}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-medium whitespace-nowrap"
          >
            Đăng ký
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
