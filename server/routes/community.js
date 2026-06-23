const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const {
  getPosts,
  createPost,
  toggleLike,
  deletePost,
} = require('../controllers/communityController')

router.get('/',           auth, getPosts)
router.post('/',          auth, createPost)
router.put('/:id/like',   auth, toggleLike)
router.delete('/:id',     auth, deletePost)

module.exports = router
