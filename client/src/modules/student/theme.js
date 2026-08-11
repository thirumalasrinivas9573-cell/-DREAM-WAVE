/** Student Portal — blue futuristic, education focused */
export const STUDENT_THEME = {
  id: 'student',
  label: 'Student Portal',
  tagline: 'AI-powered learning universe',
  icon: '🎓',
  basePath: '/student',
  accent: '#8B5CF6',
  accent2: '#3B82F6',
  accentLight: '#A855F7',
  glow: 'rgba(139,92,246,0.5)',
  gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
  sidebarBg: '#0D0D17',
  sidebarBorder: 'rgba(139,92,246,0.12)',
  bg: 'radial-gradient(ellipse at 20% 0%, #2E1065 0%, #02040C 55%)',
}

export function studentPath(segment = '') {
  if (!segment) return STUDENT_THEME.basePath
  return `${STUDENT_THEME.basePath}/${segment.replace(/^\//, '')}`
}
