const express = require('express')
const router  = express.Router()
console.log('Tasks route loading...')
const auth    = require('../middleware/auth')
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  generateFromRoadmap,
} = require('../controllers/taskController')

router.get('/',       auth, getTasks)
router.post('/generate-from-roadmap', auth, (req, res, next) => {
  console.log('POST /api/tasks/generate-from-roadmap hit!')
  generateFromRoadmap(req, res, next)
})
router.post('/',      auth, createTask)
router.put('/:id',    auth, updateTask)
router.delete('/:id', auth, deleteTask)

router.use('*', (req, res) => {
  console.log(`Task Router 404 hit for ${req.method} ${req.originalUrl}`)
  res.status(404).json({ message: `Task Router: Route ${req.originalUrl} not found` })
})

module.exports = router
