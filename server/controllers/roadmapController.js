const Roadmap = require('../models/Roadmap');
const Notification = require('../models/Notification');
const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pick } = require('../utils/helpers');
const { assertCanUseAi, consumeAiCredit, refundAiCredit, recordAiUsage } = require('../services/entitlements');
const { orgCreateStamp, orgListFilter, findAccessible } = require('../utils/orgScope');

const UPDATE_FIELDS = [
  'title',
  'career',
  'description',
  'skills',
  'timeline',
  'progress',
  'status',
  'kind',
  'semesterLabel',
  'placementFocus',
];

exports.list = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30 });
  const [roadmaps, total] = await Promise.all([
    Roadmap.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Roadmap.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { roadmaps, pagination: paginationMeta(page, limit, total) },
  });
});

exports.getOne = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  res.json({ success: true, data: { roadmap } });
});

exports.generate = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const { career, level } = req.body;
  const generated = await aiService.generateRoadmap(career, level || 'beginner');
  const roadmap = await Roadmap.create({
    ...orgCreateStamp(req.user),
    title: generated.title,
    career: generated.career || career,
    description: generated.description || '',
    skills: generated.skills || [],
    timeline: generated.timeline || [],
    progress: 0,
  });
  await Notification.create({
    user: req.user._id,
    title: 'Roadmap generated',
    message: `"${roadmap.title}" is ready`,
    type: 'info',
    link: '/roadmap',
  });
  res.status(201).json({ success: true, data: { roadmap } });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.update = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  Object.assign(roadmap, pick(req.body, UPDATE_FIELDS));
  await roadmap.save();
  res.json({ success: true, data: { roadmap } });
});

exports.remove = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  await roadmap.deleteOne();
  res.json({ success: true, message: 'Roadmap deleted' });
});

exports.togglePhase = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  const phase = roadmap.timeline.id(req.params.phaseId);
  if (!phase) throw new AppError('Phase not found', 404);
  phase.completed = !phase.completed;
  const done = roadmap.timeline.filter((t) => t.completed).length;
  roadmap.progress = roadmap.timeline.length
    ? Math.round((done / roadmap.timeline.length) * 100)
    : 0;
  if (roadmap.progress === 100) roadmap.status = 'completed';
  await roadmap.save();
  if (roadmap.progress === 100) {
    await Notification.create({
      user: req.user._id,
      title: 'Roadmap completed',
      message: `You finished "${roadmap.title}"`,
      type: 'success',
      link: '/roadmap',
    });
  }
  res.json({ success: true, data: { roadmap } });
});

exports.updateSkill = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  const skill = roadmap.skills.id(req.params.skillId);
  if (!skill) throw new AppError('Skill not found', 404);
  if (req.body.progress !== undefined) {
    skill.progress = Math.min(100, Math.max(0, Number(req.body.progress) || 0));
  }
  if (req.body.level) skill.level = req.body.level;
  await roadmap.save();
  res.json({ success: true, data: { roadmap } });
});

const ecosystem = require('../services/learningEcosystemService');

exports.adapt = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  const result = await ecosystem.adaptRoadmap(req.user, roadmap);
  roadmap.adaptive = {
    lastAdaptedAt: new Date(),
    dependencies: result.dependencies,
    milestones: result.milestones,
  };
  await roadmap.save();
  await recordAiUsage(req.user, { ...({ mode: 'roadmap', source: 'specialized' }), creditsUsed: 1, success: true });
  res.json({
    success: true,
    data: {
      roadmap,
      dependencies: result.dependencies,
      milestones: result.milestones,
      advice: result.advice,
      changed: result.changed,
    },
  });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.milestones = asyncHandler(async (req, res) => {
  const roadmap = await findAccessible(Roadmap, req.user, req.params.id);
  if (!roadmap) throw new AppError('Roadmap not found', 404);
  const milestones =
    roadmap.adaptive?.milestones?.length > 0
      ? roadmap.adaptive.milestones
      : ecosystem.buildMilestones(roadmap);
  const dependencies =
    roadmap.adaptive?.dependencies?.length > 0
      ? roadmap.adaptive.dependencies
      : ecosystem.buildDependencies(roadmap.skills || []);
  res.json({ success: true, data: { milestones, dependencies, progress: roadmap.progress } });
});

exports.generateAdaptive = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const { career, level } = req.body;
  const generated = await aiService.generateRoadmap(career, level || 'beginner');
  await recordAiUsage(req.user, { ...({ mode: 'roadmap', source: 'specialized' }), creditsUsed: 1, success: true });
  const roadmap = await Roadmap.create({
    ...orgCreateStamp(req.user),
    title: generated.title,
    career: generated.career || career,
    description: generated.description || '',
    skills: generated.skills || [],
    timeline: generated.timeline || [],
    progress: 0,
  });
  const adapted = await ecosystem.adaptRoadmap(req.user, roadmap);
  roadmap.adaptive = {
    lastAdaptedAt: new Date(),
    dependencies: adapted.dependencies,
    milestones: adapted.milestones,
  };
  await roadmap.save();
  await Notification.create({
    user: req.user._id,
    title: 'Adaptive roadmap ready',
    message: `"${roadmap.title}" includes dependencies and milestones`,
    type: 'info',
    link: '/roadmap',
  });
  res.status(201).json({
    success: true,
    data: {
      roadmap,
      dependencies: adapted.dependencies,
      milestones: adapted.milestones,
      advice: adapted.advice,
    },
  });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});
