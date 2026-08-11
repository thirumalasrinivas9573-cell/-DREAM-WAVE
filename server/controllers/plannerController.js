const PlannerEvent = require('../models/PlannerEvent');
const Task = require('../models/Task');
const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pick } = require('../utils/helpers');
const { assertCanUseAi, consumeAiCredit, refundAiCredit, recordAiUsage } = require('../services/entitlements');
const { orgCreateStamp, orgListFilter, findAccessible } = require('../utils/orgScope');

exports.list = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.from || req.query.to) {
    filter.start = {};
    if (req.query.from) filter.start.$gte = new Date(req.query.from);
    if (req.query.to) filter.start.$lte = new Date(req.query.to);
  } else {
    // Default window: last 30 days → next 60 days to bound payload size
    const from = new Date(Date.now() - 30 * 864e5);
    const to = new Date(Date.now() + 60 * 864e5);
    filter.start = { $gte: from, $lte: to };
  }
  if (req.query.type) filter.type = req.query.type;
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 100, maxLimit: 500 });
  const [events, total] = await Promise.all([
    PlannerEvent.find(filter).sort({ start: 1 }).skip(skip).limit(limit).lean(),
    PlannerEvent.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { events, pagination: paginationMeta(page, limit, total) },
  });
});

exports.create = asyncHandler(async (req, res) => {
  if (!req.body.title?.trim()) throw new AppError('Title is required', 400);
  if (!req.body.start) throw new AppError('Start time is required', 400);
  const event = await PlannerEvent.create({
    ...pick(req.body, [
      'title',
      'description',
      'type',
      'start',
      'end',
      'allDay',
      'priority',
      'relatedTask',
      'relatedGoal',
      'reminderAt',
      'recurrence',
    ]),
    ...orgCreateStamp(req.user),
  });
  res.status(201).json({ success: true, data: { event } });
});

exports.update = asyncHandler(async (req, res) => {
  const event = await findAccessible(PlannerEvent, req.user, req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  Object.assign(
    event,
    pick(req.body, [
      'title',
      'description',
      'type',
      'start',
      'end',
      'allDay',
      'priority',
      'completed',
      'relatedTask',
      'relatedGoal',
      'reminderAt',
      'recurrence',
    ])
  );
  await event.save();
  res.json({ success: true, data: { event } });
});

exports.remove = asyncHandler(async (req, res) => {
  const event = await findAccessible(PlannerEvent, req.user, req.params.id);
  if (!event) throw new AppError('Event not found', 404);
  await event.deleteOne();
  res.json({ success: true, message: 'Event deleted' });
});

exports.generateDaily = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const taskFilter = await orgListFilter(req.user, { status: { $ne: 'done' } });
  const tasks = await Task.find(taskFilter).sort({ priority: -1 }).limit(8);
  const prompt = `Create a daily plan. Open tasks: ${tasks.map((t) => `${t.title} (${t.priority})`).join('; ') || 'none'}. Focus minutes: ${req.user.preferences?.focusMinutes || 25}.`;
  const plan = (await aiService.runMode('daily', [{ role: 'user', content: prompt }])).content;
  res.json({ success: true, data: { plan, tasks } });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.overview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [dayFilter, weekFilter, monthFilter] = await Promise.all([
    orgListFilter(req.user, { start: { $gte: startOfDay, $lte: endOfDay } }),
    orgListFilter(req.user, { start: { $gte: startOfWeek, $lte: endOfWeek } }),
    orgListFilter(req.user, { start: { $gte: startOfMonth, $lte: endOfMonth } }),
  ]);

  const [daily, weekly, monthly] = await Promise.all([
    PlannerEvent.find(dayFilter).sort({ start: 1 }).limit(200).lean(),
    PlannerEvent.find(weekFilter).sort({ start: 1 }).limit(500).lean(),
    PlannerEvent.find(monthFilter).sort({ start: 1 }).limit(500).lean(),
  ]);

  res.json({ success: true, data: { daily, weekly, monthly } });
});
