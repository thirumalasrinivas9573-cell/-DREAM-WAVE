import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { institutionApi, interactionApi } from '../../shared/services/api'
import { useAuth } from '../../shared/context/AuthContext'
import PublicProfileActions from '../../shared/components/portal/PublicProfileActions'

export default function InstitutionPublic() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [applyMsg, setApplyMsg] = useState('')

  useEffect(() => {
    institutionApi.publicProfile(slug).then(r => setData(r.data)).catch(() => setData(null))
  }, [slug])

  const applyNow = async () => {
    if (!user) { window.location.href = '/student/login'; return }
    try {
      await interactionApi.applyAdmission(data.institution._id, { coverLetter: 'Application via public profile' })
      setApplyMsg('Application submitted successfully!')
    } catch (err) {
      setApplyMsg(err.response?.data?.message || 'Could not apply')
    }
  }

  if (!data) return <div style={{ padding: 40, color: '#94A3B8', minHeight: '100vh', background: '#0F0C06' }}>Loading institution profile...</div>
  const i = data.institution
  const images = (data.gallery || []).filter(g => g.type === 'image')
  const videos = (data.gallery || []).filter(g => g.type === 'video')

  return (
    <div style={{ minHeight: '100vh', background: '#0F0C06', color: '#FEF3C7' }}>
      <header style={{
        minHeight: 240, background: i.banner ? `linear-gradient(180deg,rgba(0,0,0,0.3),rgba(15,12,6,0.95)), url(${i.banner}) center/cover` : 'linear-gradient(135deg,#78350F,#F59E0B)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', width: '100%' }}>
          {i.logo && <img src={i.logo} alt="" style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 12 }} />}
          <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem,4vw,2.4rem)' }}>{i.name}</h1>
          <p style={{ opacity: 0.8, marginTop: 8 }}>{i.contact?.city}{i.contact?.city && i.contact?.country ? ', ' : ''}{i.contact?.country}</p>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px 48px' }}>
        <Link to="/discover" style={{ color: '#FCD34D' }}>← Discovery</Link>
        <PublicProfileActions targetType="institution" targetId={i._id} accent="#F59E0B" />

        <Section title="About"><p style={{ lineHeight: 1.7, opacity: 0.9 }}>{i.about || '—'}</p></Section>
        <Section title="Mission & Vision">
          <p><strong>Mission:</strong> {i.mission || '—'}</p>
          <p><strong>Vision:</strong> {i.vision || '—'}</p>
        </Section>

        {(data.departments || []).length > 0 && (
          <Section title="Departments">
            <Grid>{data.departments.map(d => <Card key={d._id} title={d.name} sub={d.head ? `Head: ${d.head}` : d.code} />)}</Grid>
          </Section>
        )}

        <Section title="Courses">
          <Grid>{(data.courses || []).map(c => <Card key={c._id} title={c.title} sub={`${c.level} · ${c.duration || '—'}`} />)}</Grid>
        </Section>

        <Section title="Placements">
          {(data.placements || []).map(p => <div key={p._id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{p.company} — {p.role} — ₹{p.package}L ({p.studentsPlaced} placed)</div>)}
        </Section>

        {(i.recruiters || []).length > 0 && (
          <Section title="Recruiters">
            <Grid>{i.recruiters.map((r, idx) => <Card key={idx} title={r.name} sub={r.package ? `Package: ${r.package}` : ''} />)}</Grid>
          </Section>
        )}

        {(i.facilities || []).length > 0 && (
          <Section title="Facilities"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{i.facilities.map((f, idx) => <span key={idx} style={{ padding: '6px 12px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', fontSize: '0.85rem' }}>{f}</span>)}</div></Section>
        )}

        {images.length > 0 && (
          <Section title="Gallery">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
              {images.map(g => <img key={g._id} src={g.url} alt={g.caption} style={{ width: '100%', borderRadius: 10, aspectRatio: '4/3', objectFit: 'cover' }} />)}
            </div>
          </Section>
        )}

        {videos.length > 0 && (
          <Section title="Campus Videos">
            {videos.map(v => <div key={v._id} style={{ marginBottom: 12 }}><video src={v.url} controls style={{ width: '100%', borderRadius: 10, maxHeight: 360 }} /><p style={{ fontSize: '0.85rem', opacity: 0.7 }}>{v.caption}</p></div>)}
          </Section>
        )}

        {(i.achievements || []).length > 0 && (
          <Section title="Achievements">{i.achievements.map((a, idx) => <div key={idx}><strong>{a.title}</strong> ({a.year}) — {a.description}</div>)}</Section>
        )}

        {(i.research || []).length > 0 && (
          <Section title="Research">{i.research.map((r, idx) => <div key={idx}><strong>{r.title}</strong> — {r.summary} {r.url && <a href={r.url} style={{ color: '#FCD34D' }}>Read</a>}</div>)}</Section>
        )}

        {(data.events || []).length > 0 && (
          <Section title="Events">{data.events.map(ev => <div key={ev._id}>{ev.title} — {new Date(ev.startDate).toLocaleDateString()}</div>)}</Section>
        )}

        {(data.promotions || []).length > 0 && (
          <Section title="News & Announcements">{data.promotions.map(p => <div key={p._id} style={{ marginBottom: 10 }}><strong>{p.title}</strong><p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{p.content}</p></div>)}</Section>
        )}

        <Section title="Admission Information">
          <p>{i.admissionInfo || 'Contact the institution for admission details.'}</p>
          {i.scholarships && <p><strong>Scholarships:</strong> {i.scholarships}</p>}
          {i.brochureUrl && <a href={i.brochureUrl} target="_blank" rel="noreferrer" style={{ color: '#FCD34D' }}>Download Brochure →</a>}
        </Section>

        <Section title="Contact">
          <p>Email: {i.contact?.email || '—'}</p>
          <p>Phone: {i.contact?.phone || '—'}</p>
          <p>Website: {i.contact?.website ? <a href={i.contact.website} style={{ color: '#FCD34D' }}>{i.contact.website}</a> : '—'}</p>
          <p>{i.contact?.address}</p>
          {i.location?.lat && <a href={`https://maps.google.com/?q=${i.location.lat},${i.location.lng}`} target="_blank" rel="noreferrer" style={{ color: '#FCD34D' }}>View on Map</a>}
        </Section>

        {(data.reviews || []).length > 0 && (
          <Section title="Student Reviews">
            {data.reviews.map(r => <div key={r._id} style={{ marginBottom: 8 }}>★{r.rating} — {r.content || r.title}</div>)}
          </Section>
        )}

        <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={applyNow} style={{ padding: '14px 28px', borderRadius: 10, border: 'none', background: '#F59E0B', color: '#1a1208', fontWeight: 700, cursor: 'pointer' }}>Apply Now</button>
          {applyMsg && <span style={{ color: '#FCD34D' }}>{applyMsg}</span>}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return <section style={{ marginTop: 28 }}><h2 style={{ fontSize: '1.15rem', color: '#FCD34D', marginBottom: 12 }}>{title}</h2>{children}</section>
}
function Grid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>{children}</div>
}
function Card({ title, sub }) {
  return <div style={{ padding: 14, borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)' }}><strong>{title}</strong>{sub && <div style={{ fontSize: '0.82rem', opacity: 0.65, marginTop: 4 }}>{sub}</div>}</div>
}
