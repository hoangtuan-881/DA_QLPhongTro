
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

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
const BookingDeposits = lazy(() => import('../pages/booking-deposits/page'));
const Contracts = lazy(() => import('../pages/contracts/page'));
const Payments = lazy(() => import('../pages/payments/page'));
const Services = lazy(() => import('../pages/services/page'));
const Maintenance = lazy(() => import('../pages/maintenance/page'));
const Equipment = lazy(() => import('../pages/equipment/page'));
const Reports = lazy(() => import('../pages/reports/page'));
const Analytics = lazy(() => import('../pages/analytics/page'));
const Rules = lazy(() => import('../pages/rules/page'));
const RulesViolations = lazy(() => import('../pages/rules-violations/page'));
const Notifications = lazy(() => import('../pages/notifications/page'));
const UserManagement = lazy(() => import('../pages/user-management/page'));
const Settings = lazy(() => import('../pages/settings/page'));
const CustomerDashboard = lazy(() => import('../pages/customer-dashboard/page'));
const AvailableRooms = lazy(() => import('../pages/available-rooms/page'));
const MaintenanceRequest = lazy(() => import('../pages/maintenance-request/page'));
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
    element: <Dashboard />
  },
  {
    path: '/room-types',
    element: <RoomTypes />
  },
  {
    path: '/rooms',
    element: <Rooms />
  },
  {
    path: '/tenants',
    element: <Tenants />
  },
  {
    path: '/bookings',
    element: <Bookings />
  },
  {
    path: '/booking-deposits',
    element: <BookingDeposits />
  },
  {
    path: '/contracts',
    element: <Contracts />
  },
  {
    path: '/payments',
    element: <Payments />
  },
  {
    path: '/services',
    element: <Services />
  },
  {
    path: '/maintenance',
    element: <Maintenance />
  },
  {
    path: '/equipment',
    element: <Equipment />
  },
  {
    path: '/reports',
    element: <Reports />
  },
  {
    path: '/analytics',
    element: <Analytics />
  },
  {
    path: '/rules',
    element: <Rules />
  },
  {
    path: '/rules-violations',
    element: <RulesViolations />
  },
  {
    path: '/notifications',
    element: <Notifications />
  },
  {
    path: '/user-management',
    element: <UserManagement />
  },
  {
    path: '/settings',
    element: <Settings />
  },
  {
    path: '/customer-dashboard',
    element: <CustomerDashboard />
  },
  {
    path: '/available-rooms',
    element: <AvailableRooms />
  },
  {
    path: '/maintenance-request',
    element: <MaintenanceRequest />
  },
  {
    path: '/profile',
    element: <Profile />
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
