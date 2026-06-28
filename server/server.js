require('dotenv').config()
const express   = require('express')
const http      = require('http')
const { Server} = require('socket.io')
const mongoose  = require('mongoose')
const cors      = require('cors')
const helmet    = require('helmet')
const rateLimit = require('express-rate-limit')

let compression
try { compression = require('compression') } catch { compression = null }

// ── Logger ────────────────────────────────────────────────────────────────────
const log = {
  info:  (...a) => console.log (`[${new Date().toISOString()}] INFO `, ...a),
  warn:  (...a) => console.warn (`[${new Date().toISOString()}] WARN `, ...a),
  error: (...a) => console.error(`[${new Date().toISOString()}] ERROR`, ...a),
}

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth')
const aiRoutes        = require('./routes/aiRoutes')
const aiExtRoutes     = require('./routes/ai')
const goalRoutes      = require('./routes/goals')
const taskRoutes      = require('./routes/tasks')
const communityRoutes = require('./routes/community')
const paymentRoutes   = require('./routes/payment')
const adminRoutes     = require('./routes/admin')
const reportRoutes    = require('./routes/report')
const roadmapRoutes   = require('./routes/roadmap')
const booksRoutes     = require('./routes/books')
const dailyRoutes     = require('./routes/daily')
const mentorRoutes    = require('./routes/mentor')
const profileRoutes   = require('./routes/profile')
const lessonRoutes    = require('./routes/lesson')
const mjRoutes        = require('./routes/mj')

const app    = express()
const server = http.createServer(app)

// ── CORS origin resolver ──────────────────────────────────────────────────────
// Accepts: localhost (any port), any *.netlify.app, and CLIENT_URL env var
const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true) // curl / mobile / server-to-server
  const ok =
    !origin ||
    /^https?:\/\/localhost(:\d+)?$/.test(origin) ||    // localhost dev
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin) || // 127.0.0.1 dev
    /\.netlify\.app$/.test(origin) ||                   // any *.netlify.app
    /\.netlify\.live$/.test(origin) ||                  // netlify deploy previews
    (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)

  if (ok) return callback(null, true)
  log.warn(`CORS blocked: ${origin}`)
  callback(new Error(`CORS: ${origin} not allowed`))
}

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: corsOrigin, credentials: true },
  transports: ['websocket', 'polling'],
})
app.set('io', io)

io.on('connection', socket => {
  log.info(`Socket connected: ${socket.id}`)
  socket.on('join', userId => { socket.join(`user:${userId}`) })
  socket.on('disconnect', () => { log.info(`Socket disconnected: ${socket.id}`) })
})

// ── Middleware ────────────────────────────────────────────────────────────────
if (compression) app.use(compression())
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: corsOrigin, credentials: true }))

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 30,  standardHeaders: true, message: { success: false, message: 'Too many auth attempts.' } })
const aiLimiter   = rateLimit({ windowMs: 60*1000,    max: 40,  standardHeaders: true, message: { success: false, message: 'AI rate limit. Please wait.' } })
const apiLimiter  = rateLimit({ windowMs: 15*60*1000, max: 500, standardHeaders: true, message: { success: false, message: 'Too many requests.' } })
app.use('/api/auth', authLimiter)
app.use('/api/ai',   aiLimiter)
app.use('/api',      apiLimiter)

// Stripe webhook needs raw body BEFORE json parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logger
app.use((req, _res, next) => { log.info(`${req.method} ${req.path}`); next() })

// ── MongoDB ───────────────────────────────────────────────────────────────────
const connectDB = async (attempt = 1) => {
  const url = process.env.MONGODB_URL
  if (!url) { log.error('MONGODB_URL not set'); return }
  try {
    const conn = await mongoose.connect(url, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS:          45000,
      maxPoolSize:              10,
    })
    log.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    log.error(`MongoDB attempt ${attempt}/3: ${err.message}`)
    if (attempt < 3) setTimeout(() => connectDB(attempt + 1), 5000)
  }
}
connectDB()

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health',    (_req, res) => res.json({ status: 'OK', ts: Date.now(), env: process.env.NODE_ENV }))
app.get('/api/test',  (_req, res) => res.json({ success: true, message: 'Dream Wave API is running' }))

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/ai',        aiRoutes)
app.use('/api/ai',        aiExtRoutes)
app.use('/api/goals',     goalRoutes)
app.use('/api/tasks',     taskRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/payment',   paymentRoutes)
app.use('/api/admin',     adminRoutes)
app.use('/api/report',    reportRoutes)
app.use('/api/roadmap',   roadmapRoutes)
app.use('/api/books',     booksRoutes)
app.use('/api/daily',     dailyRoutes)
app.use('/api/mentor',    mentorRoutes)
app.use('/api/profile',   profileRoutes)
app.use('/api/lesson',    lessonRoutes)
app.use('/api/mj',        mjRoutes)

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  log.error(`${req.method} ${req.path} →`, err.message)
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(v => v.message).join(', ')
    return res.status(400).json({ success: false, message: msg })
  }
  if (err.code === 11000) return res.status(400).json({ success: false, message: 'Email already registered.' })
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' })
  if (err.message?.startsWith('CORS'))
    return res.status(403).json({ success: false, message: err.message })
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use('*', (req, res) => res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` }))

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '5001', 10)
server.listen(PORT, '0.0.0.0', () =>
  log.info(`Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
)

process.on('unhandledRejection', err => log.warn('Unhandled rejection:', err?.message))
process.on('uncaughtException',  err => { log.error('Uncaught exception:', err?.message); process.exit(1) })
