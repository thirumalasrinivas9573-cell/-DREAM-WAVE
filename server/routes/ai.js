const express = require('express')
const router  = require('express').Router()
const OpenAI  = require('openai')
const Chat    = require('../models/Chat')
const UserProfile = require('../models/UserProfile')
const auth    = require('../middleware/auth')
const { sanitizeInput } = require('../middleware/sanitize')
const cache   = require('../services/responseCache')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

router.use(sanitizeInput)

const SYS = 'You are a world-class AI career mentor. Give accurate, goal-focused guidance. Be direct (5-8 lines), specific, and action-oriented.'

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  try {
    const { message, session = 'mentor', userGoal } = req.body
    if (!message) return res.status(400).json({ message: 'message required' })

    let chat = await Chat.findOne({ userId: req.user._id, session })
    if (!chat) chat = new Chat({ userId: req.user._id, session, messages: [] })
    const history = chat.messages.slice(-20).map(m => ({ role: m.role, content: m.content }))

    const systemMsg = userGoal
      ? SYS + ' User Goal: "' + userGoal + '". Assess every message against this goal.'
      : SYS

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 600,
      messages: [{ role: 'system', content: systemMsg }, ...history, { role: 'user', content: message.trim() }],
    })

    const reply = completion.choices[0].message.content
    chat.messages.push({ role: 'user', content: message.trim() })
    chat.messages.push({ role: 'assistant', content: reply })
    await chat.save()

    res.json({ success: true, reply })
  } catch (err) {
    console.error('[ai/chat]', err.message)
    if (err.status === 429) return res.status(429).json({ message: 'AI rate limit. Please wait.' })
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// GET /api/ai/history
router.get('/history', auth, async (req, res) => {
  try {
    const { session = 'mentor' } = req.query
    const chat = await Chat.findOne({ userId: req.user._id, session })
    res.json({ success: true, messages: chat ? chat.messages : [] })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history' })
  }
})

// DELETE /api/ai/history
router.delete('/history', auth, async (req, res) => {
  try {
    const { session = 'mentor' } = req.query
    await Chat.findOneAndUpdate({ userId: req.user._id, session }, { messages: [] })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear history' })
  }
})

// GET /api/ai/progress
router.get('/progress', auth, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id })
    if (!profile) profile = await UserProfile.create({ userId: req.user._id })
    res.json({
      success: true,
      progress: {
        consistencyScore: profile.consistencyScore,
        focusScore: profile.focusScore,
        dailyStreak: profile.dailyStreak,
        lastActivity: profile.lastActivity,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load progress' })
  }
})

// POST /api/ai/goal-plan
router.post('/goal-plan', auth, async (req, res) => {
  try {
    const { title, category = 'Personal' } = req.body
    if (!title) return res.status(400).json({ message: 'title required' })

    const cacheKey = cache.makeKey('goal-plan', title, category)
    const cached = cache.get(cacheKey)
    if (cached) return res.json({ success: true, steps: cached, cached: true })

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.65,
      max_tokens: 350,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: 'Create a 4-step action plan for goal: "' + title + '" (Category: ' + category + '). Return JSON: { "steps": ["step1","step2","step3","step4"] }' },
      ],
    })

    let steps = []
    try { steps = JSON.parse(completion.choices[0].message.content).steps || [] } catch { steps = [] }
    cache.set(cacheKey, steps)
    res.json({ success: true, steps })
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// POST /api/ai/daily
router.post('/daily', auth, async (req, res) => {
  try {
    const { message } = req.body
    if (!message) return res.status(400).json({ message: 'message required' })
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.75,
      max_tokens: 400,
      messages: [{ role: 'system', content: SYS + ' You are a daily life coach.' }, { role: 'user', content: message }],
    })
    res.json({ success: true, reply: completion.choices[0].message.content })
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// POST /api/ai/report
router.post('/report', auth, async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic) return res.status(400).json({ message: 'topic required' })
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.6,
      max_tokens: 600,
      messages: [
        { role: 'system', content: 'You are a research analyst. Return JSON only.' },
        { role: 'user', content: 'Research report on: "' + topic + '". Return JSON: { "summary": "...", "insights": [{"label":"...","value":"..."}], "actions": ["..."] }' },
      ],
    })
    let report = {}
    try { report = JSON.parse(completion.choices[0].message.content) } catch {
      report = { summary: completion.choices[0].message.content, insights: [], actions: [] }
    }
    res.json({ success: true, report })
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// POST /api/ai/roadmap
router.post('/roadmap', auth, async (req, res) => {
  try {
    const { goal, currentLevel = 'beginner' } = req.body
    if (!goal) return res.status(400).json({ message: 'goal required' })
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.65,
      max_tokens: 480,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: 'Create 3-phase roadmap for "' + goal + '" level ' + currentLevel + '. JSON: { "phases": [{"title":"...","duration":"...","description":"...","steps":["...","...","..."]}] }' },
      ],
    })
    let phases = []
    try { phases = JSON.parse(completion.choices[0].message.content).phases || [] } catch { phases = [] }
    res.json({ success: true, phases })
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// POST /api/ai/books
router.post('/books', auth, async (req, res) => {
  try {
    const { topic } = req.body
    if (!topic) return res.status(400).json({ message: 'topic required' })
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 600,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: '5 books on "' + topic + '". JSON: { "books": [{"title":"...","author":"...","reason":"...","category":"..."}] }' },
      ],
    })
    let books = []
    try { books = JSON.parse(completion.choices[0].message.content).books || [] } catch { books = [] }
    res.json({ success: true, books })
  } catch (err) {
    res.status(500).json({ message: 'AI error', error: err.message })
  }
})

// GET /api/ai/dashboard-stats
router.get('/dashboard-stats', auth, async (req, res) => {
  try {
    const Goal = require('../models/Goal')
    const Task = require('../models/Task')
    const [goals, tasks, done, chat] = await Promise.all([
      Goal.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: true }),
      Chat.findOne({ userId: req.user._id, session: 'mentor' }),
    ])
    res.json({ success: true, stats: { goals, tasks, taskDone: done, aiChats: Math.floor((chat && chat.messages ? chat.messages.length : 0) / 2) } })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats' })
  }
})

// GET /api/ai/daily-suggestion
router.get('/daily-suggestion', auth, async (req, res) => {
  try {
    const Goal = require('../models/Goal')
    const Task = require('../models/Task')
    const [goals, tasks] = await Promise.all([
      Goal.find({ userId: req.user._id, completed: false }).limit(3).lean(),
      Task.find({ userId: req.user._id, completed: false }).limit(5).lean(),
    ])
    const goalList = goals.map(g => '- ' + g.title + ' (' + (g.progress || 0) + '% done)').join('\n') || 'No active goals'
    const taskList = tasks.map(t => '- ' + t.title).join('\n') || 'No pending tasks'
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      max_tokens: 300,
      messages: [
        { role: 'system', content: SYS },
        { role: 'user', content: 'Daily suggestion for user. Goals: ' + goalList + ' Tasks: ' + taskList + '. Return JSON: { "greeting":"...","focus":"...","action":"...","avoid":"...","affirmation":"..." }' },
      ],
    })
    let suggestion = {}
    try { suggestion = JSON.parse(completion.choices[0].message.content) } catch {
      suggestion = { greeting: 'Today is your opportunity.', focus: 'Focus on your primary goal.', action: 'Take one step forward.', avoid: 'Avoid distractions.', affirmation: 'You are capable.' }
    }
    res.json({ success: true, suggestion })
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate suggestion' })
  }
})

// POST /api/ai/agent  
router.post('/agent', auth, async (req, res) => {
  try {
    const { message, agentType = 'mentor' } = req.body
    if (!message) return res.status(400).json({ message: 'message required' })
    const agentSvc = require('../services/agentService')
    const profile = await UserProfile.findOne({ userId: req.user._id }) || {}
    const { reply, agentName } = await agentSvc.runAgent(agentType, message, [], profile)
    res.json({ success: true, reply, agentName, agentType })
  } catch (err) {
    res.status(500).json({ message: 'Agent error', error: err.message })
  }
})

// GET /api/ai/nudge
router.get('/nudge', auth, async (req, res) => {
  try {
    const agentSvc = require('../services/agentService')
    const Goal = require('../models/Goal')
    const Task = require('../models/Task')
    const [goalCount, taskDone, chat, profile] = await Promise.all([
      Goal.countDocuments({ userId: req.user._id }),
      Task.countDocuments({ userId: req.user._id, completed: true }),
      Chat.findOne({ userId: req.user._id, session: 'mentor' }),
      UserProfile.findOne({ userId: req.user._id }),
    ])
    const stats = { goals: goalCount, taskDone, aiChats: Math.floor((chat ? chat.messages.length : 0) / 2) }
    const nudge = await agentSvc.generateNudge(stats, profile || {})
    res.json({ success: true, nudge })
  } catch (err) {
    res.status(500).json({ message: 'Nudge error' })
  }
})

// GET /api/ai/user-profile
router.get('/user-profile', auth, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id })
    if (!profile) profile = await UserProfile.create({ userId: req.user._id })
    res.json({ success: true, profile })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile' })
  }
})

// PUT /api/ai/user-profile
router.put('/user-profile', auth, async (req, res) => {
  try {
    const allowed = ['tone', 'interests', 'currentRole', 'targetRole', 'skills']
    const updates = {}
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k] })
    const profile = await UserProfile.findOneAndUpdate({ userId: req.user._id }, { $set: updates }, { new: true, upsert: true })
    res.json({ success: true, profile })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' })
  }
})

module.exports = router
