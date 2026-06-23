const { generateRoadmap, FALLBACK_ROADMAP } = require("../services/aiRoadmapService");
const { generateDailyTasks } = require("../services/aiTaskService");
const Roadmap = require("../models/Roadmap");
const Goal    = require("../models/Goal");
const Task    = require("../models/Task");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/roadmap/generate
// Generates a full specialist-level AI roadmap for a goal and saves it.
// ─────────────────────────────────────────────────────────────────────────────
exports.createRoadmap = async (req, res) => {
  try {
    const { goalTitle, category, goalId, age, education, skills, interests } = req.body;

    if (!goalId) {
      return res.status(400).json({ success: false, message: "Goal ID is required." });
    }

    // Build optional user context for richer AI output
    const userContext = { age, education, skills, interests };

    // 1. Generate the rich specialist roadmap
    const roadmapData = await generateRoadmap(goalTitle, category, userContext);

    // 2. Upsert roadmap in DB (one roadmap per goal per user)
    const roadmap = await Roadmap.findOneAndUpdate(
      { goalId, userId: req.user._id },
      { data: roadmapData },
      { upsert: true, new: true }
    );

    // 3. Auto-generate daily tasks from the roadmap (non-blocking)
    try {
      const { days } = await generateDailyTasks(goalTitle, category, roadmapData);

      // Clear old roadmap tasks for this goal
      await Task.deleteMany({ roadmapId: roadmap._id, userId: req.user._id });

      const tasksToCreate = [];
      days.forEach(dayInfo => {
        dayInfo.tasks.forEach(task => {
          tasksToCreate.push({
            userId:        req.user._id,
            goalId,
            roadmapId:     roadmap._id,
            day:           dayInfo.day,
            type:          task.type,
            title:         task.title,
            description:   task.description,
            estimatedTime: task.estimatedTime,
            category,
            completed:     false,
          });
        });
      });

      if (tasksToCreate.length > 0) {
        await Task.insertMany(tasksToCreate);
      }

      // Reset goal progress since tasks are freshly generated
      await Goal.findByIdAndUpdate(goalId, { progress: 0 });

    } catch (taskErr) {
      // Task generation failure should not fail the roadmap response
      console.error("[roadmapController] Task generation failed:", taskErr.message);
    }

    res.json({ success: true, roadmap });

  } catch (error) {
    console.error("[roadmapController.createRoadmap]", error.message);

    // Quota / rate-limit fallback -- return a usable roadmap instead of an error
    const isQuota = error?.status === 429 || error?.code === 'insufficient_quota';
    if (isQuota) {
      try {
        const { goalId } = req.body;
        const roadmap = await Roadmap.findOneAndUpdate(
          { goalId, userId: req.user._id },
          { data: FALLBACK_ROADMAP },
          { upsert: true, new: true }
        );
        return res.json({ success: true, roadmap, fallback: true });
      } catch (fbErr) {
        console.error("[roadmapController] Fallback save failed:", fbErr.message);
      }
    }

    res.status(500).json({
      success: false,
      message: "Failed to generate roadmap.",
      details: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/roadmap/:goalId
// Fetches the saved roadmap for a goal.
// ─────────────────────────────────────────────────────────────────────────────
exports.getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({
      goalId:  req.params.goalId,
      userId:  req.user._id,
    });

    if (!roadmap) {
      return res.status(404).json({ message: "No roadmap found for this goal." });
    }

    res.json({ success: true, roadmap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/roadmap/:goalId/task
// Kept for backward compatibility -- marks a step as complete and updates
// goal progress based on completed nextSteps.
// ─────────────────────────────────────────────────────────────────────────────
exports.updateTaskStatus = async (req, res) => {
  try {
    const { stepIndex, completed } = req.body;

    const roadmap = await Roadmap.findOne({
      goalId: req.params.goalId,
      userId: req.user._id,
    });

    if (!roadmap) return res.status(404).json({ message: "Roadmap not found" });

    // Update the nextSteps completion flag
    if (
      roadmap.data.nextSteps &&
      Array.isArray(roadmap.data.nextSteps) &&
      roadmap.data.nextSteps[stepIndex] !== undefined
    ) {
      roadmap.data.nextSteps[stepIndex].completed = completed;
      roadmap.markModified('data');
      await roadmap.save();

      // Recalculate goal progress from completed steps
      const total     = roadmap.data.nextSteps.length;
      const done      = roadmap.data.nextSteps.filter(s => s.completed).length;
      const progress  = Math.round((done / total) * 100);
      await Goal.findByIdAndUpdate(req.params.goalId, { progress });

      return res.json({ success: true, roadmap, progress });
    }

    // Legacy: phases-based roadmap (old format)
    if (roadmap.data.phases && Array.isArray(roadmap.data.phases)) {
      const { phaseIndex, taskIndex } = req.body;
      roadmap.data.phases[phaseIndex].tasks[taskIndex].completed = completed;
      roadmap.markModified('data');
      await roadmap.save();

      const allTasks      = roadmap.data.phases.flatMap(p => p.tasks);
      const completedCount = allTasks.filter(t => t.completed).length;
      const progress       = Math.round((completedCount / allTasks.length) * 100);
      await Goal.findByIdAndUpdate(req.params.goalId, { progress });

      return res.json({ success: true, roadmap, progress });
    }

    res.status(400).json({ message: "Invalid roadmap format for task update." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
