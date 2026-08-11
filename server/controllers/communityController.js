const communityService = require('../services/communityService')

exports.getFeed = async (req, res) => {
  try {
    const feed = await communityService.listFeed(req.user, req.query)
    res.json({ success: true, ...feed })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.getPosts = async (req, res) => {
  try {
    const feed = await communityService.listFeed(req.user, { ...req.query, mode: req.query.mode || 'for_you' })
    res.json({ success: true, posts: feed.posts, total: feed.total, page: feed.page, limit: feed.limit })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.getPost = async (req, res) => {
  try {
    const post = await communityService.getPost(req.user, req.params.id)
    res.json({ success: true, post })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.createPost = async (req, res) => {
  try {
    const post = await communityService.createPost(req.user, req.body)
    res.status(201).json({ success: true, post })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.updatePost = async (req, res) => {
  try {
    const post = await communityService.updatePost(req.user, req.params.id, req.body)
    res.json({ success: true, post })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.deletePost = async (req, res) => {
  try {
    await communityService.deletePost(req.user, req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.toggleLike = async (req, res) => {
  try {
    const result = await communityService.toggleReaction(req.user, req.params.id, 'like')
    res.json({
      success: true,
      likeCount: result.likeCount,
      likedByMe: result.likedByMe,
    })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.toggleReaction = async (req, res) => {
  try {
    const type = req.params.type || 'like'
    const result = await communityService.toggleReaction(req.user, req.params.id, type)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.addComment = async (req, res) => {
  try {
    const result = await communityService.addComment(req.user, req.params.id, req.body.content)
    res.status(201).json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.deleteComment = async (req, res) => {
  try {
    const result = await communityService.deleteComment(req.user, req.params.id, req.params.commentId)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.toggleBookmark = async (req, res) => {
  try {
    const result = await communityService.toggleBookmark(req.user, req.params.id)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.listBookmarks = async (req, res) => {
  try {
    const bookmarks = await communityService.listBookmarks(req.user, req.query)
    res.json({ success: true, ...bookmarks })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.follow = async (req, res) => {
  try {
    const result = await communityService.follow(req.user, req.body.targetType, req.body.targetId)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.unfollow = async (req, res) => {
  try {
    const result = await communityService.unfollow(
      req.user,
      req.params.targetType,
      req.params.targetId,
    )
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.listFollowing = async (req, res) => {
  try {
    const following = await communityService.listFollowing(req.user)
    res.json({ success: true, ...following })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.createCollaborationRequest = async (req, res) => {
  try {
    const request = await communityService.createCollaborationRequest(req.user, req.body)
    res.status(201).json({ success: true, request })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.respondCollaborationRequest = async (req, res) => {
  try {
    const request = await communityService.respondCollaborationRequest(
      req.user,
      req.params.id,
      req.body.action,
    )
    res.json({ success: true, request })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.listCollaborationRequests = async (req, res) => {
  try {
    const result = await communityService.listCollaborationRequests(req.user, req.query.role)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.reportPost = async (req, res) => {
  try {
    const result = await communityService.reportPost(req.user, req.params.id, req.body)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.search = async (req, res) => {
  try {
    const result = await communityService.searchCommunity(req.user, req.query.q, req.query)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

exports.getAiSuggestions = async (req, res) => {
  try {
    const result = await communityService.getPostAiSuggestions(req.user, req.params.id)
    res.json({ success: true, ...result })
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}
