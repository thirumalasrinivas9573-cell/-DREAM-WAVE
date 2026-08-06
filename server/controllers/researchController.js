const researchService = require('../services/researchService')
const researchGroundingService = require('../services/researchGroundingService')
const researchSynthesisService = require('../services/researchSynthesisService')

const fail = (res, status, message, code = 'RESEARCH_ERROR') =>
  res.status(status).json({ success: false, code, message })

function guardEnabled(req, res, next) {
  if (!researchService.isEnabled()) {
    return fail(res, 503, 'Research workspace is temporarily unavailable.', 'RESEARCH_DISABLED')
  }
  return next()
}

exports.overview = async (req, res) => {
  try {
    const data = await researchService.getOverview(req.user._id)
    return res.json({ success: true, data })
  } catch (error) {
    return fail(res, 500, error.message || 'Failed to load research overview.')
  }
}

exports.listProjects = async (req, res) => {
  try {
    const projects = await researchService.listProjects(req.user._id, req.query)
    return res.json({ success: true, projects })
  } catch (error) {
    return fail(res, 500, 'Failed to list research projects.')
  }
}

exports.createProject = async (req, res) => {
  try {
    const project = await researchService.createProject(req.user._id, req.body)
    return res.status(201).json({ success: true, project })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to create project.')
  }
}

exports.getProject = async (req, res) => {
  try {
    const data = await researchService.getProjectDetail(req.user._id, req.params.id)
    return res.json({ success: true, data })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to load project.')
  }
}

exports.updateProject = async (req, res) => {
  try {
    const project = await researchService.updateProject(req.user._id, req.params.id, req.body)
    return res.json({ success: true, project })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to update project.')
  }
}

exports.deleteProject = async (req, res) => {
  try {
    const result = await researchService.deleteProject(req.user._id, req.params.id)
    return res.json({ success: true, ...result })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to delete project.')
  }
}

exports.addSource = async (req, res) => {
  try {
    const source = await researchService.addSource(req.user._id, req.params.id, req.body)
    return res.status(201).json({ success: true, source })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to add source.')
  }
}

exports.addNote = async (req, res) => {
  try {
    const note = await researchService.addNote(req.user._id, { ...req.body, projectId: req.params.id })
    return res.status(201).json({ success: true, note })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to add note.')
  }
}

exports.addClaim = async (req, res) => {
  try {
    const claim = await researchService.addClaim(req.user._id, { ...req.body, projectId: req.params.id })
    return res.status(201).json({ success: true, claim })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to add claim.')
  }
}

exports.proposePlan = async (req, res) => {
  try {
    const project = await researchService.getOwnedProject(req.user._id, req.params.id)
    const plan = await researchSynthesisService.proposeResearchPlan(project)
    return res.json({ success: true, plan, requiresConfirmation: true })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to propose research plan.')
  }
}

exports.applyPlan = async (req, res) => {
  try {
    const project = await researchService.updateProject(req.user._id, req.params.id, {
      researchPlan: req.body.steps,
      status: 'ACTIVE',
    })
    return res.json({ success: true, project })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Failed to apply research plan.')
  }
}

exports.chat = async (req, res) => {
  try {
    const project = await researchService.getOwnedProject(req.user._id, req.params.id)
    const result = await researchGroundingService.groundedChat(req.user._id, project, req.body)
    return res.json({ success: true, result })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Research chat failed.')
  }
}

exports.synthesize = async (req, res) => {
  try {
    const project = await researchService.getOwnedProject(req.user._id, req.params.id)
    const output = await researchSynthesisService.synthesizeProject(req.user._id, project)
    const updated = await researchService.updateProject(req.user._id, req.params.id, {
      synthesis: output.synthesis,
      findings: (output.findings || []).join('\n'),
      connections: output.connections,
      report: {
        summary: output.synthesis?.slice(0, 1000) || '',
        sections: output.reportSections || [],
        generatedAt: new Date(),
      },
    })
    return res.json({ success: true, output, project: updated })
  } catch (error) {
    return fail(res, error.statusCode || 500, error.message || 'Synthesis failed.')
  }
}

exports.guardEnabled = guardEnabled
