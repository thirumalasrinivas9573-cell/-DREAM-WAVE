const User = require('../models/User');
const Resume = require('../models/Resume');
const Roadmap = require('../models/Roadmap');
const InterviewSession = require('../models/InterviewSession');
const career = require('../services/careerIntelligenceService');
const learningEco = require('../services/learningEcosystemService');
const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { assertCanUseAi, consumeAiCredit, refundAiCredit, recordAiUsage } = require('../services/entitlements');
const { orgCreateStamp, orgListFilter, findAccessible } = require('../utils/orgScope');
const { auditFromRequest } = require('../utils/audit');

/* ─── Profile ─── */

exports.getProfile = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  res.json({ success: true, data: { profile } });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const fields = [
    'headline',
    'summary',
    'interests',
    'preferredDomains',
    'preferredCompanies',
    'preferredRoles',
    'targetRole',
    'targetIndustry',
    'experienceLevel',
    'academic',
  ];
  for (const f of fields) {
    if (req.body[f] !== undefined) profile[f] = req.body[f];
  }
  await profile.save();
  if (req.body.targetRole && req.body.syncUserCareer !== false) {
    await User.findByIdAndUpdate(req.user._id, { targetCareer: String(req.body.targetRole).slice(0, 160) });
  }
  await auditFromRequest(req, {
    action: 'career.profile.update',
    resource: 'CareerProfile',
    resourceId: profile._id,
  });
  res.json({ success: true, data: { profile } });
});

/* ─── Skill gap ─── */

exports.skillGap = asyncHandler(async (req, res) => {
  const gap = await career.analyzeSkillGap(req.user, req.query.role || req.body?.role);
  res.json({ success: true, data: { gap } });
});

/* ─── Recommendations ─── */

exports.recommendations = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const { skills } = await learningEco.analyzeSkills(req.user);
  const careers = career.recommendCareers(profile, skills);
  const salary = career.salaryInsights(
    profile.targetRole || careers[0]?.role,
    profile.experienceLevel === 'mid' || profile.experienceLevel === 'senior' ? 'mid' : 'fresher'
  );
  profile.lastRecommendationsAt = new Date();
  await profile.save();
  res.json({
    success: true,
    data: {
      careers,
      roles: careers.map((c) => ({ role: c.role, matchScore: c.matchScore, missingSkills: c.missingSkills })),
      industries: [...new Set(careers.map((c) => c.industry))],
      technologies: [...new Set(careers.flatMap((c) => c.technologies))].slice(0, 20),
      salary,
      growth: careers.map((c) => ({ role: c.role, growth: c.growth, opportunities: c.opportunities })),
    },
  });
});

exports.salaryInsights = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const role = req.query.role || profile.targetRole || req.user.targetCareer;
  const level = req.query.level || (profile.experienceLevel === 'mid' ? 'mid' : 'fresher');
  res.json({ success: true, data: { salary: career.salaryInsights(role, level) } });
});

/* ─── Roadmaps ─── */

exports.generateRoadmap = asyncHandler(async (req, res) => {
  const kind = req.body.kind || 'career';
  const profile = await career.getOrCreateCareerProfile(req.user);
  const target = req.body.career || profile.targetRole || req.user.targetCareer || 'Backend Engineer';
  const level = req.body.level || 'beginner';
  const useAi = Boolean(req.body.useAi);

  let blueprint = career.buildRoadmapBlueprint(kind, target, level);
  if (useAi) {
    await consumeAiCredit(req.user, 1);
    try {
      const generated = await aiService.generateRoadmap(target, level);
      blueprint = {
        ...blueprint,
        title: generated.title || blueprint.title,
        description: generated.description || blueprint.description,
        skills: generated.skills?.length ? generated.skills : blueprint.skills,
        timeline: generated.timeline?.length ? generated.timeline : blueprint.timeline,
      };
      await recordAiUsage(req.user, {
        mode: 'roadmap',
        source: 'career',
        creditsUsed: 1,
        success: true,
      });
    } catch (err) {
      await refundAiCredit(req.user, 1);
      throw err;
    }
  }

  const roadmap = await Roadmap.create({
    ...orgCreateStamp(req.user),
    ...blueprint,
    semesterLabel: req.body.semesterLabel || blueprint.semesterLabel || '',
    placementFocus: req.body.placementFocus || blueprint.placementFocus || '',
  });
  await auditFromRequest(req, {
    action: 'career.roadmap.create',
    resource: 'Roadmap',
    resourceId: roadmap._id,
    meta: { kind },
  });
  res.status(201).json({ success: true, data: { roadmap } });
});

exports.listIntelligentRoadmaps = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.kind) filter.kind = req.query.kind;
  const roadmaps = await Roadmap.find(filter).sort({ updatedAt: -1 }).limit(50);
  res.json({ success: true, data: { roadmaps } });
});

/* ─── Jobs ─── */

exports.matchJobs = asyncHandler(async (req, res) => {
  const limit = Math.min(40, Math.max(1, parseInt(req.query.limit, 10) || 15));
  const matches = await career.matchJobs(req.user, {
    limit,
    internshipOnly: req.query.type === 'internship',
  });
  res.json({ success: true, data: { matches } });
});

exports.matchInternships = asyncHandler(async (req, res) => {
  const matches = await career.matchJobs(req.user, {
    limit: Math.min(40, Math.max(1, parseInt(req.query.limit, 10) || 15)),
    internshipOnly: true,
  });
  res.json({ success: true, data: { matches } });
});

exports.matchCompanies = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const matches = await career.matchJobs(req.user, { limit: 40 });
  const byOrg = new Map();
  for (const m of matches) {
    const id = String(m.organization?._id || m.job.organizationId);
    if (!byOrg.has(id)) {
      byOrg.set(id, {
        organization: m.organization,
        bestScore: m.matchScore,
        jobs: [],
        preferred: (profile.preferredCompanies || []).some(
          (c) =>
            m.organization &&
            String(m.organization.name).toLowerCase().includes(String(c).toLowerCase())
        ),
      });
    }
    const entry = byOrg.get(id);
    entry.bestScore = Math.max(entry.bestScore, m.matchScore);
    entry.jobs.push({ id: m.job._id, title: m.job.title, matchScore: m.matchScore });
  }
  const companies = [...byOrg.values()].sort((a, b) => b.bestScore - a.bestScore).slice(0, 20);
  res.json({ success: true, data: { companies } });
});

exports.resumeJobMatch = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId || req.body.jobId;
  const Job = require('../models/Job');
  const job = await Job.findOne({ _id: jobId, status: 'published' });
  if (!job) throw new AppError('Job not found', 404);
  const resume = await Resume.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
  const { skills } = await learningEco.analyzeSkills(req.user);
  const skillNames = [
    ...skills.map((s) => s.name),
    ...((resume && resume.skills) || []),
  ];
  const { score, matched, missing } = career.skillMatchScore(
    skillNames.map((n) => ({ name: n, mastery: 75 })),
    job.skills?.length ? job.skills : career.findRoleEntry(job.title)?.skills || []
  );
  res.json({
    success: true,
    data: {
      match: {
        jobId: job._id,
        score,
        matched: matched.map((m) => m.name),
        missing,
        eligible: score >= 40 || !(job.skills || []).length,
      },
    },
  });
});

exports.eligibility = asyncHandler(async (req, res) => {
  const matches = await career.matchJobs(req.user, { limit: 30 });
  const eligible = matches.filter((m) => m.eligibility.eligible);
  res.json({
    success: true,
    data: {
      eligibleCount: eligible.length,
      totalReviewed: matches.length,
      matches: eligible.slice(0, 15),
    },
  });
});

/* ─── Interview ─── */

exports.generateQuestions = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const role = req.body.role || profile.targetRole || req.user.targetCareer || 'Software Engineer';
  const type = req.body.type || 'mixed';
  let questions = career.fallbackInterviewQuestions(role, type);
  const useAi = req.body.useAi !== false;

  if (useAi) {
    await consumeAiCredit(req.user, 1);
    try {
      const prompt = `Generate ${type} interview questions for ${role}. Return markdown numbered list of 6 questions only.`;
      const reply = (await aiService.runMode('interview', [{ role: 'user', content: prompt }])).content;
      const parsed = String(reply)
        .split('\n')
        .map((l) => l.replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '').trim())
        .filter((l) => l.length > 12)
        .slice(0, 8)
        .map((promptText) => ({
          prompt: promptText.slice(0, 2000),
          category: type === 'hr' ? 'hr' : type === 'technical' ? 'technical' : 'technical',
          difficulty: 'medium',
        }));
      if (parsed.length >= 3) questions = parsed;
      await recordAiUsage(req.user, {
        mode: 'interview',
        source: 'career',
        creditsUsed: 1,
        success: true,
      });
    } catch (err) {
      await refundAiCredit(req.user, 1);
      throw err;
    }
  }

  res.json({ success: true, data: { role, type, questions } });
});

exports.createInterviewSession = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const role = req.body.role || profile.targetRole || 'Software Engineer';
  const type = req.body.type || 'mock';
  let questions = req.body.questions;
  if (!questions?.length) {
    questions = career.fallbackInterviewQuestions(role, type === 'mock' ? 'mixed' : type);
  }
  const session = await InterviewSession.create({
    ...orgCreateStamp(req.user),
    role,
    company: req.body.company || '',
    type: type === 'mock' ? 'mock' : type,
    status: 'active',
    questions: questions.map((q) => ({
      prompt: q.prompt || q,
      category: q.category || 'technical',
      difficulty: q.difficulty || 'medium',
      sampleAnswer: q.sampleAnswer || '',
    })),
  });
  res.status(201).json({ success: true, data: { session } });
});

exports.listInterviewSessions = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  const sessions = await InterviewSession.find(filter).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, data: { sessions } });
});

exports.getInterviewSession = asyncHandler(async (req, res) => {
  const session = await findAccessible(InterviewSession, req.user, req.params.id);
  if (!session) throw new AppError('Interview session not found', 404);
  res.json({ success: true, data: { session } });
});

exports.answerInterviewQuestion = asyncHandler(async (req, res) => {
  const session = await findAccessible(InterviewSession, req.user, req.params.id);
  if (!session) throw new AppError('Interview session not found', 404);
  const q = session.questions.id(req.params.questionId);
  if (!q) throw new AppError('Question not found', 404);
  q.userAnswer = String(req.body.answer || '').slice(0, 8000);

  await consumeAiCredit(req.user, 1);
  try {
    const prompt = `Score this interview answer 0-100 and give brief feedback.\nRole: ${session.role}\nQuestion: ${q.prompt}\nAnswer: ${q.userAnswer}\nReply format:\nSCORE: <n>\nFEEDBACK: <text>`;
    const reply = (await aiService.runMode('interview', [{ role: 'user', content: prompt }])).content;
    const scoreMatch = String(reply).match(/SCORE:\s*(\d+)/i);
    q.score = scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10))) : 60;
    q.feedback = String(reply).replace(/SCORE:\s*\d+/i, '').replace(/FEEDBACK:\s*/i, '').trim().slice(0, 4000);
    await session.save();
    await recordAiUsage(req.user, {
      mode: 'interview',
      source: 'career',
      creditsUsed: 1,
      success: true,
    });
    res.json({ success: true, data: { question: q, session } });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.completeInterviewSession = asyncHandler(async (req, res) => {
  const session = await findAccessible(InterviewSession, req.user, req.params.id);
  if (!session) throw new AppError('Interview session not found', 404);
  const scored = session.questions.filter((q) => typeof q.score === 'number');
  session.overallScore = scored.length
    ? Math.round(scored.reduce((s, q) => s + q.score, 0) / scored.length)
    : null;

  await consumeAiCredit(req.user, 1);
  let feedbackPersisted = false;
  try {
    const summaryPrompt = `Give overall mock interview feedback for ${session.role}. Scores: ${scored
      .map((q) => q.score)
      .join(', ')}. Average: ${session.overallScore}. Keep under 200 words.`;
    session.overallFeedback = (
      await aiService.runMode('interview', [{ role: 'user', content: summaryPrompt }])
    ).content;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();
    feedbackPersisted = true;
    await recordAiUsage(req.user, {
      mode: 'interview',
      source: 'career',
      creditsUsed: 1,
      success: true,
    });
  } catch (err) {
    if (!feedbackPersisted) await refundAiCredit(req.user, 1);
    throw err;
  }

  const profile = await career.getOrCreateCareerProfile(req.user);
  if (session.overallScore != null) {
    profile.scores = profile.scores || {};
    profile.scores.interviewReadiness = session.overallScore;
    await profile.save();
  }
  const { safeEmit } = require('../utils/platformEvents');
  await safeEmit(req.user, {
    type: 'career_milestone',
    module: 'career',
    title: `Interview complete: ${session.role}`,
    refType: 'InterviewSession',
    refId: session._id,
    payload: { overallScore: session.overallScore, role: session.role },
  });
  res.json({ success: true, data: { session } });
});

/* ─── Resume intelligence ─── */

exports.analyzeResume = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  let resume = await Resume.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
  if (!resume) {
    resume = await Resume.create({
      ...orgCreateStamp(req.user),
      title: 'My Resume',
      headline: profile.targetRole || req.user.targetCareer || '',
    });
  }
  const target = req.body.targetRole || profile.targetRole || req.user.targetCareer || 'Software Engineer';
  const heuristic = career.analyzeResumeHeuristic(resume, target);
  resume.score = heuristic.score;
  resume.analysis = heuristic.analysis;
  const useAi = req.body.useAi !== false;

  if (useAi) {
    await consumeAiCredit(req.user, 1);
    try {
      const prompt = `Analyze this resume for ${target}. List strengths, gaps, and 5 concrete optimizations.\n\n${JSON.stringify({
        headline: resume.headline,
        summary: resume.summary,
        skills: resume.skills,
        experience: resume.experience,
        education: resume.education,
        projects: resume.projects,
      })}`;
      const reply = (await aiService.runMode('resume', [{ role: 'user', content: prompt }])).content;
      resume.aiSuggestions = reply;
      resume.analysis.suggestions = [
        ...heuristic.analysis.suggestions.slice(0, 5),
        ...String(reply)
          .split('\n')
          .map((l) => l.replace(/^[-*•\d.)\s]+/, '').trim())
          .filter((l) => l.length > 20)
          .slice(0, 5),
      ].slice(0, 12);
      await recordAiUsage(req.user, {
        mode: 'resume',
        source: 'career',
        creditsUsed: 1,
        success: true,
      });
    } catch (err) {
      await refundAiCredit(req.user, 1);
      throw err;
    }
  }

  await resume.save();
  profile.scores = profile.scores || {};
  profile.scores.resume = resume.score;
  await profile.save();
  res.json({ success: true, data: { resume, score: resume.score, analysis: resume.analysis } });
});

exports.optimizeResume = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const resume = await Resume.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
  if (!resume) throw new AppError('Resume not found', 404);
  const target = req.body.targetRole || profile.targetRole || 'Software Engineer';
  const prompt = `Optimize this resume for ${target}. Return improved Summary and Skills as markdown.\n\n${JSON.stringify(resume.toObject())}`;
  const suggestions = (await aiService.runMode('resume', [{ role: 'user', content: prompt }])).content;
  resume.aiSuggestions = suggestions;
  if (req.body.applySummary) {
    resume.summary = suggestions.slice(0, 500);
  }
  const heuristic = career.analyzeResumeHeuristic(resume, target);
  resume.score = heuristic.score;
  resume.analysis = heuristic.analysis;
  await resume.save();
  res.json({ success: true, data: { resume, suggestions } });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

/* ─── Certifications ─── */

exports.recommendCertifications = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const { skills } = await require('../services/learningEcosystemService').analyzeSkills(req.user);
  const recommended = career.recommendCertifications(
    profile,
    req.query.role || profile.targetRole,
    skills
  );
  res.json({ success: true, data: { certifications: recommended } });
});

exports.addCertification = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  profile.certifications.push({
    name: req.body.name,
    provider: req.body.provider || '',
    status: req.body.status || 'planned',
    skill: req.body.skill || '',
    credentialId: req.body.credentialId || '',
    targetDate: req.body.targetDate || null,
    notes: req.body.notes || '',
  });
  await profile.save();
  res.status(201).json({ success: true, data: { profile } });
});

exports.updateCertification = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const cert = profile.certifications.id(req.params.certId);
  if (!cert) throw new AppError('Certification not found', 404);
  for (const f of ['name', 'provider', 'status', 'skill', 'credentialId', 'notes', 'targetDate']) {
    if (req.body[f] !== undefined) cert[f] = req.body[f];
  }
  if (req.body.status === 'completed' && !cert.completedAt) cert.completedAt = new Date();
  if (req.body.status && req.body.status !== 'completed') cert.completedAt = null;
  await profile.save();
  res.json({ success: true, data: { certification: cert, profile } });
});

exports.completeCertification = asyncHandler(async (req, res) => {
  const profile = await career.getOrCreateCareerProfile(req.user);
  const cert = profile.certifications.id(req.params.certId);
  if (!cert) throw new AppError('Certification not found', 404);
  cert.status = 'completed';
  cert.completedAt = new Date();
  if (req.body.credentialId) cert.credentialId = req.body.credentialId;
  await profile.save();
  const { safeEmit } = require('../utils/platformEvents');
  await safeEmit(req.user, {
    type: 'career_milestone',
    module: 'career',
    title: `Certification: ${cert.name}`,
    refType: 'Certification',
    refId: cert._id,
    payload: { provider: cert.provider, skill: cert.skill },
  });
  res.json({ success: true, data: { certification: cert } });
});

/* ─── Learning recommendations ─── */

exports.learningRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await career.recommendLearning(req.user);
  res.json({ success: true, data: { recommendations } });
});

/* ─── Analytics ─── */

exports.analytics = asyncHandler(async (req, res) => {
  const analytics = await career.computeAnalytics(req.user);
  res.json({ success: true, data: { analytics } });
});

exports.catalog = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      roles: career.ROLE_CATALOG.map((r) => ({
        role: r.role,
        industry: r.industry,
        domains: r.domains,
        growth: r.growth,
      })),
      certifications: career.CERT_CATALOG,
      roadmapKinds: ['career', 'skill', 'semester', 'placement', 'certification'],
    },
  });
});
