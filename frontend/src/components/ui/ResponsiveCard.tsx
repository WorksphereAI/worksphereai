import React from 'react';
import { motion } from 'framer-motion';

interface ResponsiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'elevated';
  className?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  onClick,
  padding = 'md',
  variant = 'default',
  className = '',
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-5 lg:p-6',
    lg: 'p-5 md:p-6 lg:p-8',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    outlined: 'border border-gray-300 bg-transparent',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow',
  };

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`
        rounded-xl
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
