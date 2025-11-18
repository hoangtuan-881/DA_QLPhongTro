import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (perPage: number) => void;
  onNext: () => void;
  onPrev: () => void;
  itemLabel?: string; // e.g., "hợp đồng", "thiết bị", "phòng"
  showItemsPerPageSelector?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onNext,
  onPrev,
  itemLabel = 'mục',
  showItemsPerPageSelector = true,
}: PaginationProps) {
  if (totalPages <= 1 && !showItemsPerPageSelector) return null;

  const generatePageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push(-1); // Ellipsis marker
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push(-1); // Ellipsis marker
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200 bg-white">
      {/* Left side - Info and items per page selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">
          Hiển thị <span className="font-medium">{startIndex}</span> đến{' '}
          <span className="font-medium">{endIndex}</span> của{' '}
          <span className="font-medium">{totalItems}</span> {itemLabel}
        </span>

        {showItemsPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Hiển thị:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      {/* Right side - Page navigation */}
      {totalPages > 1 && (
        <div className="flex space-x-2">
          {/* Previous button */}
          <button
            onClick={onPrev}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang trước"
          >
            Trước
          </button>

          {/* Page numbers */}
          {pageNumbers.map((page, index) => {
            if (page === -1) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 text-sm font-medium text-gray-500"
                >
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white'
                    : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                }`}
                aria-label={`Trang ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}

          {/* Next button */}
          <button
            onClick={onNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Trang sau"
          >
            Tiếp
          </button>
        </div>
      )}
    </div>
  );
}
