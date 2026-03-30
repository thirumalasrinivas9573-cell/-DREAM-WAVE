import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar   from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { StaggerContainer, StaggerItem } from '../components/ui/PageTransition';
import GoalChat  from './GoalChat';
import Report    from './Report';
import Roadmap   from './Roadmap';
import Books     from './Books';
import Tasks     from './Tasks';
import DailyLife from './DailyLife';
import Mentor    from './Mentor';
import Community from './Community';
import Profile   from './Profile';

function getLevelLabel(level) {
  if (level >= 10) return 'Master';
  if (level >= 8)  return 'Expert';
  if (level >= 6)  return 'Achiever';
  if (level >= 4)  return 'Learner';
  if (level >= 2)  return 'Explorer';
  return 'Beginner';
}

const CARDS = [
  { icon: '🎯', label: 'Set Goal',      glow: 'rgba(124,58,237,0.25)',  border: 'rgba(124,58,237,0.3)',  bg: 'rgba(124,58,237,0.08)',  to: '/dashboard/goal' },
  { icon: '🗺️', label: 'Roadmap',      glow: 'rgba(236,72,153,0.25)',  border: 'rgba(236,72,153,0.3)',  bg: 'rgba(236,72,153,0.08)',  to: '/dashboard/roadmap' },
  { icon: '📊', label: 'R&D Report',    glow: 'rgba(59,130,246,0.25)',  border: 'rgba(59,130,246,0.3)',  bg: 'rgba(59,130,246,0.08)',  to: '/dashboard/report' },
  { icon: '🪷', label: 'Krishna Mentor',glow: 'rgba(245,158,11,0.25)',  border: 'rgba(245,158,11,0.3)',  bg: 'rgba(245,158,11,0.08)',  to: '/dashboard/mentor' },
  { icon: '✅', label: 'Tasks',         glow: 'rgba(16,185,129,0.25)',  border: 'rgba(16,185,129,0.3)',  bg: 'rgba(16,185,129,0.08)',  to: '/dashboard/tasks' },
  { icon: '📖', label: 'Books',         glow: 'rgba(244,63,94,0.25)',   border: 'rgba(244,63,94,0.3)',   bg: 'rgba(244,63,94,0.08)',   to: '/dashboard/books' },
  { icon: '🌿', label: 'Daily Life AI', glow: 'rgba(20,184,166,0.25)',  border: 'rgba(20,184,166,0.3)',  bg: 'rgba(20,184,166,0.08)',  to: '/dashboard/daily-life' },
  { icon: '👥', label: 'Community',     glow: 'rgba(99,102,241,0.25)',  border: 'rgba(99,102,241,0.3)',  bg: 'rgba(99,102,241,0.08)',  to: '/dashboard/community' },
];

function StatCard({ icon, label, value, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass rounded-2xl p-4 text-center relative overflow-hidden group"
      style={{ boxShadow: '0 4px 20px rgba(124,58,237,0.06)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-xs text-white/40 mt-0.5">{label}</div>
    </motion.div>
  );
}

function Home() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const level = user?.level || 1;

  return (
    <div className="p-6 md:p-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl md:text-3xl font-black text-white">
          {greeting},{' '}
          <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent glow-text">
            {user?.name?.split(' ')[0]} 👋
          </span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          {user?.goal ? `Working towards: ${user.goal}` : 'Set your career goal to get started'}
        </p>
        {user?.aaId && (
          <p className="text-xs text-violet-400/60 mt-1">
            AA ID: <span className="font-mono font-bold text-violet-400">{user.aaId}</span>
          </p>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Credits', value: user?.credits || 0, icon: '💰' },
          { label: 'Streak',  value: user?.streak  || 0, icon: '🔥' },
          { label: 'Level',   value: level,               icon: '⭐' },
          { label: 'Rank',    value: getLevelLabel(level), icon: '🏅' },
        ].map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.08} />)}
      </div>

      {/* Feature cards */}
      <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <StaggerItem key={c.label}>
            <motion.div
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <Link
                to={c.to}
                className="block rounded-2xl p-6 cursor-pointer relative overflow-hidden group"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                  transition: 'box-shadow 0.3s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 32px ${c.glow}`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 60%)' }} />
                <div className="text-3xl mb-3 relative z-10">{c.icon}</div>
                <div className="font-bold text-white/90 relative z-10">{c.label}</div>
                <div className="text-xs text-white/30 mt-1 relative z-10 group-hover:text-white/50 transition-colors">Open →</div>
              </Link>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  );
}

// Inner route page transition wrapper
const pageVariants = {
  initial: { opacity: 0, x: 10 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, x: -10, transition: { duration: 0.18 } },
};

function AnimatedRoute({ children }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
      {children}
    </motion.div>
  );
}

export default function Dashboard() {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route index        element={<AnimatedRoute><Home /></AnimatedRoute>} />
            <Route path="goal"       element={<AnimatedRoute><GoalChat /></AnimatedRoute>} />
            <Route path="roadmap"    element={<AnimatedRoute><Roadmap /></AnimatedRoute>} />
            <Route path="report"     element={<AnimatedRoute><Report /></AnimatedRoute>} />
            <Route path="books"      element={<AnimatedRoute><Books /></AnimatedRoute>} />
            <Route path="tasks"      element={<AnimatedRoute><Tasks /></AnimatedRoute>} />
            <Route path="daily-life" element={<AnimatedRoute><DailyLife /></AnimatedRoute>} />
            <Route path="mentor"     element={<AnimatedRoute><Mentor /></AnimatedRoute>} />
            <Route path="community"  element={<AnimatedRoute><Community /></AnimatedRoute>} />
            <Route path="profile"    element={<AnimatedRoute><Profile /></AnimatedRoute>} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
