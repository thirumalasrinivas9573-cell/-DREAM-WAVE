const express = require('express');
const ctrl = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { zodValidate } = require('../middleware/validate');
const schemas = require('../config/schemas');

const router = express.Router();
router.use(protect, authorize('admin'));
router.get('/dashboard', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.patch('/users/:id', zodValidate(schemas.adminUserUpdate), ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/reports', ctrl.reports);
router.patch(
  '/orgs/:id/verification',
  zodValidate(
    require('zod').z.object({
      status: require('zod').z.enum(['unverified', 'pending', 'verified', 'rejected']),
      notes: require('zod').z.string().max(500).optional(),
    })
  ),
  require('../controllers/companyController').adminSetVerification
);

module.exports = router;
