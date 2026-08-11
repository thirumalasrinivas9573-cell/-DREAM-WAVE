const mongoose = require('mongoose')
const Post = require('../models/Post')
const StudentFollow = require('../models/StudentFollow')
const StudentBlock = require('../models/StudentBlock')
const Bookmark = require('../models/Bookmark')
const User = require('../models/User')
const StudentProfile = require('../models/StudentProfile')

const LEARNING_TYPES = ['LEARNING_UPDATE', 'RESOURCE', 'QUESTION', 'ACHIEVEMENT']
const KNOWLEDGE_TYPES = ['LEARNING_UPDATE', 'RESOURCE', 'QUESTION', 'PROJECT', 'ACHIEVEMENT', 'COLLABORATION']

function text(value, max) {
  return String(value || '').trim().slice(0, max)
}

function parseCursor(cursor) {
  if (!cursor) return null
  const [createdAt, id] = String(cursor).split('|')
  if (!createdAt || !mongoose.isValidObjectId(id)) return null
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return null
  return { createdAt: date, _id: new mongoose.Types.ObjectId(id) }
}

function buildCursor(post) {
  return `${new Date(post.createdAt).toISOString()}|${post._id}`
}

async function getBlockedUserIds(userId) {
  if (!userId) return []
  const rows = await StudentBlock.find({
    $or: [{ blockerId: userId }, { blockedId: userId }],
  }).select('blockerId blockedId').lean()
  const set = new Set()
  for (const row of rows) {
    if (String(row.blockerId) === String(userId)) set.add(String(row.blockedId))
    else set.add(String(row.blockerId))
  }
  return [...set].map((id) => new mongoose.Types.ObjectId(id))
}

async function getFollowingIds(userId) {
  if (!userId) return []
  const rows = await StudentFollow.find({ followerId: userId }).select('followingId').lean()
  return rows.map((r) => r.followingId)
}

function visibilityFilter(userId, followingIds = []) {
  if (!userId) {
    return { status: 'published', visibility: 'PUBLIC' }
  }
  return {
    status: 'published',
    $or: [
      { visibility: 'PUBLIC' },
      { userId },
      { visibility: 'FOLLOWERS', userId: { $in: followingIds } },
    ],
  }
}

function scorePost(post, { followingSet, interestTopics, interestSkills }) {
  let score = 0
  const reasons = []
  const ageHours = (Date.now() - new Date(post.createdAt).getTime()) / 3600000
  score += Math.max(0, 48 - ageHours) * 2
  if (followingSet.has(String(post.userId))) {
    score += 40
    reasons.push('Because you follow this student')
  }
  const topics = post.topics || []
  const skills = post.skills || []
  for (const topic of topics) {
    if (interestTopics.has(topic.toLowerCase())) {
      score += 25
      reasons.push(`Related to ${topic}`)
      break
    }
  }
  for (const skill of skills) {
    if (interestSkills.has(skill.toLowerCase())) {
      score += 20
      reasons.push(`Related to your ${skill} learning interests`)
      break
    }
  }
  score += (post.likeCount || 0) * 1.5
  score += (post.commentCount || 0) * 2
  score += (post.saveCount || 0) * 1
  return { score, reason: reasons[0] || '' }
}

async function loadInterests(userId) {
  const topics = new Set()
  const skills = new Set()
  if (!userId) return { topics, skills }
  const profile = await StudentProfile.findOne({ userId }).select('skills projects').lean()
  if (profile?.skills) {
    for (const s of profile.skills) {
      if (s.visibility === 'public' || s.visibility === 'unlisted') skills.add(String(s.name).toLowerCase())
    }
  }
  if (profile?.projects) {
    for (const p of profile.projects) {
      if (p.visibility !== 'public') continue
      for (const t of p.technologies || []) topics.add(String(t).toLowerCase())
    }
  }
  return { topics, skills }
}

async function attachAuthors(posts) {
  const userIds = [...new Set(posts.map((p) => String(p.userId)))]
  const [users, profiles] = await Promise.all([
    User.find({ _id: { $in: userIds } }).select('name profileImage').lean(),
    StudentProfile.find({ userId: { $in: userIds } }).select('userId username displayName profilePhoto headline').lean(),
  ])
  const userMap = Object.fromEntries(users.map((u) => [String(u._id), u]))
  const profileMap = Object.fromEntries(profiles.map((p) => [String(p.userId), p]))
  return posts.map((post) => {
    const user = userMap[String(post.userId)] || {}
    const profile = profileMap[String(post.userId)] || {}
    const initials = String(profile.displayName || user.name || '?')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    return {
      ...post,
      author: {
        id: post.userId,
        name: profile.displayName || user.name || 'Student',
        username: profile.username || '',
        photo: profile.profilePhoto || user.profileImage || '',
        headline: profile.headline || '',
        initials,
      },
    }
  })
}

async function attachEngagement(posts, viewerId) {
  if (!viewerId || !posts.length) return posts
  const postIds = posts.map((p) => p._id)
  const bookmarks = await Bookmark.find({
    studentId: viewerId,
    targetType: 'post',
    targetId: { $in: postIds },
  }).select('targetId').lean()
  const savedSet = new Set(bookmarks.map((b) => String(b.targetId)))
  const uid = String(viewerId)
  return posts.map((post) => ({
    ...post,
    likedByMe: (post.likes || []).some((id) => String(id) === uid),
    savedByMe: savedSet.has(String(post._id)),
    likeCount: post.likeCount ?? (post.likes || []).length,
    commentCount: post.commentCount ?? (post.comments || []).filter((c) => c.status !== 'removed').length,
  }))
}

async function fetchFeed({
  viewerId,
  tab = 'for-you',
  postType,
  topic,
  groupId,
  limit = 20,
  cursor,
}) {
  const parsed = parseCursor(cursor)
  const blocked = await getBlockedUserIds(viewerId)
  const followingIds = await getFollowingIds(viewerId)
  const followingSet = new Set(followingIds.map(String))
  const { topics: interestTopics, skills: interestSkills } = await loadInterests(viewerId)

  const filter = {
    ...visibilityFilter(viewerId, followingIds),
  }
  if (blocked.length) filter.userId = { $nin: blocked }
  if (groupId && mongoose.isValidObjectId(groupId)) filter.groupId = groupId
  if (topic) filter.topics = text(topic, 60)
  if (postType) filter.postType = text(postType, 40).toUpperCase()

  if (tab === 'following') {
    if (!followingIds.length) return { posts: [], nextCursor: null }
    filter.userId = { $in: followingIds.filter((id) => !blocked.some((b) => String(b) === String(id))) }
    delete filter.$or
    filter.status = 'published'
    filter.visibility = { $in: ['PUBLIC', 'FOLLOWERS'] }
  } else if (tab === 'learning' || tab === 'knowledge') {
    filter.postType = { $in: KNOWLEDGE_TYPES }
  } else if (tab === 'projects') {
    filter.postType = 'PROJECT'
  } else if (tab === 'questions') {
    filter.postType = 'QUESTION'
  } else if (tab === 'collaboration') {
    filter.postType = 'COLLABORATION'
  } else if (tab === 'achievements') {
    filter.postType = 'ACHIEVEMENT'
  }

  if (parsed) {
    filter.$and = filter.$and || []
    filter.$and.push({
      $or: [
        { createdAt: { $lt: parsed.createdAt } },
        { createdAt: parsed.createdAt, _id: { $lt: parsed._id } },
      ],
    })
  }

  const fetchLimit = tab === 'for-you' ? Math.min(limit * 3, 60) : limit + 1
  let posts = await Post.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(fetchLimit)
    .select('-comments.content')
    .lean()

  if (tab === 'for-you') {
    posts = posts
      .map((post) => {
        const { score, reason } = scorePost(post, { followingSet, interestTopics, interestSkills })
        return { ...post, _rankScore: score, feedReason: post.feedReason || reason }
      })
      .sort((a, b) => b._rankScore - a._rankScore || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit + 1)
  }

  const hasMore = posts.length > limit
  if (hasMore) posts = posts.slice(0, limit)
  posts = await attachAuthors(posts)
  posts = await attachEngagement(posts, viewerId)
  return {
    posts,
    nextCursor: hasMore && posts.length ? buildCursor(posts[posts.length - 1]) : null,
  }
}

async function canViewPost(post, viewerId) {
  if (!post || post.status !== 'published') return false
  if (viewerId && String(post.userId) === String(viewerId)) return true
  if (post.visibility === 'PUBLIC') return true
  if (!viewerId) return false
  if (post.visibility === 'PRIVATE') return false
  if (post.visibility === 'FOLLOWERS') {
    const follow = await StudentFollow.exists({ followerId: viewerId, followingId: post.userId })
    return Boolean(follow)
  }
  return false
}

async function getTrendingTopics(limit = 8) {
  const since = new Date(Date.now() - 7 * 86400000)
  const rows = await Post.aggregate([
    { $match: { status: 'published', visibility: 'PUBLIC', createdAt: { $gte: since }, topics: { $exists: true, $ne: [] } } },
    { $unwind: '$topics' },
    { $group: { _id: '$topics', count: { $sum: 1 }, engagement: { $sum: { $add: ['$likeCount', '$commentCount'] } } } },
    { $sort: { engagement: -1, count: -1 } },
    { $limit: limit },
  ])
  return rows.map((r) => ({ topic: r._id, count: r.count, engagement: r.engagement }))
}

async function discoverStudents({ viewerId, q, skill, topic, limit = 20, cursor }) {
  const blocked = await getBlockedUserIds(viewerId)
  const filter = { 'privacy.discoverable': true, 'privacy.visibility': 'public' }
  if (blocked.length) filter.userId = { $nin: blocked }
  if (skill) filter['skills.name'] = new RegExp(`^${String(skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')
  if (topic) {
    filter.$or = [
      { 'projects.technologies': new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { headline: new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ]
  }
  if (q) {
    const rx = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ displayName: rx }, { username: rx }, { headline: rx }, { 'skills.name': rx }]
  }
  const parsed = parseCursor(cursor)
  if (parsed) {
    filter.$and = filter.$and || []
    filter.$and.push({
      $or: [
        { updatedAt: { $lt: parsed.createdAt } },
        { updatedAt: parsed.createdAt, _id: { $lt: parsed._id } },
      ],
    })
  }
  const rows = await StudentProfile.find(filter)
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit + 1)
    .select('username displayName profilePhoto headline skills projects userId')
    .lean()
  const hasMore = rows.length > limit
  const profiles = hasMore ? rows.slice(0, limit) : rows
  const userIds = profiles.map((p) => p.userId)
  const [followRows, followerCounts] = await Promise.all([
    viewerId ? StudentFollow.find({ followerId: viewerId, followingId: { $in: userIds } }).select('followingId').lean() : [],
    StudentFollow.aggregate([
      { $match: { followingId: { $in: userIds } } },
      { $group: { _id: '$followingId', count: { $sum: 1 } } },
    ]),
  ])
  const followingSet = new Set(followRows.map((r) => String(r.followingId)))
  const followerMap = Object.fromEntries(followerCounts.map((r) => [String(r._id), r.count]))
  return {
    students: profiles.map((p) => ({
      userId: p.userId,
      username: p.username,
      displayName: p.displayName,
      profilePhoto: p.profilePhoto,
      headline: p.headline,
      publicSkills: (p.skills || []).filter((s) => s.visibility === 'public').slice(0, 8).map((s) => s.name),
      publicProjects: (p.projects || []).filter((pr) => pr.visibility === 'public').slice(0, 4).map((pr) => ({
        id: pr._id,
        title: pr.title,
        status: pr.status,
      })),
      followerCount: followerMap[String(p.userId)] || 0,
      isFollowing: followingSet.has(String(p.userId)),
    })),
    nextCursor: hasMore && profiles.length ? buildCursor({ createdAt: profiles[profiles.length - 1].updatedAt, _id: profiles[profiles.length - 1]._id }) : null,
  }
}

module.exports = {
  text,
  parseCursor,
  buildCursor,
  getBlockedUserIds,
  getFollowingIds,
  fetchFeed,
  attachAuthors,
  attachEngagement,
  canViewPost,
  getTrendingTopics,
  discoverStudents,
  LEARNING_TYPES,
  KNOWLEDGE_TYPES,
}
