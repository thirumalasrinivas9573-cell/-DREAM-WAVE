import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const LOGINS = [
  {
    to: '/student/login',
    label: 'Student Login',
    hint: 'Learning, goals & career intelligence',
    accent: '#38BDF8',
  },
  {
    to: '/institution/login',
    label: 'Institution Login',
    hint: 'Campus, faculty & academic operations',
    accent: '#10B981',
  },
  {
    to: '/company/login',
    label: 'Company Login',
    hint: 'Hiring, talent & workforce tools',
    accent: '#A855F7',
  },
]

export default function Landing() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '32px 20px',
        background:
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.12), transparent 55%),' +
          'radial-gradient(ellipse 60% 40% at 100% 100%, rgba(168,85,247,0.08), transparent 50%),' +
          'linear-gradient(180deg, #0B1020 0%, #070A12 100%)',
        color: '#F8FAFC',
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      }}
    >
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: 'min(720px, 100%)', textAlign: 'center' }}
      >
        <p
          style={{
            margin: '0 0 12px',
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(148,163,184,0.9)',
            fontWeight: 600,
          }}
        >
          Dream Wave AI
        </p>
        <h1
          style={{
            margin: '0 0 12px',
            fontSize: 'clamp(2rem, 5vw, 2.75rem)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
          }}
        >
          Sign in to your portal
        </h1>
        <p style={{ margin: '0 0 36px', color: 'rgba(148,163,184,0.95)', fontSize: '1rem', lineHeight: 1.55 }}>
          One platform for students, institutions, and companies.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 12,
            gridTemplateColumns: '1fr',
          }}
          className="dw-landing-logins"
        >
          {LOGINS.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
            >
              <Link
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  padding: '18px 20px',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 14,
                  border: `1px solid ${item.accent}40`,
                  background: 'rgba(15,23,42,0.65)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.borderColor = `${item.accent}99`
                  e.currentTarget.style.background = 'rgba(15,23,42,0.9)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = `${item.accent}40`
                  e.currentTarget.style.background = 'rgba(15,23,42,0.65)'
                }}
              >
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 650, fontSize: '1.05rem', color: item.accent }}>
                    {item.label}
                  </span>
                  <span style={{ display: 'block', marginTop: 4, fontSize: '0.85rem', color: 'rgba(148,163,184,0.9)' }}>
                    {item.hint}
                  </span>
                </span>
                <span style={{ color: item.accent, fontSize: '1.25rem', fontWeight: 600 }} aria-hidden>
                  →
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: '0.85rem', color: 'rgba(148,163,184,0.85)' }}>
          New here?{' '}
          <Link to="/student/signup" style={{ color: '#38BDF8', fontWeight: 600 }}>Student signup</Link>
          {' · '}
          <Link to="/institution/signup" style={{ color: '#10B981', fontWeight: 600 }}>Institution</Link>
          {' · '}
          <Link to="/company/signup" style={{ color: '#A855F7', fontWeight: 600 }}>Company</Link>
        </p>
      </motion.main>

      <style>{`
        @media (min-width: 640px) {
          .dw-landing-logins { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
