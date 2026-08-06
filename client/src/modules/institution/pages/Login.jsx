import PortalLoginForm from '@shared/components/auth/PortalLoginForm'
import { INSTITUTION_THEME } from '../theme'
import { setSelectedPortal } from '@shared/auth/portalSession'
import { useEffect } from 'react'
import '../styles/institution.css'

/**
 * Institution login — shared auth UI + institution branding.
 * Auth: email/mobile + password + email/mobile OTP (unified backend).
 */
export default function InstitutionLogin() {
  const t = INSTITUTION_THEME
  useEffect(() => { setSelectedPortal('institution') }, [])
  return (
    <PortalLoginForm
      portal="institution"
      portalLabel="Institution Portal"
      icon="🏛️"
      accent={t.accentMid}
      accentLight={t.accentLight}
      signupPath="/institution/signup"
      cssClass="institution-module"
    />
  )
}
