import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  ProtectedRoute, 
  AdminRoute, 
  ManagerRoute, 
  EmployeeRoute, 
  CustomerRoute,
  EnterpriseRoute
} from './components/auth/ProtectedRoute';
import { 
  AuthRoute,
  MarketingRoute 
} from './components/auth/PublicRoute';
import { ROUTES } from './config/routes';

// Public Components
import { HomePage } from './pages/public/HomePage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { PricingPage } from './pages/public/PricingPage';

// Auth Components
import { SignupPage } from './components/auth/SignupPage';
import { ProfessionalAuth } from './components/auth/ProfessionalAuth';

// Protected Components
import { Dashboard } from './components/Dashboard';

// Dashboard wrapper to handle user prop
const DashboardWrapper: React.FC = () => {
  const { user } = useAuth();
  return <Dashboard user={user} />;
};

// Error Pages
import { UnauthorizedPage } from './pages/errors/UnauthorizedPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========== PUBLIC ROUTES (No Auth Required) ========== */}
          
          {/* Marketing Pages */}
          <Route path={ROUTES.public.home} element={<MarketingRoute><HomePage /></MarketingRoute>} />
          <Route path={ROUTES.public.features} element={<MarketingRoute><FeaturesPage /></MarketingRoute>} />
          <Route path={ROUTES.public.pricing} element={<MarketingRoute><PricingPage /></MarketingRoute>} />
          
          {/* Auth Routes (Redirect if authenticated) */}
          <Route path={ROUTES.public.signup} element={<AuthRoute><SignupPage /></AuthRoute>} />
          <Route path={ROUTES.public.login} element={<AuthRoute><ProfessionalAuth onAuth={() => {}} /></AuthRoute>} />
          
          {/* Legacy route redirects */}
          <Route path="/signin" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/register" element={<Navigate to={ROUTES.public.signup} replace />} />
          <Route path="/signup/enterprise" element={<Navigate to={ROUTES.public.signup} replace />} />
          <Route path="/signup/individual" element={<Navigate to={ROUTES.public.signup} replace />} />
          <Route path="/signup/customer" element={<Navigate to={ROUTES.public.signup} replace />} />
          <Route path="/verify-email" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/verify" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/onboarding" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/setup" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/reset-password" element={<Navigate to={ROUTES.public.login} replace />} />
          <Route path="/forgot-password" element={<Navigate to={ROUTES.public.login} replace />} />
          
          {/* ========== PROTECTED ROUTES (Auth Required) ========== */}
          
          {/* Main Dashboard */}
          <Route path={ROUTES.protected.dashboard} element={<ProtectedRoute><DashboardWrapper /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path={ROUTES.protected.admin} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          <Route path={ROUTES.protected.adminUsers} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          <Route path={ROUTES.protected.adminOrganizations} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          <Route path={ROUTES.protected.adminSubscriptions} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          <Route path={ROUTES.protected.adminAnalytics} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          <Route path={ROUTES.protected.adminSettings} element={<AdminRoute><DashboardWrapper /></AdminRoute>} />
          
          {/* Organization Routes */}
          <Route path={ROUTES.protected.team} element={<ManagerRoute><DashboardWrapper /></ManagerRoute>} />
          <Route path={ROUTES.protected.departments} element={<ManagerRoute><DashboardWrapper /></ManagerRoute>} />
          <Route path={ROUTES.protected.approvals} element={<ManagerRoute><DashboardWrapper /></ManagerRoute>} />
          <Route path={ROUTES.protected.analytics} element={<ManagerRoute><DashboardWrapper /></ManagerRoute>} />
          
          {/* User Routes */}
          <Route path={ROUTES.protected.profile} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          <Route path={ROUTES.protected.settings} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          <Route path={ROUTES.protected.messages} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          <Route path={ROUTES.protected.tasks} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          <Route path={ROUTES.protected.documents} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          <Route path={ROUTES.protected.calendar} element={<EmployeeRoute><DashboardWrapper /></EmployeeRoute>} />
          
          {/* Customer Portal */}
          <Route path={ROUTES.protected.customerPortal} element={<CustomerRoute><DashboardWrapper /></CustomerRoute>} />
          <Route path={ROUTES.protected.customerTickets} element={<CustomerRoute><DashboardWrapper /></CustomerRoute>} />
          <Route path={ROUTES.protected.customerDocuments} element={<CustomerRoute><DashboardWrapper /></CustomerRoute>} />
          <Route path={ROUTES.protected.customerMessages} element={<CustomerRoute><DashboardWrapper /></CustomerRoute>} />
          
          {/* Enterprise Routes */}
          <Route path={ROUTES.protected.whiteLabel} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.whiteLabelSettings} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.whiteLabelTheme} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.whiteLabelDomain} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.enterpriseSettings} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.enterpriseBilling} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.enterpriseApi} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          <Route path={ROUTES.protected.enterpriseAudit} element={<EnterpriseRoute><DashboardWrapper /></EnterpriseRoute>} />
          
          {/* Legacy protected routes - redirect to dashboard */}
          <Route path="/app" element={<Navigate to={ROUTES.protected.dashboard} replace />} />
          <Route path="/customer-portal" element={<Navigate to={ROUTES.protected.customerPortal} replace />} />
          
          {/* ========== ERROR PAGES ========== */}
          
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Temporary ServerErrorPage component
const ServerErrorPage: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Server Error</h1>
      <p className="text-gray-600 mb-8">Something went wrong. Please try again later.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export default App;
