import React, { useState } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';

// Feature pages
import Overview      from './features/Overview';
import Goals         from './features/Goals';
import GoalChat      from './features/GoalChat';
import Roadmaps      from './features/Roadmaps';
import TaskManager   from './features/TaskManager';
import LearningPlan  from './features/LearningPlan';
import SmartDay      from './features/SmartDay';
import AIChat        from './features/AIChat';
import Krishna       from './features/Krishna';
import Books         from './features/Books';
import DailyLife     from './features/DailyLife';
import Community     from './features/Community';
import Profile       from './features/Profile';
import QuizEngine    from './features/QuizEngine';
import VideoLearning from './features/VideoLearning';
import AnimationPlayer from './features/AnimationPlayer';
import SkillGap      from './features/SkillGap';
import Reports       from './features/Reports';
import Training      from './features/Training';
import Certificates  from './features/Certificates';
import ResumeBuilder from './features/ResumeBuilder';

const NAV = [
  { group: 'Main',
    items: [
      { to: '/dashboard',           icon: '⬡', label: 'Overview'      },
      { to: '/dashboard/goals',     icon: '🎯', label: 'My Goals'      },
    ]
  },
  { group: 'AI Engine',
    items: [
      { to: '/dashboard/roadmaps',  icon: '🗺️', label: 'Roadmaps'     },
      { to: '/dashboard/tasks',     icon: '✅', label: 'Tasks'         },
      { to: '/dashboard/training',  icon: '🎓', label: 'Training'      },
      { to: '/dashboard/learning',  icon: '📚', label: 'Learning Plan' },
      { to: '/dashboard/smart-day', icon: '⚡', label: 'Smart Day'     },
      { to: '/dashboard/quiz',      icon: '🧠', label: 'Quiz Engine'   },
      { to: '/dashboard/animation', icon: '🎬', label: 'Visual Learn'  },
    ]
  },
  { group: 'AI Mentors',
    items: [
      { to: '/dashboard/ai-chat',   icon: '🤖', label: 'AI Mentor'     },
      { to: '/dashboard/krishna',   icon: '🕉️', label: 'Krishna AI'   },
      { to: '/dashboard/goal-chat', icon: '💬', label: 'Goal Chat'     },
      { to: '/dashboard/daily-life',icon: '🌅', label: 'Daily Life AI' },
    ]
  },
  { group: 'Resources',
    items: [
      { to: '/dashboard/books',     icon: '📖', label: 'Books'         },
      { to: '/dashboard/reports',   icon: '📊', label: 'Reports'       },
      { to: '/dashboard/skill-gap', icon: '🔍', label: 'Skill Gap'     },
      { to: '/dashboard/videos',    icon: '🎬', label: 'Video Learn'   },
    ]
  },
  { group: 'Social',
    items: [
      { to: '/dashboard/community',    icon: '👥', label: 'Community'     },
      { to: '/dashboard/certificates', icon: '🏆', label: 'Certificates'  },
      { to: '/dashboard/resume',       icon: '📄', label: 'Resume Builder'},
      { to: '/dashboard/profile',      icon: '👤', label: 'Profile'       },
    ]
  },
];

function Sidebar({ open, onClose, user, logout }) {
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : -280 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className="fixed top-0 left-0 h-full w-64 z-50 flex flex-col lg:translate-x-0 lg:static lg:z-auto"
        style={{ background: '#0D1117', borderRight: '1px solid rgba(59,130,246,0.12)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b" style={{ borderColor: 'rgba(59,130,246,0.12)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)' }}>
            🌊
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Dream Wave AI</div>
            <div className="text-xs" style={{ color: '#3b82f6' }}>Life OS</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-gray-500 hover:text-white">✕</button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV.map(group => (
            <div key={group.group}>
              <p className="text-xs font-semibold uppercase tracking-widest px-2 mb-2"
                style={{ color: '#334155' }}>
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onClose}
                    className={() => `nav-item ${isActive(item.to) ? 'active' : ''}`}
                  >
                    <span className="text-base w-5 text-center">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(59,130,246,0.12)' }}>
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#8b5cf6)' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              <p className="text-xs truncate" style={{ color: '#475569' }}>{user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left nav-item text-sm"
            style={{ color: '#ef4444' }}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </motion.aside>
    </>
  );
}

function Header({ onMenu, title, subtitle }) {
  return (
    <header className="flex items-center gap-4 px-5 py-4 border-b"
      style={{ background: 'rgba(13,17,23,0.8)', borderColor: 'rgba(59,130,246,0.12)', backdropFilter: 'blur(12px)' }}>
      <button
        onClick={onMenu}
        className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div>
        <h1 className="text-lg font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs" style={{ color: '#64748b' }}>{subtitle}</p>}
      </div>
    </header>
  );
}

const PAGE_TITLES = {
  '/dashboard':            { title: 'Overview',       subtitle: 'Your AI-powered life dashboard' },
  '/dashboard/goals':      { title: 'My Goals',       subtitle: 'Goals drive your entire system' },
  '/dashboard/roadmaps':   { title: 'Roadmaps',       subtitle: 'AI-generated learning paths' },
  '/dashboard/tasks':      { title: 'Tasks',          subtitle: 'Daily execution plan' },
  '/dashboard/learning':   { title: 'Learning Plan',  subtitle: 'Structured day-by-day learning' },
  '/dashboard/smart-day':  { title: 'Smart Day',      subtitle: 'Deep daily lesson with AI' },
  '/dashboard/quiz':       { title: 'Quiz Engine',    subtitle: 'Test your knowledge with AI quizzes' },
  '/dashboard/animation':  { title: 'Visual Learning',subtitle: 'In-app animated explanations' },
  '/dashboard/resume':     { title: 'Resume Builder', subtitle: 'Auto-built from your learning activity' },
  '/dashboard/ai-chat':    { title: 'AI Mentor',      subtitle: 'Personal learning assistant' },
  '/dashboard/krishna':    { title: 'Krishna AI',     subtitle: 'Advanced mentor with memory' },
  '/dashboard/goal-chat':  { title: 'Goal Chat',      subtitle: 'Conversational goal setting' },
  '/dashboard/daily-life': { title: 'Daily Life AI',  subtitle: 'Life assistance & guidance' },
  '/dashboard/training':   { title: '🎓 AI Training',    subtitle: 'Skill-by-skill 4-day learning cycle' },
  '/dashboard/certificates': { title: '🏆 Certificates',  subtitle: 'Skills you have mastered' },
  '/dashboard/skill-gap':  { title: 'Skill Gap Analysis', subtitle: 'AI-powered gap analysis & improvement plan' },
  '/dashboard/videos':     { title: 'Video Learning', subtitle: 'AI cinematic learning scenes' },
  '/dashboard/community':  { title: 'Community',      subtitle: 'Connect with learners' },
  '/dashboard/profile':    { title: 'Profile',        subtitle: 'Your account settings' },
};

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18 } },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageInfo = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => location.pathname === path || location.pathname.startsWith(path + '/'));

  const { title = 'Dashboard', subtitle = '' } = pageInfo?.[1] || {};

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0B0F19' }}>
      {/* Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar open={true} onClose={() => {}} user={user} logout={logout} />
      </div>
      <div className="lg:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} logout={logout} />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenu={() => setSidebarOpen(true)}
          title={title}
          subtitle={subtitle}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorBoundary>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route index                  element={<motion.div key="overview"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><Overview /></motion.div>} />
              <Route path="goals"           element={<motion.div key="goals"      variants={pageVariants} initial="initial" animate="animate" exit="exit"><Goals /></motion.div>} />
              <Route path="roadmaps"        element={<motion.div key="roadmaps"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><Roadmaps /></motion.div>} />
              <Route path="tasks"           element={<motion.div key="tasks"      variants={pageVariants} initial="initial" animate="animate" exit="exit"><TaskManager /></motion.div>} />
              <Route path="training"        element={<motion.div key="training"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><Training /></motion.div>} />
              <Route path="certificates"    element={<motion.div key="certs"      variants={pageVariants} initial="initial" animate="animate" exit="exit"><Certificates /></motion.div>} />
              <Route path="learning"        element={<motion.div key="learning"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><LearningPlan /></motion.div>} />
              <Route path="smart-day"       element={<motion.div key="smartday"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><SmartDay /></motion.div>} />
              <Route path="quiz"            element={<motion.div key="quiz"       variants={pageVariants} initial="initial" animate="animate" exit="exit"><QuizEngine /></motion.div>} />
              <Route path="animation"       element={<motion.div key="animation"  variants={pageVariants} initial="initial" animate="animate" exit="exit"><AnimationPlayer /></motion.div>} />
              <Route path="resume"          element={<motion.div key="resume"     variants={pageVariants} initial="initial" animate="animate" exit="exit"><ResumeBuilder /></motion.div>} />
              <Route path="skill-gap"       element={<motion.div key="skillgap"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><SkillGap /></motion.div>} />
              <Route path="reports"         element={<motion.div key="reports"    variants={pageVariants} initial="initial" animate="animate" exit="exit"><Reports /></motion.div>} />
              <Route path="ai-chat"         element={<motion.div key="aichat"     variants={pageVariants} initial="initial" animate="animate" exit="exit"><AIChat /></motion.div>} />
              <Route path="krishna"         element={<motion.div key="krishna"    variants={pageVariants} initial="initial" animate="animate" exit="exit"><Krishna /></motion.div>} />
              <Route path="goal-chat"       element={<motion.div key="goalchat"   variants={pageVariants} initial="initial" animate="animate" exit="exit"><GoalChat /></motion.div>} />
              <Route path="daily-life"      element={<motion.div key="daily"      variants={pageVariants} initial="initial" animate="animate" exit="exit"><DailyLife /></motion.div>} />
              <Route path="books"           element={<motion.div key="books"      variants={pageVariants} initial="initial" animate="animate" exit="exit"><Books /></motion.div>} />
              <Route path="videos"          element={<motion.div key="videos"     variants={pageVariants} initial="initial" animate="animate" exit="exit"><VideoLearning /></motion.div>} />
              <Route path="community"       element={<motion.div key="community"  variants={pageVariants} initial="initial" animate="animate" exit="exit"><Community /></motion.div>} />
              <Route path="profile"         element={<motion.div key="profile"    variants={pageVariants} initial="initial" animate="animate" exit="exit"><Profile /></motion.div>} />
              <Route path="*"               element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
