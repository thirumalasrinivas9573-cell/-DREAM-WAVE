import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import InstitutionSidebar from './InstitutionSidebar'
import '../styles/institution.css'

export default function InstitutionLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="institution-module" style={{ display: 'flex', minHeight: '100vh' }}>
      <div className="inst-sidebar-desktop" style={{ display: 'flex' }}>
        <InstitutionSidebar />
      </div>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />}
      <div style={{ position: 'fixed', left: 0, top: 0, zIndex: 50, transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.25s' }}>
        <InstitutionSidebar mobile onClose={() => setOpen(false)} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid rgba(245,158,11,0.12)', background: 'rgba(12,9,4,0.9)', position: 'sticky', top: 0, zIndex: 20 }}>
          <button type="button" className="inst-menu-btn" onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: '#FCD34D', fontSize: '1.3rem', cursor: 'pointer' }}>☰</button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FCD34D' }}>Institution Management</span>
          <div style={{ width: 32 }} />
        </header>
        <main style={{ padding: '24px 20px 48px', maxWidth: 1280, margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
      <style>{`@media (min-width: 900px) { .inst-menu-btn { display: none !important; } } @media (max-width: 899px) { .inst-sidebar-desktop { display: none !important; } }`}</style>
    </div>
  )
}
