
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRouteForRole } from '@/router/utils';

export default function Forbidden() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <i className="ri-shield-cross-line text-4xl text-red-500"></i>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
        
        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Truy cập bị từ chối
        </h2>
        
        {/* Error Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên 
          để được cấp quyền hoặc quay lại trang chủ.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => {
              const defaultRoute = getDefaultRouteForRole(user);
              navigate(defaultRoute);
            }}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
          >
            <i className="ri-home-line mr-2"></i>
            {user ? 'Về trang chính' : 'Về trang chủ'}
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Quay lại
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Cần hỗ trợ?</h3>
          <p className="text-sm text-gray-600">
            Liên hệ quản trị viên: 
            <a href="mailto:admin@example.com" className="text-red-600 hover:text-red-700 ml-1">
              admin@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
