const Task = require('../models/Task')
const Goal = require('../models/Goal')
const Roadmap = require('../models/Roadmap')
const aiTaskService = require('../services/aiTaskService')
const calculateProgress = require('../utils/calculateProgress')

// ── Helper: Recalculate goal progress ──────────────────────────────────────────
const updateGoalProgress = async (goalId, userId) => {
  if (!goalId) return
  try {
    const progress = await calculateProgress(goalId, userId);
    
    await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { progress, completed: progress >= 100 }
    )
  } catch (err) {
    console.error('[updateGoalProgress]', err.message)
  }
}

// ── POST /api/tasks/generate-from-roadmap ─────────────────────────────────────
exports.generateFromRoadmap = async (req, res) => {
  try {
    const { goalId, roadmapId } = req.body;
    if (!goalId || !roadmapId) {
      return res.status(400).json({ success: false, message: "Goal and Roadmap IDs are required." });
    }

    // 1. Fetch data
    const [goal, roadmap] = await Promise.all([
      Goal.findOne({ _id: goalId, userId: req.user._id }),
      Roadmap.findOne({ _id: roadmapId, userId: req.user._id })
    ]);

    if (!goal || !roadmap) {
      return res.status(404).json({ success: false, message: "Goal or Roadmap not found." });
    }

    // 2. Generate daily tasks via AI
    const { days } = await aiTaskService.generateDailyTasks(goal.title, goal.category, roadmap.data);

    // 3. Clear existing roadmap tasks
    await Task.deleteMany({ roadmapId: roadmap._id, userId: req.user._id });

    // 4. Flatten and save tasks
    const tasksToCreate = [];
    days.forEach(dayInfo => {
      dayInfo.tasks.forEach(task => {
        tasksToCreate.push({
          userId: req.user._id,
          goalId: goal._id,
          roadmapId: roadmap._id,
          day: dayInfo.day,
          type: task.type,
          title: task.title,
          description: task.description,
          estimatedTime: task.estimatedTime,
          category: goal.category,
          completed: false
        });
      });
    });

    if (tasksToCreate.length > 0) {
      await Task.insertMany(tasksToCreate);
    }

    // 5. Update goal progress
    await updateGoalProgress(goal._id, req.user._id);

    res.status(201).json({ success: true, message: "Plan generated successfully!" });
  } catch (err) {
    console.error('[taskController.generateFromRoadmap]', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate execution plan.',
      details: err.message 
    });
  }
}

// ── GET /api/tasks ────────────────────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.json({ success: true, tasks })
  } catch (err) {
    console.error('[taskController.getTasks]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── POST /api/tasks ───────────────────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { title, priority, category, goalId } = req.body
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required.' })

    const task = await Task.create({
      userId:   req.user._id,
      title:    title.trim(),
      priority: priority || 'Medium',
      category: category || 'General',
      goalId:   goalId || undefined,
    })

    // Update goal progress if linked
    if (goalId) await updateGoalProgress(goalId, req.user._id)

    res.status(201).json({ success: true, task })
  } catch (err) {
    console.error('[taskController.createTask]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── PUT /api/tasks/:id ────────────────────────────────────────────────────────
// Toggle complete or update fields
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id })
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })

    const oldGoalId = task.goalId

    if (req.body.completed !== undefined) {
      task.completed   = req.body.completed
      task.completedAt = req.body.completed ? new Date() : undefined
    }
    if (req.body.title)    task.title    = req.body.title
    if (req.body.priority) task.priority = req.body.priority
    if (req.body.goalId !== undefined) task.goalId = req.body.goalId

    await task.save()

    // Recalculate progress for old and new goals if changed
    if (task.goalId) await updateGoalProgress(task.goalId, req.user._id)
    if (oldGoalId && oldGoalId.toString() !== task.goalId?.toString()) {
      await updateGoalProgress(oldGoalId, req.user._id)
    }

    res.json({ success: true, task })
  } catch (err) {
    console.error('[taskController.updateTask]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}

// ── DELETE /api/tasks/:id ─────────────────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' })

    if (task.goalId) await updateGoalProgress(task.goalId, req.user._id)

    res.json({ success: true })
  } catch (err) {
    console.error('[taskController.deleteTask]', err.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error.',
      details: err.message
    })
  }
}
