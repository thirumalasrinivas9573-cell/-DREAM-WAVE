const AdaptiveProfile = require('../models/AdaptiveProfile');
const LearningProgress = require('../models/LearningProgress');
const MediaItem = require('../models/MediaItem');
const MediaProgress = require('../models/MediaProgress');
const Quiz = require('../models/Quiz');
const StudyPlan = require('../models/StudyPlan');
const Skill = require('../models/Skill');
const { UserBook } = require('../models/Book');
const RecommendationEvent = require('../models/RecommendationEvent');
const learningEco = require('./learningEcosystemService');
const graph = require('./knowledgeGraphService');
const mediaAccess = require('./mediaAccessService');
const aiService = require('./aiService');
const { orgCreateStamp, orgListFilter } = require('../utils/orgScope');

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const ms = Date.parse(b) - Date.parse(a);
  return Math.round(ms / 86400000);
}

async function getOrCreateAdaptiveProfile(user) {
  let profile = await AdaptiveProfile.findOne({ user: user._id });
  if (profile) return profile;
  const learning = await learningEco.getOrCreateProfile(user);
  profile = await AdaptiveProfile.create({
    ...orgCreateStamp(user),
    learningSpeed: learning.preferredPace || 'moderate',
    weeklyFocus: learning.focusAreas?.[0] || user.targetCareer || '',
  });
  return profile;
}

function detectDifficultyFromSignals({ weaknesses, avgQuiz, masteryAvg }) {
  // Content difficulty should match learner level: struggle → easier material.
  if (avgQuiz != null && avgQuiz < 45) return 'easy';
  if (masteryAvg < 40 || (weaknesses || []).length >= 4) return 'easy';
  if (avgQuiz != null && avgQuiz >= 80 && masteryAvg >= 70) return 'challenging';
  if (masteryAvg >= 65) return 'challenging';
  return 'moderate';
}

function detectSpeed({ plansCompletedRatio, watchCompletion, quizAvg }) {
  let score = 50;
  if (plansCompletedRatio != null) score += (plansCompletedRatio - 0.5) * 40;
  if (watchCompletion != null) score += (watchCompletion - 0.5) * 30;
  if (quizAvg != null) score += (quizAvg - 50) * 0.3;
  score = Math.max(0, Math.min(100, Math.round(score)));
  const learningSpeed = score >= 70 ? 'fast' : score <= 35 ? 'slow' : 'moderate';
  return { speedScore: score, learningSpeed };
}

async function refreshAdaptiveState(user) {
  const profile = await getOrCreateAdaptiveProfile(user);
  const filter = await orgListFilter(user);
  const intel = await graph.learningIntelligence(user);
  const skills = intel.skills || [];
  const weaknesses = intel.weaknesses || [];
  const strengths = intel.strengths || [];

  const [quizzes, plans, watch, progressDocs] = await Promise.all([
    Quiz.find(filter).select('attempts topic').limit(40).lean(),
    StudyPlan.find(filter).select('progress status schedule').limit(30).lean(),
    MediaProgress.find({ user: user._id }).select('completed percent media').limit(50).lean(),
    LearningProgress.find({ user: user._id }).select('kind key completed percent').limit(200).lean(),
  ]);

  const quizScores = quizzes.flatMap((q) => (q.attempts || []).map((a) => a.score));
  const avgQuiz =
    quizScores.length === 0
      ? null
      : Math.round(quizScores.reduce((s, n) => s + (n || 0), 0) / quizScores.length);
  const masteryAvg =
    skills.length === 0
      ? 40
      : Math.round(skills.reduce((s, x) => s + (x.mastery || 0), 0) / skills.length);

  const detectedDifficulty = detectDifficultyFromSignals({
    weaknesses,
    avgQuiz,
    masteryAvg,
  });
  if (profile.difficulty === 'adaptive') {
    profile.detectedDifficulty = detectedDifficulty;
  } else {
    profile.detectedDifficulty = profile.difficulty;
  }

  const plansCompletedRatio =
    plans.length === 0
      ? 0.5
      : plans.reduce((s, p) => s + (p.progress || 0), 0) / (plans.length * 100);
  const watchCompletion =
    watch.length === 0 ? 0.5 : watch.filter((w) => w.completed || w.percent >= 90).length / watch.length;
  const speed = detectSpeed({ plansCompletedRatio, watchCompletion, quizAvg: avgQuiz });
  profile.speedScore = speed.speedScore;
  profile.learningSpeed = speed.learningSpeed;

  // Streak advances only on real learning activity (upsertProgress / quiz), not passive refresh.

  // Path from intelligence + gaps
  const pathTopics = [
    intel.nextBestTopic,
    ...intel.knowledgeGaps.slice(0, 5),
    ...weaknesses.map((w) => w.skill).slice(0, 3),
  ].filter(Boolean);
  const unique = [...new Set(pathTopics.map((t) => String(t).trim()))].slice(0, 8);
  const diff = profile.detectedDifficulty;
  profile.currentPath = unique.map((topic, order) => ({
    topic,
    kind: 'topic',
    difficulty: diff,
    order,
    completed: progressDocs.some(
      (p) => p.kind === 'topic' && p.key === topic.toLowerCase() && p.completed
    ),
  }));

  profile.lessonSequence = await buildLessonSequence(user, unique, diff);

  profile.stats = {
    topicsCompleted: progressDocs.filter((p) => p.kind === 'topic' && p.completed).length,
    chaptersCompleted: progressDocs.filter((p) => p.kind === 'chapter' && p.completed).length,
    skillsCompleted: progressDocs.filter((p) => p.kind === 'skill' && p.completed).length,
    coursesCompleted: progressDocs.filter((p) => p.kind === 'course' && p.completed).length,
    animationsCompleted: progressDocs.filter((p) => p.kind === 'animation' && p.completed).length,
    quizzesTaken: quizScores.length,
    avgQuizScore: avgQuiz || 0,
    lastComputedAt: new Date(),
  };

  if (!profile.weeklyFocus) {
    profile.weeklyFocus = unique[0] || strengths[0]?.skill || user.targetCareer || '';
  }

  await awardAchievements(profile);
  await profile.save();
  return { profile, intel, weaknesses, strengths, skills };
}

async function buildLessonSequence(user, topics, difficulty) {
  const mediaFilter = await mediaAccess.accessibleMediaFilter(user, { status: 'published' });
  const animations = await MediaItem.find({ ...mediaFilter, type: 'animation' })
    .select('title topics skills subject difficulty book course')
    .limit(40)
    .lean();
  const videos = await MediaItem.find({ ...mediaFilter, type: 'video' })
    .select('title topics skills subject')
    .limit(20)
    .lean();

  const sequence = [];
  let order = 0;
  for (const topic of topics.slice(0, 6)) {
    const t = String(topic).toLowerCase();
    const topicMatch = (item) =>
      (item.topics || []).some((x) => String(x).toLowerCase().includes(t) || t.includes(String(x).toLowerCase())) ||
      (item.skills || []).some((x) => String(x).toLowerCase().includes(t) || t.includes(String(x).toLowerCase())) ||
      String(item.subject || '')
        .toLowerCase()
        .includes(t) ||
      String(item.title || '')
        .toLowerCase()
        .includes(t);

    const scoredAnims = animations
      .filter(topicMatch)
      .map((a) => {
        let score = 40;
        if (a.difficulty === difficulty) score += 20;
        else if (!a.difficulty) score += 5;
        else if (a.difficulty === 'easy' && difficulty === 'moderate') score += 8;
        return { a, score };
      })
      .sort((x, y) => y.score - x.score);
    const anim = scoredAnims[0]?.a;
    if (anim) {
      sequence.push({
        title: anim.title,
        topic,
        resourceType: 'animation',
        resourceId: String(anim._id),
        order: order++,
        completed: false,
      });
    }
    const vid = videos.find(topicMatch);
    if (vid) {
      sequence.push({
        title: vid.title,
        topic,
        resourceType: 'video',
        resourceId: String(vid._id),
        order: order++,
        completed: false,
      });
    }
    sequence.push({
      title: `Practice: ${topic}`,
      topic,
      resourceType: 'practice',
      resourceId: '',
      order: order++,
      completed: false,
    });
  }
  return sequence.slice(0, 18);
}

async function awardAchievements(profile) {
  const add = (key, title, description) => {
    if ((profile.achievements || []).some((a) => a.key === key)) return;
    profile.achievements.push({ key, title, description, earnedAt: new Date() });
  };
  if ((profile.streak?.current || 0) >= 3) {
    add('streak-3', '3-Day Streak', 'Learned on 3 consecutive days');
  }
  if ((profile.streak?.current || 0) >= 7) {
    add('streak-7', 'Week Warrior', '7-day learning streak');
  }
  if ((profile.stats?.topicsCompleted || 0) >= 5) {
    add('topics-5', 'Topic Explorer', 'Completed 5 topics');
  }
  if ((profile.stats?.animationsCompleted || 0) >= 3) {
    add('anim-3', 'Animation Learner', 'Completed 3 animations');
  }
  if ((profile.stats?.avgQuizScore || 0) >= 80 && (profile.stats?.quizzesTaken || 0) >= 3) {
    add('quiz-80', 'Quiz Ace', 'Averaged 80%+ across quizzes');
  }
  profile.achievements = (profile.achievements || []).slice(-40);
}

async function upsertProgress(user, body) {
  const key = String(body.key || body.label || '')
    .toLowerCase()
    .trim()
    .slice(0, 200);
  if (!key) {
    const err = new Error('key or label required');
    err.statusCode = 400;
    throw err;
  }
  const percent = Math.min(100, Math.max(0, Number(body.percent) || 0));
  const completed = body.completed === true || percent >= 100;
  const stamp = orgCreateStamp(user);
  const doc = await LearningProgress.findOneAndUpdate(
    { user: user._id, kind: body.kind, key },
    {
      $set: {
        ...stamp,
        label: body.label || key,
        percent: completed ? 100 : percent,
        completed,
        completedAt: completed ? new Date() : null,
        refType: body.refType || '',
        refId: body.refId || null,
        meta: body.meta || {},
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (completed && body.kind === 'skill') {
    await Skill.findOneAndUpdate(
      { user: user._id, name: body.label || key },
      {
        $set: {
          ...stamp,
          mastery: Math.max(80, percent),
          level: 'advanced',
          lastPracticed: new Date(),
        },
      },
      { upsert: true }
    );
  }

  const profile = await getOrCreateAdaptiveProfile(user);
  const today = todayKey();
  if (profile.streak?.lastActiveDate !== today) {
    if (profile.streak?.lastActiveDate && daysBetween(profile.streak.lastActiveDate, today) === 1) {
      profile.streak.current += 1;
    } else {
      profile.streak.current = 1;
    }
    profile.streak.lastActiveDate = today;
    profile.streak.longest = Math.max(profile.streak.longest || 0, profile.streak.current);
  }
  if (completed) {
    const field =
      body.kind === 'topic'
        ? 'topicsCompleted'
        : body.kind === 'chapter'
          ? 'chaptersCompleted'
          : body.kind === 'skill'
            ? 'skillsCompleted'
            : body.kind === 'course'
              ? 'coursesCompleted'
              : body.kind === 'animation'
                ? 'animationsCompleted'
                : null;
    if (field) {
      // recount later via refresh; bump lightly
      profile.stats = profile.stats || {};
    }
    for (const step of profile.currentPath || []) {
      if (String(step.topic).toLowerCase() === key) step.completed = true;
    }
    for (const step of profile.lessonSequence || []) {
      if (String(step.topic).toLowerCase() === key && body.kind !== 'practice') {
        if (!body.resourceId || step.resourceId === String(body.resourceId)) step.completed = true;
      }
    }
  }
  await awardAchievements(profile);
  await profile.save();
  return doc;
}

async function recommendAnimations(user, { topic, skill, bookId, courseId, limit = 10 } = {}) {
  const mediaFilter = await mediaAccess.accessibleMediaFilter(user, {
    status: 'published',
    type: 'animation',
  });
  const filter = { ...mediaFilter };
  if (bookId) filter.book = bookId;
  if (courseId) filter.course = courseId;
  if (skill) filter.skills = new RegExp(String(skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (topic) {
    filter.$or = [
      { topics: new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { subject: new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { title: new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { skills: new RegExp(String(topic).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }

  let items = await MediaItem.find(filter)
    .select('title topics skills subject book course difficulty durationSec views completions')
    .limit(40)
    .lean();

  if (!items.length) {
    items = await MediaItem.find({ ...mediaFilter })
      .sort({ views: -1 })
      .limit(limit)
      .select('title topics skills subject book course difficulty durationSec views completions')
      .lean();
  }

  const profile = await getOrCreateAdaptiveProfile(user);
  const diff = profile.detectedDifficulty || 'moderate';
  const scored = items
    .map((m) => {
      let score = (m.views || 0) * 0.01 + (m.completions || 0);
      if (m.difficulty === diff) score += 10;
      if (topic && (m.topics || []).some((t) => String(t).toLowerCase().includes(String(topic).toLowerCase())))
        score += 20;
      if (skill && (m.skills || []).some((s) => String(s).toLowerCase().includes(String(skill).toLowerCase())))
        score += 20;
      return {
        ...m,
        score: Math.round(score),
        confidence: Math.min(92, Math.max(30, Math.round(score * 0.8) + 20)),
        reason: 'Animation intelligence match',
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

async function mapAnimation(user, mediaId, mappings = {}) {
  const media = await MediaItem.findById(mediaId);
  if (!media) {
    const err = new Error('Animation not found');
    err.statusCode = 404;
    throw err;
  }
  if (media.type !== 'animation' && media.type !== 'video') {
    const err = new Error('Only animation/video media supports adaptive mapping');
    err.statusCode = 400;
    throw err;
  }
  if (mappings.topics) media.topics = [...new Set([...(media.topics || []), ...mappings.topics])].slice(0, 30);
  if (mappings.skills) media.skills = [...new Set([...(media.skills || []), ...mappings.skills])].slice(0, 30);
  if (mappings.bookId !== undefined) media.book = mappings.bookId;
  if (mappings.courseId !== undefined) media.course = mappings.courseId;
  if (mappings.difficulty !== undefined) media.difficulty = mappings.difficulty || '';
  if (mappings.learningObjectives) {
    media.learningObjectives = mappings.learningObjectives.slice(0, 20);
  }
  media.rebuildSearchIndex();
  await media.save();

  // Sync into knowledge graph lightly
  try {
    const key = graph.normKey(media.type === 'animation' ? 'animation' : 'video', String(media._id));
    await graph.upsertNode({
      key,
      label: media.title,
      kind: media.type === 'animation' ? 'animation' : 'video',
      organizationId: user.organizationId,
      refType: 'MediaItem',
      refId: media._id,
      weight: 4,
      searchText: media.searchIndex,
    });
    for (const t of media.topics || []) {
      const topicKey = graph.normKey('topic', t);
      await graph.upsertNode({
        key: topicKey,
        label: t,
        kind: 'topic',
        organizationId: user.organizationId,
        weight: 2,
      });
      await graph.upsertEdge({
        from: key,
        to: topicKey,
        type: 'teaches',
        weight: 2,
        organizationId: user.organizationId,
      });
    }
    for (const s of media.skills || []) {
      const skillKey = graph.normKey('skill', s);
      await graph.upsertNode({
        key: skillKey,
        label: s,
        kind: 'skill',
        organizationId: user.organizationId,
        weight: 2,
      });
      await graph.upsertEdge({
        from: key,
        to: skillKey,
        type: 'teaches',
        weight: 2,
        organizationId: user.organizationId,
      });
    }
  } catch (_) {
    /* non-blocking */
  }
  return media;
}

async function dailyGoal(user) {
  const { profile, intel } = await refreshAdaptiveState(user);
  const minutes = profile.dailyGoalMinutes || 30;
  const topics = (profile.currentPath || []).filter((p) => !p.completed).slice(0, profile.dailyGoalTopics || 1);
  const lessons = (profile.lessonSequence || []).filter((l) => !l.completed).slice(0, 3);
  return {
    date: todayKey(),
    minutes,
    topics,
    lessons,
    focus: profile.weeklyFocus || intel.nextBestTopic,
    streak: profile.streak,
  };
}

async function weeklyPlan(user) {
  const { profile, intel, weaknesses } = await refreshAdaptiveState(user);
  const focus = profile.weeklyFocus || intel.nextBestTopic;
  // Reuse study plan horizon generation shape without duplicating AI if plan exists
  const existing = await StudyPlan.findOne({
    user: user._id,
    horizon: 'weekly',
    status: 'active',
  }).sort({ createdAt: -1 });

  const days = [];
  const weak = weaknesses.map((w) => w.skill);
  for (let i = 1; i <= 7; i++) {
    const topic = profile.currentPath[(i - 1) % Math.max(1, profile.currentPath.length)]?.topic || focus;
    days.push({
      day: i,
      focus: topic,
      tasks: [
        `Study ${topic} (${Math.round((profile.dailyGoalMinutes || 30) * (profile.learningSpeed === 'fast' ? 0.8 : profile.learningSpeed === 'slow' ? 1.2 : 1))} min)`,
        i % 2 === 0 ? `Watch animation on ${topic}` : `Practice exercises for ${topic}`,
        i === 7 ? `Weekly quiz on ${focus}` : `Review notes for ${topic}`,
      ],
      completed: false,
    });
  }

  return {
    focus,
    difficulty: profile.detectedDifficulty,
    learningSpeed: profile.learningSpeed,
    path: profile.currentPath,
    days,
    existingPlanId: existing?._id || null,
    weakTopics: weak.slice(0, 5),
  };
}

async function adaptiveRecommendations(user) {
  const { profile, intel } = await refreshAdaptiveState(user);
  const graphRecs = await graph.buildRecommendations(user, { limit: 8 });
  const animations = await recommendAnimations(user, {
    topic: intel.nextBestTopic,
    limit: 8,
  });
  const learning = graphRecs.learning || {};
  const practiceSeed =
    learning.practiceProblems?.length
      ? learning.practiceProblems
      : (intel.knowledgeGaps || []).slice(0, 6).map((g) => ({
          skill: g,
          prompt: `Adaptive practice set for ${g} (${profile.detectedDifficulty})`,
        }));

  return {
    difficulty: profile.detectedDifficulty,
    nextBestTopic: intel.nextBestTopic,
    books: graphRecs.recommendations.books,
    videos: graphRecs.recommendations.videos,
    animations: animations.map((a) => ({
      id: a._id,
      title: a.title,
      score: a.score,
      confidence: a.confidence ?? Math.min(90, Math.round((a.score || 50) * 0.85)),
      reason: a.reason,
      topics: a.topics,
      skills: a.skills,
    })),
    courses: graphRecs.recommendations.courses,
    projects: graphRecs.recommendations.projects?.length
      ? graphRecs.recommendations.projects
      : (learning.projects || []).map((p, i) => ({
          ...p,
          title: p.idea || p.title || p.skill,
          score: Math.max(45, 72 - i * 4),
          confidence: Math.max(40, 65 - i * 4),
          reason: p.reason || 'Gap-aligned project',
        })),
    practice: practiceSeed.map((p, i) => ({
      ...p,
      title: p.title || p.prompt || p.skill,
      score: p.score || Math.max(45, 72 - i * 4),
      confidence: p.confidence || Math.max(40, 65 - i * 4),
      reason: p.reason || 'Adaptive practice',
    })),
    assessments: intel.knowledgeGaps.slice(0, 4).map((g) => ({
      topic: g,
      type: 'adaptive_quiz',
      difficulty: profile.detectedDifficulty,
    })),
    feed: graphRecs.feed,
  };
}

async function adaptiveQuiz(user, { topic, useAi = true } = {}) {
  const { profile, intel } = await refreshAdaptiveState(user);
  const focus = topic || intel.weakTopics[0]?.topic || intel.nextBestTopic || 'fundamentals';
  const difficulty = profile.detectedDifficulty;

  let questions = [
    {
      question: `Explain the core idea of ${focus} at a ${difficulty} level.`,
      options: ['Definition only', 'Definition + example', 'Skip', 'Memorize formula only'],
      answer: 'Definition + example',
      explanation: 'Active explanation with examples builds durable understanding.',
      difficulty,
    },
    {
      question: `Which practice best reinforces ${focus}?`,
      options: ['Passive reread', 'Spaced recall + problems', 'Ignore weaknesses', 'Only watch once'],
      answer: 'Spaced recall + problems',
      explanation: 'Spaced active recall is highest leverage.',
      difficulty,
    },
    {
      question: `A common mistake learners make with ${focus} is…`,
      options: [
        'Skipping prerequisites',
        'Practicing deliberately',
        'Asking questions',
        'Building projects',
      ],
      answer: 'Skipping prerequisites',
      explanation: 'Adaptive paths restore prerequisites when difficulty rises.',
      difficulty,
    },
  ];

  let usedAi = false;
  if (useAi) {
    try {
      const prompt = `Create 5 multiple-choice quiz questions on "${focus}" at ${difficulty} difficulty. Return JSON array questions[{question,options,answer,explanation}].`;
      const aiResult = await aiService.runMode('quiz', [{ role: 'user', content: prompt }]);
      const reply = aiResult.content;
      const match = String(reply).match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          questions = parsed.slice(0, 8).map((q) => ({ ...q, difficulty }));
          usedAi = aiResult.provider !== 'local' && aiResult.model !== 'fallback' && !aiResult.recovered;
        }
      }
    } catch (_) {
      /* fallback questions */
    }
  }

  const quiz = await Quiz.create({
    ...orgCreateStamp(user),
    title: `Adaptive Quiz — ${focus}`,
    topic: focus,
    questions,
  });

  profile.stats = profile.stats || {};
  await profile.save();
  return { quiz, focus, difficulty, reinforcement: intel.weakTopics.slice(0, 5), usedAi };
}

async function analytics(user) {
  const { profile, intel } = await refreshAdaptiveState(user);
  const [watch, progress, events] = await Promise.all([
    MediaProgress.find({ user: user._id })
      .populate('media', 'type title')
      .select('completed percent media')
      .limit(100)
      .lean(),
    LearningProgress.find({ user: user._id }).select('kind key completed percent').limit(200).lean(),
    RecommendationEvent.find({ user: user._id }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const animations = watch.filter((w) => w.media?.type === 'animation');
  const animEngagement = {
    started: animations.length,
    completed: animations.filter((a) => a.completed).length,
    avgPercent:
      animations.length === 0
        ? 0
        : Math.round(animations.reduce((s, a) => s + (a.percent || 0), 0) / animations.length),
  };

  const completion = {
    topics: progress.filter((p) => p.kind === 'topic' && p.completed).length,
    chapters: progress.filter((p) => p.kind === 'chapter' && p.completed).length,
    skills: progress.filter((p) => p.kind === 'skill' && p.completed).length,
    courses: progress.filter((p) => p.kind === 'course' && p.completed).length,
    animations: progress.filter((p) => p.kind === 'animation' && p.completed).length,
    overallPercent:
      progress.length === 0
        ? 0
        : Math.round(progress.reduce((s, p) => s + (p.percent || 0), 0) / progress.length),
  };

  const engaged = events.filter((e) => e.engaged).length;
  const dismissed = events.filter((e) => e.dismissed).length;
  const feedbackSample = engaged + dismissed;
  const recommendationEffectiveness = feedbackSample
    ? Math.round((engaged / feedbackSample) * 100)
    : events.length
      ? Math.round((engaged / events.length) * 100)
      : null;

  const effectiveness =
    Math.round(
      (completion.overallPercent * 0.4 +
        (profile.stats?.avgQuizScore || 0) * 0.35 +
        Math.min(100, (profile.streak?.current || 0) * 10) * 0.25)
    ) || 0;

  return {
    learningEffectiveness: effectiveness,
    animationEngagement: animEngagement,
    skillProgress: {
      readiness: intel.readiness,
      weak: intel.weakTopics,
      strong: intel.strongTopics,
      masteryPath: profile.currentPath,
    },
    recommendationEffectiveness: {
      percent: recommendationEffectiveness,
      sampleSize: events.length,
    },
    completion,
    streak: profile.streak,
    difficulty: profile.detectedDifficulty,
    learningSpeed: profile.learningSpeed,
    achievements: profile.achievements,
  };
}

module.exports = {
  getOrCreateAdaptiveProfile,
  refreshAdaptiveState,
  detectDifficultyFromSignals,
  upsertProgress,
  recommendAnimations,
  mapAnimation,
  dailyGoal,
  weeklyPlan,
  adaptiveRecommendations,
  adaptiveQuiz,
  analytics,
};
