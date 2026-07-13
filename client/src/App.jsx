import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './modules/shared/context/AuthContext'
import GamificationProvider from './modules/shared/components/Gamification'
import Landing from './modules/shared/pages/Landing'
import StudentRoutes from './modules/student/routes'
import StudentAuthRoutes from './modules/student/authRoutes'
import InstitutionRoutes from './modules/institution/routes'
import CompanyRoutes from './modules/company/routes'

const InstitutionLogin = lazy(() => import('./modules/institution/pages/Login'))
const InstitutionSignup = lazy(() => import('./modules/institution/pages/Signup'))
const CompanyLogin = lazy(() => import('./modules/company/pages/Login'))
const CompanySignup = lazy(() => import('./modules/company/pages/Signup'))
const DiscoveryPage = lazy(() => import('./modules/discovery/pages/DiscoveryPage'))
const PromotionDetail = lazy(() => import('./modules/discovery/pages/PromotionDetail'))
const InstitutionPublic = lazy(() => import('./modules/public/pages/InstitutionPublic'))
const CompanyPublic = lazy(() => import('./modules/public/pages/CompanyPublic'))
const SearchPage = lazy(() => import('./modules/search/pages/SearchPage'))
const LibraryHome = lazy(() => import('./modules/digital-library/pages/LibraryHome'))
const PdfReader = lazy(() => import('./modules/digital-library/pages/PdfReader'))
const AdminDashboard = lazy(() => import('./modules/admin/pages/AdminDashboard'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      <div style={{ fontSize: '2rem' }}>🌊</div>
      <div className="spinner spinner-lg" />
    </div>
  )
}

const ROLE_DEST = {
  institution: '/institution/dashboard',
  company: '/company/dashboard',
  admin: '/admin',
  student: '/student/dashboard',
}

function PrivateRoute({ children, module, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!user) {
    return <Navigate to={`/${module}/login`} replace state={{ from: location }} />
  }
  if (roles?.length && !roles.includes(user.role) && user.role !== 'admin') {
    return <Navigate to={ROLE_DEST[user.role] || '/'} replace />
  }
  return children
}

function PublicRoute({ children, loginPath }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (user) {
    return <Navigate to={ROLE_DEST[user.role] || '/student/dashboard'} replace />
  }
  return children
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/discover" element={<DiscoveryPage />} />
        <Route path="/discover/:id" element={<PromotionDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryHome />} />
        <Route path="/library/read/:id" element={<PdfReader />} />
        <Route path="/i/:slug" element={<InstitutionPublic />} />
        <Route path="/c/:slug" element={<CompanyPublic />} />
        <Route path="/admin" element={<PrivateRoute module="student" roles={['admin']}><AdminDashboard /></PrivateRoute>} />

        <Route path="/student/login" element={<PublicRoute loginPath="/student/login"><StudentAuthRoutes page="login" /></PublicRoute>} />
        <Route path="/student/signup" element={<PublicRoute loginPath="/student/login"><StudentAuthRoutes page="signup" /></PublicRoute>} />
        <Route path="/student/*" element={<PrivateRoute module="student" roles={['student']}><StudentRoutes /></PrivateRoute>} />

        <Route path="/institution/login" element={<PublicRoute loginPath="/institution/login"><InstitutionLogin /></PublicRoute>} />
        <Route path="/institution/signup" element={<PublicRoute loginPath="/institution/login"><InstitutionSignup /></PublicRoute>} />
        <Route path="/institution/*" element={<PrivateRoute module="institution" roles={['institution']}><InstitutionRoutes /></PrivateRoute>} />

        <Route path="/company/login" element={<PublicRoute loginPath="/company/login"><CompanyLogin /></PublicRoute>} />
        <Route path="/company/signup" element={<PublicRoute loginPath="/company/login"><CompanySignup /></PublicRoute>} />
        <Route path="/company/*" element={<PrivateRoute module="company" roles={['company']}><CompanyRoutes /></PrivateRoute>} />

        {/* Legacy college paths → institution */}
        <Route path="/college/login" element={<Navigate to="/institution/login" replace />} />
        <Route path="/college/*" element={<Navigate to="/institution/dashboard" replace />} />

        <Route path="/login" element={<Navigate to="/student/login" replace />} />
        <Route path="/signup" element={<Navigate to="/student/signup" replace />} />
        <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="/goals" element={<Navigate to="/student/goals" replace />} />
        <Route path="/roadmap" element={<Navigate to="/student/roadmap" replace />} />
        <Route path="/learn" element={<Navigate to="/student/learn" replace />} />
        <Route path="/tasks" element={<Navigate to="/student/tasks" replace />} />
        <Route path="/mentor" element={<Navigate to="/student/mentor" replace />} />
        <Route path="/reports" element={<Navigate to="/student/reports" replace />} />
        <Route path="/resume" element={<Navigate to="/student/resume" replace />} />
        <Route path="/books" element={<Navigate to="/student/books" replace />} />
        <Route path="/community" element={<Navigate to="/student/community" replace />} />
        <Route path="/profile" element={<Navigate to="/student/profile" replace />} />
        <Route path="/settings" element={<Navigate to="/student/settings" replace />} />
        <Route path="/certificates" element={<Navigate to="/student/certificates" replace />} />
        <Route path="/analytics" element={<Navigate to="/student/analytics" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <GamificationProvider>
        <AppRoutes />
      </GamificationProvider>
    </AuthProvider>
  )
}
