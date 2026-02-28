import React, { useState } from 'react';
import { registerButton, recordTestResult } from '../../utils/buttonInventory';
import { useAuth } from '../../contexts/AuthContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface ButtonTestWrapperProps {
  children: React.ReactElement;
  buttonId: string;
  component: string;
  text: string;
  action: string;
  requiredRole?: string[];
  requiresAuth?: boolean;
  apiEndpoint?: string;
  expectedBehavior: string;
  onClick?: () => void | Promise<void>;
}

export const ButtonTestWrapper: React.FC<ButtonTestWrapperProps> = ({
  children,
  buttonId,
  component,
  text,
  action,
  requiredRole,
  requiresAuth = true,
  apiEndpoint,
  expectedBehavior,
  onClick
}) => {
  const { user, isAuthenticated, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const screenSize = useMediaQuery('(max-width: 640px)') ? 'mobile' : 
                     useMediaQuery('(max-width: 1024px)') ? 'tablet' : 'desktop';

  // Register button on mount
  React.useEffect(() => {
    registerButton({
      id: buttonId,
      path: window.location.pathname,
      component,
      text,
      type: children.type === 'button' ? 'button' : 
            children.type === 'a' ? 'link' : 'icon',
      action,
      requiredRole,
      requiresAuth,
      apiEndpoint,
      expectedBehavior,
      tested: false,
      working: true
    });
  }, []);

  // Check permissions
  const hasPermission = !requiresAuth || (isAuthenticated && (!requiredRole || hasRole(requiredRole)));

  const handleClick = async (e: React.MouseEvent) => {
    if (!hasPermission) {
      e.preventDefault();
      const error = 'Insufficient permissions';
      setError(error);
      recordTestResult({
        buttonId,
        timestamp: new Date().toISOString(),
        success: false,
        error,
        screenSize,
        userRole: user?.role
      });
      return;
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      if (onClick) {
        await onClick();
      } else if (children.props.onClick) {
        await children.props.onClick(e);
      }

      const endTime = performance.now();
      
      recordTestResult({
        buttonId,
        timestamp: new Date().toISOString(),
        success: true,
        actualBehavior: `Completed in ${(endTime - startTime).toFixed(0)}ms`,
        screenSize,
        userRole: user?.role
      });

    } catch (err: any) {
      const error = err.message || 'Button click failed';
      setError(error);
      recordTestResult({
        buttonId,
        timestamp: new Date().toISOString(),
        success: false,
        error,
        screenSize,
        userRole: user?.role
      });
    } finally {
      setLoading(false);
    }
  };

  // Clone child with additional props
  const enhancedChild = React.cloneElement(children, {
    onClick: handleClick,
    disabled: children.props.disabled || loading || !hasPermission,
    'data-testid': buttonId,
    'data-loading': loading,
    'data-error': error,
    'data-permission': hasPermission,
    className: `${children.props.className || ''} ${loading ? 'opacity-50 cursor-wait' : ''} ${error ? 'border-red-500' : ''}`
  });

  return (
    <>
      {enhancedChild}
      {error && process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-red-500 mt-1">{error}</div>
      )}
    </>
  );
};
