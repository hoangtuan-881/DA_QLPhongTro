/**
 * Custom hook to set document title
 * Automatically appends " - Quản Lý Phòng Trọ" to page title
 */

import { useEffect } from 'react';

export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;

    // Set new title with app name suffix
    document.title = title ? `${title} - Quản Lý Phòng Trọ` : 'Quản Lý Phòng Trọ';

    // Cleanup: restore previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}

export default useDocumentTitle;
