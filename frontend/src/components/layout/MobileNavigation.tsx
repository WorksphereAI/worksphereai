import React, { useState, useEffect } from 'react';
import { Menu, X, Home, MessageSquare, CheckSquare, FileText, User, Settings, Bell, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { Link, useLocation, useNavigate } from 'react-router-dom';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  badge?: number;
}

export const MobileNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: 'Dashboard', href: '/dashboard' },
    { icon: <MessageSquare size={20} />, label: 'Messages', href: '/messages', badge: 3 },
    { icon: <CheckSquare size={20} />, label: 'Tasks', href: '/tasks', badge: 5 },
    { icon: <FileText size={20} />, label: 'Documents', href: '/documents' },
    { icon: <User size={20} />, label: 'Profile', href: '/profile' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  // Desktop navigation
  if (isDesktop) {
    return (
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">WS</span>
              </div>
              <span className="font-semibold text-gray-900">WorkSphere</span>
            </Link>

            {/* Desktop Menu */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition relative ${
                    location.pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
                <span className="hidden lg:inline">{user?.full_name || 'User'}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // Mobile navigation
  return (
    <>
      {/* Top Bar */}
      <div className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">WS</span>
            </div>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/notifications')}
              className="relative p-2 text-gray-600"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-600 hover:text-blue-600"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-out Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-40 shadow-xl"
            >
              {/* Menu Header */}
              <div className="p-4 border-b border-gray-100 mt-14">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{user?.full_name?.charAt(0) || 'U'}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{user?.full_name || 'Guest User'}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email || 'Not signed in'}</div>
                  </div>
                </div>
                {user && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full capitalize">
                      {user?.role || 'employee'}
                    </span>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition relative ${
                      location.pathname === item.href
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={location.pathname === item.href ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Logout Button */}
              {user && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-14" />
    </>
  );
};
