import { useEffect } from 'react'
import PortalLoginForm from '@shared/components/auth/PortalLoginForm'
import { COMPANY_THEME } from '../theme'
import { setSelectedPortal } from '@shared/auth/portalSession'
import '../styles/company.css'

/** Company login — shared auth flows; company branding only. */
export default function CompanyLogin() {
  const t = COMPANY_THEME
  useEffect(() => { setSelectedPortal('company') }, [])
  return (
    <PortalLoginForm
      portal="company"
      portalLabel="Company Portal"
      icon="🏢"
      accent={t.accent}
      accentLight={t.accentLight}
      signupPath="/company/signup"
      cssClass="company-module"
    />
  )
}
