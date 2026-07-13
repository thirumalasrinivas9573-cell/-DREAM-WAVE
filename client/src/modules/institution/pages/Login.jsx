import PortalLoginForm from '@shared/components/auth/PortalLoginForm'
import { INSTITUTION_THEME, institutionPath } from '../theme'
import '../styles/institution.css'

export default function InstitutionLogin() {
  const t = INSTITUTION_THEME
  return (
    <PortalLoginForm
      portal="institution"
      portalLabel="Institution Portal"
      icon="🏛️"
      accent={t.accent}
      accentLight={t.accentLight}
      dashboardPath={institutionPath('dashboard')}
      signupPath="/institution/signup"
      cssClass="institution-module"
      otpChannel="email"
    />
  )
}
