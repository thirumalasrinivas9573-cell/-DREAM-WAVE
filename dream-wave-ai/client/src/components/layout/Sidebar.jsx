import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = ({ features, currentFeature, isOpen, onToggle, user, onLogout }) => {
  const location = useLocation();

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: -320 }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-dark-900/95 backdrop-blur-xl border-r border-primary-800/30">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-primary-800/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-accent-blue bg-clip-text text-transparent">
                Dream Wave AI
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {features.map((feature) => {
              const isActive = location.pathname === feature.path || 
                             (feature.path === '/dashboard' && location.pathname === '/dashboard');
              
              return (
                <Link
                  key={feature.id}
                  to={feature.path}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-primary text-white shadow-blue' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                    }
                  `}
                >
                  <span className="text-lg mr-3">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-dark-400'}`}>
                      {feature.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse-glow" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-primary-800/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <motion.div
        className="lg:hidden fixed inset-y-0 left-0 z-50 w-80"
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="flex flex-col h-full bg-dark-900/95 backdrop-blur-xl border-r border-primary-800/30">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-primary-800/30">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌊</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-accent-blue bg-clip-text text-transparent">
                Dream Wave AI
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-2 text-dark-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {features.map((feature) => {
              const isActive = location.pathname === feature.path || 
                             (feature.path === '/dashboard' && location.pathname === '/dashboard');
              
              return (
                <Link
                  key={feature.id}
                  to={feature.path}
                  onClick={onToggle}
                  className={`
                    group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-primary text-white shadow-blue' 
                      : 'text-dark-300 hover:text-white hover:bg-dark-800/50'
                    }
                  `}
                >
                  <span className="text-lg mr-3">{feature.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{feature.name}</div>
                    <div className={`text-xs ${isActive ? 'text-primary-100' : 'text-dark-400'}`}>
                      {feature.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse-glow" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Info */}
          <div className="p-4 border-t border-primary-800/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-dark-400 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="w-full px-3 py-2 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 rounded-lg transition-colors"
            >
              🚪 Sign Out
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;