import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import GoalChat  from './GoalChat';
import Report    from './Report';
import Roadmap   from './Roadmap';
import Books     from './Books';
import Tasks     from './Tasks';
import DailyLife from './DailyLife';
import Mentor    from './Mentor';
import Community from './Community';

// Page placeholders — will be built out in next steps
const ComingSoon = ({ title, icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center h-full text-center p-8"
  >
    <div className="text-6xl mb-4">{icon}</div>
    <h2 className="text-2xl font-bold text-white/80 mb-2">{title}</h2>
    <p className="text-white/30 text-sm">Coming soon — this feature is being built.</p>
  </motion.div>
);

function Home() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const cards = [
    { icon: '🎯', label: 'Set Goal',    color: 'from-violet-600/20 to-violet-600/5',  border: 'border-violet-500/20', to: '/dashboard/goal' },
    { icon: '🗺️', label: 'Roadmap',    color: 'from-pink-600/20 to-pink-600/5',      border: 'border-pink-500/20',   to: '/dashboard/roadmap' },
    { icon: '📊', label: 'Report',      color: 'from-blue-600/20 to-blue-600/5',      border: 'border-blue-500/20',   to: '/dashboard/report' },
    { icon: '🤖', label: 'AA AI Mentor',color: 'from-emerald-600/20 to-emerald-600/5',border: 'border-emerald-500/20',to: '/dashboard/mentor' },
    { icon: '✅', label: 'Tasks',       color: 'from-amber-600/20 to-amber-600/5',    border: 'border-amber-500/20',  to: '/dashboard/tasks' },
    { icon: '📖', label: 'Books',       color: 'from-rose-600/20 to-rose-600/5',      border: 'border-rose-500/20',   to: '/dashboard/books' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white">
          {greeting}, <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]} 👋</span>
        </h1>
        <p className="text-white/40 mt-1 text-sm">
          {user?.goal ? `Working towards: ${user.goal}` : 'Set your career goal to get started'}
        </p>
        {user?.aaId && (
          <p className="text-xs text-violet-400/60 mt-1">Your AA ID: <span className="font-mono font-bold text-violet-400">{user.aaId}</span></p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Credits', value: user?.credits || 0, icon: '💰' },
          { label: 'Streak',  value: user?.streak  || 0, icon: '🔥' },
          { label: 'Tasks',   value: 0,                  icon: '✅' },
          { label: 'Level',   value: 'Beginner',          icon: '⭐' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-black text-white">{s.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <motion.a
            key={c.label}
            href={c.to}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-gradient-to-br ${c.color} border ${c.border} rounded-2xl p-6 cursor-pointer block`}
          >
            <div className="text-3xl mb-3">{c.icon}</div>
            <div className="font-bold text-white/90">{c.label}</div>
            <div className="text-xs text-white/30 mt-1">Click to open →</div>
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route index element={<Home />} />
          <Route path="goal"       element={<GoalChat />} />
          <Route path="roadmap"    element={<Roadmap />} />
          <Route path="report"     element={<Report />} />
          <Route path="books"      element={<Books />} />
          <Route path="tasks"      element={<Tasks />} />
          <Route path="daily-life" element={<DailyLife />} />
          <Route path="mentor"     element={<Mentor />} />
          <Route path="community"  element={<Community />} />
          <Route path="profile"    element={<ComingSoon title="Your Profile" icon="👤" />} />
        </Routes>
      </main>
    </div>
  );
}
