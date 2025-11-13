import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      <p className="ml-4 text-gray-600">Đang tải dữ liệu...</p>
    </div>
  );
};

export default LoadingSpinner;
