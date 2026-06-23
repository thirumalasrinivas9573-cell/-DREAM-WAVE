import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import useScrollReveal from '../hooks/useScrollReveal'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  useScrollReveal() // activate scroll-reveal on every page

  return (
    <div className="page-layout">
      {/* Desktop sidebar */}
      <div className="sidebar-wrapper" style={{ display: 'flex' }}>
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Mobile sidebar */}
      <div
        style={{
          position: 'fixed', left: 0, top: 0, zIndex: 50,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Sidebar mobile onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Mobile topbar */}
        <div
          className="mobile-topbar"
          style={{
            display: 'none',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            alignItems: 'center', gap: 12,
          }}
        >
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileOpen(true)}
            style={{ display: 'flex' }}
          >☰</button>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>🌊 Dream Wave</span>
        </div>

        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="page-content"
        >
          {children}
        </motion.main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
          .mobile-topbar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
