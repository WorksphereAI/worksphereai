// src/components/auth/PublicRoute.tsx
import React from 'react';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export const MarketingRoute: React.FC<PublicRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default PublicRoute;
