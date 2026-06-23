const router = require('express').Router();
const auth   = require('../middleware/auth');
const { getMe, updateMe, award, updateLoginStreak, getGamification } = require('../controllers/userController');
const { getMemory, updateMemory } = require('../services/memoryService');

router.get('/me',            auth, getMe);
router.put('/me',            auth, updateMe);
router.post('/award',        auth, award);
router.post('/login-streak', auth, updateLoginStreak);
router.get('/gamification',  auth, getGamification);

// ── GET /api/user/memory — fetch AI memory for current user ───────────────
router.get('/memory', auth, async (req, res) => {
  try {
    const memory = await getMemory(req.user._id);
    res.json({ memory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch memory' });
  }
});

// ── PATCH /api/user/memory — update AI memory fields ─────────────────────
router.patch('/memory', auth, async (req, res) => {
  try {
    const memory = await updateMemory(req.user._id, req.body);
    res.json({ memory });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update memory' });
  }
});

module.exports = router;
