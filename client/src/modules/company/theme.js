/** Company Portal — dark graphite, purple accents, enterprise glassmorphism */
export const COMPANY_THEME = {
  id: 'company',
  label: 'Company Portal',
  tagline: 'Talent, hiring & workforce intelligence',
  icon: '🏢',
  basePath: '/company',
  accent: '#A855F7',
  accent2: '#6366F1',
  accentLight: '#C084FC',
  glow: 'rgba(168,85,247,0.45)',
  gradient: 'linear-gradient(135deg, #1E1B4B, #7C3AED 55%, #A855F7)',
  sidebarBg: '#0A0A12',
  sidebarBorder: 'rgba(168,85,247,0.14)',
  bg: 'radial-gradient(ellipse at 50% 0%, #1E1B4B 0%, #030712 60%)',
  css: {
    card: 'company-glass',
    input: 'company-input',
    btn: 'company-btn company-btn-secondary',
    btnPrimary: 'company-btn company-btn-primary',
  },
}

export function companyPath(segment = '') {
  if (!segment) return COMPANY_THEME.basePath
  return `${COMPANY_THEME.basePath}/${segment.replace(/^\//, '')}`
}
