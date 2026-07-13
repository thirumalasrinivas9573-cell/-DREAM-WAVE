/**
 * Premium portal landing — Student / Institution / Company login only.
 * No Three.js, no video, no motion libraries.
 */
import { Link } from 'react-router-dom'

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
    accent: '#F59E0B',
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
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56,189,248,0.10), transparent 55%),' +
          'radial-gradient(ellipse 60% 40% at 100% 100%, rgba(168,85,247,0.07), transparent 50%),' +
          'linear-gradient(180deg, #0B1020 0%, #070A12 100%)',
        color: '#F8FAFC',
        fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif",
      }}
    >
      <main style={{ width: 'min(720px, 100%)', textAlign: 'center' }}>
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

        <div style={{ display: 'grid', gap: 12 }}>
          {LOGINS.map((item) => (
            <Link
              key={item.to}
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
          ))}
        </div>
      </main>
    </div>
  )
}
