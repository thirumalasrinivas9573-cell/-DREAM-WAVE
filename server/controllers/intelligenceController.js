const intelligenceService = require('../services/intelligenceService')
const recommendationEngine = require('../services/recommendationEngine')
const decisionSupportService = require('../services/decisionSupportService')
const studentContextEngine = require('../services/studentContextEngine')
const knowledgeGraphService = require('../services/knowledgeGraphService')

const fail = (res, status, message, code = 'INTELLIGENCE_ERROR') => res.status(status).json({ success: false, code, message })

exports.home = async (req, res) => {
  try {
    const data = await intelligenceService.getHome(req.user._id)
    return res.json({ success: true, data })
  } catch (error) {
    console.error('[intelligence.home]', error.message)
    return fail(res, 500, 'AI workspace is temporarily unavailable.')
  }
}

exports.insights = async (req, res) => {
  try {
    const items = await intelligenceService.getDashboardInsights(req.user._id)
    return res.json({ success: true, data: { items } })
  } catch (error) {
    console.error('[intelligence.insights]', error.message)
    return fail(res, 500, 'AI insights are temporarily unavailable.')
  }
}

exports.recommendations = async (req, res) => {
  try {
    const types = String(req.query.types || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    const data = await recommendationEngine.getRecommendations(req.user._id, types.length ? types : null)
    return res.json({ success: true, data })
  } catch (error) {
    console.error('[intelligence.recommendations]', error.message)
    return fail(res, 500, 'Recommendations are temporarily unavailable.')
  }
}

exports.getProfile = async (req, res) => {
  try {
    const profile = await intelligenceService.getOrCreateAiProfile(req.user._id)
    const snapshot = await intelligenceService.buildActivitySnapshot(req.user._id)
    return res.json({
      success: true,
      data: {
        profile,
        activity: intelligenceService.buildPersonalProfile(snapshot),
      },
    })
  } catch (error) {
    console.error('[intelligence.profile.get]', error.message)
    return fail(res, 500, 'AI profile is temporarily unavailable.')
  }
}

exports.updateProfile = async (req, res) => {
  try {
    const profile = await intelligenceService.updatePersonalProfile(req.user._id, req.body || {})
    return res.json({ success: true, profile })
  } catch (error) {
    console.error('[intelligence.profile.update]', error.message)
    return fail(res, 500, 'AI profile update failed.')
  }
}

exports.memory = async (req, res) => {
  try {
    const snapshot = await intelligenceService.buildActivitySnapshot(req.user._id)
    const data = intelligenceService.buildKnowledgeMemory(snapshot)
    return res.json({ success: true, data })
  } catch (error) {
    console.error('[intelligence.memory]', error.message)
    return fail(res, 500, 'Knowledge memory is temporarily unavailable.')
  }
}

exports.learningDashboard = async (req, res) => {
  try {
    const home = await intelligenceService.getHome(req.user._id)
    return res.json({ success: true, data: home.learningDashboard })
  } catch (error) {
    console.error('[intelligence.learningDashboard]', error.message)
    return fail(res, 500, 'Learning dashboard is temporarily unavailable.')
  }
}

exports.nextAction = async (req, res) => {
  try {
    if (!knowledgeGraphService.isEnabled()) {
      return fail(res, 503, 'Intelligence layer is temporarily disabled.', 'INTELLIGENCE_DISABLED')
    }
    const action = await decisionSupportService.getNextAction(req.user._id)
    return res.json({ success: true, data: action })
  } catch (error) {
    console.error('[intelligence.nextAction]', error.message)
    return fail(res, 500, 'Next action is temporarily unavailable.')
  }
}

exports.decisionRecommendations = async (req, res) => {
  try {
    if (!knowledgeGraphService.isEnabled()) {
      return fail(res, 503, 'Intelligence layer is temporarily disabled.', 'INTELLIGENCE_DISABLED')
    }
    const types = String(req.query.types || '')
      .split(',')
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean)
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 8))
    const items = await decisionSupportService.getRecommendations(req.user._id, {
      types: types.length ? types : null,
      limit,
    })
    return res.json({ success: true, data: { items, version: 'v3' } })
  } catch (error) {
    console.error('[intelligence.decisionRecommendations]', error.message)
    return fail(res, 500, 'Decision recommendations are temporarily unavailable.')
  }
}

exports.contextSummary = async (req, res) => {
  try {
    const data = await studentContextEngine.buildContextSummary(req.user._id)
    return res.json({ success: true, data })
  } catch (error) {
    console.error('[intelligence.contextSummary]', error.message)
    return fail(res, 500, 'Context summary is temporarily unavailable.')
  }
}

exports.graphSummary = async (req, res) => {
  try {
    if (!knowledgeGraphService.isEnabled()) {
      return fail(res, 503, 'Intelligence layer is temporarily disabled.', 'INTELLIGENCE_DISABLED')
    }
    await knowledgeGraphService.syncFromCanonical(req.user._id)
    const summary = await knowledgeGraphService.getGraphSummary(req.user._id)
    return res.json({ success: true, data: summary })
  } catch (error) {
    console.error('[intelligence.graphSummary]', error.message)
    return fail(res, 500, 'Knowledge graph summary is temporarily unavailable.')
  }
}

exports.dismissRecommendation = async (req, res) => {
  try {
    const fp = String(req.params.fingerprint || '').trim()
    if (!fp) return fail(res, 400, 'Recommendation fingerprint is required.', 'INVALID_FINGERPRINT')
    await decisionSupportService.dismissRecommendation(req.user._id, fp)
    return res.json({ success: true })
  } catch (error) {
    console.error('[intelligence.dismissRecommendation]', error.message)
    return fail(res, 500, 'Failed to dismiss recommendation.')
  }
}

exports.feedbackRecommendation = async (req, res) => {
  try {
    const fp = String(req.params.fingerprint || '').trim()
    const { feedback } = req.body || {}
    if (!fp) return fail(res, 400, 'Recommendation fingerprint is required.', 'INVALID_FINGERPRINT')
    await decisionSupportService.feedbackRecommendation(req.user._id, fp, feedback)
    return res.json({ success: true })
  } catch (error) {
    if (error.statusCode) return fail(res, error.statusCode, error.message, error.code)
    console.error('[intelligence.feedbackRecommendation]', error.message)
    return fail(res, 500, 'Failed to save recommendation feedback.')
  }
}
