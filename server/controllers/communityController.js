const Post = require('../models/Post');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { toAssetUrl } = require('../utils/assetUrl');
const { orgCreateStamp } = require('../utils/orgScope');

async function communityListFilter(user) {
  if (!user.organizationId) {
    return { $or: [{ organizationId: null }, { organizationId: { $exists: false } }] };
  }
  return { organizationId: user.organizationId };
}

async function findCommunityPost(user, id) {
  const post = await Post.findById(id);
  if (!post) return null;
  if (user.role === 'admin') return post;
  if (String(post.user) === String(user._id)) return post;
  if (!post.organizationId) {
    return user.organizationId ? null : post;
  }
  if (user.organizationId && String(post.organizationId) === String(user.organizationId)) {
    return post;
  }
  return null;
}

exports.list = asyncHandler(async (req, res) => {
  const filter = await communityListFilter(req.user);
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 });
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('user', 'name profileImage aaid')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { posts, pagination: paginationMeta(page, limit, total) },
  });
});

exports.create = asyncHandler(async (req, res) => {
  const content = req.body.content;
  if (!content?.trim()) throw new AppError('Content is required', 400);
  const image = req.file ? toAssetUrl(req.file.filename) : '';
  const post = await Post.create({
    ...orgCreateStamp(req.user),
    content: content.trim().slice(0, 2000),
    image,
  });
  await post.populate('user', 'name profileImage aaid');
  const { safeEmit } = require('../utils/platformEvents');
  await safeEmit(req.user, {
    type: 'community_activity',
    module: 'community',
    title: 'New post',
    refType: 'Post',
    refId: post._id,
    payload: { action: 'create' },
  });
  res.status(201).json({ success: true, data: { post } });
});

exports.like = asyncHandler(async (req, res) => {
  const post = await findCommunityPost(req.user, req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  const idx = post.likes.findIndex((id) => String(id) === String(req.user._id));
  if (idx >= 0) post.likes.splice(idx, 1);
  else post.likes.push(req.user._id);
  await post.save();
  await post.populate('user', 'name profileImage aaid');
  res.json({ success: true, data: { post } });
});

exports.comment = asyncHandler(async (req, res) => {
  const post = await findCommunityPost(req.user, req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (!req.body.text?.trim()) throw new AppError('Comment text required', 400);
  post.comments.push({ user: req.user._id, text: req.body.text.trim() });
  await post.save();
  await post.populate('user', 'name profileImage aaid');
  await post.populate('comments.user', 'name profileImage');
  res.json({ success: true, data: { post } });
});

exports.remove = asyncHandler(async (req, res) => {
  const post = await findCommunityPost(req.user, req.params.id);
  if (!post) throw new AppError('Post not found', 404);
  if (String(post.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Not allowed', 403);
  }
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});
