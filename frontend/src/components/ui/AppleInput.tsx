import React, { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface AppleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  helper?: string;
  showPasswordToggle?: boolean;
}

export const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(({
  label,
  error,
  success,
  icon,
  helper,
  showPasswordToggle = false,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type;
  
  const baseStyles = 'w-full px-4 py-3 bg-[#F2F2F7] border rounded-xl font-text transition-all duration-200 placeholder-[#8E8E93]';
  
  const stateStyles = error
    ? 'border-[#FF3B30] focus:border-[#FF3B30] focus:ring-2 focus:ring-[#FF3B30]/20'
    : success
    ? 'border-[#34C759] focus:border-[#34C759] focus:ring-2 focus:ring-[#34C759]/20'
    : focused
    ? 'border-[#007AFF] focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 bg-white'
    : 'border-transparent hover:border-[#D1D1D6]';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#1C1C1E] mb-2 font-text">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={`${baseStyles} ${stateStyles} ${icon ? 'pl-10' : ''} ${showPasswordToggle ? 'pr-12' : ''} ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
        
        {success && !error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#34C759] pointer-events-none"
          >
            <Check size={18} />
          </motion.div>
        )}
        
        {error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF3B30] pointer-events-none"
          >
            <AlertCircle size={18} />
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {(error || helper) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-1 text-sm flex items-center gap-1 ${error ? 'text-[#FF3B30]' : 'text-[#8E8E93]'}`}
          >
            {error && <AlertCircle size={14} />}
            <span>{error || helper}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

AppleInput.displayName = 'AppleInput';
