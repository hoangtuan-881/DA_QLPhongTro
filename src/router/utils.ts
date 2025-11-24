/**
 * Router utilities
 * Helper functions for routing logic
 */

import { User } from '@/services/auth.service';

/**
 * Get default route for user based on their role (MaQuyen)
 * @param user - User object with MaQuyen property
 * @returns Default route path
 */
export function getDefaultRouteForRole(user: User | null): string {
  if (!user) {
    return '/';
  }

  switch (user.MaQuyen) {
    case 1: // Admin
    case 2: // Staff
      return '/dashboard';
    case 3: // Khách thuê
      return '/customer-dashboard';
    default:
      return '/';
  }
}

/**
 * Check if user can access admin routes
 * @param user - User object
 * @returns true if user is admin or staff
 */
export function canAccessAdminRoutes(user: User | null): boolean {
  if (!user) return false;
  return user.MaQuyen === 1 || user.MaQuyen === 2;
}

/**
 * Check if user can access customer routes
 * @param user - User object
 * @returns true if user is tenant
 */
export function canAccessCustomerRoutes(user: User | null): boolean {
  if (!user) return false;
  return user.MaQuyen === 3;
}
