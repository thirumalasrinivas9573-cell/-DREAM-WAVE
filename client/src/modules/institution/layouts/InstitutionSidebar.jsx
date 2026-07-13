import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/context/AuthContext'
import { institutionPath } from '../theme'

const NAV = [
  { to: 'dashboard', icon: '📊', label: 'Overview' },
  { to: 'students', icon: '👨‍🎓', label: 'Students' },
  { to: 'faculty', icon: '👩‍🏫', label: 'Faculty' },
  { to: 'departments', icon: '🏫', label: 'Departments' },
  { to: 'courses', icon: '📚', label: 'Courses' },
  { to: 'course-insights', icon: '🤖', label: 'Course Insights' },
  { to: 'admissions', icon: '📝', label: 'Admissions' },
  { to: 'placements', icon: '💼', label: 'Placements' },
  { to: 'events', icon: '📅', label: 'Events' },
  { to: 'news', icon: '📰', label: 'News' },
  { to: 'announcements', icon: '📣', label: 'Announcements' },
  { to: 'promotions', icon: '📢', label: 'Promotions' },
  { to: 'gallery', icon: '🖼️', label: 'Gallery' },
  { to: 'certificates', icon: '🏅', label: 'Certificates' },
  { to: 'library', icon: '📖', label: 'Library' },
  { to: 'reports', icon: '📋', label: 'Reports' },
  { to: 'analytics', icon: '📈', label: 'Analytics' },
  { to: 'profile', icon: '🏛️', label: 'Public Profile' },
  { to: 'settings', icon: '⚙️', label: 'Settings' },
]

export default function InstitutionSidebar({ mobile, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/institution/login')
  }

  return (
    <aside className="inst-sidebar" style={mobile ? { height: '100vh', overflowY: 'auto' } : {}}>
      <div style={{ padding: '8px 12px 20px', borderBottom: '1px solid rgba(245,158,11,0.12)', marginBottom: 12 }}>
        <div style={{ fontSize: '1.5rem' }}>🏛️</div>
        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FCD34D' }}>Institution Portal</div>
        <div style={{ fontSize: '0.72rem', opacity: 0.55, marginTop: 4 }}>{user?.organizationName || user?.name}</div>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={institutionPath(n.to)} className={({ isActive }) => `inst-nav-link${isActive ? ' active' : ''}`}
            onClick={onClose}>
            <span>{n.icon}</span> {n.label}
          </NavLink>
        ))}
      </nav>
      <button type="button" className="inst-btn" onClick={handleLogout} style={{ marginTop: 12 }}>Sign Out</button>
    </aside>
  )
}
