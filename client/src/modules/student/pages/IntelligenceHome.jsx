import { Link } from 'react-router-dom'
import StudentLayout from '../layouts/StudentLayout'
import { ErrorState } from '@shared/components/ui'
import useIntelligence from '../hooks/useIntelligence'
import {
  ActionCenter,
  DailyBriefCard,
  InsightArchitectureGrid,
  IntelligencePanel,
  KnowledgeMemoryPanel,
  LearningDashboardPanel,
  LearningPlanPanel,
  PersonalProfileSummary,
  ProgressSummaryGrid,
  RecommendationList,
} from '../components/intelligence/IntelligenceWidgets'
import '../styles/intelligence.css'

export default function IntelligenceHome() {
  const { sections, loading, error, refresh } = useIntelligence()

  return (
    <StudentLayout>
      <div className="dw-intelligence">
        <header className="dw-intelligence__hero">
          <div>
            <p className="dw-intelligence__eyebrow">Dream Wave AI</p>
            <h1>AI Intelligence Workspace</h1>
            <p>Your personal learning companion — briefings, plans, recommendations and memory in one place.</p>
          </div>
          <div className="dw-intelligence__hero-actions">
            <button type="button" className="btn btn-secondary" onClick={() => refresh()} disabled={loading}>
              Refresh
            </button>
            <Link className="btn btn-primary" to="/student/mentor">Open Mentor</Link>
          </div>
        </header>

        {error && <ErrorState title="AI workspace unavailable" message={error} onRetry={refresh} />}

        <ProgressSummaryGrid summary={sections.progressSummary} />

        <div className="dw-intelligence__layout">
          <div className="dw-intelligence__main">
            <IntelligencePanel title="Daily AI Brief" icon="🌅" id="intel-daily-brief">
              <DailyBriefCard brief={sections.dailyBrief} loading={loading} />
            </IntelligencePanel>

            <IntelligencePanel title="Today's Learning Plan" icon="📋" id="intel-learning-plan">
              <LearningPlanPanel plan={sections.learningPlan} loading={loading} />
            </IntelligencePanel>

            <div className="dw-intelligence__grid">
              <IntelligencePanel title="Priority Goals" icon="🎯" id="intel-goals">
                <RecommendationList
                  items={sections.priorityGoals.map((item) => ({
                    id: item.id,
                    title: item.title,
                    subtitle: `${item.progress || 0}% · ${item.priority || 'medium'}`,
                    url: item.url,
                  }))}
                  emptyLabel="Create a goal to see priorities here."
                />
              </IntelligencePanel>

              <IntelligencePanel title="Recommended Tasks" icon="✓" id="intel-tasks">
                <RecommendationList
                  items={sections.recommendedTasks.map((item) => ({
                    id: item.id,
                    title: item.title,
                    subtitle: item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString()}` : item.priority,
                    url: item.url,
                  }))}
                  emptyLabel="Add tasks to get smart recommendations."
                />
              </IntelligencePanel>

              <IntelligencePanel title="Recommended Books" icon="📚" id="intel-books">
                <RecommendationList items={sections.recommendations.books?.items || []} />
              </IntelligencePanel>

              <IntelligencePanel title="Recommended Courses" icon="🎓" id="intel-courses">
                <RecommendationList items={sections.recommendations.courses?.items || []} />
              </IntelligencePanel>

              <IntelligencePanel title="Career Suggestions" icon="🧭" id="intel-career">
                <RecommendationList items={sections.careerSuggestions} />
              </IntelligencePanel>

              <IntelligencePanel title="Learning Progress Summary" icon="📈" id="intel-progress">
                <LearningDashboardPanel dashboard={sections.learningDashboard} loading={loading} />
              </IntelligencePanel>
            </div>

            <IntelligencePanel title="AI Insights" icon="🔮" id="intel-insights">
              <InsightArchitectureGrid insights={sections.insights} />
            </IntelligencePanel>

            <IntelligencePanel title="Knowledge Memory" icon="🧠" id="intel-memory">
              <KnowledgeMemoryPanel memory={sections.knowledgeMemory} />
            </IntelligencePanel>
          </div>

          <aside className="dw-intelligence__aside" aria-label="AI sidebar">
            <IntelligencePanel title="AI Action Center" icon="⚡" id="intel-actions">
              <ActionCenter actions={sections.actionCenter} />
            </IntelligencePanel>

            <IntelligencePanel title="Personal AI Profile" icon="👤" id="intel-profile">
              <PersonalProfileSummary profile={sections.personalProfile} />
            </IntelligencePanel>

            <IntelligencePanel title="Smart Learning Dashboard" icon="📊" id="intel-dashboard">
              <LearningDashboardPanel dashboard={sections.learningDashboard} loading={loading} />
            </IntelligencePanel>
          </aside>
        </div>
      </div>
    </StudentLayout>
  )
}