
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  //const { showToast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Vui lòng nhập địa chỉ email';
    }
    if (!emailRegex.test(email)) {
      return 'Hãy nhập email hoặc số điện thoại';
    }
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleChange = (value: string) => {
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    setError(emailError);
    setTouched(true);

    if (emailError) {
      return;
    }

    setIsLoading(true);

    // Mô phỏng gửi email reset password
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      //showToast('Đã gửi email khôi phục mật khẩu thành công!', 'success');
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center text-indigo-600 hover:text-indigo-700 transition-colors duration-200 cursor-pointer"
        >
          <i className="ri-arrow-left-line mr-2"></i>
          <span className="font-medium">Về trang chủ</span>
        </Link>

        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-mail-check-line text-2xl text-green-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kiểm tra email của bạn</h1>
          <p className="text-gray-600 mb-6">
            Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email:
          </p>
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <p className="font-medium text-gray-900">{email}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Nếu bạn không nhận được email trong vòng 5 phút, vui lòng kiểm tra thư mục spam hoặc thử lại.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
                setError('');
                setTouched(false);
              }}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 font-medium whitespace-nowrap"
            >
              Gửi lại email
            </button>
            <Link
              to="/login"
              className="block w-full text-center text-indigo-600 hover:text-indigo-500 py-2 font-medium"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
            <i className="ri-lock-unlock-line text-2xl text-white"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
          <p className="text-gray-600">Nhập email để nhận hướng dẫn khôi phục mật khẩu</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-mail-line text-gray-400"></i>
              </div>
              <input
                type="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${error && touched
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300'
                  }`}
                placeholder="Nhập email đã đăng ký"
                value={email}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                disabled={isLoading}
              />
            </div>
            {error && touched && (
              <div className="flex items-center mt-2 text-red-500 text-sm">
                <i className="ri-error-warning-line mr-1"></i>
                <span>{error}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Chúng tôi sẽ gửi link khôi phục mật khẩu đến email này
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 font-medium whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Đang gửi...
              </div>
            ) : (
              'Gửi email khôi phục'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nhớ lại mật khẩu?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">Cần hỗ trợ?</p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                <i className="ri-phone-line mr-1"></i>
                Hotline
              </a>
              <a href="#" className="text-indigo-600 hover:text-indigo-500">
                <i className="ri-mail-line mr-1"></i>
                Email hỗ trợ
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
