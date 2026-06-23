const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  generateAIPlan,
} = require('../controllers/goalController')

router.get('/',              auth, getGoals)
router.post('/',             auth, createGoal)
router.put('/:id',           auth, updateGoal)
router.delete('/:id',        auth, deleteGoal)
router.post('/:id/ai-plan',  auth, generateAIPlan)

module.exports = router
