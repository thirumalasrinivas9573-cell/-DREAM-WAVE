import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { companyApi, interactionApi } from '@shared/services/api'
import { useAuth } from '@shared/context/AuthContext'
import PublicProfileActions from '@shared/components/portal/PublicProfileActions'

export default function CompanyPublic() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    companyApi.publicProfile(slug).then(r => setData(r.data)).catch(() => setData(null))
  }, [slug])

  const applyJob = async (id) => {
    if (!user) { window.location.href = '/student/login'; return }
    try {
      await interactionApi.applyJob(id, {})
      setMsg('Job application submitted!')
    } catch (err) { setMsg(err.response?.data?.message || 'Apply failed') }
  }

  const applyInternship = async (id) => {
    if (!user) { window.location.href = '/student/login'; return }
    try {
      await interactionApi.applyInternship(id, {})
      setMsg('Internship application submitted!')
    } catch (err) { setMsg(err.response?.data?.message || 'Apply failed') }
  }

  if (!data) return <div style={{ padding: 40, color: '#94A3B8', minHeight: '100vh', background: '#0A0A14' }}>Loading company profile...</div>
  const c = data.company
  const images = (data.gallery || []).filter(g => g.type === 'image')
  const videos = (data.gallery || []).filter(g => g.type === 'video')

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A14', color: '#E9D5FF' }}>
      <header style={{
        minHeight: 240, background: c.banner ? `linear-gradient(180deg,rgba(0,0,0,0.4),rgba(10,10,20,0.95)), url(${c.banner}) center/cover` : 'linear-gradient(135deg,#581C87,#A855F7)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          {c.logo && <img src={c.logo} alt="" style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 12 }} />}
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem,4vw,2.4rem)' }}>{c.name}</h1>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 48px' }}>
        <Link to="/discover" style={{ color: '#C084FC' }}>← Discovery</Link>
        <PublicProfileActions targetType="company" targetId={c._id} accent="#A855F7" />
        {msg && <p style={{ color: '#C084FC' }}>{msg}</p>}

        <Section title="About"><p style={{ lineHeight: 1.7 }}>{c.about || '—'}</p></Section>
        <Section title="Mission & Vision"><p><strong>Mission:</strong> {c.mission || '—'}</p><p><strong>Vision:</strong> {c.vision || '—'}</p></Section>

        {(c.products || []).length > 0 && (
          <Section title="Products"><Grid>{c.products.map((p, i) => <Card key={i} title={p.name} sub={p.description} link={p.url} />)}</Grid></Section>
        )}
        {(c.services || []).length > 0 && (
          <Section title="Services"><Grid>{c.services.map((s, i) => <Card key={i} title={s.name} sub={s.description} />)}</Grid></Section>
        )}
        {(c.techStack || []).length > 0 && (
          <Section title="Technology Stack"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{c.techStack.map((t, i) => <span key={i} style={tagStyle}>{t}</span>)}</div></Section>
        )}
        {(c.offices || []).length > 0 && (
          <Section title="Offices">{c.offices.map((o, i) => <div key={i}>{o.city}, {o.country} — {o.address}</div>)}</Section>
        )}
        {(c.awards || []).length > 0 && (
          <Section title="Awards">{c.awards.map((a, i) => <div key={i}>{a.title} ({a.year})</div>)}</Section>
        )}
        {(c.achievements || []).length > 0 && (
          <Section title="Achievements">{c.achievements.map((a, i) => <div key={i}><strong>{a.title}</strong> — {a.description}</div>)}</Section>
        )}

        <Section title="Careers — Open Jobs">
          {(data.jobs || []).map(j => (
            <div key={j._id} style={{ padding: 14, marginBottom: 10, borderRadius: 10, border: '1px solid rgba(168,85,247,0.25)' }}>
              <strong>{j.title}</strong> — {j.location} — {j.type}
              <p style={{ fontSize: '0.85rem', opacity: 0.75 }}>{j.description?.slice(0, 200)}</p>
              <button type="button" onClick={() => applyJob(j._id)} style={applyBtn}>Apply for Job</button>
            </div>
          ))}
        </Section>

        <Section title="Internships">
          {(data.internships || []).map(j => (
            <div key={j._id} style={{ padding: 14, marginBottom: 10, borderRadius: 10, border: '1px solid rgba(168,85,247,0.25)' }}>
              <strong>{j.title}</strong> — {j.duration} — Stipend: ₹{j.stipend}
              <button type="button" onClick={() => applyInternship(j._id)} style={{ ...applyBtn, marginTop: 8 }}>Apply Internship</button>
            </div>
          ))}
        </Section>

        {images.length > 0 && (
          <Section title="Gallery">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
              {images.map(g => <img key={g._id} src={g.url} alt={g.caption} style={{ width: '100%', borderRadius: 10, aspectRatio: '4/3', objectFit: 'cover' }} />)}
            </div>
          </Section>
        )}
        {videos.length > 0 && (
          <Section title="Videos">{videos.map(v => <video key={v._id} src={v.url} controls style={{ width: '100%', borderRadius: 10, marginBottom: 12, maxHeight: 360 }} />)}</Section>
        )}

        {(data.events || []).length > 0 && <Section title="Events">{data.events.map(ev => <div key={ev._id}>{ev.title}</div>)}</Section>}
        {(data.promotions || []).length > 0 && <Section title="Company News">{data.promotions.map(p => <div key={p._id}><strong>{p.title}</strong><p style={{ opacity: 0.8 }}>{p.content}</p></div>)}</Section>}
        {(data.reviews || []).length > 0 && <Section title="Reviews">{data.reviews.map(r => <div key={r._id}>★{r.rating} {r.content}</div>)}</Section>}

        <Section title="Contact">
          {c.contact?.website && <a href={c.contact.website} target="_blank" rel="noreferrer" style={{ color: '#C084FC', display: 'block' }}>Website →</a>}
          {c.contact?.linkedin && <a href={c.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: '#C084FC', display: 'block' }}>LinkedIn →</a>}
          {c.social?.twitter && <a href={c.social.twitter} style={{ color: '#C084FC' }}>Twitter</a>}
          <p>Email: {c.contact?.email}</p>
        </Section>
      </div>
    </div>
  )
}

const tagStyle = { padding: '6px 12px', borderRadius: 20, background: 'rgba(168,85,247,0.15)', fontSize: '0.85rem' }
const applyBtn = { padding: '8px 16px', borderRadius: 8, border: 'none', background: '#A855F7', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }

function Section({ title, children }) {
  return <section style={{ marginTop: 28 }}><h2 style={{ fontSize: '1.15rem', color: '#C084FC', marginBottom: 12 }}>{title}</h2>{children}</section>
}
function Grid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>{children}</div>
}
function Card({ title, sub, link }) {
  return (
    <div style={{ padding: 14, borderRadius: 10, border: '1px solid rgba(168,85,247,0.2)' }}>
      <strong>{title}</strong>
      {sub && <p style={{ fontSize: '0.82rem', opacity: 0.7, margin: '6px 0 0' }}>{sub}</p>}
      {link && <a href={link} style={{ color: '#C084FC', fontSize: '0.82rem' }}>View</a>}
    </div>
  )
}
