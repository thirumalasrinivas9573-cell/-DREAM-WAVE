import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// ── Eagerly load auth pages (no layout, fast) ─────────────────────────────────
import Login  from './pages/Login'
import Signup from './pages/Signup'

// ── Lazy load all protected pages ─────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Goals     = lazy(() => import('./pages/Goals'))
const Roadmap   = lazy(() => import('./pages/Roadmap'))
const Tasks     = lazy(() => import('./pages/Tasks'))
const Learn     = lazy(() => import('./pages/Learn'))
const Mentor    = lazy(() => import('./pages/Mentor'))
const Reports   = lazy(() => import('./pages/Reports'))
const Resume    = lazy(() => import('./pages/Resume'))
const Books     = lazy(() => import('./pages/Books'))
const Community = lazy(() => import('./pages/Community'))
const Profile   = lazy(() => import('./pages/Profile'))
const Settings  = lazy(() => import('./pages/Settings'))

// ── Full-screen loading state ─────────────────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', gap: 16,
      background: 'var(--bg-primary)',
    }}>
      <div style={{ fontSize: '2.5rem' }}>🌊</div>
      <div className="spinner spinner-lg" />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading…</p>
    </div>
  )
}

// ── Route guards ──────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

// ── Routes ────────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/login"     element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"    element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/goals"     element={<PrivateRoute><Goals /></PrivateRoute>} />
        <Route path="/roadmap"   element={<PrivateRoute><Roadmap /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/learn"     element={<PrivateRoute><Learn /></PrivateRoute>} />
        <Route path="/mentor"    element={<PrivateRoute><Mentor /></PrivateRoute>} />
        <Route path="/reports"   element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/resume"    element={<PrivateRoute><Resume /></PrivateRoute>} />
        <Route path="/books"     element={<PrivateRoute><Books /></PrivateRoute>} />
        <Route path="/community" element={<PrivateRoute><Community /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/settings"  element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
