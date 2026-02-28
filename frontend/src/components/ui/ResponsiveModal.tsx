import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useIsMobile, useIsTablet } from '../../hooks/useMediaQuery';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  const getWidth = () => {
    if (isMobile) return '95%';
    if (isTablet) return '90%';
    
    switch (size) {
      case 'sm': return '400px';
      case 'md': return '500px';
      case 'lg': return '600px';
      case 'xl': return '800px';
      case 'full': return '95%';
      default: return '500px';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: isMobile ? '100%' : 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isMobile ? '100%' : 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ width: getWidth() }}
            className={`
              relative bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-auto
              ${isMobile ? 'rounded-b-none' : ''}
            `}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between z-10">
                {title && (
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full -mr-2"
                  >
                    <X size={isMobile ? 20 : 24} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="p-4 sm:p-6">
              {children}
            </div>

            {/* Mobile drag indicator */}
            {isMobile && (
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
