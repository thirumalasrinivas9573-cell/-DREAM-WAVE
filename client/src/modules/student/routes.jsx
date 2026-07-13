import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Dashboard     = lazy(() => import('./pages/Dashboard'))
const Goals         = lazy(() => import('./pages/Goals'))
const Roadmap       = lazy(() => import('./pages/Roadmap'))
const Learn         = lazy(() => import('./pages/Learn'))
const Tasks         = lazy(() => import('./pages/Tasks'))
const Mentor        = lazy(() => import('./pages/Mentor'))
const Reports       = lazy(() => import('./pages/Reports'))
const Resume        = lazy(() => import('./pages/Resume'))
const Books         = lazy(() => import('./pages/Books'))
const Community     = lazy(() => import('./pages/Community'))
const Profile       = lazy(() => import('./pages/Profile'))
const Settings      = lazy(() => import('./pages/Settings'))
const Certificates  = lazy(() => import('./pages/CertificatesPage'))
const Analytics     = lazy(() => import('./pages/AnalyticsPage'))

function Loader() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner spinner-lg" /></div>
}

export default function StudentRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="goals" element={<Goals />} />
        <Route path="roadmap" element={<Roadmap />} />
        <Route path="learn" element={<Learn />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="mentor" element={<Mentor />} />
        <Route path="reports" element={<Reports />} />
        <Route path="resume" element={<Resume />} />
        <Route path="books" element={<Books />} />
        <Route path="community" element={<Community />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="certificates" element={<Certificates />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
