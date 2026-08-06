const mentorContextEngine = require('./mentorContextEngine')
const knowledgeGraphService = require('./knowledgeGraphService')

const INTENTS = [
  'GENERAL_MENTOR', 'GOAL_HELP', 'ROADMAP_HELP', 'STUDY_HELP', 'TASK_HELP', 'PLANNER_HELP',
  'LIBRARY_HELP', 'CAREER_HELP', 'PROJECT_HELP', 'PROFILE_HELP', 'SEARCH_HELP', 'ACADEMIC_HELP',
]

const INTENT_KEYWORDS = {
  GOAL_HELP: /\b(goal|objective|milestone)\b/i,
  ROADMAP_HELP: /\b(roadmap|stage|learning path|next step)\b/i,
  STUDY_HELP: /\b(study|learn|practice|topic|concept)\b/i,
  ACADEMIC_HELP: /\b(syllabus|semester|subject|exam|assignment|unit|revise|revision|midterm|internal)\b/i,
  TASK_HELP: /\b(task|todo|deadline|due|complete)\b/i,
  PLANNER_HELP: /\b(planner|schedule|plan my day|focus|today'?s plan)\b/i,
  LIBRARY_HELP: /\b(book|read|library|resource|continue reading)\b/i,
  CAREER_HELP: /\b(career|job|internship|interview|apply|role|resume)\b/i,
  PROJECT_HELP: /\b(project|portfolio|build|github)\b/i,
  PROFILE_HELP: /\b(profile|portfolio|credential|certificate)\b/i,
  SEARCH_HELP: /\b(search|find|discover|look for)\b/i,
  RESEARCH_HELP: /\b(research|source|citation|synthesize|hypothesis|literature review|evidence)\b/i,
}

const LAYER_SOURCES = {
  identity: ['profile'],
  goal: ['goals', 'tasks', 'roadmaps'],
  learning: ['library', 'roadmaps', 'skills', 'academics', 'research'],
  career: ['career', 'skills'],
  activity: ['tasks', 'planner'],
  temporal: ['planner', 'tasks'],
  conversation: [],
  academic: ['academics'],
  research: ['research', 'library'],
}

const INTENT_LAYERS = {
  GENERAL_MENTOR: ['identity', 'goal', 'learning', 'career', 'activity', 'temporal', 'academic'],
  GOAL_HELP: ['identity', 'goal', 'learning'],
  ROADMAP_HELP: ['goal', 'learning'],
  STUDY_HELP: ['learning', 'goal', 'temporal', 'academic'],
  ACADEMIC_HELP: ['academic', 'learning', 'temporal'],
  RESEARCH_HELP: ['research', 'library', 'goal'],
  TASK_HELP: ['activity', 'goal', 'temporal'],
  PLANNER_HELP: ['temporal', 'activity', 'goal'],
  LIBRARY_HELP: ['learning', 'goal'],
  CAREER_HELP: ['career', 'goal', 'learning'],
  PROJECT_HELP: ['goal', 'learning', 'career'],
  PROFILE_HELP: ['identity'],
  SEARCH_HELP: ['goal', 'learning', 'career'],
}

const DEFAULT_BUDGET = 4200

const MENTOR_MODE_INTENT = {
  goal: 'GOAL_HELP',
  study: 'STUDY_HELP',
  learning: 'STUDY_HELP',
  career: 'CAREER_HELP',
  project: 'PROJECT_HELP',
  research: 'LIBRARY_HELP',
}

function routeIntent(message = '', { mentorMode = 'general', action = '' } = {}) {
  if (action === 'plan-day') return 'PLANNER_HELP'
  if (action === 'help-goal') return 'GOAL_HELP'
  if (action === 'help-career') return 'CAREER_HELP'
  if (action === 'recommend-books') return 'LIBRARY_HELP'
  if (action === 'recommend-next') return 'GOAL_HELP'
  if (MENTOR_MODE_INTENT[mentorMode]) return MENTOR_MODE_INTENT[mentorMode]

  for (const [intent, pattern] of Object.entries(INTENT_KEYWORDS)) {
    if (pattern.test(message)) return intent
  }
  return 'GENERAL_MENTOR'
}

function layersForIntent(intent) {
  return INTENT_LAYERS[intent] || INTENT_LAYERS.GENERAL_MENTOR
}

function sourcesForLayers(layers) {
  const sources = new Set()
  for (const layer of layers) {
    for (const source of LAYER_SOURCES[layer] || []) sources.add(source)
  }
  return [...sources]
}

async function buildStudentContext(userId, options = {}) {
  const {
    message = '',
    mentorMode = 'general',
    action = '',
    budget = DEFAULT_BUDGET,
    includeGraph = true,
  } = options

  const intent = routeIntent(message, { mentorMode, action })
  const layers = layersForIntent(intent)
  const sources = sourcesForLayers(layers)

  const mentorSources = mentorContextEngine.resolveSources
    ? mentorContextEngine.resolveSources(message, mentorMode, action)
    : sources

  const filteredSources = mentorSources.filter((source) => {
    const layerSources = new Set(sources)
    if (layerSources.has(source)) return true
    if (source === 'profile' && layers.includes('identity')) return true
    return false
  })

  const mentorContext = await mentorContextEngine.buildMentorContext(userId, {
    message,
    mentorMode,
    action,
    sourcesOverride: filteredSources.length ? filteredSources : undefined,
  })

  let graphSummary = null
  let relationshipLines = []
  if (includeGraph && knowledgeGraphService.isEnabled()) {
    await knowledgeGraphService.syncFromCanonical(userId).catch(() => null)
    graphSummary = await knowledgeGraphService.getGraphSummary(userId).catch(() => null)
    const activeGoal = mentorContext.loaded?.goals?.find((g) => g.status === 'active') || mentorContext.loaded?.goals?.[0]
    if (activeGoal) {
      const related = await knowledgeGraphService.getRelatedContext(userId, {
        entityType: 'goal', entityId: activeGoal._id, limit: 6,
      }).catch(() => [])
      relationshipLines = related.map((r) => `- ${r.relation}: ${r.to}${r.label ? ` (${r.label})` : ''}`)
    }
  }

  let text = mentorContext.contextText || ''
  if (layers.includes('academic') || intent === 'ACADEMIC_HELP' || intent === 'STUDY_HELP') {
    try {
      const academicService = require('./academicService')
      const conceptMasteryService = require('./conceptMasteryService')
      if (academicService.isEnabled()) {
        const overview = await academicService.getOverview(userId)
        const revision = await conceptMasteryService.getRevisionQueue(userId, { limit: 5 })
        const academicLines = []
        if (overview.profile?.program) academicLines.push(`Program: ${overview.profile.program}${overview.profile.branch ? ` (${overview.profile.branch})` : ''}`)
        if (overview.subjects?.length) academicLines.push(`Active subjects: ${overview.subjects.map((s) => s.name).join(', ')}`)
        if (overview.upcomingExam) academicLines.push(`Next exam: ${overview.upcomingExam.name} in ${overview.upcomingExam.daysRemaining} day(s)`)
        if (overview.dueAssignment) academicLines.push(`Assignment due: ${overview.dueAssignment.title}`)
        if (revision.length) academicLines.push(`Revision queue: ${revision.map((r) => r.name).join(', ')}`)
        if (academicLines.length) text = `${text}\n\nACADEMIC CONTEXT (private, student-provided)\n${academicLines.join('\n')}`
      }
    } catch {
      // Academic context failure must not break mentor
    }
  }
  if (layers.includes('research') || intent === 'RESEARCH_HELP') {
    try {
      const researchService = require('./researchService')
      if (researchService.isEnabled()) {
        const overview = await researchService.getOverview(userId)
        const projects = await researchService.listProjects(userId, { limit: 5 })
        const lines = []
        if (overview.active) lines.push(`Active research projects: ${overview.active}`)
        projects.slice(0, 3).forEach((p) => {
          lines.push(`- ${p.title}${p.question ? `: ${p.question}` : ''} (${p.status}, ${p.counts?.sources || 0} sources)`)
        })
        if (lines.length) text = `${text}\n\nRESEARCH CONTEXT (private)\n${lines.join('\n')}`
      }
    } catch {
      // Research context failure must not break mentor
    }
  }
  if (relationshipLines.length) {
    text = `${text}\n\nRELATIONSHIPS\n${relationshipLines.join('\n')}`
  }
  const trimmed = text.length > budget ? `${text.slice(0, budget)}…` : text

  return {
    intent,
    layers,
    provenance: filteredSources.map((source) => ({
      source,
      layer: Object.entries(LAYER_SOURCES).find(([, vals]) => vals.includes(source))?.[0] || 'general',
    })),
    budget,
    budgetUsed: trimmed.length,
    text: trimmed,
    graph: graphSummary,
    dataConfidence: mentorContext.dataConfidence,
    generatedAt: new Date().toISOString(),
  }
}

async function buildContextSummary(userId) {
  const intent = 'GENERAL_MENTOR'
  const layers = layersForIntent(intent)
  const context = await buildStudentContext(userId, { intent, budget: 2400, includeGraph: true })
  return {
    intent: context.intent,
    layers: context.layers,
    graph: context.graph,
    preview: context.text.slice(0, 600),
    generatedAt: context.generatedAt,
  }
}

module.exports = {
  INTENTS,
  routeIntent,
  buildStudentContext,
  buildContextSummary,
  layersForIntent,
}
