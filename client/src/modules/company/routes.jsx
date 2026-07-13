import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import CompanyLayout from './layouts/CompanyLayout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const JobPosts = lazy(() => import('./pages/JobPosts'))
const Internships = lazy(() => import('./pages/Internships'))
const Recruitment = lazy(() => import('./pages/Recruitment'))
const Employees = lazy(() => import('./pages/Employees'))
const Departments = lazy(() => import('./pages/Departments'))
const Projects = lazy(() => import('./pages/Projects'))
const Events = lazy(() => import('./pages/Events'))
const Training = lazy(() => import('./pages/Training'))
const Certificates = lazy(() => import('./pages/Certificates'))
const Applications = lazy(() => import('./pages/Applications'))
const Promotions = lazy(() => import('./pages/Promotions'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Reports = lazy(() => import('./pages/Reports'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const HRDashboard = lazy(() => import('./pages/HRDashboard'))
const InterviewPipeline = lazy(() => import('./pages/InterviewPipeline'))
const ResumeScreening = lazy(() => import('./pages/ResumeScreening'))
const CandidateRanking = lazy(() => import('./pages/CandidateRanking'))
const Attendance = lazy(() => import('./pages/Attendance'))
const Performance = lazy(() => import('./pages/Performance'))
const Payroll = lazy(() => import('./pages/Payroll'))
const Notifications = lazy(() => import('./pages/Notifications'))

function Loader() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner spinner-lg" /></div>
}

export default function CompanyRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<CompanyLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<JobPosts />} />
          <Route path="internships" element={<Internships />} />
          <Route path="recruitment" element={<Recruitment />} />
          <Route path="employees" element={<Employees />} />
          <Route path="departments" element={<Departments />} />
          <Route path="projects" element={<Projects />} />
          <Route path="events" element={<Events />} />
          <Route path="training" element={<Training />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="applications" element={<Applications />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="reports" element={<Reports />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="hr" element={<HRDashboard />} />
          <Route path="interviews" element={<InterviewPipeline />} />
          <Route path="screening" element={<ResumeScreening />} />
          <Route path="ranking" element={<CandidateRanking />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="performance" element={<Performance />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
