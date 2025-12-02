
import { lazy } from 'react';
import { type RouteObject } from "react-router-dom"
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

// Lazy load components
const Home = lazy(() => import('../pages/home/page'));
const Login = lazy(() => import('../pages/login/page'));
const Register = lazy(() => import('../pages/register/page'));
const ForgotPassword = lazy(() => import('../pages/forgot-password/page'));
const Dashboard = lazy(() => import('../pages/dashboard/page'));
const RoomTypes = lazy(() => import('../pages/room-types/page'));
const Rooms = lazy(() => import('../pages/rooms/page'));
const Tenants = lazy(() => import('../pages/tenants/page'));
const Bookings = lazy(() => import('../pages/bookings/page'));
const Contracts = lazy(() => import('../pages/contracts/page'));
const Payments = lazy(() => import('../pages/payments/page'));
const Services = lazy(() => import('../pages/services/page'));
const Maintenance = lazy(() => import('../pages/maintenance/page'));
const Equipment = lazy(() => import('../pages/equipment/page'));
const Reports = lazy(() => import('../pages/reports/page'));
const Rules = lazy(() => import('../pages/rules/page'));
const Notifications = lazy(() => import('../pages/notifications/page'));
const UserManagement = lazy(() => import('../pages/user-management/page'));
const Settings = lazy(() => import('../pages/settings/page'));
const CustomerDashboard = lazy(() => import('../pages/customer-dashboard/page'));
const AvailableRooms = lazy(() => import('../pages/available-rooms/page'));
const Profile = lazy(() => import('../pages/profile/page'));
const TestToast = lazy(() => import('../pages/test-toast/page'));
const Forbidden = lazy(() => import('../pages/403'));
const PageNotFound = lazy(() => import('../pages/404'));
const Employees = lazy(() => import('../pages/employee-management/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/register',
    element: <Register />
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />
  },
  {
    path: '/dashboard',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Dashboard /></RoleProtectedRoute>
  },
  {
    path: '/room-types',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><RoomTypes /></RoleProtectedRoute>
  },
  {
    path: '/rooms',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Rooms /></RoleProtectedRoute>
  },
  {
    path: '/tenants',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Tenants /></RoleProtectedRoute>
  },
  {
    path: '/bookings',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Bookings /></RoleProtectedRoute>
  },
  {
    path: '/contracts',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Contracts /></RoleProtectedRoute>
  },
  {
    path: '/payments',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Payments /></RoleProtectedRoute>
  },
  {
    path: '/services',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Services /></RoleProtectedRoute>
  },
  {
    path: '/maintenance',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Maintenance /></RoleProtectedRoute>
  },
  {
    path: '/equipment',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Equipment /></RoleProtectedRoute>
  },
  {
    path: '/reports',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Reports /></RoleProtectedRoute>
  },
  {
    path: '/rules',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Rules /></RoleProtectedRoute>
  },
  {
    path: '/notifications',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Notifications /></RoleProtectedRoute>
  },
  {
    path: '/user-management',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><UserManagement /></RoleProtectedRoute>
  },
  {
    path: '/settings',
    element: <RoleProtectedRoute allowedRoles={[1, 2]}><Settings /></RoleProtectedRoute>
  },
  {
    path: '/customer-dashboard',
    element: <RoleProtectedRoute allowedRoles={[3]}><CustomerDashboard /></RoleProtectedRoute>
  },
  {
    path: '/available-rooms',
    element: <AvailableRooms />
  },
  {
    path: '/profile',
    element: <ProtectedRoute><Profile /></ProtectedRoute>
  },
  {
    path: '/customer-dashboard/profile',
    element: <RoleProtectedRoute allowedRoles={[3]}><Profile /></RoleProtectedRoute>
  },
  {
    path: '/test-toast',
    element: <TestToast />
  },
  {
    path: '/403',
    element: <Forbidden />
  },
  {
    path: '*',
    element: <PageNotFound />
  },
  {
    path: '/employees',
    element: (
      <RoleProtectedRoute allowedRoles={[1, 2]}>
        <Employees />
      </RoleProtectedRoute>
    )
  },
];

export default routes;
