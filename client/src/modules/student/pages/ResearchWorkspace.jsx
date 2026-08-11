import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorState, EmptyState, LoadingState } from '@shared/components/ui'
import StudentLayout from '../layouts/StudentLayout'
import researchService from '@shared/services/researchService'
import '../styles/research.css'

const TABS = ['overview', 'intelligence', 'sources', 'chat', 'notes', 'claims', 'synthesis', 'report']

export default function ResearchWorkspace() {
  const { id } = useParams()
  const [tab, setTab] = useState('overview')
  const [detail, setDetail] = useState(null)
  const [intelligence, setIntelligence] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sourceForm, setSourceForm] = useState({ title: '', rawText: '', url: '', author: '', sourceType: 'manual' })
  const [noteForm, setNoteForm] = useState({ title: '', content: '', noteType: 'GENERAL' })
  const [claimForm, setClaimForm] = useState({ text: '' })
  const [chatQ, setChatQ] = useState('')
  const [chatResult, setChatResult] = useState(null)
  const [plan, setPlan] = useState(null)
  const [synthesis, setSynthesis] = useState(null)
  const [compareResult, setCompareResult] = useState(null)
  const [selectedSources, setSelectedSources] = useState([])
  const [questionSuggestion, setQuestionSuggestion] = useState(null)
  const [sourceSummary, setSourceSummary] = useState(null)

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

  const loadIntelligence = useCallback(async () => {
    try {
      const { data } = await researchService.api.intelligence(id)
      setIntelligence(data.data)
    } catch (err) {
      setError(err.userMessage || err.message || 'Failed to load research intelligence.')
    }
  }, [id])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (tab === 'intelligence') loadIntelligence()
  }, [tab, loadIntelligence])

  const project = detail?.project

  async function addSource(e) {
    e.preventDefault()
    setBusy(true)
    try {
      await researchService.api.addSource(id, sourceForm)
      setSourceForm({ title: '', rawText: '', url: '', author: '', sourceType: 'manual' })
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
      await researchService.api.addNote(id, { ...noteForm, origin: 'USER_WRITTEN' })
      setNoteForm({ title: '', content: '', noteType: 'GENERAL' })
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
      setSynthesis({
        synthesis: data.output?.synthesis,
        report: data.project?.report,
        connections: data.output?.connections,
        disclaimer: data.output?.disclaimer,
      })
      await load()
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function refineQuestion() {
    setBusy(true)
    try {
      const { data } = await researchService.api.refineQuestion(id)
      setQuestionSuggestion(data.suggestion)
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function compareSelected() {
    if (selectedSources.length < 2) {
      setError('Select at least two sources to compare.')
      return
    }
    setBusy(true)
    try {
      const { data } = await researchService.api.compareSources(id, { sourceIds: selectedSources })
      setCompareResult(data)
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  async function summarizeSource(sourceId) {
    setBusy(true)
    try {
      const { data } = await researchService.api.summarizeSource(id, sourceId)
      setSourceSummary(data)
    } catch (err) {
      setError(err.userMessage || err.message)
    } finally {
      setBusy(false)
    }
  }

  function toggleSource(sourceId) {
    setSelectedSources((prev) => (
      prev.includes(sourceId) ? prev.filter((item) => item !== sourceId) : [...prev, sourceId].slice(0, 4)
    ))
  }

  async function acceptSuggested(claim) {
    setBusy(true)
    try {
      await researchService.api.acceptSuggestedClaim(id, {
        text: claim.text,
        citations: (claim.citationIndexes || []).map((idx) => {
          const citation = chatResult?.citations?.[idx]
          return citation ? {
            sourceId: citation.sourceId,
            sourceTitle: citation.sourceTitle,
            excerpt: citation.excerpt,
            confidence: citation.confidence,
          } : null
        }).filter(Boolean),
      })
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
            {intelligence?.progress?.label && <span className="research-badge">{intelligence.progress.label}</span>}
          </div>
          <div className="research-header-actions">
            <Link to="/student/knowledge" className="btn btn-ghost">My Knowledge</Link>
            <Link to="/student/profile" className="btn btn-ghost">Portfolio</Link>
            <Link to="/student/mentor?mode=research" className="btn btn-secondary">Open AI Mentor</Link>
          </div>
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
            <p>{project?.description || project?.objective || 'Add a description and research plan to guide your work.'}</p>
            <div className="research-actions">
              <button type="button" className="btn btn-secondary" onClick={refineQuestion} disabled={busy}>Refine question (AI suggestion)</button>
              <button type="button" className="btn btn-secondary" onClick={loadPlan} disabled={busy}>Propose research plan</button>
              {questionSuggestion && (
                <div className="research-suggestion">
                  <span className="research-badge">AI SUGGESTION</span>
                  <p>{questionSuggestion.refined}</p>
                  <small>{questionSuggestion.disclaimer}</small>
                </div>
              )}
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

        {tab === 'intelligence' && (
          <section className="research-panel research-intelligence">
            {!intelligence ? <LoadingState label="Analyzing research workspace…" rows={4} /> : (
              <>
                <div className="research-intel-grid">
                  <div><strong>Lifecycle</strong><span>{intelligence.project.lifecycle}</span></div>
                  <div><strong>Progress</strong><span>{intelligence.progress.label}</span></div>
                  <div><strong>Sources</strong><span>{intelligence.counts.sources}</span></div>
                  <div><strong>Verified claims</strong><span>{intelligence.counts.verifiedClaims}</span></div>
                </div>

                <h3>Next best action</h3>
                <ul className="research-action-list">
                  {intelligence.nextActions.map((item) => (
                    <li key={item.label}><strong>{item.label}</strong><span>{item.why}</span></li>
                  ))}
                </ul>

                <h3>Potential research gaps</h3>
                {intelligence.gaps.length ? (
                  <ul className="research-gap-list">
                    {intelligence.gaps.map((gap) => (
                      <li key={gap.label}>
                        <span className="research-badge">POTENTIAL RESEARCH GAP</span>
                        <strong>{gap.label}</strong>
                        <p>{gap.detail}</p>
                      </li>
                    ))}
                  </ul>
                ) : <p>No obvious gaps detected from current workspace data.</p>}

                <h3>Potential conflicts</h3>
                {intelligence.potentialConflicts.length ? (
                  <ul className="research-gap-list">
                    {intelligence.potentialConflicts.map((item, index) => (
                      <li key={`${item.claimA.id}-${item.claimB.id}-${index}`}>
                        <span className="research-badge">POTENTIAL CONFLICT</span>
                        <p>{item.claimA.text}</p>
                        <p>{item.claimB.text}</p>
                        <small>{item.guidance}</small>
                      </li>
                    ))}
                  </ul>
                ) : <p>No potential claim conflicts detected.</p>}

                <h3>Evidence ledger</h3>
                <ul className="research-ledger">
                  <li>Source-indexed materials: {intelligence.evidenceLedger.sourceExtracted}</li>
                  <li>User notes: {intelligence.evidenceLedger.userNotes}</li>
                  <li>AI notes: {intelligence.evidenceLedger.aiNotes}</li>
                  <li>User claims: {intelligence.evidenceLedger.userClaims}</li>
                  <li>AI-suggested claims: {intelligence.evidenceLedger.aiSuggestedClaims}</li>
                  <li>Verified claims: {intelligence.evidenceLedger.verifiedClaims}</li>
                </ul>

                <h3>Knowledge map</h3>
                <div className="research-knowledge-map" aria-label="Research knowledge map">
                  {intelligence.knowledgeMap.nodes.slice(0, 24).map((node) => (
                    <span key={node.id} className={`research-node research-node--${node.type.toLowerCase()}`}>
                      <em>{node.type}</em>
                      {node.label}
                    </span>
                  ))}
                </div>

                {intelligence.learningConnections?.learningActions?.length > 0 && (
                  <>
                    <h3>Learning connections</h3>
                    <p>{intelligence.learningConnections.learningActions.join('; ')}</p>
                  </>
                )}

                {intelligence.portfolioProject && (
                  <>
                    <h3>Linked portfolio project</h3>
                    <p>{intelligence.portfolioProject.title} · {intelligence.portfolioProject.status}</p>
                  </>
                )}
              </>
            )}
            <button type="button" className="btn btn-ghost" onClick={loadIntelligence} disabled={busy}>Refresh intelligence</button>
          </section>
        )}

        {tab === 'sources' && (
          <section className="research-panel">
            <form onSubmit={addSource} className="research-form">
              <input value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} placeholder="Source title" required aria-label="Source title" />
              <input value={sourceForm.author} onChange={(e) => setSourceForm({ ...sourceForm, author: e.target.value })} placeholder="Author (if known)" aria-label="Author" />
              <input value={sourceForm.url} onChange={(e) => setSourceForm({ ...sourceForm, url: e.target.value })} placeholder="URL (optional)" aria-label="Source URL" />
              <select value={sourceForm.sourceType} onChange={(e) => setSourceForm({ ...sourceForm, sourceType: e.target.value })} aria-label="Source type">
                <option value="manual">Manual / pasted</option>
                <option value="book">Book</option>
                <option value="document">Document / PDF text</option>
                <option value="url">Website / article</option>
                <option value="academic">Paper / academic</option>
                <option value="note">Note</option>
              </select>
              <textarea value={sourceForm.rawText} onChange={(e) => setSourceForm({ ...sourceForm, rawText: e.target.value })} rows={6} placeholder="Paste source text for indexing and grounded retrieval…" aria-label="Source text" />
              <button type="submit" className="btn btn-primary" disabled={busy}>Add source</button>
            </form>
            {detail?.sources?.length ? (
              <>
                <div className="research-actions">
                  <button type="button" className="btn btn-secondary" onClick={compareSelected} disabled={busy || selectedSources.length < 2}>Compare selected</button>
                </div>
                <ul className="research-source-list">
                  {detail.sources.map((s) => (
                    <li key={s._id}>
                      <label>
                        <input type="checkbox" checked={selectedSources.includes(s._id)} onChange={() => toggleSource(s._id)} aria-label={`Select ${s.title}`} />
                        <strong>{s.title}</strong>
                      </label>
                      <span>{s.chunkCount || 0} chunks · {s.sourceType}{s.author ? ` · ${s.author}` : ''}</span>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => summarizeSource(s._id)} disabled={busy}>Summarize</button>
                    </li>
                  ))}
                </ul>
              </>
            ) : <EmptyState title="No sources yet" message="Add documents, notes, or pasted text to ground AI answers." />}
            {compareResult?.comparison && (
              <article className="research-compare">
                <h3>Source comparison</h3>
                <p className="research-disclaimer">{compareResult.comparison.disclaimer}</p>
                <div className="research-compare-grid">
                  <div>
                    <strong>{compareResult.comparison.sourceA.title}</strong>
                    <p>Excerpts available: {compareResult.comparison.sourceA.availableExcerpts}</p>
                    {compareResult.comparison.sourceA.sampleExcerpts?.map((ex) => <p key={ex.slice(0, 24)} className="research-excerpt">{ex}</p>)}
                  </div>
                  <div>
                    <strong>{compareResult.comparison.sourceB.title}</strong>
                    <p>Excerpts available: {compareResult.comparison.sourceB.availableExcerpts}</p>
                    {compareResult.comparison.sourceB.sampleExcerpts?.map((ex) => <p key={ex.slice(0, 24)} className="research-excerpt">{ex}</p>)}
                  </div>
                </div>
              </article>
            )}
            {sourceSummary && (
              <article className="research-summary">
                <span className="research-badge">{sourceSummary.origin || sourceSummary.label}</span>
                <h3>{sourceSummary.source?.title}</h3>
                <p>{sourceSummary.summary || sourceSummary.message}</p>
                {sourceSummary.disclaimer && <small>{sourceSummary.disclaimer}</small>}
              </article>
            )}
          </section>
        )}

        {tab === 'chat' && (
          <section className="research-panel">
            <p>Answers are grounded in your project sources when available. AI interpretation is never treated as a source.</p>
            <form onSubmit={askChat} className="research-inline-form">
              <input value={chatQ} onChange={(e) => setChatQ(e.target.value)} placeholder="Ask about your research…" aria-label="Research question" required />
              <button type="submit" className="btn btn-primary" disabled={busy}>Ask</button>
            </form>
            {chatResult && (
              <article className="research-chat-result">
                <span className="research-badge">{chatResult.contentLabels?.answer || 'AI_INTERPRETATION'}</span>
                <p>{chatResult.answer}</p>
                {chatResult.sourceGrounded && <span className="research-badge">Source grounded</span>}
                {!chatResult.sourceGrounded && chatResult.generalNote && <p className="research-disclaimer">{chatResult.generalNote}</p>}
                {chatResult.citations?.length > 0 && (
                  <>
                    <h4>SOURCE EVIDENCE</h4>
                    <ul className="research-citation-list">
                      {chatResult.citations.map((c) => (
                        <li key={`${c.sourceTitle}-${c.excerpt?.slice(0, 20)}`}><strong>{c.sourceTitle}</strong> ({c.confidence})<p>{c.excerpt}</p></li>
                      ))}
                    </ul>
                  </>
                )}
                {chatResult.suggestedClaims?.length > 0 && (
                  <>
                    <h4>AI-suggested claims (draft)</h4>
                    <ul className="research-claim-list">
                      {chatResult.suggestedClaims.map((claim) => (
                        <li key={claim.text}>
                          <strong>{claim.text}</strong>
                          <button type="button" className="btn btn-sm" onClick={() => acceptSuggested(claim)} disabled={busy}>Save as draft claim</button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </article>
            )}
          </section>
        )}

        {tab === 'notes' && (
          <section className="research-panel">
            <form onSubmit={addNote} className="research-form">
              <input value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} placeholder="Note title" aria-label="Note title" />
              <select value={noteForm.noteType} onChange={(e) => setNoteForm({ ...noteForm, noteType: e.target.value })} aria-label="Note type">
                <option value="GENERAL">General</option>
                <option value="SOURCE_NOTE">Source note</option>
                <option value="IDEA">Idea</option>
                <option value="OBSERVATION">Observation</option>
                <option value="QUESTION">Question</option>
                <option value="SUMMARY">Summary</option>
                <option value="FINDING">Finding</option>
              </select>
              <textarea value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="Research notes…" required aria-label="Note content" />
              <button type="submit" className="btn btn-primary" disabled={busy}>Save note</button>
            </form>
            {detail?.notes?.length ? (
              <ul className="research-note-list">
                {detail.notes.map((n) => (
                  <li key={n._id}>
                    <span className="research-badge">{n.origin || 'USER_WRITTEN'}</span>
                    <strong>{n.title || n.noteType || 'Note'}</strong>
                    <p>{n.content}</p>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No notes" message="Private research notes stay in your workspace." />}
          </section>
        )}

        {tab === 'claims' && (
          <section className="research-panel">
            <p>Findings should cite sources. AI-suggested claims remain drafts until you verify them.</p>
            <form onSubmit={addClaim} className="research-form">
              <textarea value={claimForm.text} onChange={(e) => setClaimForm({ text: e.target.value })} placeholder="Verifiable claim with evidence…" required aria-label="Claim text" />
              <button type="submit" className="btn btn-primary" disabled={busy}>Add claim</button>
            </form>
            {detail?.claims?.length ? (
              <ul className="research-claim-list">
                {detail.claims.map((c) => (
                  <li key={c._id}>
                    <span className="research-badge">{c.aiSuggested ? 'AI_GENERATED' : 'USER_WRITTEN'}</span>
                    <strong>{c.text}</strong>
                    <span>{c.status} · {c.citations?.length || 0} citations</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title="No claims yet" message="Extract claims from sources and attach citations." />}
          </section>
        )}

        {tab === 'synthesis' && (
          <section className="research-panel">
            <button type="button" className="btn btn-secondary" onClick={runSynthesis} disabled={busy}>Generate synthesis from sources</button>
            {synthesis?.disclaimer && <p className="research-disclaimer">{synthesis.disclaimer}</p>}
            {synthesis?.synthesis && (
              <div className="research-synthesis">
                <span className="research-badge">AI_GENERATED</span>
                <p>{synthesis.synthesis}</p>
              </div>
            )}
            {synthesis?.connections && (
              <div className="research-connections">
                <h3>Knowledge connections</h3>
                {synthesis.connections.skills?.length > 0 && <p>Skills: {synthesis.connections.skills.join(', ')}</p>}
                {synthesis.connections.learningActions?.length > 0 && <p>Learning: {synthesis.connections.learningActions.join('; ')}</p>}
                {synthesis.connections.careerRoles?.length > 0 && <p>Career: {synthesis.connections.careerRoles.join(', ')}</p>}
              </div>
            )}
          </section>
        )}

        {tab === 'report' && (
          <section className="research-panel">
            {project?.report?.aiGenerated && <p className="research-disclaimer">Report sections are AI-generated drafts from available sources — review before treating as final.</p>}
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
