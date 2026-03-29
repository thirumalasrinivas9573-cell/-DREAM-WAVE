const Post = require('../models/Post');
const User = require('../models/User');
const Connection = require('../models/Connection');

exports.createPost = async (req, res) => {
  try {
    const { content, type = 'post' } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Content required' });
    const post = await Post.create({ userId: req.user._id, content: content.trim(), type });
    await post.populate('userId', 'name aaId avatar');
    res.status(201).json({ post });
  } catch (err) { res.status(500).json({ message: 'Error creating post' }); }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }).limit(20)
      .populate('userId', 'name aaId avatar');
    res.json({ posts });
  } catch (err) { res.status(500).json({ message: 'Error fetching feed' }); }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1);
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length, liked: idx === -1 });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment required' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.comments.push({ userId: req.user._id, text: text.trim() });
    await post.save();
    res.json({ comments: post.comments.length });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};

exports.connect = async (req, res) => {
  try {
    const { aaId } = req.body;
    if (!aaId) return res.status(400).json({ message: 'AA ID required' });
    const friend = await User.findOne({ aaId: aaId.toUpperCase() });
    if (!friend) return res.status(404).json({ message: 'User not found' });
    if (friend._id.equals(req.user._id)) return res.status(400).json({ message: 'Cannot connect with yourself' });
    const exists = await Connection.findOne({ userId: req.user._id, friendId: friend._id });
    if (exists) return res.json({ message: 'Already connected', status: exists.status });
    const conn = await Connection.create({ userId: req.user._id, friendId: friend._id, status: 'accepted' });
    res.status(201).json({ message: 'Connected!', friend: { name: friend.name, aaId: friend.aaId } });
  } catch (err) { res.status(500).json({ message: 'Error connecting' }); }
};

exports.getConnections = async (req, res) => {
  try {
    const conns = await Connection.find({ userId: req.user._id, status: 'accepted' })
      .populate('friendId', 'name aaId avatar goal');
    res.json({ connections: conns.map(c => c.friendId) });
  } catch (err) { res.status(500).json({ message: 'Error' }); }
};
