import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../shared/context/AuthContext'
import { COMPANY_THEME, companyPath } from '../theme'

const NAV = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'jobs', label: 'Jobs' },
  { to: 'internships', label: 'Internships' },
  { to: 'recruitment', label: 'Hiring' },
  { to: 'employees', label: 'Employees' },
  { to: 'departments', label: 'Departments' },
  { to: 'projects', label: 'Projects' },
  { to: 'events', label: 'Events' },
  { to: 'training', label: 'Training' },
  { to: 'certificates', label: 'Certificates' },
  { to: 'applications', label: 'Applications' },
  { to: 'promotions', label: 'Promotions' },
  { to: 'gallery', label: 'Gallery' },
  { to: 'reports', label: 'Reports' },
  { to: 'analytics', label: 'Analytics' },
  { to: 'profile', label: 'Public Profile' },
  { to: 'settings', label: 'Settings' },
]

export default function CompanySidebar({ mobile, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const t = COMPANY_THEME

  return (
    <motion.aside initial={mobile ? { x: -280 } : false} animate={{ x: 0 }}
      style={{ width: 260, flexShrink: 0, background: t.sidebarBg, borderRight: `1px solid ${t.sidebarBorder}`, display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
      <div style={{ padding: '22px 20px', borderBottom: `1px solid ${t.sidebarBorder}` }}>
        <div style={{ fontWeight: 800 }}>🏢 Company Portal</div>
        <div style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: 4 }}>{user?.organizationName || user?.name}</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(item => (
          <NavLink key={item.to} to={companyPath(item.to)} onClick={onClose}
            style={({ isActive }) => ({ display: 'block', padding: '9px 14px', borderRadius: 8, marginBottom: 2, textDecoration: 'none', fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#F1F5F9' : 'rgba(241,245,249,0.5)', background: isActive ? 'rgba(168,85,247,0.15)' : 'transparent', borderLeft: isActive ? `3px solid ${t.accent}` : '3px solid transparent' })}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 16, borderTop: `1px solid ${t.sidebarBorder}` }}>
        <button type="button" onClick={async () => { await logout(); navigate(companyPath('login')) }} className="company-btn company-btn-secondary" style={{ width: '100%' }}>Sign out</button>
      </div>
    </motion.aside>
  )
}
