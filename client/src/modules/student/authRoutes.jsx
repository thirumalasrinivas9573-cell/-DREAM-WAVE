import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

const Login  = lazy(() => import('../student/pages/Login'))
const Signup = lazy(() => import('../student/pages/Signup'))

function Loader() {
  return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div className="spinner spinner-lg" /></div>
}

export default function StudentAuthRoutes({ page }) {
  const Component = page === 'signup' ? Signup : Login
  return (
    <Suspense fallback={<Loader />}>
      <Component />
    </Suspense>
  )
}
