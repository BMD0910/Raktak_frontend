import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import VendorRoute from './VendorRoute';
import ClientRoute from './ClientRoute';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = lazy(() => import('../pages/HomePage'));
const CategoriesPage = lazy(() => import('../pages/CategoriesPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const FaqPage = lazy(() => import('../pages/FaqPage'));
const ListingPage = lazy(() => import('../pages/ListingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const PricingPage = lazy(() => import('../pages/PricingPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const RegisterAdvertiserPage = lazy(() => import('../pages/RegisterAdvertiserPage'));
const RegisterClientPage = lazy(() => import('../pages/RegisterClientPage'));
const RegisterVendorPage = lazy(() => import('../pages/RegisterVendorPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const SearchPage = lazy(() => import('../pages/SearchPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const DashboardAdminPage = lazy(() => import('../pages/DashboardAdminPage'));
const AdminSubscriptionPlansPage = lazy(() => import('../pages/AdminSubscriptionPlansPage'));
const AdminSubscribersPage = lazy(() => import('../pages/AdminSubscribersPage'));
const AdminDashboardLayout = lazy(() => import('../components/layout/AdminDashboardLayout'));
const AdminMainDashboard = lazy(() => import('../pages/AdminMainDashboard'));
const AdminVendorsList = lazy(() => import('../pages/AdminVendorsList'));
const AdminClientsList = lazy(() => import('../pages/AdminClientsList'));
const AdminServicesList = lazy(() => import('../pages/AdminServicesList'));
const AdminSettings = lazy(() => import('../pages/AdminSettings'));
const AdminsManagement = lazy(() => import('../pages/AdminsManagement'));
const AdminAuditPage = lazy(() => import('../pages/AdminAuditPage'));
const AdminRequestsPage = lazy(() => import('../pages/AdminRequestsPage'));
const DashboardAdvertiserPage = lazy(() => import('../pages/DashboardAdvertiserPage'));
const DashboardVendorPage = lazy(() => import('../pages/DashboardVendorPage'));
const OAuth2SuccessPage = lazy(() => import('../pages/OAuth2SuccessPage'));
const VendorsPage = lazy(() => import('../pages/VendorsPage'));
const VendorDetailPage = lazy(() => import('../pages/VendorDetailPage'));
const ServicesPage = lazy(() => import('../pages/ServicesPage'));
const NewRequestPage = lazy(() => import('../pages/NewRequestPage'));
const BecomeVendorPage = lazy(() => import('../pages/BecomeVendorPage'));
const CreateServicePage = lazy(() => import('../pages/CreateServicePage'));
const DashboardRedirectPage = lazy(() => import('../pages/DashboardRedirectPage'));
const ClientAccountPage = lazy(() => import('../pages/ClientAccountPage'));
const ClientRequestsPage = lazy(() => import('../pages/ClientRequestsPage'));
const ClientProfilePage = lazy(() => import('../pages/ClientProfilePage'));
const VendorSetupProfilePage = lazy(() => import('../pages/VendorSetupProfilePage'));
const VendorServicesPage = lazy(() => import('../pages/VendorServicesPage'));
const VendorProfilePage = lazy(() => import('../pages/VendorProfilePage'));
const VendorSubscriptionPage = lazy(() => import('../pages/VendorSubscriptionPage'));
const VendorServiceDetailPage = lazy(() => import('../pages/VendorServiceDetailPage'));
const VendorOrdersPage = lazy(() => import('../pages/VendorOrdersPage'));
const ConversationPage = lazy(() => import('../pages/ConversationPage'));
const VendorDashboardLayout = lazy(() => import('../components/layout/VendorDashboardLayout'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

function withSuspense(element) {
  return <Suspense fallback={<LoadingSpinner />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: withSuspense(<HomePage />) },
      { path: '/home', element: withSuspense(<HomePage />) },
      { path: '/listing', element: withSuspense(<ListingPage />) },
      { path: '/search', element: withSuspense(<SearchPage />) },
      { path: '/vendors', element: withSuspense(<VendorsPage />) },
      { path: '/vendors/:id', element: withSuspense(<VendorDetailPage />) },
      { path: '/services', element: withSuspense(<ServicesPage />) },
      { path: '/new-request', element: withSuspense(<NewRequestPage />) },
      { path: '/profile', element: withSuspense(<ProfilePage />) },
      { path: '/categories', element: withSuspense(<CategoriesPage />) },
      { path: '/contact', element: withSuspense(<ContactPage />) },
      { path: '/faq', element: withSuspense(<FaqPage />) },
      { path: '/pricing', element: withSuspense(<PricingPage />) },
      { path: '/privacy', element: withSuspense(<PrivacyPage />) },
      { path: '/terms', element: withSuspense(<TermsPage />) }
    ]
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterClientPage />) },
      { path: '/register-client', element: withSuspense(<RegisterClientPage />) },
      { path: '/register-vendor', element: withSuspense(<RegisterVendorPage />) },
      { path: '/register-advertiser', element: withSuspense(<RegisterAdvertiserPage />) },
      { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: '/oauth2/success', element: withSuspense(<OAuth2SuccessPage />) }
    ]
  },
  {
    element: <PrivateRoute><ClientRoute><MainLayout /></ClientRoute></PrivateRoute>,
    children: [
      { path: '/account', element: withSuspense(<ClientAccountPage />) },
      { path: '/account/requests', element: withSuspense(<ClientRequestsPage />) },
      { path: '/account/profile', element: withSuspense(<ClientProfilePage />) }
    ]
  },
  {
    element: <PrivateRoute><ClientRoute><MainLayout /></ClientRoute></PrivateRoute>,
    children: [
      { path: '/account/conversation', element: withSuspense(<ConversationPage />) }
    ]
  },
  {
    element: <PrivateRoute><DashboardLayout /></PrivateRoute>,
    children: [
      { path: '/dashboard', element: withSuspense(<DashboardRedirectPage />) },
      {
        path: '/dashboard/vendor',
        element: withSuspense(
          <VendorRoute>
            <VendorDashboardLayout />
          </VendorRoute>
        ),
        children: [
          { index: true, element: withSuspense(<DashboardVendorPage />) },
          { path: 'services', element: withSuspense(<VendorServicesPage />) },
          { path: 'services/:id', element: withSuspense(<VendorServiceDetailPage />) },
          { path: 'profile', element: withSuspense(<VendorProfilePage />) },
          { path: 'subscription', element: withSuspense(<VendorSubscriptionPage />) },
          { path: 'orders', element: withSuspense(<VendorOrdersPage />) },
          { path: 'conversation', element: withSuspense(<ConversationPage />) },
          {
            path: 'create-service',
            element: withSuspense(
              <VendorRoute requireServiceReady>
                <CreateServicePage />
              </VendorRoute>
            )
          }
        ]
      },
      {
        path: '/dashboard/admin',
        element: withSuspense(
          <AdminRoute>
            <AdminDashboardLayout />
          </AdminRoute>
        ),
        children: [
          { index: true, element: withSuspense(<AdminMainDashboard />) },
          { path: 'vendors', element: withSuspense(<AdminVendorsList />) },
          { path: 'clients', element: withSuspense(<AdminClientsList />) },
          { path: 'services', element: withSuspense(<AdminServicesList />) },
          { path: 'requests', element: withSuspense(<AdminRequestsPage />) },
          { path: 'settings', element: withSuspense(<AdminSettings />) },
          { path: 'admins', element: withSuspense(<AdminsManagement />) },
          { path: 'plans', element: withSuspense(<AdminSubscriptionPlansPage />) },
          { path: 'subscribers', element: withSuspense(<AdminSubscribersPage />) },
          { path: 'audit', element: withSuspense(<AdminAuditPage />) }
        ]
      }
    ]
  },
  {
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      { path: '/dashboard/client', element: <Navigate to="/account" replace /> },
      {
        path: '/vendor/setup-profile',
        element: withSuspense(
          <VendorRoute requireSubscribed>
            <VendorSetupProfilePage />
          </VendorRoute>
        )
      },
      { path: '/dashboard-advertiser', element: withSuspense(<DashboardAdvertiserPage />) },
      { path: '/become-vendor', element: withSuspense(<BecomeVendorPage />) },
      {
        path: '/create-service',
        element: withSuspense(
          <VendorRoute requireServiceReady>
            <CreateServicePage />
          </VendorRoute>
        )
      }
    ]
  },
  { path: '*', element: withSuspense(<NotFoundPage />) }
]);
