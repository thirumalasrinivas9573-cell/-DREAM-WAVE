const mongoose = require('mongoose')
const {
  POST_TYPES,
  VISIBILITY,
  REACTION_TYPES,
  LINKED_ENTITY_TYPES,
} = require('../constants/community')

<<<<<<< HEAD
const POST_TYPES = [
  'GENERAL',
  'LEARNING_UPDATE',
  'PROJECT',
  'QUESTION',
  'RESOURCE',
  'ACHIEVEMENT',
  'COLLABORATION',
  'CAREER_UPDATE',
]

const TAG_TO_TYPE = {
  General: 'GENERAL',
  Achievement: 'ACHIEVEMENT',
  Question: 'QUESTION',
  Resource: 'RESOURCE',
  Project: 'PROJECT',
}

const commentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parentCommentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    editedAt: { type: Date, default: null },
    status: { type: String, enum: ['active', 'removed'], default: 'active' },
    helpful: { type: Boolean, default: false },
  },
  { timestamps: true },
)

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    mimeType: { type: String, default: '' },
    filename: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false },
)

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, maxlength: 5000 },
    tag: {
      type: String,
      enum: ['General', 'Achievement', 'Question', 'Resource', 'Project'],
      default: 'General',
    },
    postType: {
      type: String,
      enum: POST_TYPES,
      default: 'GENERAL',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['PUBLIC', 'FOLLOWERS', 'PRIVATE'],
      default: 'PUBLIC',
      index: true,
    },
    status: { type: String, enum: ['published', 'draft', 'removed'], default: 'published', index: true },
    topics: [{ type: String, trim: true, maxlength: 60 }],
    skills: [{ type: String, trim: true, maxlength: 60 }],
    media: [mediaSchema],
    projectId: { type: String, default: '' },
    libraryBookId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryBook', default: null },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'LearningGroup', default: null, index: true },
    collaborationId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollaborationRequest', default: null },
    achievementRef: {
      type: {
        type: String,
        enum: ['certificate', 'goal', 'project', 'milestone', 'hackathon', 'other'],
      },
      refId: { type: String, trim: true, maxlength: 80 },
      label: { type: String, trim: true, maxlength: 200 },
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    comments: [commentSchema],
    acceptedCommentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    feedReason: { type: String, default: '' },
  },
  { timestamps: true },
)

postSchema.index({ userId: 1, createdAt: -1 })
postSchema.index({ visibility: 1, status: 1, createdAt: -1 })
postSchema.index({ postType: 1, status: 1, createdAt: -1 })
postSchema.index({ topics: 1, status: 1, createdAt: -1 })
postSchema.index({ skills: 1, status: 1, createdAt: -1 })
postSchema.index({ content: 'text', topics: 'text', skills: 'text' })

postSchema.pre('save', function mapTagToType(next) {
  if (this.isNew && !this.postType) {
    this.postType = TAG_TO_TYPE[this.tag] || 'GENERAL'
  }
  if (this.isModified('likes')) {
    this.likeCount = this.likes?.length || 0
  }
  if (this.isModified('comments')) {
    this.commentCount = (this.comments || []).filter((c) => c.status !== 'removed').length
  }
  next()
})
=======
const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  content: { type: String, required: true, maxlength: 500, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
})

const linkedEntitySchema = new mongoose.Schema(
  {
    entityType: { type: String, enum: LINKED_ENTITY_TYPES, required: true },
    entityId: { type: String, required: true },
    snapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false },
)

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    authorName: { type: String, required: true },
    authorInitials: { type: String, required: true },
    authorRole: {
      type: String,
      enum: ['student', 'institution', 'company', 'admin'],
      default: 'student',
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    title: { type: String, trim: true, default: '', maxlength: 200 },
    content: { type: String, required: true, trim: true, maxlength: 5000 },
    tag: {
      type: String,
      enum: ['Achievement', 'Books', 'Goals', 'Habits', 'General'],
      default: 'General',
    },
    postType: {
      type: String,
      enum: POST_TYPES,
      default: 'GENERAL',
      index: true,
    },
    visibility: {
      type: String,
      enum: VISIBILITY,
      default: 'public',
      index: true,
    },
    linkedEntity: { type: linkedEntitySchema, default: null },
    likes: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    reactions: {
      insight: { type: [mongoose.Schema.Types.ObjectId], default: [] },
      helpful: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    },
    bookmarkedBy: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    comments: [commentSchema],
    aiClassification: { type: String, default: '' },
    relevanceTags: [{ type: String, trim: true }],
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

postSchema.index({ createdAt: -1 })
postSchema.index({ postType: 1, createdAt: -1 })
postSchema.index({ visibility: 1, createdAt: -1 })
postSchema.index({ 'linkedEntity.entityType': 1, 'linkedEntity.entityId': 1 })
>>>>>>> feature/ui-threejs

module.exports = mongoose.model('Post', postSchema)
module.exports.POST_TYPES = POST_TYPES
module.exports.TAG_TO_TYPE = TAG_TO_TYPE
