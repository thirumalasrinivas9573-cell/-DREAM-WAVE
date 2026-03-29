const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPosts,
  createPost,
  likePost,
  commentPost,
  getFriends,
  addFriend,
} = require('../controllers/communityController');

router.get('/posts', auth, getPosts);
router.post('/posts', auth, createPost);
router.post('/posts/:id/like', auth, likePost);
router.post('/posts/:id/comment', auth, commentPost);
router.get('/friends', auth, getFriends);
router.post('/friends/:id', auth, addFriend);

module.exports = router;
