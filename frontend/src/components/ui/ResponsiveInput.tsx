import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ResponsiveInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helper?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const ResponsiveInput: React.FC<ResponsiveInputProps> = ({
  label,
  error,
  success,
  helper,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const baseClasses = `
    w-full px-4 py-3 sm:py-2.5
    bg-white border rounded-xl sm:rounded-lg
    text-base sm:text-sm
    transition-all duration-200
    placeholder:text-gray-400
    focus:outline-none focus:ring-2
    disabled:bg-gray-50 disabled:text-gray-500
  `;

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : success
    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
    : focused
    ? 'border-blue-500 ring-2 ring-blue-100'
    : 'border-gray-300 hover:border-gray-400';

  const iconPadding = icon
    ? iconPosition === 'left'
      ? 'pl-10 sm:pl-9'
      : 'pr-10 sm:pr-9'
    : '';

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          className={`${baseClasses} ${stateClasses} ${iconPadding} ${className}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle size={18} className="text-green-500" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {(error || helper) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`mt-1.5 text-sm flex items-start gap-1.5 ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error && <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />}
            <span>{error || helper}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
