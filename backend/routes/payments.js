const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Subscribe endpoint
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { plan, paymentId } = req.body;

    // In production, verify payment with Razorpay here
    // For now, we'll just update the subscription

    const user = await User.findById(req.userId);
    user.subscription = plan;
    await user.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription: user.subscription
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing error' });
  }
});

module.exports = router;
