const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const requireRole = require('../middleware/requireRole')
const { resolveOrganization } = require('../middleware/resolveOrganization')
const partnershipController = require('../controllers/partnershipController')

const orgAuth = [auth, requireRole('institution', 'company'), resolveOrganization]

router.get('/meta', orgAuth, partnershipController.getMeta)
router.get('/stats', orgAuth, partnershipController.getStats)
router.get('/', orgAuth, partnershipController.listPartnerships)
router.post('/requests', orgAuth, partnershipController.createRequest)
router.get('/:id', orgAuth, partnershipController.getPartnership)
router.patch('/:id', orgAuth, partnershipController.updatePartnership)
router.post('/:id/respond', orgAuth, partnershipController.respondToRequest)
router.get('/:id/activity', orgAuth, partnershipController.getActivity)
router.get('/:id/documents', orgAuth, partnershipController.listDocuments)
router.post('/:id/documents', orgAuth, partnershipController.addDocument)

module.exports = router
