// src/components/auth/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean; // If true, authenticated users are redirected
  redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  restricted = false,
  redirectTo = '/dashboard',
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If route is restricted and user is authenticated, redirect
  if (restricted && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Otherwise render the public content
  return <>{children}</>;
};

// Specialized public route components
export const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PublicRoute restricted={true} redirectTo="/dashboard">
    {children}
  </PublicRoute>
);

export const MarketingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PublicRoute restricted={false}>
    {children}
  </PublicRoute>
);
