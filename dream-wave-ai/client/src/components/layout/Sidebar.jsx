import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/dashboard',               icon: '🏠', label: 'Dashboard' },
  { to: '/dashboard/goal',          icon: '🎯', label: 'Set Goal' },
  { to: '/dashboard/roadmap',       icon: '🗺️', label: 'Roadmap' },
  { to: '/dashboard/report',        icon: '📊', label: 'R&D Report' },
  { to: '/dashboard/books',         icon: '📖', label: 'Books' },
  { to: '/dashboard/tasks',         icon: '✅', label: 'Tasks' },
  { to: '/dashboard/mentor',        icon: '🪷', label: 'Krishna Mentor' },
  { to: '/dashboard/daily-life',    icon: '🌿', label: 'Daily Life AI' },
  { to: '/dashboard/community',     icon: '👥', label: 'Community' },
  { to: '/dashboard/profile',       icon: '👤', label: 'Profile' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
      className="h-screen flex flex-col glass border-r border-violet-500/10 flex-shrink-0 overflow-hidden"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-violet-500/10">
        <span className="text-2xl flex-shrink-0">🌊</span>
        {!collapsed && (
          <span className="font-black text-sm bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
            Dream Wave AI
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto text-white/30 hover:text-white/70 transition-colors text-xs"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`
            }
          >
            <span className="text-base flex-shrink-0">{icon}</span>
            {!collapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-violet-500/10">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white/80 truncate">{user.name}</p>
              <p className="text-xs text-white/30 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <span className="flex-shrink-0">🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
