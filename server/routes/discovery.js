const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const { resolveOrganization } = require('../middleware/resolveOrganization')
const discoveryController = require('../controllers/discoveryController')

router.use(auth, requireRole('institution', 'company'), resolveOrganization)

router.get('/companies', requireRole('institution'), discoveryController.searchCompanies)
router.get('/companies/:id', requireRole('institution'), discoveryController.getCompany)
router.get('/institutions', requireRole('company'), discoveryController.searchInstitutions)
router.get('/institutions/:id', requireRole('company'), discoveryController.getInstitution)

module.exports = router
