/**
 * taskController.js
 * Production-grade task controller.
 * All progress calculations use the central progressEngine.
 */

'use strict';

const Task           = require('../models/Task');
const Goal           = require('../models/Goal');
const Roadmap        = require('../models/Roadmap');
const aiEngine       = require('../services/aiEngine');
const { fullProgressSync, syncGoalProgress } = require('../utils/progressEngine');
const logger         = require('../utils/logger');

// ── Helper: build Task documents ─────────────────────────────────────────────
function buildTaskDocs(daysData, userId, goalId, roadmapId) {
  const tasks = [];
  for (const dayData of (daysData.days || [])) {
    const dayNum = parseInt(dayData.day) || 1;
    for (let i = 0; i < (dayData.tasks || []).length; i++) {
      const t = dayData.tasks[i];
      tasks.push({
        userId,
        goalId,
        roadmapId,
        day:           dayNum,
        type:          t.type          || 'learn',
        title:         t.title         || `Day ${dayNum} Task ${i + 1}`,
        description:   t.description   || t.title || '',
        estimatedTime: t.estimatedTime || '30 min',
        priority:      t.priority      || 'medium',
        difficulty:    t.difficulty    || 'medium',
        completed:     false,
        metadata:      { order: i + 1, aiGenerated: true, generatedAt: new Date() },
      });
    }
  }
  return tasks;
}

// ── POST /api/tasks/generate ─────────────────────────────────────────────────
// Legacy: generate tasks from a goal string (no roadmap)
exports.generate = async (req, res) => {
  const { goal } = req.body;
  if (!goal?.trim()) {
    return res.status(400).json({ success: false, message: 'goal is required' });
  }

  const tasksData = await aiEngine.generateTasksFromRoadmap({ phases: [] }, goal);
  return res.json({ success: true, data: tasksData });
};

// ── POST /api/tasks/generate-from-roadmap ────────────────────────────────────
exports.generateFromRoadmap = async (req, res) => {
  const { roadmapId } = req.body;
  if (!roadmapId) {
    return res.status(400).json({ success: false, message: 'roadmapId is required' });
  }

  const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user._id })
    .populate('goalId');
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  // Delete existing tasks for this roadmap
  await Task.deleteMany({ roadmapId, userId: req.user._id });

  logger.info('[taskController] Generating tasks from roadmap', {
    roadmapId,
    goalTitle: roadmap.goalId?.title,
  });

  const tasksData = await aiEngine.generateTasksFromRoadmap(roadmap, roadmap.goalId.title);
  const docs      = buildTaskDocs(tasksData, req.user._id, roadmap.goalId._id, roadmap._id);

  if (docs.length > 0) {
    await Task.insertMany(docs);
    await Goal.findByIdAndUpdate(roadmap.goalId._id, { tasksGenerated: true });
  }

  logger.info('[taskController] Tasks generated', { count: docs.length });

  return res.json({
    success: true,
    message: `${docs.length} tasks generated`,
    data:    { count: docs.length },
  });
};

// ── GET /api/tasks/list ──────────────────────────────────────────────────────
exports.list = async (req, res) => {
  const { goalId, roadmapId, day, completed } = req.query;
  const filter = { userId: req.user._id };

  if (goalId)    filter.goalId    = goalId;
  if (roadmapId) filter.roadmapId = roadmapId;
  if (day)       filter.day       = parseInt(day);
  if (completed !== undefined) filter.completed = completed === 'true';

  const tasks = await Task.find(filter)
    .populate('goalId', 'title category')
    .sort({ day: 1, 'metadata.order': 1 });

  // Group by day
  const byDay = {};
  tasks.forEach(t => {
    const d = t.day;
    if (!byDay[d]) byDay[d] = [];
    byDay[d].push(t);
  });

  return res.json({ success: true, data: { tasks, byDay } });
};

// ── GET /api/tasks/progress/:goalId ─────────────────────────────────────────
exports.getProgress = async (req, res) => {
  const { goalId } = req.params;

  const goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
  if (!goal) {
    return res.status(404).json({ success: false, message: 'Goal not found' });
  }

  const stats = await syncGoalProgress(goalId);

  return res.json({ success: true, data: { goalId, ...stats, goal } });
};

// ── PUT /api/tasks/complete/:id ──────────────────────────────────────────────
exports.complete = async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  task.completed   = true;
  task.completedAt = new Date();
  await task.save();

  const stats = await fullProgressSync(task.goalId, task.roadmapId);

  logger.info('[taskController] Task completed', {
    taskId:   task._id,
    goalId:   task.goalId,
    progress: stats.goal?.progress,
  });

  return res.json({
    success: true,
    message: 'Task completed',
    data:    { task, progress: stats.goal?.progress ?? 0 },
  });
};

// ── PUT /api/tasks/uncomplete/:id ────────────────────────────────────────────
exports.uncomplete = async (req, res) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { completed: false, completedAt: null },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const stats = await fullProgressSync(task.goalId, task.roadmapId);

  return res.json({
    success: true,
    data:    { task, progress: stats.goal?.progress ?? 0 },
  });
};
