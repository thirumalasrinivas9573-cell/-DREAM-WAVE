import PortalLoginForm from '@shared/components/auth/PortalLoginForm'
import { COMPANY_THEME, companyPath } from '../theme'
import '../styles/company.css'

export default function CompanyLogin() {
  const t = COMPANY_THEME
  return (
    <PortalLoginForm
      portal="company"
      portalLabel="Company Portal"
      icon="🏢"
      accent={t.accent}
      accentLight={t.accentLight}
      dashboardPath={companyPath('dashboard')}
      signupPath="/company/signup"
      cssClass="company-module"
      otpChannel="email"
    />
  )
}
