/**
 * roadmapController.js
 * Professional Life Path Generator — complete career roadmap with skills,
 * courses, books, projects, colleges, timeline, and career guidance.
 */

'use strict';

const Roadmap        = require('../models/Roadmap');
const Goal           = require('../models/Goal');
const Task           = require('../models/Task');
const aiEngine       = require('../services/aiEngine');
const { fullProgressSync } = require('../utils/progressEngine');
const logger         = require('../utils/logger');

// ── Helper: build Task documents from AI days data ───────────────────────────
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

// ── Helper: convert life-path data into legacy phases for task generation ────
function lifePathToPhases(lifePath) {
  const phases = [];
  const plan = lifePath.learningPlan || [];

  plan.forEach((lp, idx) => {
    const phaseTasks = [];

    // Add step-by-step tasks for this phase
    const stepsPerPhase = Math.ceil((lifePath.stepByStepPath || []).length / Math.max(plan.length, 1));
    const start = idx * stepsPerPhase;
    const end   = start + stepsPerPhase;
    (lifePath.stepByStepPath || []).slice(start, end).forEach(step => {
      phaseTasks.push({
        title:         step.title,
        description:   step.description,
        completed:     false,
        estimatedTime: step.duration || '1 week',
        priority:      idx === 0 ? 'high' : 'medium',
      });
    });

    // Add practice tasks for this phase
    const practiceForPhase = (lifePath.practicePlan || []).filter(p =>
      p.stage?.toLowerCase().includes(lp.phase?.toLowerCase().split(' ')[0] || '')
    );
    practiceForPhase.forEach(p => {
      phaseTasks.push({
        title:         p.task,
        description:   `Expected output: ${p.output}`,
        completed:     false,
        estimatedTime: '1 week',
        priority:      'medium',
      });
    });

    // Add project for this phase
    const projectForPhase = (lifePath.projects || [])[idx];
    if (projectForPhase) {
      phaseTasks.push({
        title:         `Build: ${projectForPhase.title}`,
        description:   projectForPhase.description,
        completed:     false,
        estimatedTime: '2 weeks',
        priority:      'high',
      });
    }

    phases.push({
      title:       lp.phase || `Phase ${idx + 1}`,
      duration:    lp.duration || '4 weeks',
      description: lp.focus,
      skills:      (lifePath.skills || [])
        .filter((_, si) => Math.floor(si / 2) === idx)
        .map(s => s.name),
      tasks:       phaseTasks.length > 0 ? phaseTasks : [{
        title:         `Complete ${lp.phase} phase`,
        description:   lp.focus,
        completed:     false,
        estimatedTime: lp.duration || '4 weeks',
        priority:      'high',
      }],
      order: idx + 1,
    });
  });

  return phases.length > 0 ? phases : [{
    title: 'Foundation', duration: '4 weeks',
    description: 'Build core skills',
    skills: [], tasks: [], order: 1,
  }];
}

// ── POST /api/roadmap/generate ───────────────────────────────────────────────
// Accepts: { goalId } OR { goalTitle, category }
exports.generate = async (req, res) => {
  const { goalId, goalTitle, category } = req.body;

  let goal;

  if (goalId) {
    // Standard path: look up by goalId
    goal = await Goal.findOne({ _id: goalId, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
  } else if (goalTitle && category) {
    // Direct path: create a transient goal object (or find/create a real one)
    const VALID_CATEGORIES = ['education', 'career', 'personal', 'health', 'finance'];
    const cat = category.toLowerCase();
    if (!VALID_CATEGORIES.includes(cat)) {
      return res.status(400).json({ success: false, message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    // Find or create a goal with this title
    goal = await Goal.findOne({ title: goalTitle.trim(), userId: req.user._id });
    if (!goal) {
      goal = await Goal.create({
        userId:   req.user._id,
        title:    goalTitle.trim(),
        category: cat,
      });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Provide either goalId or both goalTitle and category' });
  }

  // Return existing roadmap if already generated
  const existing = await Roadmap.findOne({ goalId: goal._id, userId: req.user._id });
  if (existing) {
    logger.info('[roadmapController] Returning existing roadmap', { goalId: goal._id });
    return res.json({ success: true, message: 'Roadmap already exists', data: { roadmap: existing } });
  }

  logger.info('[roadmapController] Generating life-path roadmap', { goalTitle: goal.title, category: goal.category });

  // ── Generate full life-path ────────────────────────────────────────────────
  const lifePath = await aiEngine.generateLifePath(goal.title, goal.category);

  // ── Convert to phases for task generation ─────────────────────────────────
  const phases = lifePathToPhases(lifePath);

  // ── Persist roadmap ────────────────────────────────────────────────────────
  const roadmap = await Roadmap.create({
    userId:   req.user._id,
    goalId:   goal._id,
    title:    `${goal.title} — Life Path`,
    category: goal.category,

    // Rich life-path data
    overview:       lifePath.overview,
    skills:         lifePath.skills         || [],
    stepByStepPath: lifePath.stepByStepPath || [],
    learningPlan:   lifePath.learningPlan   || [],
    courses:        lifePath.courses        || [],
    books:          lifePath.books          || [],
    practicePlan:   lifePath.practicePlan   || [],
    projects:       lifePath.projects       || [],
    careerPath:     lifePath.careerPath     || {},
    colleges:       lifePath.colleges       || [],
    timeline:       lifePath.timeline       || {},

    // Legacy phases for task generation
    phases,
    totalDuration: lifePath.timeline?.totalDuration || '6 months',
    difficulty:    'beginner',

    metadata: {
      generationPrompt: `Goal: ${goal.title}, Category: ${goal.category}`,
      aiModel:          'gpt-4o-mini',
      generatedAt:      new Date(),
      deepData:         lifePath._deep || null,   // full R&D report + deep content
    },
  });

  goal.roadmapGenerated = true;
  await goal.save();

  logger.info('[roadmapController] Life-path roadmap saved', { roadmapId: roadmap._id });

  // ── Auto-generate tasks in background ─────────────────────────────────────
  setImmediate(async () => {
    try {
      await _generateAndSaveTasks(roadmap, goal);
    } catch (err) {
      logger.error('[roadmapController] Background task generation failed', { error: err.message });
    }
  });

  // Attach _deep to response so frontend can display R&D report immediately
  const roadmapWithDeep = roadmap.toObject();
  roadmapWithDeep._deep = lifePath._deep || null;

  return res.status(201).json({
    success: true,
    message: 'Life-path roadmap generated. Tasks are being created in the background.',
    data:    { roadmap: roadmapWithDeep },
  });
};

// ── GET /api/roadmap/list ────────────────────────────────────────────────────
exports.list = async (req, res) => {
  const { goalId, status } = req.query;
  const filter = { userId: req.user._id };
  if (goalId) filter.goalId = goalId;
  if (status) filter.status = status;

  const roadmaps = await Roadmap.find(filter)
    .populate('goalId', 'title category status')
    .sort({ createdAt: -1 })
    .lean();

  // Attach progress from Task collection
  const Task = require('../models/Task');
  for (const rm of roadmaps) {
    const [total, done] = await Promise.all([
      Task.countDocuments({ roadmapId: rm._id }),
      Task.countDocuments({ roadmapId: rm._id, completed: true }),
    ]);
    rm.progress = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  return res.json({ success: true, data: { roadmaps } });
};

// ── GET /api/roadmap/:id ─────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('goalId', 'title category status progress');

  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  const tasks = await Task.find({ roadmapId: roadmap._id, userId: req.user._id })
    .sort({ day: 1, 'metadata.order': 1 });

  // Attach _deep from metadata so frontend can display R&D report
  const roadmapObj = roadmap.toObject();
  roadmapObj._deep = roadmap.metadata?.deepData || null;

  return res.json({ success: true, data: { roadmap: roadmapObj, tasks: tasks.length ? tasks : null } });
};

// ── PATCH /api/roadmap/:id/phase/:phaseIndex/task/:taskIndex ─────────────────
exports.updatePhaseTask = async (req, res) => {
  const { id, phaseIndex, taskIndex } = req.params;
  const { completed } = req.body;

  const roadmap = await Roadmap.findOne({ _id: id, userId: req.user._id });
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  const pi = parseInt(phaseIndex);
  const ti = parseInt(taskIndex);

  if (!roadmap.phases[pi] || !roadmap.phases[pi].tasks[ti]) {
    return res.status(404).json({ success: false, message: 'Task not found in roadmap' });
  }

  roadmap.phases[pi].tasks[ti].completed = !!completed;
  await roadmap.save();

  await fullProgressSync(roadmap.goalId, roadmap._id);

  return res.json({ success: true, message: 'Task updated', data: { roadmap } });
};

// ── POST /api/roadmap/:id/regenerate ─────────────────────────────────────────
exports.regenerate = async (req, res) => {
  const roadmap = await Roadmap.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('goalId');

  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  const goal = roadmap.goalId;
  logger.info('[roadmapController] Regenerating life-path', { roadmapId: roadmap._id, goalTitle: goal.title });

  await Task.deleteMany({ roadmapId: roadmap._id, userId: req.user._id });

  const lifePath = await aiEngine.generateLifePath(goal.title, goal.category);
  const phases   = lifePathToPhases(lifePath);

  roadmap.overview       = lifePath.overview;
  roadmap.skills         = lifePath.skills         || [];
  roadmap.stepByStepPath = lifePath.stepByStepPath || [];
  roadmap.learningPlan   = lifePath.learningPlan   || [];
  roadmap.courses        = lifePath.courses        || [];
  roadmap.books          = lifePath.books          || [];
  roadmap.practicePlan   = lifePath.practicePlan   || [];
  roadmap.projects       = lifePath.projects       || [];
  roadmap.careerPath     = lifePath.careerPath     || {};
  roadmap.colleges       = lifePath.colleges       || [];
  roadmap.timeline       = lifePath.timeline       || {};
  roadmap.phases         = phases;
  roadmap.totalDuration  = lifePath.timeline?.totalDuration || '6 months';
  roadmap.progress       = 0;
  roadmap.metadata       = { ...roadmap.metadata, generatedAt: new Date() };

  await roadmap.save();
  await _generateAndSaveTasks(roadmap, goal);

  return res.json({ success: true, message: 'Life-path regenerated', data: { roadmap } });
};

// ── DELETE /api/roadmap/:id ──────────────────────────────────────────────────
exports.delete = async (req, res) => {
  const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  await Task.deleteMany({ roadmapId: roadmap._id, userId: req.user._id });
  await Goal.findByIdAndUpdate(roadmap.goalId, {
    roadmapGenerated: false,
    tasksGenerated:   false,
    progress:         0,
  });

  return res.json({ success: true, message: 'Roadmap and tasks deleted' });
};

// ── Internal: generate + save tasks ─────────────────────────────────────────
async function _generateAndSaveTasks(roadmap, goal) {
  logger.info('[roadmapController] Generating tasks', { roadmapId: roadmap._id, goalTitle: goal.title });

  const tasksData = await aiEngine.generateTasksFromRoadmap(roadmap, goal.title);
  const docs      = buildTaskDocs(tasksData, goal.userId, goal._id, roadmap._id);

  if (docs.length > 0) {
    await Task.insertMany(docs);
    await Goal.findByIdAndUpdate(goal._id, { tasksGenerated: true });
    logger.info('[roadmapController] Tasks saved', { count: docs.length, roadmapId: roadmap._id });
  }

  return docs;
}

exports._generateAndSaveTasks = _generateAndSaveTasks;
