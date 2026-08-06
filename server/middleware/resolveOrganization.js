const Institution = require('../models/Institution')
const Company = require('../models/Company')

async function ensureInstitutionProfile(user) {
  let institution = await Institution.findOne({ ownerUserId: user._id })
  if (!institution) {
    institution = await Institution.create({
      ownerUserId: user._id,
      name: user.organizationName?.trim() || user.name || 'Institution',
      email: user.email,
    })
  }
  return institution
}

async function ensureCompanyProfile(user) {
  let company = await Company.findOne({ ownerUserId: user._id })
  if (!company) {
    company = await Company.create({
      ownerUserId: user._id,
      name: user.organizationName?.trim() || user.name || 'Company',
      email: user.email,
    })
  }
  return company
}

/**
 * Resolves organization from authenticated session — never trust client-supplied org IDs.
 */
async function resolveOrganization(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    if (req.user.role === 'institution') {
      req.institution = await ensureInstitutionProfile(req.user)
    } else if (req.user.role === 'company') {
      req.company = await ensureCompanyProfile(req.user)
    }

    next()
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Organization resolution failed' })
  }
}

module.exports = {
  resolveOrganization,
  ensureInstitutionProfile,
  ensureCompanyProfile,
}
