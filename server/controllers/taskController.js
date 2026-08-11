const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pick } = require('../utils/helpers');
const { orgCreateStamp, orgListFilter, findAccessible, findMutable } = require('../utils/orgScope');

const FIELDS = [
  'title',
  'description',
  'priority',
  'status',
  'dueDate',
  'scheduledAt',
  'estimatedMinutes',
  'loggedMinutes',
  'goal',
  'dependsOn',
  'tags',
  'progress',
  'recurrence',
];

exports.list = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.status) filter.status = req.query.status;
  if (req.query.goal) filter.goal = req.query.goal;
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.from || req.query.to) {
    filter.dueDate = {};
    if (req.query.from) filter.dueDate.$gte = new Date(req.query.from);
    if (req.query.to) filter.dueDate.$lte = new Date(req.query.to);
  }
  const sort =
    req.query.sort === 'priority'
      ? { aiPriorityScore: -1, dueDate: 1 }
      : { dueDate: 1, createdAt: -1 };
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 50 });
  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);
  res.json({ success: true, data: { tasks, pagination: paginationMeta(page, limit, total) } });
});

exports.create = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...pick(req.body, FIELDS), ...orgCreateStamp(req.user) });
  if (task.dueDate) {
    await Notification.create({
      user: req.user._id,
      title: 'Task scheduled',
      message: `"${task.title}" due ${new Date(task.dueDate).toLocaleDateString()}`,
      type: 'task',
      link: '/tasks',
    });
  }
  res.status(201).json({ success: true, data: { task } });
});

exports.update = asyncHandler(async (req, res) => {
  const existing = await findMutable(Task, req.user, req.params.id);
  if (!existing) throw new AppError('Task not found', 404);
  Object.assign(existing, pick(req.body, FIELDS));
  if (existing.status === 'done' && !existing.completedAt) existing.completedAt = new Date();
  if (existing.status !== 'done') existing.completedAt = undefined;
  await existing.save();
  res.json({ success: true, data: { task: existing } });
});

exports.remove = asyncHandler(async (req, res) => {
  const existing = await findMutable(Task, req.user, req.params.id);
  if (!existing) throw new AppError('Task not found', 404);
  await existing.deleteOne();
  res.json({ success: true, message: 'Task deleted' });
});

exports.toggleComplete = asyncHandler(async (req, res) => {
  const task = await findMutable(Task, req.user, req.params.id);
  if (!task) throw new AppError('Task not found', 404);

  if (task.status === 'done') {
    task.status = 'todo';
    task.completedAt = undefined;
    task.progress = Math.min(task.progress || 0, 99);
    await task.save();
    return res.json({ success: true, data: { task } });
  }

  const completed = await Task.findOneAndUpdate(
    { _id: task._id, status: { $ne: 'done' }, user: req.user._id },
    {
      $set: {
        status: 'done',
        progress: 100,
        completedAt: new Date(),
      },
    },
    { new: true }
  );
  if (!completed) {
    const current = await findMutable(Task, req.user, req.params.id);
    return res.json({ success: true, data: { task: current } });
  }

  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const completedToday = await Task.countDocuments({
    user: req.user._id,
    status: 'done',
    completedAt: { $gte: dayStart },
  });
  const DAILY_TASK_CREDIT_AWARDS = 5;
  let awarded = 0;
  if (completedToday <= DAILY_TASK_CREDIT_AWARDS) {
    awarded = 5;
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: awarded } });
    req.user.credits = (req.user.credits || 0) + awarded;
  }

  await Notification.create({
    user: req.user._id,
    title: 'Task completed',
    message:
      awarded > 0
        ? `You finished "${completed.title}" (+${awarded} credits)`
        : `You finished "${completed.title}" (daily credit cap reached)`,
    type: 'success',
    link: '/tasks',
  });
  const { safeEmit } = require('../utils/platformEvents');
  await safeEmit(req.user, {
    type: 'task_completed',
    module: 'productivity',
    title: completed.title,
    refType: 'Task',
    refId: completed._id,
  });

  res.json({ success: true, data: { task: completed, creditsAwarded: awarded } });
});
