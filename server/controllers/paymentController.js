// Lazy Stripe init -- only fails at runtime if key is missing, not at startup
let stripe = null
const getStripe = () => {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) return null
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}
const User   = require('../models/User')

// ── POST /api/payment/create-checkout-session ─────────────────────────────────
exports.createCheckoutSession = async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({ message: 'Payment system not configured.' })
    }

    const { plan = 'pro' } = req.body
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      metadata: { userId: req.user._id.toString(), plan },
      line_items: [{
        price_data: {
          currency: 'usd',
          recurring: { interval: 'month' },
          product_data: {
            name: 'Dream Wave AI -- Pro',
            description: 'Unlimited AI chats, goals, roadmaps, and voice mentor',
            images: [],
          },
          unit_amount: 999, // $9.99/month
        },
        quantity: 1,
      }],
      success_url: `${clientUrl}/dashboard?payment=success`,
      cancel_url:  `${clientUrl}/pricing?payment=cancelled`,
    })

    res.json({ success: true, url: session.url })
  } catch (err) {
    console.error('[paymentController.createCheckoutSession]', err.message)
    res.status(500).json({ message: 'Failed to create checkout session.', error: err.message })
  }
}

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
// Stripe sends events here -- mark user as premium on successful payment
exports.webhook = async (req, res) => {
  const sig    = req.headers['stripe-signature']
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = secret
      ? getStripe().webhooks.constructEvent(req.body, sig, secret)
      : JSON.parse(req.body)
  } catch (err) {
    console.error('[webhook] signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId  = session.metadata?.userId
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        $set: { plan: 'pro', planActivatedAt: new Date() },
      })
      console.log(`[webhook] User ${userId} upgraded to Pro`)
    }
  }

  res.json({ received: true })
}

// ── GET /api/payment/status ───────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('plan planActivatedAt')
    res.json({ success: true, plan: user?.plan || 'free', activatedAt: user?.planActivatedAt })
  } catch (err) {
    res.status(500).json({ message: 'Server error.' })
  }
}
