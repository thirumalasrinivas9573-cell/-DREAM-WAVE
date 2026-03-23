const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = await User.findById(req.userId);
    user.subscription = plan;
    await user.save();
    res.json({ message: 'Subscription updated successfully', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error' });
  }
});

module.exports = router;
