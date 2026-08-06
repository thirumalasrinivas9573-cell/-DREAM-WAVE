import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, EmptyState, LoadingState } from '@shared/components/ui'
import StudentLayout from '../layouts/StudentLayout'
import researchService from '@shared/services/researchService'
import '../styles/research.css'

const TABS = ['overview', 'sources', 'chat', 'notes', 'claims', 'synthesis', 'report']

export default function ResearchWorkspace() {
  const { id } = useParams()
  const [tab, setTab] = useState('overview')
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sourceForm, setSourceForm] = useState({ title: '', rawText: '', url: '' })
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })
  const [claimForm, setClaimForm] = useState({ text: '' })
  const [chatQ, setChatQ] = useState('')
  const [chatResult, setChatResult] = useState(null)
  const [plan, setPlan] = useState(null)
  const [synthesis, setSynthesis] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await researchService.project(id, { force: true })
      setDetail(data)
      setSynthesis(data.project?.synthesis ? { synthesis: data.project.synthesis, report: data.project.report } : null)
    } catch (err) {
      setError(err.userMessage || err.message || 'Failed to load project.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const project = detail?.project

  async function addSource(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await researchService.api.addSource(id, sourceForm)
      setSourceForm({ title: '', rawText: '', url: '' })
      researchService.invalidate()
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function addNote(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await researchService.api.addNote(id, noteForm)
      setNoteForm({ title: '', content: '' })
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function addClaim(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await researchService.api.addClaim(id, { text: claimForm.text, citations: [] })
      setClaimForm({ text: '' })
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function askChat(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const { data } = await researchService.api.chat(id, { question: chatQ })
      setChatResult(data.result)
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function loadPlan() {
    setBusy(true)
    try {
      const { data } = await researchService.api.proposePlan(id)
      setPlan(data.plan)
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function applyPlan() {
    if (!plan?.steps) return
    setBusy(true)
    try {
      await researchService.api.applyPlan(id, { steps: plan.steps })
      setPlan(null)
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function runSynthesis() {
    setBusy(true)
    try {
      const { data } = await researchService.api.synthesize(id)
      setSynthesis({ synthesis: data.output?.synthesis, report: data.project?.report, connections: data.output?.connections })
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return <StudentLayout><div className="research-shell"><LoadingState label="Loading research project…" rows={8} /></div></StudentLayout>
  }

  if (error && !project) {
    return <StudentLayout><ErrorState title="Project unavailable" message={error} onRetry={load} /></StudentLayout>
  }

  return (
    <StudentLayout>
      <div className="research-shell">
        <nav className="research-breadcrumb"><Link to="/student/research">Research</Link> / <span>{project?.title}</span></nav>
        <header className="research-project-header">
          <div>
            <h1>{project?.title}</h1>
            {project?.question && <p>{project.question}</p>}
            <span className="research-status">{project?.status}</span>
          </div>
          <Link to={`/student/mentor?mode=research`} className="btn btn-secondary">Open AI Mentor</Link>
        </header>

        <div className="research-tabs" role="tablist" aria-label="Research sections">
          {TABS.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={tab === item} className={tab === item ? 'is-active' : ''} onClick={() => setTab(item)}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </button>
          ))}
        </div>

        {error && <p className="research-error" role="alert">{error}</p>}

        {tab === 'overview' && (
          <section className="research-panel">
            <p>{project?.description || 'Add a description and research plan to guide your work.'}</p>
            <div className="research-actions">
              <button type="button" className="btn btn-secondary" onClick={loadPlan} disabled={busy}>Propose research plan</button>
              {plan && (
                <>
                  <p className="research-disclaimer">{plan.disclaimer}</p>
                  <ol className="research-plan-list">
                    {plan.steps.map((step) => <li key={step.order}><strong>{step.title}</strong><span>{step.description}</span></li>)}
                  </ol>
                  <button type="button" className="btn btn-primary" onClick={applyPlan} disabled={busy}>Confirm plan</button>
                </>
              )}
            </div>
            {project?.researchPlan?.length > 0 && (
              <ol className="research-plan-list">
                {project.researchPlan.map((step) => <li key={step._id || step.order}><strong>{step.title}</strong><span>{step.description}</span></li>)}
              </ol>
            )}
          </section>
        )}

        {tab === 'sources' && (
          <section className="research-panel">
            <form onSubmit={addSource} className="research-form">
              <input value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} placeholder="Source title" required />
              <input value={sourceForm.url} onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })} placeholder="URL (optional)" />
              <textarea value={sourceForm.rawText} onChange={(e) => setSourceForm({ ...sourceForm, rawText: e.target.value })} rows={6} placeholder="Paste source text for indexing and grounded retrieval…" aria-label="Source text" />
              <button type="submit" className="btn btn-primary" disabled={busy}>Add source</button>
            </form>
            {detail?.sources?.length ? (
              <ul className="research-source-list">
                {detail.sources.map((s) => (
                  <li key={s._id}><strong>{s.title}</strong><span>{s.chunkCount || 0} chunks · {s.sourceType}</span></li>
                ))}
              </ul>
            ) : <EmptyState title="No sources yet" message="Add documents, notes, or pasted text to ground AI answers." />}
          </section>
        )}

        {tab === 'chat' && (
          <section className="research-panel">
            <p>Answers are grounded in your project sources when available.</p>
            <form onSubmit={askChat} className="research-inline-form">
              <input value={chatQ} onChange={(e) => setChatQ(e.target.value)} placeholder="Ask about your research…" aria-label="Research question" required />
              <button type="submit" className="btn btn-primary" disabled={busy}>Ask</button>
            </form>
            {chatResult && (
              <article className="research-chat-result">
                <p>{chatResult.answer}</p>
                {chatResult.sourceGrounded && <span className="research-badge">Source grounded</span>}
                {!chatResult.sourceGrounded && chatResult.generalNote && <p className="research-disclaimer">{chatResult.generalNote}</p>}
                {chatResult.citations?.length > 0 && (
                  <ul className="research-citation-list">
                    {chatResult.citations.map((c) => (
                      <li key={`${c.sourceTitle}-${c.excerpt?.slice(0, 20)}`}><strong>{c.sourceTitle}</strong> ({c.confidence})<p>{c.excerpt}</p></li>
                    ))}
                  </ul>
                )}
              </article>
            )}
          </section>
        )}

        {tab === 'notes' && (
          <section className="research-panel">
            <form onSubmit={addNote} className="research-form">
              <input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} placeholder="Note title" />
              <textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="Research notes…" required />
              <button type="submit" className="btn btn-primary" disabled={busy}>Save note</button>
            </form>
            {detail?.notes?.length ? (
              <ul className="research-note-list">{detail.notes.map((n) => <li key={n._id}><strong>{n.title || 'Note'}</strong><p>{n.content}</p></li>)}</ul>
            ) : <EmptyState title="No notes" message="Private research notes stay in your workspace." />}
          </section>
        )}

        {tab === 'claims' && (
          <section className="research-panel">
            <form onSubmit={addClaim} className="research-form">
              <textarea value={claimForm.text} onChange={(e) => setClaimForm({ text: e.target.value })} placeholder="Verifiable claim with evidence…" required />
              <button type="submit" className="btn btn-primary" disabled={busy}>Add claim</button>
            </form>
            {detail?.claims?.length ? (
              <ul className="research-claim-list">
                {detail.claims.map((c) => (
                  <li key={c._id}><strong>{c.text}</strong><span>{c.status} · {c.citations?.length || 0} citations</span></li>
                ))}
              </ul>
            ) : <EmptyState title="No claims yet" message="Extract claims from sources and attach citations." />}
          </section>
        )}

        {tab === 'synthesis' && (
          <section className="research-panel">
            <button type="button" className="btn btn-secondary" onClick={runSynthesis} disabled={busy}>Generate synthesis from sources</button>
            {synthesis?.synthesis && <div className="research-synthesis"><p>{synthesis.synthesis}</p></div>}
            {synthesis?.connections && (
              <div className="research-connections">
                <h3>Knowledge connections</h3>
                {synthesis.connections.skills?.length > 0 && <p>Skills: {synthesis.connections.skills.join(', ')}</p>}
                {synthesis.connections.learningActions?.length > 0 && <p>Learning: {synthesis.connections.learningActions.join('; ')}</p>}
              </div>
            )}
          </section>
        )}

        {tab === 'report' && (
          <section className="research-panel">
            {project?.report?.sections?.length ? (
              project.report.sections.map((section) => (
                <article key={section.title} className="research-report-section">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </article>
              ))
            ) : (
              <EmptyState title="No report yet" message="Run synthesis to generate a structured research report from your sources." action={<button type="button" className="btn btn-sm" onClick={runSynthesis}>Synthesize</button>} />
            )}
          </section>
        )}
      </div>
    </StudentLayout>
  )
}
