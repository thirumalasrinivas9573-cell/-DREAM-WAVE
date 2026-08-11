const express = require('express')
<<<<<<< HEAD
const multer = require('multer')
const auth = require('../middleware/auth')
const controller = require('../controllers/communityController')

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 1 },
})

router.get('/media/:filename', controller.getMedia)

router.use(auth)

router.get('/feed', controller.getFeed)
router.get('/trending', controller.getTrending)
router.get('/projects', controller.getProjects)
router.get('/projects/:projectId', controller.getProject)
router.post('/projects/:projectId/publish', controller.publishProjectPost)
router.get('/groups', controller.listGroups)
router.post('/groups', controller.createGroup)
router.get('/groups/:id', controller.getGroup)
router.post('/groups/:id/join', controller.joinGroup)
router.post('/groups/:id/leave', controller.leaveGroup)
router.get('/collaborations', controller.listCollaborations)
router.post('/collaborations', controller.createCollaboration)
router.patch('/collaborations/:id/status', controller.updateCollaborationStatus)
router.get('/students/discover', controller.discoverStudents)
router.get('/students/:userId/follow-stats', controller.getFollowStats)
router.post('/students/:userId/follow', controller.followStudent)
router.post('/students/:userId/block', controller.blockStudent)
router.get('/creator/stats', controller.getCreatorStats)
router.post('/ai/improve-post', controller.improvePostDraft)
router.post('/ai/suggest-tags', controller.suggestTags)
router.post('/ai/project-summary', controller.suggestProjectSummary)
router.post('/upload', upload.single('file'), controller.uploadMedia)
router.post('/report', controller.reportContent)

router.get('/', controller.getPosts)
router.get('/posts/:id', controller.getPost)
router.post('/', controller.createPost)
router.put('/posts/:id', controller.updatePost)
router.delete('/posts/:id', controller.deletePost)
router.put('/:id/like', controller.toggleLike)
router.delete('/:id', controller.deletePost)
router.post('/posts/:id/bookmark', controller.toggleBookmark)
router.get('/posts/:id/comments', controller.getComments)
router.post('/posts/:id/comments', controller.addComment)
router.put('/posts/:id/comments/:commentId', controller.updateComment)
router.delete('/posts/:id/comments/:commentId', controller.deleteComment)
router.post('/posts/:id/comments/:commentId/helpful', controller.markHelpfulComment)
router.post('/posts/:id/create-task', controller.createTaskFromPost)

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      code: 'UPLOAD_ERROR',
      message: error.code === 'LIMIT_FILE_SIZE' ? 'File exceeds the upload limit.' : error.message,
    })
  }
  return next(error)
})
=======
const router = express.Router()
const auth = require('../middleware/auth')
const communityController = require('../controllers/communityController')

router.get('/feed', auth, communityController.getFeed)
router.get('/search', auth, communityController.search)
router.get('/bookmarks', auth, communityController.listBookmarks)
router.get('/following', auth, communityController.listFollowing)
router.get('/collaboration', auth, communityController.listCollaborationRequests)
router.post('/collaboration', auth, communityController.createCollaborationRequest)
router.post('/collaboration/:id/respond', auth, communityController.respondCollaborationRequest)
router.post('/follow', auth, communityController.follow)
router.delete('/follow/:targetType/:targetId', auth, communityController.unfollow)

router.get('/', auth, communityController.getPosts)
router.post('/', auth, communityController.createPost)
router.get('/:id/ai-suggestions', auth, communityController.getAiSuggestions)
router.post('/:id/comments', auth, communityController.addComment)
router.delete('/:id/comments/:commentId', auth, communityController.deleteComment)
router.post('/:id/bookmark', auth, communityController.toggleBookmark)
router.post('/:id/report', auth, communityController.reportPost)
router.put('/:id/like', auth, communityController.toggleLike)
router.put('/:id/reactions/:type', auth, communityController.toggleReaction)
router.get('/:id', auth, communityController.getPost)
router.patch('/:id', auth, communityController.updatePost)
router.delete('/:id', auth, communityController.deletePost)
>>>>>>> feature/ui-threejs

module.exports = router
