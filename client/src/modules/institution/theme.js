export const INSTITUTION_THEME = {
  id: 'institution',
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  bg: '#120F08',
  card: 'rgba(24,18,8,0.92)',
  name: 'institution',
  css: {
    card: 'inst-card',
    input: 'inst-input',
    btn: 'inst-btn',
    btnPrimary: 'inst-btn inst-btn-primary',
  },
}

export const institutionPath = (p = '') => `/institution/${p}`.replace(/\/$/, '')
