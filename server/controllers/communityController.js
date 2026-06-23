const Post = require('../models/Post')

// ── GET /api/community/posts ──────────────────────────────────────────────────
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    // Attach likedByMe flag
    const userId = req.user._id.toString()
    const mapped = posts.map(p => ({
      ...p,
      likeCount: p.likes.length,
      likedByMe: p.likes.map(id => id.toString()).includes(userId),
    }))

    res.json({ success: true, posts: mapped })
  } catch (err) {
    console.error('[communityController.getPosts]', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ── POST /api/community/posts ─────────────────────────────────────────────────
exports.createPost = async (req, res) => {
  try {
    const { content, tag } = req.body
    if (!content?.trim()) return res.status(400).json({ message: 'Content is required.' })

    const initials = req.user.name
      .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

    const post = await Post.create({
      userId:         req.user._id,
      authorName:     req.user.name,
      authorInitials: initials,
      content:        content.trim(),
      tag:            tag || 'General',
    })

    res.status(201).json({
      success: true,
      post: { ...post.toObject(), likeCount: 0, likedByMe: false },
    })
  } catch (err) {
    console.error('[communityController.createPost]', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ── PUT /api/community/posts/:id/like ─────────────────────────────────────────
exports.toggleLike = async (req, res) => {
  try {
    const post   = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    const uid    = req.user._id
    const liked  = post.likes.some(id => id.equals(uid))

    if (liked) {
      post.likes = post.likes.filter(id => !id.equals(uid))
    } else {
      post.likes.push(uid)
    }
    await post.save()

    res.json({ success: true, likeCount: post.likes.length, likedByMe: !liked })
  } catch (err) {
    console.error('[communityController.toggleLike]', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
}

// ── DELETE /api/community/posts/:id ──────────────────────────────────────────
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!post) return res.status(404).json({ message: 'Post not found or not yours.' })
    res.json({ success: true })
  } catch (err) {
    console.error('[communityController.deletePost]', err.message)
    res.status(500).json({ message: 'Server error.' })
  }
}
