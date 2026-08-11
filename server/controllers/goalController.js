const Goal = require('../models/Goal');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pick } = require('../utils/helpers');
const { orgCreateStamp, orgListFilter, findAccessible, findMutable } = require('../utils/orgScope');

<<<<<<< Updated upstream
<<<<<<< Updated upstream
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
=======
const CATEGORIES = [
  'Academic', 'Career', 'Certification', 'Education', 'Finance', 'Health', 'Personal', 'Skill',
  'Technical Skill', 'Soft Skill', 'Project', 'Research', 'Placement', 'Internship',
  'Entrepreneurship', 'Personal Development', 'Custom',
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']
const STATUSES = ['planning', 'active', 'paused', 'completed', 'archived']
const MILESTONE_STATUSES = ['not-started', 'in-progress', 'completed', 'blocked']
const fail = (res, status, message, code = 'GOAL_ERROR') => res.status(status).json({ success: false, code, message })
const validId = (id) => mongoose.isValidObjectId(id)
const clampProgress = (value) => Math.min(100, Math.max(0, Math.round(Number(value) || 0)))
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function parseDate(value, label = 'date') {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`Invalid ${label}.`)
    error.statusCode = 400
    error.code = 'VALIDATION_ERROR'
    throw error
  }
  return date
}

function validateGoalInput(body, partial = false) {
  const output = {}
  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title || title.length > 160) throw Object.assign(new Error('A title between 1 and 160 characters is required.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.title = title
  }
  if (!partial || body.description !== undefined) {
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    if (description.length > 4000) throw Object.assign(new Error('Description cannot exceed 4000 characters.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.description = description
  }
  if (!partial || body.category !== undefined) {
    const category = body.category || 'Personal'
    if (!CATEGORIES.includes(category)) throw Object.assign(new Error('Invalid goal category.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.category = category
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) throw Object.assign(new Error('Invalid priority.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.priority = body.priority
  }
  if (body.difficulty !== undefined) {
    if (!DIFFICULTIES.includes(body.difficulty)) throw Object.assign(new Error('Invalid difficulty level.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.difficulty = body.difficulty
  }
  if (body.estimatedDuration !== undefined) {
    const value = String(body.estimatedDuration || '').trim()
    if (value.length > 80) throw Object.assign(new Error('Estimated duration is too long.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.estimatedDuration = value
  }
  if (body.weeklyStudyHours !== undefined) {
    const hours = Number(body.weeklyStudyHours)
    if (!Number.isFinite(hours) || hours < 0 || hours > 168) throw Object.assign(new Error('Weekly study hours must be between 0 and 168.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.weeklyStudyHours = hours
  }
  if (body.deadline !== undefined) output.deadline = body.deadline ? parseDate(body.deadline, 'completion date') : null
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) throw Object.assign(new Error('Invalid goal status.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    output.status = body.status
  }
  if (body.requiredSkills !== undefined) {
    if (!Array.isArray(body.requiredSkills)) {
      throw Object.assign(new Error('requiredSkills must be an array of skill names.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    }
    const skills = body.requiredSkills
      .map((item) => String(typeof item === 'string' ? item : item?.name || '').trim())
      .filter(Boolean)
      .slice(0, 40)
    if (skills.some((s) => s.length > 100)) {
      throw Object.assign(new Error('Each required skill must be at most 100 characters.'), { statusCode: 400, code: 'VALIDATION_ERROR' })
    }
    output.requiredSkills = [...new Set(skills)]
  }
  return output
}

async function notify(userId, data) {
  try {
    await notificationService.createForUser(userId, { channel: 'in-app', source: 'goals', ...data })
  } catch (error) {
    console.warn('[goal-notification]', error.message)
  }
}

function syncCompletion(goal) {
  if (goal.status === 'paused' || goal.status === 'archived') {
    goal.completed = false
    goal.completedAt = undefined
    return
  }
  if (goal.progress >= 100) {
    goal.status = 'completed'
    goal.completed = true
    goal.progress = 100
    goal.completedAt = goal.completedAt || new Date()
  } else {
    goal.completed = false
    goal.completedAt = undefined
    if (goal.status === 'completed') goal.status = 'active'
  }
}

function serializeStatus(goal) {
  if (goal.status) return goal.status
  return goal.completed ? 'completed' : 'active'
}
>>>>>>> Stashed changes
=======
const CREATE_FIELDS = [
  'title',
  'description',
  'category',
  'status',
  'progress',
  'targetDate',
  'priority',
  'milestones',
  'tags',
  'aiRecommended',
  'aiSuggestion',
];
const UPDATE_FIELDS = CREATE_FIELDS;
>>>>>>> Stashed changes

exports.list = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.tag) filter.tags = req.query.tag;
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50 });
  const [goals, total] = await Promise.all([
    Goal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Goal.countDocuments(filter),
  ]);
  res.json({ success: true, data: { goals, pagination: paginationMeta(page, limit, total) } });
});

exports.create = asyncHandler(async (req, res) => {
  const goal = await Goal.create({ ...pick(req.body, CREATE_FIELDS), ...orgCreateStamp(req.user) });
  await Notification.create({
    user: req.user._id,
    title: 'Goal created',
    message: `You created "${goal.title}"`,
    type: 'goal',
    link: '/goals',
  });
  res.status(201).json({ success: true, data: { goal } });
});

exports.getOne = asyncHandler(async (req, res) => {
  const goal = await findAccessible(Goal, req.user, req.params.id);
  if (!goal) throw new AppError('Goal not found', 404);
  res.json({ success: true, data: { goal } });
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await findMutable(Goal, req.user, req.params.id);
  if (!existing) throw new AppError('Goal not found', 404);
  const wasCompleted = existing.status === 'completed';
  Object.assign(existing, pick(req.body, UPDATE_FIELDS));
  if (existing.progress === 100) existing.status = 'completed';
  await existing.save();
  if (!wasCompleted && existing.status === 'completed') {
    await Notification.create({
      user: req.user._id,
      title: 'Goal completed',
      message: `You completed "${existing.title}"`,
      type: 'success',
      link: '/goals',
    });
    const { safeEmit } = require('../utils/platformEvents');
    await safeEmit(req.user, {
      type: 'goal_achieved',
      module: 'productivity',
      title: existing.title,
      refType: 'Goal',
      refId: existing._id,
      payload: { progress: existing.progress },
    });
  }
  res.json({ success: true, data: { goal: existing } });
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await findMutable(Goal, req.user, req.params.id);
  if (!existing) throw new AppError('Goal not found', 404);
  await existing.deleteOne();
  res.json({ success: true, message: 'Goal deleted' });
});

exports.toggleMilestone = asyncHandler(async (req, res) => {
  const goal = await findMutable(Goal, req.user, req.params.id);
  if (!goal) throw new AppError('Goal not found', 404);
  const m = goal.milestones.id(req.params.milestoneId);
  if (!m) throw new AppError('Milestone not found', 404);
  m.completed = !m.completed;
  goal.recalcProgress();
  await goal.save();
  res.json({ success: true, data: { goal } });
});

exports.updateProgress = asyncHandler(async (req, res) => {
  const goal = await findMutable(Goal, req.user, req.params.id);
  if (!goal) throw new AppError('Goal not found', 404);
  const wasCompleted = goal.status === 'completed';
  goal.progress = Math.min(100, Math.max(0, Number(req.body.progress) || 0));
  if (goal.progress === 100) goal.status = 'completed';
  await goal.save();
  if (!wasCompleted && goal.status === 'completed') {
    await Notification.create({
      user: req.user._id,
      title: 'Goal completed',
      message: `You completed "${goal.title}"`,
      type: 'success',
      link: '/goals',
    });
    const { safeEmit } = require('../utils/platformEvents');
    await safeEmit(req.user, {
      type: 'goal_achieved',
      module: 'productivity',
      title: goal.title,
      refType: 'Goal',
      refId: goal._id,
      payload: { progress: goal.progress },
    });
  }
  res.json({ success: true, data: { goal } });
});
