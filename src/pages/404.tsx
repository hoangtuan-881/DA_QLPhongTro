
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-search-line text-4xl text-blue-500"></i>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
        
        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Không tìm thấy trang
        </h2>
        
        {/* Error Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển. 
          Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <i className="ri-home-line mr-2"></i>
            Về trang chủ
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Quay lại
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Gợi ý</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                Dashboard
              </button>
              <span>•</span>
              <button
                onClick={() => navigate('/rooms')}
                className="text-blue-600 hover:text-blue-700"
              >
                Quản lý phòng
              </button>
              <span>•</span>
              <button
                onClick={() => navigate('/tenants')}
                className="text-blue-600 hover:text-blue-700"
              >
                Khách thuê
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
