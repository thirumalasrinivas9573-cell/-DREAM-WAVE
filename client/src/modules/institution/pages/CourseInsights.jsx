import { useEffect, useState } from 'react'
import { institutionApi } from '@shared/services/api'
import { INSTITUTION_THEME } from '../theme'

export default function CourseInsights() {
  const t = INSTITUTION_THEME
  const [courses, setCourses] = useState([])
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    institutionApi.courses.list({ limit: 50 }).then(r => setCourses(r.data.items || []))
  }, [])

  const loadInsights = async (id) => {
    setLoading(true)
    try {
      const { data } = await institutionApi.courses.insights(id)
      setInsights({ course: data.course, insights: data.insights })
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h1 style={{ color: t.accentLight }}>🤖 AI Course Insights</h1>
      <p style={{ opacity: 0.7 }}>Select a course to generate career intelligence</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, margin: '20px 0' }}>
        {courses.map(c => (
          <button key={c._id} type="button" onClick={() => loadInsights(c._id)} className="inst-card" style={{ textAlign: 'left', cursor: 'pointer', color: 'inherit' }}>
            <strong>{c.title}</strong>
            <div style={{ fontSize: '0.82rem', opacity: 0.6 }}>{c.level}</div>
          </button>
        ))}
      </div>
      {loading && <p>Generating insights...</p>}
      {insights && (
        <div className="inst-card">
          <h3 style={{ color: t.accentLight }}>{insights.course.title}</h3>
          <p>{insights.insights.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
            <Metric label="Popularity" value={insights.insights.popularity} />
            <Metric label="Salary Rank" value={insights.insights.salaryRank} />
            <Metric label="Demand" value={insights.insights.demandScore} />
          </div>
          {insights.insights.industryDemand && <p><strong>Industry Demand:</strong> {insights.insights.industryDemand}</p>}
          {insights.insights.futureScope && <p><strong>Future Scope:</strong> {insights.insights.futureScope}</p>}
          {insights.insights.competitionLevel && <p><strong>Competition:</strong> {insights.insights.competitionLevel}</p>}
          {(insights.insights.careerPaths || insights.course.careerPaths)?.length > 0 && (
            <p><strong>Career Paths:</strong> {(insights.insights.careerPaths || insights.course.careerPaths).join(', ')}</p>
          )}
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }) {
  return <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{value || 0}</div><div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{label}</div></div>
}
