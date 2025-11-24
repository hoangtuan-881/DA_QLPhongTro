import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Required roles (MaQuyen values)
   * User must have one of these roles to access the route
   */
  allowedRoles: number[];
}

/**
 * RoleProtectedRoute Component
 * Protects routes based on user authentication and role
 *
 * @example
 * // Admin and Staff only
 * <RoleProtectedRoute allowedRoles={[1, 2]}>
 *   <Dashboard />
 * </RoleProtectedRoute>
 *
 * @example
 * // Tenant only
 * <RoleProtectedRoute allowedRoles={[3]}>
 *   <CustomerDashboard />
 * </RoleProtectedRoute>
 */
export default function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return <div>Đang tải...</div>;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.includes(user.MaQuyen);

  if (!hasRequiredRole) {
    // User is authenticated but doesn't have the required role
    // Show 403 Forbidden page
    return <Navigate to="/403" replace />;
  }

  // User is authenticated and has required role
  return <>{children}</>;
}
