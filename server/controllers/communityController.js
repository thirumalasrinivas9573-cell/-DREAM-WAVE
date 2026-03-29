const Post = require('../models/Post');
const User = require('../models/User');

// @desc    Get all posts
// @route   GET /api/community/posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name profileImage aaid')
      .populate('comments.user', 'name profileImage')
      .populate('likes.user', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      posts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create post
// @route   POST /api/community/posts
exports.createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    const post = await Post.create({
      user: req.user.id,
      content,
      image
    });

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'name profileImage aaid');

    res.status(201).json({
      success: true,
      post: populatedPost
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like post
// @route   POST /api/community/posts/:id/like
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked
    const alreadyLiked = post.likes.some(like => 
      like.user.toString() === req.user.id
    );

    if (alreadyLiked) {
      // Remove like
      post.likes = post.likes.filter(like => 
        like.user.toString() !== req.user.id
      );
    } else {
      // Add like
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.json({
      success: true,
      likes: post.likes.length,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Comment on post
// @route   POST /api/community/posts/:id/comment
exports.commentPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({
      user: req.user.id,
      content
    });

    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('comments.user', 'name profileImage');

    const newComment = populatedPost.comments[populatedPost.comments.length - 1];

    res.status(201).json({
      success: true,
      comment: newComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's friends
// @route   GET /api/community/friends
exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'name profileImage aaid level');

    res.json({
      success: true,
      friends: user.friends
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add friend
// @route   POST /api/community/friends/:id
exports.addFriend = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Add to both users' friends list
    user.friends.push(friendId);
    friend.friends.push(user.id);

    await user.save();
    await friend.save();

    res.json({
      success: true,
      message: 'Friend added successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
