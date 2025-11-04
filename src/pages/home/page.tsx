
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <i className="ri-home-4-fill text-white text-lg"></i>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Quản lý phòng trọ</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 whitespace-nowrap"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Hệ thống quản lý
              <span className="text-indigo-600 block">phòng trọ thông minh</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Giải pháp toàn diện cho việc quản lý phòng trọ, từ đặt phòng, thanh toán đến bảo trì và báo cáo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700 transition duration-200 whitespace-nowrap"
              >
                Bắt đầu ngay
              </Link>
              <Link 
                to="/dashboard" 
                className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-50 transition duration-200 whitespace-nowrap"
              >
                Demo quản trị viên
              </Link>
              <Link 
                to="/customer-dashboard" 
                className="border border-gray-400 text-gray-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition duration-200 whitespace-nowrap"
              >
                Demo khách hàng
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600">Quản lý phòng trọ chưa bao giờ dễ dàng đến thế</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: 'ri-home-4-line',
                title: 'Quản lý phòng',
                description: 'Theo dõi tình trạng phòng, thiết bị và thông tin chi tiết'
              },
              {
                icon: 'ri-user-line',
                title: 'Quản lý khách thuê',
                description: 'Lưu trữ thông tin khách thuê, lịch sử thuê và liên hệ'
              },
              {
                icon: 'ri-calendar-line',
                title: 'Đặt phòng online',
                description: 'Hệ thống đặt phòng và giữ chỗ trực tuyến tiện lợi'
              },
              {
                icon: 'ri-money-dollar-circle-line',
                title: 'Thanh toán tự động',
                description: 'Tính toán tiền điện nước, gửi thông báo thanh toán'
              },
              {
                icon: 'ri-tools-line',
                title: 'Quản lý bảo trì',
                description: 'Theo dõi yêu cầu sửa chữa và lịch bảo trì thiết bị'
              },
              {
                icon: 'ri-bar-chart-line',
                title: 'Báo cáo thống kê',
                description: 'Báo cáo doanh thu, tỷ lệ lấp đầy và các chỉ số quan trọng'
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl border border-gray-200 hover:shadow-lg transition duration-200">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${feature.icon} text-2xl text-indigo-600`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Sẵn sàng bắt đầu quản lý phòng trọ hiệu quả?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Tham gia cùng hàng nghìn chủ trọ đang sử dụng hệ thống của chúng tôi
          </p>
          <Link 
            to="/register" 
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition duration-200 inline-block whitespace-nowrap"
          >
            Đăng ký miễn phí
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <i className="ri-home-4-fill text-white text-lg"></i>
                </div>
                <span className="ml-3 text-xl font-bold">Phòng trọ</span>
              </div>
              <p className="text-gray-400">
                Hệ thống quản lý phòng trọ thông minh và hiệu quả
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Quản lý phòng</a></li>
                <li><a href="#" className="hover:text-white">Thanh toán</a></li>
                <li><Link to="/test-toast" className="hover:text-white">Báo cáo</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">Hướng dẫn</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@phongtro.com</li>
                <li>Hotline: 1900 1234</li>
                <li>Địa chỉ: 123 Đường ABC, TP.HCM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Hệ thống quản lý phòng trọ. All rights reserved. | <a href="https://readdy.ai/?origin=logo" className="hover:text-white">Powered by Readdy</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
