const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/create', auth, async (req, res) => {
  try {
    const { content, type } = req.body;
    
    const post = new Post({
      author: req.userId,
      content,
      type: type || 'general'
    });

    await post.save();
    await post.populate('author', 'name username profilePhoto');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post', error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name username profilePhoto')
      .populate('comments.user', 'name username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (post.likes.includes(req.userId)) {
      post.likes = post.likes.filter(id => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Comment on post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    post.comments.push({
      user: req.userId,
      text
    });

    await post.save();
    await post.populate('comments.user', 'name username');

    res.json(post.comments);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment' });
  }
});

module.exports = router;
