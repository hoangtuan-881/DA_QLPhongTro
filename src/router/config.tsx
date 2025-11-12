
import { lazy } from 'react';
import { type RouteObject } from "react-router-dom"
import ProtectedRoute from './ProtectedRoute';

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
const NotFound = lazy(() => import('../pages/NotFound'));
const Forbidden = lazy(() => import('../pages/403'));
const PageNotFound = lazy(() => import('../pages/404'));

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
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  {
    path: '/room-types',
    element: <ProtectedRoute><RoomTypes /></ProtectedRoute>
  },
  {
    path: '/rooms',
    element: <ProtectedRoute><Rooms /></ProtectedRoute>
  },
  {
    path: '/tenants',
    element: <ProtectedRoute><Tenants /></ProtectedRoute>
  },
  {
    path: '/bookings',
    element: <ProtectedRoute><Bookings /></ProtectedRoute>
  },
  {
    path: '/contracts',
    element: <ProtectedRoute><Contracts /></ProtectedRoute>
  },
  {
    path: '/payments',
    element: <ProtectedRoute><Payments /></ProtectedRoute>
  },
  {
    path: '/services',
    element: <ProtectedRoute><Services /></ProtectedRoute>
  },
  {
    path: '/maintenance',
    element: <ProtectedRoute><Maintenance /></ProtectedRoute>
  },
  {
    path: '/equipment',
    element: <ProtectedRoute><Equipment /></ProtectedRoute>
  },
  {
    path: '/reports',
    element: <ProtectedRoute><Reports /></ProtectedRoute>
  },
  {
    path: '/rules',
    element: <ProtectedRoute><Rules /></ProtectedRoute>
  },
  {
    path: '/notifications',
    element: <ProtectedRoute><Notifications /></ProtectedRoute>
  },
  {
    path: '/user-management',
    element: <ProtectedRoute><UserManagement /></ProtectedRoute>
  },
  {
    path: '/settings',
    element: <ProtectedRoute><Settings /></ProtectedRoute>
  },
  {
    path: '/customer-dashboard',
    element: <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
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
    path: '/test-toast',
    element: <TestToast />
  },
  {
    path: '/403',
    element: <Forbidden />
  },
  {
    path: '/404',
    element: <PageNotFound />
  },
  {
    path: '*',
    element: <NotFound />
  }
];

export default routes;
