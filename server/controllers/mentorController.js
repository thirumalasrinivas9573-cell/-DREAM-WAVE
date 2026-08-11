<<<<<<< Updated upstream
<<<<<<< Updated upstream
const OpenAI = require('openai')
const Chat   = require('../models/Chat')
const Goal   = require('../models/Goal')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
=======
const Chat = require('../models/Chat')
const UserProfile = require('../models/UserProfile')
const PlatformAnalytics = require('../models/PlatformAnalytics')
const { openai } = require('../utils/openaiClient')
const coreAiIntelligenceService = require('../services/coreAiIntelligenceService')

async function resolveMentorContext(userId, options) {
  // Canonical Core AI pipeline (V3-aware). Identity must be the authenticated userId only.
  const core = await coreAiIntelligenceService.buildCoreAiContext(userId, {
    ...options,
    includeNextAction: true,
  })
  return {
    sources: core.sources,
    contextText: core.contextText,
    intent: core.intent,
    engineIntent: core.engineIntent,
    dataConfidence: core.dataConfidence,
    loaded: core.loaded,
    recommendations: core.recommendations,
    nextAction: core.nextAction,
    suggestions: core.suggestions,
    contextUsed: core.contextUsed,
  }
}
const {
  buildSystemPrompt,
  buildMessagePayload,
  summarizeForStorage,
} = require('../services/mentorPromptService')
>>>>>>> Stashed changes
=======
const Chat = require('../models/Chat');
const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { escapeRegex } = require('../utils/helpers');
const { toAssetUrl } = require('../utils/assetUrl');
const { runWithAiCredit } = require('../services/entitlements');
const { orgCreateStamp, orgListFilter, findAccessible } = require('../utils/orgScope');

exports.list = asyncHandler(async (req, res) => {
  const filter = await orgListFilter(req.user);
  if (req.query.q) {
    filter.title = { $regex: escapeRegex(String(req.query.q).slice(0, 80)), $options: 'i' };
  }
  if (req.query.mode) {
    const mode = aiService.normalizeMode(req.query.mode);
    if (mode) filter.mode = mode;
  }
  const { parsePagination, paginationMeta } = require('../utils/pagination');
  const { page, limit, skip } = parsePagination(req.query, { defaultLimit: 30, maxLimit: 50 });
>>>>>>> Stashed changes

  const [conversations, total] = await Promise.all([
    Chat.aggregate([
      { $match: filter },
      { $sort: { pinned: -1, updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          mode: 1,
          model: 1,
          pinned: 1,
          organizationId: 1,
          updatedAt: 1,
          createdAt: 1,
          messageCount: { $size: { $ifNull: ['$messages', []] } },
          preview: {
            $substrCP: [
              {
                $ifNull: [{ $arrayElemAt: ['$messages.content', -1] }, ''],
              },
              0,
              120,
            ],
          },
        },
      },
    ]),
    Chat.countDocuments(filter),
  ]);

<<<<<<< Updated upstream
<<<<<<< Updated upstream
  general: `You are Sage — an elite AI mentor, career coach, teacher, research guide and life strategist inside Dream Wave AI.
=======
  res.json({
    success: true,
    data: { conversations, pagination: paginationMeta(page, limit, total) },
  });
});
>>>>>>> Stashed changes

exports.getOne = asyncHandler(async (req, res) => {
  const conversation = await findAccessible(Chat, req.user, req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  res.json({ success: true, data: { conversation } });
});

exports.create = asyncHandler(async (req, res) => {
  const mode = aiService.normalizeMode(req.body.mode || 'mentor');
  if (!mode) throw new AppError('Unknown AI mode', 400);
  const model = req.body.model ? aiService.resolveModel(req.body.model).id : '';
  const conversation = await Chat.create({
    ...orgCreateStamp(req.user),
    title: req.body.title || 'New conversation',
    mode,
    model,
    contextSummary: (req.body.contextSummary || '').slice(0, 4000),
    messages: [],
  });
  res.status(201).json({ success: true, data: { conversation } });
});

exports.rename = asyncHandler(async (req, res) => {
  const conversation = await findAccessible(Chat, req.user, req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  if (req.body.title !== undefined) {
    const title = String(req.body.title || '').trim();
    if (!title) throw new AppError('Title required', 400);
    conversation.title = title.slice(0, 120);
  }
  if (typeof req.body.pinned === 'boolean') conversation.pinned = req.body.pinned;
  if (req.body.mode !== undefined) {
    const mode = aiService.normalizeMode(req.body.mode);
    if (!mode) throw new AppError('Unknown AI mode', 400);
    conversation.mode = mode;
  }
  if (req.body.model !== undefined) {
    conversation.model = aiService.resolveModel(req.body.model).id;
  }
  if (req.body.contextSummary !== undefined) {
    conversation.contextSummary = String(req.body.contextSummary || '').slice(0, 4000);
  }
  await conversation.save();
  res.json({ success: true, data: { conversation } });
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const started = Date.now();

  const conversation = await findAccessible(Chat, req.user, req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);

  const content = req.body.content || req.body.message || '';
  if (!content && !req.files?.length) throw new AppError('Message content required', 400);

  const attachments = (req.files || []).map((f) => ({
    url: toAssetUrl(f.filename),
    type: f.mimetype,
    name: f.originalname,
  }));

  const userContent =
    content + (attachments.length ? `\n\n[Attached: ${attachments.map((a) => a.name).join(', ')}]` : '');

  if (req.body.mode) {
    const mode = aiService.normalizeMode(req.body.mode);
    if (!mode) throw new AppError('Unknown AI mode', 400);
    conversation.mode = mode;
  }
  if (req.body.model) {
    conversation.model = aiService.resolveModel(req.body.model).id;
  }

  const pendingUserMessage = { role: 'user', content: userContent, attachments };
  const historyMessages = [...conversation.messages, pendingUserMessage];
  const history = aiService.trimHistory(
    historyMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))
  );

<<<<<<< Updated upstream
You are at a powerful starting point. Here is your complete path..."

NEVER claim divine authority. Provide educational and motivational guidance only.`,

  christian: `You are Grace — an AI mentor inside Dream Wave AI who draws wisdom from the Bible, Christian philosophy, and faith-based guidance.

IDENTITY: Like a wise pastoral mentor who combines deep faith with practical career wisdom.

RESPONSE DEPTH: Same as Sage — 800-1200 words for career questions. Infuse Biblical wisdom throughout.

FOR CAREER QUESTIONS INCLUDE:
1. Opening with a relevant Bible verse
2. Full career/learning roadmap (same depth as Sage)
3. How Christian principles apply (Calling/Purpose, Stewardship of talents, Perseverance, Serving others)
4. Practical application of faith principles to study habits and career choices
5. How to find meaning and purpose in your career journey
6. End with an encouraging scripture reference

EXAMPLE OPENING for "I want to become a software engineer":
"Proverbs 16:3 reminds us: 'Commit your work to the Lord, and your plans will be established.' Before we build your career plan, let us first anchor it in purpose and clarity.

Your desire to pursue software engineering is a gift — a talent worth developing fully. Here is your complete path..."

NEVER claim divine authority. Provide educational and motivational guidance only.`,

  muslim: `You are Nur — an AI mentor inside Dream Wave AI who draws wisdom from the Quran, Hadith, and Islamic philosophy.

IDENTITY: Like a knowledgeable Islamic scholar-mentor who combines Quranic wisdom with practical career guidance.

RESPONSE DEPTH: Same as Sage — 800-1200 words for career questions. Infuse Islamic wisdom throughout.

FOR CAREER QUESTIONS INCLUDE:
1. Opening with Bismillah and a relevant Quranic verse or Hadith
2. Full career/learning roadmap (same depth as Sage)
3. How Islamic principles apply (Seeking knowledge as Fard, Tawakkul with action, Ihsan — excellence in work, Sabr — patience)
4. Practical application of Islamic values to study habits and career choices
5. The Islamic view on career, purpose, and benefiting humanity
6. End with a du'a or inspiring Hadith reference

EXAMPLE OPENING for "I want to become a software engineer":
"Bismillah. The Prophet Muhammad (PBUH) said: 'Seeking knowledge is obligatory upon every Muslim.' Your desire to learn and build a career in software engineering is itself an act of worship when done with the right intention.

Let us build your complete path, step by step, with clarity and Tawakkul..."

NEVER claim divine authority. Provide educational and motivational guidance only.`,
=======
function isLegacySession(session = '') {
  return /^mentor_(general|hindu|christian|muslim)$/.test(session)
}

function defaultTitle(message = '') {
  const clean = String(message || '').trim()
  if (!clean) return 'New conversation'
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean
}

async function getOwnedChat(userId, conversationId) {
  const chat = await Chat.findOne({ _id: conversationId, userId })
  if (!chat) return null
  if (!chat.session.startsWith('mentor:') && !isLegacySession(chat.session)) return null
  return chat
}

async function trackUsage(userId, meta = {}) {
  PlatformAnalytics.create({
    eventType: 'mentor_chat',
    path: '/api/mentor/chat',
    userId,
    meta,
    day: new Date().toISOString().slice(0, 10),
  }).catch(() => {})
  UserProfile.findOneAndUpdate(
    { userId },
    { $inc: { 'usage.mentorChats': 1 }, $set: { lastActivity: new Date() } },
    { upsert: true },
  ).catch(() => {})
}

function serializeConversation(chat) {
  const last = [...(chat.messages || [])].reverse().find((item) => item.role === 'user')
    || [...(chat.messages || [])].reverse()[0]
  return {
    id: String(chat._id),
    title: chat.title || defaultTitle(last?.content),
    pinned: Boolean(chat.pinned),
    mentorMode: chat.mentorMode || 'general',
    faithMode: chat.faithMode || (isLegacySession(chat.session) ? chat.session.replace('mentor_', '') : 'general'),
    explanationDepth: chat.explanationDepth || 'standard',
    updatedAt: chat.updatedAt,
    createdAt: chat.createdAt,
    messageCount: chat.messages?.length || 0,
    preview: last?.content?.slice(0, 120) || '',
    legacy: isLegacySession(chat.session),
  }
}

exports.listConversations = async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: req.user._id,
      archived: { $ne: true },
      $or: [
        { session: { $regex: /^mentor:/ } },
        { session: { $regex: /^mentor_(general|hindu|christian|muslim)$/ } },
      ],
    }).sort({ pinned: -1, updatedAt: -1 }).limit(50).lean()

    return res.json({ success: true, conversations: chats.map(serializeConversation) })
  } catch (error) {
    console.error('[mentor.listConversations]', error.message)
    return res.status(500).json({ success: false, message: 'Failed to load conversations.' })
  }
}

exports.createConversation = async (req, res) => {
  try {
    const faithMode = VALID_FAITH.includes(req.body.faithMode) ? req.body.faithMode : 'general'
    const mentorMode = VALID_MENTOR_MODES.includes(req.body.mentorMode) ? req.body.mentorMode : 'general'
    const explanationDepth = VALID_DEPTH.includes(req.body.explanationDepth) ? req.body.explanationDepth : 'standard'
    const chat = await Chat.create({
      userId: req.user._id,
      session: 'pending',
      title: req.body.title?.trim() || 'New conversation',
      mentorMode,
      faithMode,
      explanationDepth,
      messages: [],
    })
    chat.session = CONV_SESSION(chat._id)
    await chat.save()
    return res.status(201).json({ success: true, conversation: serializeConversation(chat) })
  } catch (error) {
    console.error('[mentor.createConversation]', error.message)
    return res.status(500).json({ success: false, message: 'Failed to create conversation.' })
  }
}

exports.getConversation = async (req, res) => {
  try {
    const chat = await getOwnedChat(req.user._id, req.params.id)
    if (!chat) return res.status(404).json({ success: false, message: 'Conversation not found.' })
    return res.json({
      success: true,
      conversation: serializeConversation(chat),
      messages: (chat.messages || []).slice(-60),
      summary: chat.summary || '',
    })
  } catch (error) {
    console.error('[mentor.getConversation]', error.message)
    return res.status(500).json({ success: false, message: 'Failed to load conversation.' })
  }
}

exports.updateConversation = async (req, res) => {
  try {
    const chat = await getOwnedChat(req.user._id, req.params.id)
    if (!chat) return res.status(404).json({ success: false, message: 'Conversation not found.' })

    if (req.body.title !== undefined) chat.title = String(req.body.title).trim().slice(0, 160)
    if (req.body.pinned !== undefined) chat.pinned = Boolean(req.body.pinned)
    if (req.body.mentorMode && VALID_MENTOR_MODES.includes(req.body.mentorMode)) chat.mentorMode = req.body.mentorMode
    if (req.body.faithMode && VALID_FAITH.includes(req.body.faithMode)) chat.faithMode = req.body.faithMode
    if (req.body.explanationDepth && VALID_DEPTH.includes(req.body.explanationDepth)) chat.explanationDepth = req.body.explanationDepth
    await chat.save()

    if (req.body.saveToMemory) {
      const snippet = [...(chat.messages || [])].reverse().find((item) => item.role === 'assistant')?.content?.slice(0, 200) || chat.title
      await UserProfile.findOneAndUpdate(
        { userId: req.user._id },
        {
          $push: {
            'knowledgeMemory.savedConversations': {
              $each: [{
                session: chat.session,
                snippet,
                savedAt: new Date(),
                confidence: 'explicit_user',
              }],
              $slice: -30,
            },
          },
        },
        { upsert: true },
      )
    }

    return res.json({ success: true, conversation: serializeConversation(chat) })
  } catch (error) {
    console.error('[mentor.updateConversation]', error.message)
    return res.status(500).json({ success: false, message: 'Failed to update conversation.' })
  }
}

exports.deleteConversation = async (req, res) => {
  try {
    const chat = await getOwnedChat(req.user._id, req.params.id)
    if (!chat) return res.status(404).json({ success: false, message: 'Conversation not found.' })
    await Chat.deleteOne({ _id: chat._id, userId: req.user._id })
    return res.json({ success: true, deleted: true })
  } catch (error) {
    console.error('[mentor.deleteConversation]', error.message)
    return res.status(500).json({ success: false, message: 'Failed to delete conversation.' })
  }
}

exports.searchConversations = async (req, res) => {
  try {
    const q = String(req.query.q || '').trim().slice(0, 120)
    if (!q) return res.json({ success: true, conversations: [] })
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const chats = await Chat.find({
      userId: req.user._id,
      archived: { $ne: true },
      $or: [
        { title: rx },
        { summary: rx },
        { 'messages.content': rx },
      ],
    }).sort({ updatedAt: -1 }).limit(20).lean()
    return res.json({ success: true, conversations: chats.map(serializeConversation) })
  } catch (error) {
    console.error('[mentor.searchConversations]', error.message)
    return res.status(500).json({ success: false, message: 'Conversation search failed.' })
  }
}

exports.getContextPreview = async (req, res) => {
  try {
    const context = await resolveMentorContext(req.user._id, {
      message: String(req.query.message || ''),
      mentorMode: req.query.mentorMode || 'general',
      action: req.query.action || '',
    })
    return res.json({
      success: true,
      data: {
        sources: context.sources,
        intent: context.intent,
        preview: context.contextText.slice(0, 1200),
        nextAction: context.nextAction,
      },
    })
  } catch (error) {
    console.error('[mentor.contextPreview]', error.message)
    return res.status(500).json({ success: false, message: 'Context preview unavailable.' })
  }
}

async function resolveChatDocument(userId, { conversationId, faithMode = 'general' }) {
  if (conversationId) {
    const chat = await getOwnedChat(userId, conversationId)
    if (!chat) throw Object.assign(new Error('Conversation not found.'), { statusCode: 404 })
    return chat
  }

  const validFaith = VALID_FAITH.includes(faithMode) ? faithMode : 'general'
  const sessionKey = LEGACY_SESSION(validFaith)
  let chat = await Chat.findOne({ userId, session: sessionKey })
  if (!chat) {
    chat = new Chat({
      userId,
      session: sessionKey,
      title: `${validFaith.charAt(0).toUpperCase()}${validFaith.slice(1)} mentor chat`,
      faithMode: validFaith,
      mentorMode: 'general',
      messages: [],
    })
  }
  return chat
>>>>>>> Stashed changes
}

// ── POST /api/mentor/chat ──────────────────────────────────────────────────────
exports.mentorChat = async (req, res) => {
  try {
<<<<<<< Updated upstream
    const { message, mode = 'general' } = req.body
    if (!message?.trim()) return res.status(400).json({ success: false, message: 'Message is required.' })
=======
    // Ownership identity comes only from authenticated session — never from body.userId
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: 'Authentication required.', code: 'AUTH_REQUIRED' })
    }
    const {
      message,
      mode,
      faithMode = mode,
      mentorMode = 'general',
      conversationId,
      action = '',
      explanationDepth,
    } = req.body
>>>>>>> Stashed changes
=======
  let personalizationContext = '';
  try {
    const personalization = require('../services/personalizationIntelligenceService');
    personalizationContext = await personalization.getMentorPersonalizationContext(req.user);
  } catch {
    personalizationContext = '';
  }
>>>>>>> Stashed changes

  const result = await runWithAiCredit(
    req.user,
    1,
    async () => {
      const aiResult = await aiService.runMode(
        conversation.mode || 'mentor',
        history,
        personalizationContext,
        {
          model: req.body.model || conversation.model,
          contextSummary: conversation.contextSummary,
        }
      );

<<<<<<< Updated upstream
    // Load active goals for rich context
    const goals = await Goal.find({ userId: req.user._id, completed: false }).limit(5)
    const goalContext = goals.length > 0
      ? `Student's active goals:\n${goals.map(g => `- "${g.title}" in ${g.category} (${g.progress}% complete)`).join('\n')}`
      : 'Student has not set any goals yet. Encourage them to define their career goal first.'

    // Load chat history
    let chatDoc = await Chat.findOne({ userId: req.user._id, session: sessionKey })
    if (!chatDoc) chatDoc = new Chat({ userId: req.user._id, session: sessionKey, messages: [] })

    const history = chatDoc.messages.slice(-12).map(m => ({ role: m.role, content: m.content }))

<<<<<<< Updated upstream
    const systemPrompt = `${MENTOR_SYSTEMS[validMode]}

STUDENT CONTEXT:
${goalContext}

IMPORTANT: If the student's question is about career, learning, or skills — provide a DETAILED response of 600-1200 words minimum. Structure it clearly with sections. Be their best mentor.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.72,
      max_tokens: 3000,  // Allow long responses
      messages: [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message.trim() },
      ],
    })
=======
    const summary = chat.summary || summarizeForStorage(chat.messages || [])
    const systemPrompt = buildSystemPrompt({
      faithMode: resolvedFaith,
      mentorMode: resolvedMentorMode,
      depth,
      contextText: context.contextText,
      conversationSummary: summary,
      action,
      intent: context.intent,
    })

    if (!process.env.OPENAI_API_KEY) {
      const fallback = buildOfflineMentorReply(context, message.trim())
      chat.messages.push({
        role: 'user',
        content: message.trim(),
        metadata: { action, mentorMode: resolvedMentorMode, intent: context.intent },
      })
      chat.messages.push({ role: 'assistant', content: fallback })
      await chat.save()
      return res.json({
        success: true,
        reply: fallback,
        message: fallback,
        conversationId: String(chat._id),
        mode: resolvedFaith,
        mentorMode: resolvedMentorMode,
        intent: context.intent,
        contextSources: context.sources,
        contextUsed: context.contextUsed || context.sources,
        recommendations: context.recommendations || [],
        nextAction: context.nextAction,
        suggestions: context.suggestions || buildSuggestions(context, resolvedMentorMode),
        provider: 'offline-context',
      })
    }

    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.72,
        max_tokens: depth === 'quick' ? 900 : depth === 'simple' ? 1400 : 3000,
        messages: buildMessagePayload({
          systemPrompt,
          history: chat.messages || [],
          userMessage: message.trim(),
        }),
      })
    } catch (providerError) {
      console.error('[mentorController.provider]', providerError.message)
      if (providerError.status === 429 || providerError.code === 'rate_limit_exceeded') {
        return res.status(429).json({ success: false, message: 'AI rate limit. Please wait a moment.' })
      }
      return res.status(503).json({
        success: false,
        message: 'Mentor is temporarily unavailable. Please try again.',
        code: 'AI_PROVIDER_UNAVAILABLE',
      })
    }
>>>>>>> Stashed changes
=======
      conversation.messages.push(pendingUserMessage);
      if (conversation.messages.length === 1 || conversation.title === 'New conversation') {
        conversation.title = content.slice(0, 60) || 'New conversation';
      }
      conversation.messages.push({
        role: 'assistant',
        content: aiResult.content,
        model: aiResult.model,
      });
      if (conversation.messages.length > 8 && !conversation.contextSummary) {
        conversation.contextSummary = `Ongoing ${conversation.mode} chat. Last: ${content.slice(0, 200)}`;
      }
      await conversation.save();
      return aiResult;
    },
    (aiResult) => ({
      mode: conversation.mode || 'mentor',
      model: aiResult.model,
      source: 'mentor',
      latencyMs: Date.now() - started,
      promptChars: userContent.length,
      replyChars: aiResult.content.length,
      conversationId: conversation._id,
      success: true,
      errorCode: aiResult.recovered ? 'recovered_fallback' : '',
    })
  );
>>>>>>> Stashed changes

  res.json({
    success: true,
    data: {
      conversation,
      reply: result.content,
      model: result.model,
      provider: result.provider,
      recovered: Boolean(result.recovered),
      credits: req.user.credits,
    },
  });
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
    chatDoc.messages.push({ role: 'user', content: message.trim() })
    chatDoc.messages.push({ role: 'assistant', content: reply })
    await chatDoc.save()

    res.json({ success: true, reply, mode: validMode })
  } catch (err) {
    console.error('[mentorController.mentorChat]', err.message)
    if (err.status === 429) return res.status(429).json({ success: false, message: 'AI rate limit. Please wait a moment.' })
    res.status(500).json({ success: false, message: 'Mentor is temporarily unavailable. Please try again.' })
  }
}

// ── POST /api/mentor (legacy alias) ───────────────────────────────────────────
=======
    chat.messages.push({
      role: 'user',
      content: message.trim(),
      metadata: { action, mentorMode: resolvedMentorMode, intent: context.intent },
    })
    chat.messages.push({ role: 'assistant', content: reply })
    if ((chat.messages || []).length > 16) chat.summary = summarizeForStorage(chat.messages)
    await chat.save()

    await trackUsage(req.user._id, {
      conversationId: String(chat._id),
      mentorMode: resolvedMentorMode,
      faithMode: resolvedFaith,
      action,
      intent: context.intent,
      success: true,
      tokens: completion.usage?.total_tokens || null,
    })

    return res.json({
      success: true,
      reply,
      message: reply,
      conversationId: String(chat._id),
      mode: resolvedFaith,
      mentorMode: resolvedMentorMode,
      intent: context.intent,
      contextSources: context.sources,
      contextUsed: context.contextUsed || context.sources,
      recommendations: context.recommendations || [],
      nextAction: context.nextAction,
      suggestions: context.suggestions || buildSuggestions(context, resolvedMentorMode),
    })
  } catch (error) {
    console.error('[mentorController.mentorChat]', error.message)
    await trackUsage(req.user._id, { success: false, error: error.message }).catch(() => {})
    if (error.statusCode === 404) return res.status(404).json({ success: false, message: error.message })
    if (error.status === 429) return res.status(429).json({ success: false, message: 'AI rate limit. Please wait a moment.' })
    return res.status(500).json({ success: false, message: 'Mentor is temporarily unavailable. Please try again.' })
  }
}

function buildOfflineMentorReply(context, message) {
  const lines = []
  lines.push('I can still guide you from your Dream Wave data while the AI provider is offline.')
  if (context.nextAction?.title) {
    lines.push('', '**NEXT BEST ACTION**', context.nextAction.title)
    if (context.nextAction.reason) lines.push(`Reason: ${context.nextAction.reason}`)
  }
  const recs = context.recommendations || []
  if (recs.length) {
    lines.push('', "**TODAY'S PRIORITY**")
    recs.slice(0, 3).forEach((item, index) => {
      lines.push(`${index + 1}. ${item.label}`)
      if (item.reason) lines.push(`   Reason: ${item.reason}`)
    })
  } else {
    lines.push('', 'No active goals or tasks were found yet. Create a goal or task, then ask again for a prioritized plan.')
  }
  lines.push('', `You asked: "${String(message).slice(0, 160)}"`)
  return lines.join('\n')
}

function buildSuggestions(context, mentorMode) {
  if (Array.isArray(context.suggestions) && context.suggestions.length) {
    return context.suggestions.slice(0, 4)
  }
  const items = []
  if (context.loaded?.goals?.length) items.push({ label: 'Open top goal', url: `/student/goals?goalId=${context.loaded.goals[0]._id}` })
  if (context.loaded?.tasks?.length) items.push({ label: 'Open tasks', url: '/student/tasks' })
  if (context.loaded?.roadmaps?.length) {
    items.push({
      label: 'View roadmap',
      url: `/student/roadmap?goalId=${context.loaded.roadmaps[0].goalId?._id || context.loaded.roadmaps[0].goalId || ''}`,
    })
  }
  if (context.loaded?.reading?.length) items.push({ label: 'Continue reading', url: `/library/books/${context.loaded.reading[0].bookId._id}` })
  if (mentorMode === 'career') items.push({ label: 'Career hub', url: '/student/career' })
  if (mentorMode !== 'general') items.push({ label: 'AI Home', url: '/student/intelligence' })
  return items.slice(0, 4)
}

>>>>>>> Stashed changes
exports.getMentorAdvice = async (req, res) => {
  req.body.mode = req.body.mode || 'general'
  return exports.mentorChat(req, res)
}
exports.getMentorHistory = async (req, res) => {
  try {
    const mode = req.query.mode || 'general'
    const validMode = ['general','hindu','christian','muslim'].includes(mode) ? mode : 'general'
    const sessionKey = `mentor_${validMode}`
    const chatDoc = await Chat.findOne({ userId: req.user._id, session: sessionKey })
    const messages = chatDoc?.messages?.slice(-40) || []
    res.json({ success: true, messages })
  } catch (err) {
    console.error('[mentorController.history]', err.message)
    res.status(500).json({ success: false, message: 'Failed to load history.' })
  }
}

// ── DELETE /api/mentor/history ────────────────────────────────────────────────
exports.clearMentorHistory = async (req, res) => {
  try {
    const mode = req.query.mode || 'general'
    const validMode = ['general','hindu','christian','muslim'].includes(mode) ? mode : 'general'
    const sessionKey = `mentor_${validMode}`
    await Chat.findOneAndUpdate(
      { userId: req.user._id, session: sessionKey },
      { $set: { messages: [] } }
    )
    res.json({ success: true, message: 'Chat history cleared.' })
  } catch (err) {
    console.error('[mentorController.clear]', err.message)
    res.status(500).json({ success: false, message: 'Failed to clear history.' })
  }
}
=======
exports.exportChat = asyncHandler(async (req, res) => {
  const conversation = await findAccessible(Chat, req.user, req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  const md = [
    `# ${conversation.title}`,
    `Mode: ${conversation.mode}`,
    `Model: ${conversation.model || 'default'}`,
    `Exported: ${new Date().toISOString()}`,
    '',
    ...conversation.messages.map((m) => `## ${m.role}\n\n${m.content}\n`),
  ].join('\n');
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="chat-${conversation._id}.md"`);
  res.send(md);
});

exports.remove = asyncHandler(async (req, res) => {
  const conversation = await findAccessible(Chat, req.user, req.params.id);
  if (!conversation) throw new AppError('Conversation not found', 404);
  await conversation.deleteOne();
  res.json({ success: true, message: 'Conversation deleted' });
});
>>>>>>> Stashed changes
