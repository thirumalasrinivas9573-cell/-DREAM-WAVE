const Goal   = require('../models/Goal')
const OpenAI = require('openai')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// ── POST /api/goals ───────────────────────────────────────────────────────────
exports.createGoal = async (req, res) => {
  try {
    const { title, description, category, deadline } = req.body
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required.' })

    const goal = await Goal.create({
      userId:      req.user._id,
      title:       title.trim(),
      description: description?.trim() || '',
      category:    category || 'Personal',
      deadline:    deadline || undefined,
    })

    res.status(201).json({ success: true, goal })
  } catch (err) {
    console.error('[goalController.createGoal]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── GET /api/goals ────────────────────────────────────────────────────────────
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, goals })
  } catch (err) {
    console.error('[goalController.getGoals]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── PUT /api/goals/:id ────────────────────────────────────────────────────────
// Updates progress, completed flag, or any other field
exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id })
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' })

    const allowed = ['title', 'description', 'progress', 'completed', 'deadline', 'category', 'aiPlan']
    allowed.forEach(f => { if (req.body[f] !== undefined) goal[f] = req.body[f] })

    // Auto-complete when progress hits 100
    if (goal.progress >= 100) goal.completed = true

    await goal.save()
    res.json({ success: true, goal })
  } catch (err) {
    console.error('[goalController.updateGoal]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── DELETE /api/goals/:id ─────────────────────────────────────────────────────
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found.' })
    res.json({ success: true })
  } catch (err) {
    console.error('[goalController.deleteGoal]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── POST /api/goals/:id/ai-plan ───────────────────────────────────────────────
// Generate deep AI action plan and save it to the goal
exports.generateAIPlan = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id })
    if (!goal) return res.status(404).json({ message: 'Goal not found.' })

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a world-class career coach and learning architect. Generate a deep, specific 6-step action plan.
Return JSON ONLY: { "steps": ["step1", "step2", "step3", "step4", "step5", "step6"] }
REQUIREMENT: Each step must be 60-100 words. Include: exactly what to do, specific resources (tool/course/book names), timeline, and expected outcome. No vague advice.`
        },
        {
          role: 'user',
          content: `Create a practical 6-step action plan for this goal: "${goal.title}" (Category: ${goal.category}).

Each step must be 60-100 words and include:
1. Exactly what action to take
2. Specific resource to use (course name, book title, or tool name)
3. Time commitment (e.g., "2 hours/day for 3 weeks")
4. Expected outcome after completing this step

Make it concrete enough that the student knows exactly what to do starting today.`
        },
      ],
    })

    let steps = []
    try { steps = JSON.parse(completion.choices[0].message.content).steps || [] } catch { steps = [] }

    goal.aiPlan = steps
    await goal.save()

    res.json({ success: true, steps, goal })
  } catch (err) {
    console.error('[goalController.generateAIPlan]', err.message)
    res.status(500).json({ message: 'AI service error.' })
  }
}
