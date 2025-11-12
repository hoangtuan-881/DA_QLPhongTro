
import { useState } from 'react';
import { useToast } from '../../hooks/useToast';
import ConfirmDialog from '../../components/base/ConfirmDialog';

export default function TestToastPage() {
  const toast = useToast();
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => { }
  });

  const handleSuccessToast = () => {
    toast.success({
      title: 'Thành công!',
      message: 'Dữ liệu đã được lưu thành công vào hệ thống'
    });
  };

  const handleErrorToast = () => {
    toast.error({
      title: 'Lỗi!',
      message: 'Không thể kết nối đến server. Vui lòng thử lại sau'
    });
  };

  const handleWarningToast = () => {
    toast.warning({
      title: 'Cảnh báo!',
      message: 'Vui lòng kiểm tra lại thông tin trước khi tiếp tục'
    });
  };

  const handleInfoToast = () => {
    toast.info({
      title: 'Thông tin',
      message: 'Hệ thống sẽ bảo trì vào 2h sáng ngày mai'
    });
  };

  const handleMultipleToasts = () => {
    toast.success({ title: 'Toast 1', message: 'Thông báo thành công đầu tiên' });
    setTimeout(() => {
      toast.error({ title: 'Toast 2', message: 'Thông báo lỗi thứ hai' });
    }, 500);
    setTimeout(() => {
      toast.warning({ title: 'Toast 3', message: 'Thông báo cảnh báo thứ ba' });
    }, 1000);
    setTimeout(() => {
      toast.info({ title: 'Toast 4', message: 'Thông báo thông tin cuối cùng' });
    }, 1500);
  };

  const handleShortToast = () => {
    toast.success({
      title: 'Ngắn gọn',
      duration: 2000
    });
  };

  const handleLongToast = () => {
    toast.info({
      title: 'Toast dài',
      message: 'Đây là một thông báo rất dài với nhiều thông tin chi tiết để test việc hiển thị nội dung dài trong toast notification system',
      duration: 8000
    });
  };

  // ConfirmDialog test functions
  const handleDangerConfirm = () => {
    setConfirmDialog({
      show: true,
      title: 'Xóa dữ liệu',
      message: 'Bạn có chắc chắn muốn xóa dữ liệu này không? Hành động này không thể hoàn tác.',
      type: 'danger',
      onConfirm: () => {
        toast.success({ title: 'Đã xóa thành công!', message: 'Dữ liệu đã được xóa khỏi hệ thống' });
      }
    });
  };

  const handleWarningConfirm = () => {
    setConfirmDialog({
      show: true,
      title: 'Cảnh báo thay đổi',
      message: 'Thay đổi này có thể ảnh hưởng đến các dữ liệu khác. Bạn có muốn tiếp tục không?',
      type: 'warning',
      onConfirm: () => {
        toast.warning({ title: 'Đã thực hiện thay đổi', message: 'Vui lòng kiểm tra các dữ liệu liên quan' });
      }
    });
  };

  const handleInfoConfirm = () => {
    setConfirmDialog({
      show: true,
      title: 'Xác nhận thông tin',
      message: 'Bạn có muốn lưu thông tin này vào hệ thống không?',
      type: 'info',
      onConfirm: () => {
        toast.info({ title: 'Đã lưu thông tin', message: 'Thông tin đã được cập nhật thành công' });
      }
    });
  };

  const handleComplexConfirm = () => {
    setConfirmDialog({
      show: true,
      title: 'Xác nhận phức tạp',
      message: (
        <div className="space-y-3">
          <p>Bạn đang thực hiện một thao tác quan trọng:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Xóa 15 bản ghi dữ liệu</li>
            <li>Cập nhật 8 bảng liên quan</li>
            <li>Gửi thông báo đến 25 người dùng</li>
          </ul>
          <p className="font-medium text-red-600">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      type: 'danger',
      onConfirm: () => {
        toast.success({
          title: 'Thao tác hoàn thành!',
          message: 'Đã xử lý thành công 15 bản ghi và thông báo 25 người dùng',
          duration: 6000
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Toast & ConfirmDialog</h1>
          <p className="text-gray-600 mb-8">Thử nghiệm các loại thông báo toast và dialog xác nhận</p>

          {/* Basic Toast Types */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Các loại Toast cơ bản</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleSuccessToast}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-check-circle-line mr-2"></i>
                Success Toast
              </button>

              <button
                onClick={handleErrorToast}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-error-warning-line mr-2"></i>
                Error Toast
              </button>

              <button
                onClick={handleWarningToast}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-alert-line mr-2"></i>
                Warning Toast
              </button>

              <button
                onClick={handleInfoToast}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-information-line mr-2"></i>
                Info Toast
              </button>
            </div>
          </div>

          {/* Advanced Toast Tests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Toast nâng cao</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleMultipleToasts}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-stack-line mr-2"></i>
                Nhiều Toast cùng lúc
              </button>

              <button
                onClick={handleShortToast}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-time-line mr-2"></i>
                Toast ngắn (2s)
              </button>

              <button
                onClick={handleLongToast}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-article-line mr-2"></i>
                Toast dài (8s)
              </button>
            </div>
          </div>

          {/* ConfirmDialog Tests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Test ConfirmDialog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleDangerConfirm}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-delete-bin-line mr-2"></i>
                Danger Dialog
              </button>

              <button
                onClick={handleWarningConfirm}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-alert-line mr-2"></i>
                Warning Dialog
              </button>

              <button
                onClick={handleInfoConfirm}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-question-line mr-2"></i>
                Info Dialog
              </button>

              <button
                onClick={handleComplexConfirm}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-settings-line mr-2"></i>
                Complex Dialog
              </button>
            </div>
          </div>

          {/* Toast Usage Examples */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Cách sử dụng Toast</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-white p-4 rounded border-l-4 border-green-500">
                <h3 className="font-semibold text-gray-800 mb-2">Success Toast:</h3>
                <code className="text-green-600">
                  toast.success(&#123; title: 'Thành công!', message: 'Dữ liệu đã được lưu' &#125;);
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <h3 className="font-semibold text-gray-800 mb-2">Error Toast:</h3>
                <code className="text-red-600">
                  toast.error(&#123; title: 'Lỗi!', message: 'Không thể kết nối server' &#125;);
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-800 mb-2">Warning Toast:</h3>
                <code className="text-yellow-600">
                  toast.warning(&#123; title: 'Cảnh báo!', message: 'Kiểm tra lại thông tin' &#125;);
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-2">Info Toast:</h3>
                <code className="text-blue-600">
                  toast.info(&#123; title: 'Thông tin', message: 'Hệ thống bảo trì' &#125;);
                </code>
              </div>
            </div>
          </div>

          {/* ConfirmDialog Usage Examples */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Cách sử dụng ConfirmDialog</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <h3 className="font-semibold text-gray-800 mb-2">Danger Dialog (Xóa dữ liệu):</h3>
                <code className="text-red-600 block whitespace-pre-wrap">
                  {`setConfirmDialog({
  show: true,
  title: 'Xóa dữ liệu',
  message: 'Bạn có chắc chắn muốn xóa?',
  type: 'danger',
  onConfirm: () => { /* xử lý xóa */ }
});`}
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-yellow-500">
                <h3 className="font-semibold text-gray-800 mb-2">Warning Dialog (Cảnh báo):</h3>
                <code className="text-yellow-600 block whitespace-pre-wrap">
                  {`setConfirmDialog({
  show: true,
  title: 'Cảnh báo',
  message: 'Thay đổi có thể ảnh hưởng dữ liệu khác',
  type: 'warning',
  onConfirm: () => { /* xử lý thay đổi */ }
});`}
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <h3 className="font-semibold text-gray-800 mb-2">Info Dialog (Xác nhận):</h3>
                <code className="text-blue-600 block whitespace-pre-wrap">
                  {`setConfirmDialog({
  show: true,
  title: 'Xác nhận',
  message: 'Bạn có muốn lưu thông tin?',
  type: 'info',
  onConfirm: () => { /* xử lý lưu */ }
});`}
                </code>
              </div>

              <div className="bg-white p-4 rounded border-l-4 border-gray-500">
                <h3 className="font-semibold text-gray-800 mb-2">Complex Message (JSX):</h3>
                <code className="text-gray-600 block whitespace-pre-wrap">
                  {`message: (
  <div>
    <p>Nội dung phức tạp:</p>
    <ul>
      <li>Mục 1</li>
      <li>Mục 2</li>
    </ul>
  </div>
)`}
                </code>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-green-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Tính năng Toast & ConfirmDialog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-green-700 mb-3">Toast Features:</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Tự động đóng sau 5 giây
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Đóng thủ công bằng nút X
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    4 loại với màu sắc khác nhau
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Hiển thị nhiều toast cùng lúc
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Tùy chỉnh thời gian hiển thị
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-green-700 mb-3">ConfirmDialog Features:</h3>
                <div className="space-y-2 text-sm text-green-700">
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    3 loại: danger, warning, info
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Hỗ trợ message dạng JSX
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Tùy chỉnh text nút xác nhận/hủy
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Loading state khi xử lý
                  </div>
                  <div className="flex items-center">
                    <i className="ri-check-line text-green-500 mr-2"></i>
                    Icon và màu sắc theo loại
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ConfirmDialog Component */}
      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog({ ...confirmDialog, show: false });
        }}
        onClose={() => setConfirmDialog({ ...confirmDialog, show: false })}
      />
    </div>
  );
}
