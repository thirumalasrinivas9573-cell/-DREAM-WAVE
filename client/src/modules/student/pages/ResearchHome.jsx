import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, EmptyState, LoadingState } from '@shared/components/ui'
import StudentLayout from '../layouts/StudentLayout'
import researchService from '@shared/services/researchService'
import '../styles/research.css'

export default function ResearchHome() {
  const [overview, setOverview] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ title: '', question: '' })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [overviewRes, projectsRes] = await Promise.all([
        researchService.overview({ force: true }),
        researchService.api.projects(),
      ])
      setOverview(overviewRes.data)
      setProjects(projectsRes.data.projects || [])
    } catch (err) {
      setError(err.userMessage || err.message || 'Failed to load research workspace.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function createProject(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setBusy(true)
    try {
      await researchService.api.createProject(form)
      setForm({ title: '', question: '' })
      researchService.invalidate()
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <StudentLayout><div className="research-shell"><LoadingState label="Loading research workspace…" rows={8} /></div></StudentLayout>
  }

  return (
    <StudentLayout>
      <div className="research-shell">
        <header className="research-hero">
          <div>
            <span>AI Research & Knowledge Workspace</span>
            <h1>Understand, verify, organize, and reuse knowledge.</h1>
            <p>Move from question to sources, grounded AI, citations, synthesis, and actionable learning — not generic chat.</p>
          </div>
          <div className="research-hero__stats">
            <div><strong>{overview?.active || 0}</strong><span>Active</span></div>
            <div><strong>{overview?.draft || 0}</strong><span>Draft</span></div>
          </div>
        </header>

        <section className="research-panel">
          <header>
            <h2>New research project</h2>
            <form onSubmit={createProject} className="research-inline-form">
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project title" aria-label="Project title" required />
              <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Research question" aria-label="Research question" />
              <button type="submit" className="btn btn-primary" disabled={busy}>Create</button>
            </form>
          </header>
        </section>

        {error && <p className="research-error" role="alert">{error}</p>}

        <section className="research-panel">
          <h2>Your projects</h2>
          {projects.length ? (
            <ul className="research-project-list">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link to={`/student/research/${project.id}`}>
                    <strong>{project.title}</strong>
                    <span>{project.question || 'No question set'}</span>
                    <em>{project.status} · {project.counts?.sources || 0} sources</em>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No research projects yet" message="Start with a clear question, add sources, and build evidence-backed knowledge." />
          )}
        </section>
      </div>
    </StudentLayout>
  )
}
