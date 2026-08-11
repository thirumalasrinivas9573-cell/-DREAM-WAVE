const aiService = require('../services/aiService');
const Chat = require('../models/Chat');
const AiUsage = require('../models/AiUsage');
const AiPrompt = require('../models/AiPrompt');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { consumeAiCredit, refundAiCredit, getEntitlements, isLiveAiResult } = require('../services/entitlements');
const { orgCreateStamp, findAccessible, orgListFilter } = require('../utils/orgScope');
const { auditFromRequest } = require('../utils/audit');

function resolveModeOrThrow(raw) {
  const mode = aiService.normalizeMode(raw);
  if (!mode) throw new AppError('Unknown AI mode', 400);
  return mode;
}

exports.listModes = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      modes: aiService.listModes(),
      aliases: aiService.MODE_ALIASES,
      assistants: Object.keys(aiService.ASSISTANT_ROUTES),
    },
  });
});

exports.listModels = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: { models: aiService.listModels() } });
});

exports.getCredits = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      credits: req.user.credits,
      entitlements: getEntitlements(req.user),
    },
  });
});

exports.getUsage = asyncHandler(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));
  // AI usage is private to the account (platform admin may filter by userId).
  const filter =
    req.user.role === 'admin' && req.query.userId
      ? { user: req.query.userId }
      : { user: req.user._id };
  if (req.query.mode) filter.mode = String(req.query.mode);
  if (req.query.source) filter.source = String(req.query.source);

  const [rows, totals] = await Promise.all([
    AiUsage.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
    AiUsage.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          calls: { $sum: 1 },
          credits: { $sum: '$creditsUsed' },
          failures: { $sum: { $cond: ['$success', 0, 1] } },
        },
      },
    ]),
  ]);

  const summary = totals[0] || { calls: 0, credits: 0, failures: 0 };
  res.json({
    success: true,
    data: {
      usage: rows,
      summary: {
        calls: summary.calls,
        creditsUsed: summary.credits,
        failures: summary.failures,
        creditsRemaining: req.user.credits,
      },
    },
  });
});

exports.listPrompts = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.mode) filter.mode = String(req.query.mode);
  const prompts = await AiPrompt.find(filter).sort({ isFavorite: -1, updatedAt: -1 }).limit(100);
  res.json({ success: true, data: { prompts } });
});

exports.createPrompt = asyncHandler(async (req, res) => {
  const mode = resolveModeOrThrow(req.body.mode || 'mentor');
  const prompt = await AiPrompt.create({
    ...orgCreateStamp(req.user),
    name: req.body.name,
    mode,
    body: req.body.body,
    description: req.body.description || '',
    isFavorite: Boolean(req.body.isFavorite),
  });
  res.status(201).json({ success: true, data: { prompt } });
});

exports.updatePrompt = asyncHandler(async (req, res) => {
  const prompt = await findAccessible(AiPrompt, req.user, req.params.id);
  if (!prompt) throw new AppError('Prompt not found', 404);
  if (req.body.name !== undefined) prompt.name = req.body.name;
  if (req.body.body !== undefined) prompt.body = req.body.body;
  if (req.body.description !== undefined) prompt.description = req.body.description;
  if (typeof req.body.isFavorite === 'boolean') prompt.isFavorite = req.body.isFavorite;
  if (req.body.mode !== undefined) prompt.mode = resolveModeOrThrow(req.body.mode);
  await prompt.save();
  res.json({ success: true, data: { prompt } });
});

exports.deletePrompt = asyncHandler(async (req, res) => {
  const prompt = await findAccessible(AiPrompt, req.user, req.params.id);
  if (!prompt) throw new AppError('Prompt not found', 404);
  await prompt.deleteOne();
  res.json({ success: true, message: 'Prompt deleted' });
});

/** Persisted multi-turn run — writes to Chat (same store as /api/mentor). */
exports.run = asyncHandler(async (req, res) => {
  const started = Date.now();

  const mode = resolveModeOrThrow(req.body.mode || 'mentor');
  const { message, conversationId, context, model, promptId } = req.body;
  if (!message?.trim()) throw new AppError('Message is required', 400);

  await consumeAiCredit(req.user, 1);

  let conversation;
  try {
    if (conversationId) {
      conversation = await findAccessible(Chat, req.user, conversationId);
      if (!conversation) throw new AppError('Conversation not found', 404);
    } else {
      conversation = await Chat.create({
        title: message.slice(0, 60),
        mode,
        model: model || '',
        messages: [],
        ...orgCreateStamp(req.user),
      });
    }

    if (promptId) {
      const saved = await findAccessible(AiPrompt, req.user, promptId);
      if (saved) {
        saved.usageCount += 1;
        await saved.save();
      }
    }

    conversation.mode = mode;
    if (model) conversation.model = aiService.resolveModel(model).id;
    conversation.messages.push({ role: 'user', content: message });

    const history = aiService.trimHistory(
      conversation.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))
    );

    const result = await aiService.runMode(mode, history, context || '', {
      model: model || conversation.model,
      contextSummary: conversation.contextSummary,
    });

    conversation.messages.push({
      role: 'assistant',
      content: result.content,
      model: result.model,
    });
    if (conversation.title === 'New conversation') conversation.title = message.slice(0, 60);
    if (conversation.messages.length > 8 && !conversation.contextSummary) {
      conversation.contextSummary = `Ongoing ${mode} chat titled "${conversation.title}". Last topic: ${message.slice(0, 200)}`;
    }
    await conversation.save();

    const live = isLiveAiResult(result);
    if (!live) await refundAiCredit(req.user, 1);

    await require('../services/entitlements').recordAiUsage(req.user, {
      mode,
      model: result.model,
      source: 'run',
      creditsUsed: live ? 1 : 0,
      latencyMs: Date.now() - started,
      promptChars: message.length,
      replyChars: result.content.length,
      conversationId: conversation._id,
      success: live,
      errorCode: live ? '' : 'local_fallback',
      failureClass: live ? '' : 'local_fallback',
    });

    await auditFromRequest(req, {
      action: 'ai.run',
      resource: 'Chat',
      resourceId: conversation._id,
      meta: { mode, live, creditsUsed: live ? 1 : 0 },
    });

    res.json({
      success: true,
      data: {
        reply: result.content,
        conversation,
        mode,
        modeLabel: result.modeLabel,
        model: result.model,
        provider: result.provider,
        recovered: Boolean(result.recovered) || !live,
        saved: true,
        credits: req.user.credits,
      },
    });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

/** Ephemeral one-shot — does NOT write Chat history. */
exports.quick = asyncHandler(async (req, res) => {
  const started = Date.now();

  const mode = resolveModeOrThrow(req.body.mode || 'mentor');
  const { prompt, context, model } = req.body;
  if (!prompt?.trim()) throw new AppError('Prompt is required', 400);

  await consumeAiCredit(req.user, 1);
  try {
    const result = await aiService.runMode(mode, [{ role: 'user', content: prompt }], context || '', {
      model,
    });

    const live = isLiveAiResult(result);
    if (!live) await refundAiCredit(req.user, 1);

    await require('../services/entitlements').recordAiUsage(req.user, {
      mode,
      model: result.model,
      source: 'quick',
      creditsUsed: live ? 1 : 0,
      latencyMs: Date.now() - started,
      promptChars: prompt.length,
      replyChars: result.content.length,
      success: live,
      errorCode: live ? '' : 'local_fallback',
      failureClass: live ? '' : 'local_fallback',
    });

    res.json({
      success: true,
      data: {
        reply: result.content,
        mode,
        modeLabel: result.modeLabel,
        model: result.model,
        provider: result.provider,
        recovered: Boolean(result.recovered) || !live,
        saved: false,
        credits: req.user.credits,
      },
    });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

/** Specialized assistants — thin mode-mapped wrappers over run. */
exports.assistant = (req, res, next) => {
  const mapped = aiService.ASSISTANT_ROUTES[String(req.params.name || '').toLowerCase()];
  if (!mapped) return next(new AppError('Unknown assistant', 404));
  req.body = { ...req.body, mode: mapped };
  return exports.run(req, res, next);
};

/** SSE streaming when OpenAI is configured; otherwise single-chunk recovery. */
exports.stream = asyncHandler(async (req, res) => {
  const started = Date.now();

  const mode = resolveModeOrThrow(req.body.mode || 'mentor');
  const { message, conversationId, context, model } = req.body;
  if (!message?.trim()) throw new AppError('Message is required', 400);

  await consumeAiCredit(req.user, 1);

  let conversation;
  try {
    if (conversationId) {
      conversation = await findAccessible(Chat, req.user, conversationId);
      if (!conversation) throw new AppError('Conversation not found', 404);
    } else {
      conversation = await Chat.create({
        title: message.slice(0, 60),
        mode,
        model: model || '',
        messages: [],
        ...orgCreateStamp(req.user),
      });
    }

    conversation.mode = mode;
    if (model) conversation.model = aiService.resolveModel(model).id;
    conversation.messages.push({ role: 'user', content: message });

    const history = aiService.trimHistory(
      conversation.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))
    );

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    if (typeof res.flushHeaders === 'function') res.flushHeaders();

    const writeEvent = (payload) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    writeEvent({ type: 'start', conversationId: conversation._id, mode });

    const result = await aiService.streamMode(
      mode,
      history,
      context || '',
      { model: model || conversation.model, contextSummary: conversation.contextSummary },
      (chunk) => writeEvent({ type: 'chunk', text: chunk })
    );

    conversation.messages.push({
      role: 'assistant',
      content: result.content,
      model: result.model,
    });
    if (conversation.title === 'New conversation') conversation.title = message.slice(0, 60);
    await conversation.save();

    const live = isLiveAiResult(result);
    if (!live) await refundAiCredit(req.user, 1);

    await require('../services/entitlements').recordAiUsage(req.user, {
      mode,
      model: result.model,
      source: 'stream',
      creditsUsed: live ? 1 : 0,
      latencyMs: Date.now() - started,
      promptChars: message.length,
      replyChars: result.content.length,
      conversationId: conversation._id,
      success: live,
      errorCode: live ? '' : 'local_fallback',
      failureClass: live ? '' : 'local_fallback',
    });

    writeEvent({
      type: 'done',
      reply: result.content,
      conversationId: conversation._id,
      model: result.model,
      provider: result.provider,
      streamed: Boolean(result.streamed),
      recovered: Boolean(result.recovered) || !live,
      credits: req.user.credits,
    });
    res.end();
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});
