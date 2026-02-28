import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PageTransition } from './hooks/useAppleAnimation';
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

// Error Pages
import { UnauthorizedPage } from './pages/errors/UnauthorizedPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

// Dashboard wrapper to handle user prop
const DashboardWrapper: React.FC = () => {
  const { user } = useAuth();
  return <Dashboard user={user} />;
};

// Error page component
const ServerErrorPage: React.FC = () => (
  <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="text-center max-w-md mx-auto p-8"
    >
      <h1 className="text-4xl font-semibold font-display text-[var(--text-primary)] mb-4">
        Server Error
      </h1>
      <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
        Something went wrong. Please try again later.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-[var(--apple-blue)] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0066CC] transition-colors shadow-sm hover:shadow-md"
      >
        Refresh Page
      </button>
    </motion.div>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AnimatePresence mode="wait">
          <Routes>
            {/* ========== PUBLIC ROUTES (No Auth Required) ========== */}
            
            {/* Marketing Pages */}
            <Route path={ROUTES.public.home} element={
              <MarketingRoute>
                <PageTransition>
                  <HomePage />
                </PageTransition>
              </MarketingRoute>
            } />
            <Route path={ROUTES.public.features} element={
              <MarketingRoute>
                <PageTransition>
                  <FeaturesPage />
                </PageTransition>
              </MarketingRoute>
            } />
            <Route path={ROUTES.public.pricing} element={
              <MarketingRoute>
                <PageTransition>
                  <PricingPage />
                </PageTransition>
              </MarketingRoute>
            } />
            
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
            <Route path={ROUTES.protected.dashboard} element={
              <ProtectedRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path={ROUTES.protected.admin} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            <Route path={ROUTES.protected.adminUsers} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            <Route path={ROUTES.protected.adminOrganizations} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            <Route path={ROUTES.protected.adminSubscriptions} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            <Route path={ROUTES.protected.adminAnalytics} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            <Route path={ROUTES.protected.adminSettings} element={
              <AdminRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </AdminRoute>
            } />
            
            {/* Organization Routes */}
            <Route path={ROUTES.protected.team} element={
              <ManagerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </ManagerRoute>
            } />
            <Route path={ROUTES.protected.departments} element={
              <ManagerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </ManagerRoute>
            } />
            <Route path={ROUTES.protected.approvals} element={
              <ManagerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </ManagerRoute>
            } />
            <Route path={ROUTES.protected.analytics} element={
              <ManagerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </ManagerRoute>
            } />
            
            {/* User Routes */}
            <Route path={ROUTES.protected.profile} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            <Route path={ROUTES.protected.settings} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            <Route path={ROUTES.protected.messages} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            <Route path={ROUTES.protected.tasks} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            <Route path={ROUTES.protected.documents} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            <Route path={ROUTES.protected.calendar} element={
              <EmployeeRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EmployeeRoute>
            } />
            
            {/* Customer Portal */}
            <Route path={ROUTES.protected.customerPortal} element={
              <CustomerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </CustomerRoute>
            } />
            <Route path={ROUTES.protected.customerTickets} element={
              <CustomerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </CustomerRoute>
            } />
            <Route path={ROUTES.protected.customerDocuments} element={
              <CustomerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </CustomerRoute>
            } />
            <Route path={ROUTES.protected.customerMessages} element={
              <CustomerRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </CustomerRoute>
            } />
            
            {/* Enterprise Routes */}
            <Route path={ROUTES.protected.whiteLabel} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.whiteLabelSettings} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.whiteLabelTheme} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.whiteLabelDomain} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.enterpriseSettings} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.enterpriseBilling} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.enterpriseApi} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            <Route path={ROUTES.protected.enterpriseAudit} element={
              <EnterpriseRoute>
                <PageTransition>
                  <DashboardWrapper />
                </PageTransition>
              </EnterpriseRoute>
            } />
            
            {/* Legacy protected routes - redirect to dashboard */}
            <Route path="/app" element={<Navigate to={ROUTES.protected.dashboard} replace />} />
            <Route path="/customer-portal" element={<Navigate to={ROUTES.protected.customerPortal} replace />} />
            
            {/* ========== ERROR PAGES ========== */}
            
            <Route path="/unauthorized" element={
              <PageTransition>
                <UnauthorizedPage />
              </PageTransition>
            } />
            <Route path="/500" element={
              <PageTransition>
                <ServerErrorPage />
              </PageTransition>
            } />
            <Route path="*" element={
              <PageTransition>
                <NotFoundPage />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
