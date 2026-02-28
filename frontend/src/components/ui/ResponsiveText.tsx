import React from 'react';

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'error' | 'success';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'default',
  className = '',
  as: Component = 'div',
}) => {
  const variantClasses = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-medium',
    body: 'text-sm sm:text-base md:text-base',
    small: 'text-xs sm:text-sm md:text-sm',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    primary: 'text-blue-600',
    error: 'text-red-600',
    success: 'text-green-600',
  };

  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${weightClasses[weight]}
        ${colorClasses[color]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};
