import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import CompanySidebar from './CompanySidebar'
import '../styles/company.css'

export default function CompanyLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="company-module" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="company-sidebar-desktop" style={{ display: 'flex' }}>
        <CompanySidebar />
      </div>

      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 40 }} />}
      <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 50, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s' }}>
        <CompanySidebar mobile onClose={() => setOpen(false)} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 24px', borderBottom: '1px solid rgba(168,85,247,0.12)',
          background: 'rgba(10,10,18,0.9)', backdropFilter: 'blur(16px)',
          position: 'sticky', top: 0, zIndex: 20,
        }}>
          <button type="button" onClick={() => setOpen(true)} className="company-menu-btn" style={{ background: 'none', border: 'none', color: '#C084FC', fontSize: '1.3rem', cursor: 'pointer' }}>☰</button>
          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#C084FC', letterSpacing: '0.06em' }}>ENTERPRISE WORKSPACE</span>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366F1, #A855F7)', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>DW</div>
        </header>
        <main style={{ padding: '24px 24px 48px', maxWidth: 1320, margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (min-width: 900px) { .company-menu-btn { display: none !important; } }
        @media (max-width: 899px) { .company-sidebar-desktop { display: none !important; } }
      `}</style>
    </div>
  )
}
