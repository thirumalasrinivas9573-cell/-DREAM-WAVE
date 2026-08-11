const { searchCompanies, searchInstitutions } = require('../services/partnershipService')
const { PUBLIC_COMPANY_FIELDS, PUBLIC_INSTITUTION_FIELDS } = require('../constants/ecosystemProfiles')

/** GET /api/discovery/companies */
exports.searchCompanies = async (req, res) => {
  try {
    if (req.user.role !== 'institution') {
      return res.status(403).json({ success: false, message: 'Institution access required' })
    }

    const result = await searchCompanies({
      q: req.query.q,
      industry: req.query.industry,
      location: req.query.location,
      page: req.query.page,
      limit: req.query.limit,
    })

    res.json({
      success: true,
      companies: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pageCount: result.pageCount,
      },
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Company search failed',
    })
  }
}

/** GET /api/discovery/institutions */
exports.searchInstitutions = async (req, res) => {
  try {
    if (req.user.role !== 'company') {
      return res.status(403).json({ success: false, message: 'Company access required' })
    }

    const result = await searchInstitutions({
      q: req.query.q,
      type: req.query.type,
      location: req.query.location,
      department: req.query.department,
      program: req.query.program,
      page: req.query.page,
      limit: req.query.limit,
    })

    res.json({
      success: true,
      institutions: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pageCount: result.pageCount,
      },
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Institution search failed',
    })
  }
}

/** GET /api/discovery/companies/:id */
exports.getCompany = async (req, res) => {
  try {
    const Company = require('../models/Company')
    const company = await Company.findOne({ _id: req.params.id, isPublic: true })
      .select(PUBLIC_COMPANY_FIELDS)
      .lean()
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' })
    }
    res.json({ success: true, company })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

/** GET /api/discovery/institutions/:id */
exports.getInstitution = async (req, res) => {
  try {
    const Institution = require('../models/Institution')
    const institution = await Institution.findOne({ _id: req.params.id, isPublic: true })
      .select(PUBLIC_INSTITUTION_FIELDS)
      .lean()
    if (!institution) {
      return res.status(404).json({ success: false, message: 'Institution not found' })
    }
    res.json({ success: true, institution })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
