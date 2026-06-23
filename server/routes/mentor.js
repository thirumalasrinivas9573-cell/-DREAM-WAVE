const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const {
  getMentorAdvice,
  mentorChat,
  getMentorHistory,
  clearMentorHistory,
} = require('../controllers/mentorController')

router.post('/',             auth, getMentorAdvice)
router.post('/chat',         auth, mentorChat)
router.get('/history',       auth, getMentorHistory)
router.delete('/history',    auth, clearMentorHistory)

module.exports = router
