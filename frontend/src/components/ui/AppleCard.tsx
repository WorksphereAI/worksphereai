import React from 'react';
import { motion } from 'framer-motion';

interface AppleCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AppleCard: React.FC<AppleCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
}) => {
  const variants = {
    default: 'bg-white border border-[#F2F2F7] shadow-sm',
    // Ensure content inside glass cards remains readable in light and dark modes
    glass: 'bg-white/80 backdrop-blur-xl text-[#1C1C1E] dark:text-white border border-white/50 shadow-lg',
    outlined: 'border border-[#E5E5EA] bg-transparent',
    elevated: 'bg-white border border-[#F2F2F7] shadow-lg',
  };
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const hoverStyles = hoverable || clickable
    ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#007AFF]/30'
    : '';
  
  const cursorStyles = clickable ? 'cursor-pointer' : '';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }}
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${cursorStyles} ${className}`}
      onClick={onClick}
      whileHover={hoverable || clickable ? { scale: 1.02 } : {}}
      whileTap={clickable ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};
