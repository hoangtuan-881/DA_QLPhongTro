/**
 * Protected Route Component
 * Chỉ cho phép user đã đăng nhập truy cập
 */

import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: number; // MaQuyen required (1=Admin, 2=Staff, 3=Tenant)
  allowedRoles?: number[]; // Multiple roles allowed
}

export default function ProtectedRoute({
  children,
  requiredRole,
  allowedRoles
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, user, hasRole, hasAnyRole } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-indigo-600 animate-spin mb-4"></i>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/403" replace />;
  }

  // Check multiple roles if specified
  if (allowedRoles && !hasAnyRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

/**
 * Admin Only Route
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole={1}>{children}</ProtectedRoute>;
}

/**
 * Staff Only Route (Admin + Staff)
 */
export function StaffRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute allowedRoles={[1, 2]}>{children}</ProtectedRoute>;
}

/**
 * Tenant Only Route
 */
export function TenantRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole={3}>{children}</ProtectedRoute>;
}
