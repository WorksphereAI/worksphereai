import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AppleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'glass' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const AppleButton: React.FC<AppleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl backdrop-blur-sm';
  
  const variants = {
    primary: 'bg-[#007AFF] text-white hover:bg-[#0066CC] active:bg-[#0055B3] focus:ring-[#007AFF] shadow-sm hover:shadow-md border border-transparent',
    secondary: 'bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] active:bg-[#D1D1D6] focus:ring-[#8E8E93] border border-[#D1D1D6]',
    tertiary: 'bg-transparent text-[#007AFF] hover:bg-[#F2F2F7] active:bg-[#E5E5EA] focus:ring-[#007AFF] border border-transparent',
    glass: 'bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30 active:bg-white/40 focus:ring-white/50 shadow-lg',
    danger: 'bg-[#FF3B30] text-white hover:bg-[#D70015] active:bg-[#C70010] focus:ring-[#FF3B30] shadow-sm hover:shadow-md border border-transparent',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]',
  };
  
  const width = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className} ${
        disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          <span className="truncate">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </div>
      )}
    </motion.button>
  );
};
