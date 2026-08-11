require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { validateEnv } = require('./config/env');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { requestId, sanitizeInput } = require('./middleware/security');
const { requestTimeout } = require('./middleware/requestTimeout');
const { startBackgroundJobs, stopBackgroundJobs, getJobStatus } = require('./services/jobRunner');
const { metricsMiddleware, getMetricsSnapshot } = require('./utils/metrics');
const logger = require('./utils/logger');
const { APP_VERSION, resolveReleaseChannel } = require('./config/release');

validateEnv();

const app = express();
app.set('trust proxy', 1);

const isProd = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';
const RELEASE_CHANNEL = resolveReleaseChannel();

<<<<<<< Updated upstream
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
<<<<<<< Updated upstream
=======
app.use('/api/agent',     aiLimiter, require('./routes/agentOrchestration'))
app.use('/api/memory',    require('./routes/memory'))
app.use('/api/planner',   require('./routes/planner'))
>>>>>>> Stashed changes
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
=======
app.use(requestId);
app.use(metricsMiddleware);
app.use(requestTimeout());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProd ? { maxAge: 15552000, includeSubDomains: true } : false,
>>>>>>> Stashed changes
  })
);

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      if (isProd && allowedOrigins.includes('*')) {
        return cb(null, false);
      }
      if (!origin || allowedOrigins.includes(origin) || (!isProd && allowedOrigins.includes('*'))) {
        return cb(null, true);
      }
      return cb(null, false);
    },
    credentials: true,
  })
);

app.use(compression());
app.use(cookieParser());
app.use(
  morgan(isProd ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: () => isTest,
  })
);

const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.WEBHOOK_RATE_LIMIT) || 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many webhook requests.', failureClass: 'rate_limit' },
  skip: () => isTest,
});

// Stripe webhook needs the raw body for signature verification (before JSON parser)
app.post(
  '/api/billing/webhook',
  webhookLimiter,
  express.raw({ type: 'application/json' }),
  require('./controllers/billingController').webhook
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(sanitizeInput);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.API_RATE_LIMIT) || 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Try again later.', failureClass: 'rate_limit' },
  skip: (req) => {
    if (isTest) return true;
    const path = (req.originalUrl || req.url || '').split('?')[0];
    return path === '/api/health' || path === '/api/ready';
  },
  handler: (req, res, _next, options) => {
    try {
      const { recordRateLimited } = require('./utils/metrics');
      recordRateLimited();
      const ops = require('./services/opsIntelligenceService');
      ops.recordSecurityEvent({
        type: 'rate_limited',
        severity: 'medium',
        user: req.user?._id || null,
        ip: req.ip || '',
        path: req.originalUrl,
        requestId: req.requestId,
        meta: { limiter: 'api' },
      });
    } catch {
      /* ignore */
    }
    res.status(options.statusCode).json(options.message);
  },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again later.', failureClass: 'rate_limit' },
  skip: () => isTest,
  handler: (req, res, _next, options) => {
    try {
      const { recordRateLimited } = require('./utils/metrics');
      recordRateLimited();
      const ops = require('./services/opsIntelligenceService');
      ops.recordSecurityEvent({
        type: 'rate_limited',
        severity: 'high',
        ip: req.ip || '',
        path: req.originalUrl,
        requestId: req.requestId,
        meta: { limiter: 'auth' },
      });
    } catch {
      /* ignore */
    }
    res.status(options.statusCode).json(options.message);
  },
});
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many contact messages. Try again later.', failureClass: 'rate_limit' },
  skip: () => isTest,
});
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.UPLOAD_RATE_LIMIT) || 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many uploads. Try again later.', failureClass: 'rate_limit' },
  skip: () => isTest,
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/verify-email', authLimiter);
app.use('/api/auth/change-password', authLimiter);
app.use('/api/auth/refresh', authLimiter);
app.use('/api/auth/resend-verification', authLimiter);
app.use('/api/auth/otp', authLimiter);
app.use('/api/settings/contact', contactLimiter);
app.use('/api/media', uploadLimiter);
app.use('/api/documents', uploadLimiter);
app.use('/api/research', uploadLimiter);
app.use('/api/books/upload', uploadLimiter);
app.use('/api/collab', uploadLimiter);

const PORT = process.env.PORT || 5000;
let httpServer = null;
let shuttingDown = false;

app.get('/api/health', async (_req, res) => {
  if (shuttingDown) {
    return res.status(503).json({
      success: false,
      status: 'draining',
      mongo: 'draining',
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  }
  const readyState = mongoose.connection.readyState;
  const mongo = readyState === 1 ? 'up' : readyState === 2 ? 'connecting' : 'down';
  const status = mongo === 'up' ? 'ok' : 'degraded';

  // Production: minimal public health (no jobs/memory/storage leakage).
  if (isProd) {
    return res.status(mongo === 'up' ? 200 : 503).json({
      success: mongo === 'up',
      status,
      mongo,
      version: APP_VERSION,
      time: new Date().toISOString(),
    });
  }

  let storage = { status: 'unknown' };
  let queue = { status: 'unknown' };
  try {
    const ops = require('./services/opsIntelligenceService');
    storage = ops.storageHealth();
    queue = ops.queueHealth();
  } catch {
    /* optional enrichment */
  }
  const body = {
    success: mongo === 'up',
    status,
    mongo,
    database: { status: mongo, readyState },
    storage,
    queue,
    api: { status: 'up' },
    version: APP_VERSION,
    releaseChannel: RELEASE_CHANNEL,
    uptimeSec: Math.round(process.uptime()),
    jobs: getJobStatus(),
    memory: {
      rss: process.memoryUsage().rss,
      heapUsed: process.memoryUsage().heapUsed,
    },
    time: new Date().toISOString(),
  };
  res.status(mongo === 'up' ? 200 : 503).json(body);
});

app.get('/api/ready', async (_req, res) => {
  if (shuttingDown) {
    return res.status(503).json({ success: false, status: 'draining', mongo: 'draining' });
  }
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ success: false, status: 'not_ready', mongo: 'down' });
  }
  try {
    const { pingDatabase } = require('./config/db');
    const ping = await pingDatabase({
      timeoutMs: Number(process.env.READY_PING_TIMEOUT_MS) || 2000,
    });
    if (!ping.ok) {
      return res.status(503).json({
        success: false,
        status: 'not_ready',
        mongo: 'degraded',
        reason: ping.reason,
        pingMs: ping.latencyMs,
      });
    }
    return res.json({
      success: true,
      status: 'ready',
      mongo: 'up',
      pingMs: ping.latencyMs,
      version: APP_VERSION,
    });
  } catch (err) {
    return res.status(503).json({
      success: false,
      status: 'not_ready',
      mongo: 'error',
      reason: err.message,
    });
  }
});

app.get(
  '/api/metrics',
  require('./middleware/auth').protect,
  require('./middleware/auth').authorize('admin'),
  (_req, res) => {
    const snap = getMetricsSnapshot();
    let storage = null;
    try {
      storage = require('./services/opsIntelligenceService').storageHealth();
    } catch {
      storage = null;
    }
    res.json({
      success: true,
      data: {
        ...snap,
        mongo: mongoose.connection.readyState === 1 ? 'up' : 'down',
        jobs: getJobStatus(),
        storage,
      },
    });
  }
);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/research', require('./routes/research'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/lms', require('./routes/lms'));
app.use('/api/planner', require('./routes/planner'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/career', require('./routes/career'));
app.use('/api/books', require('./routes/books'));
app.use('/api/media', require('./routes/media'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/community', require('./routes/community'));
app.use('/api/collab', require('./routes/collab'));
app.use('/api/graph', require('./routes/graph'));
app.use('/api/adaptive', require('./routes/adaptive'));
app.use('/api/productivity', require('./routes/productivity'));
app.use('/api/personalization', require('./routes/personalization'));
app.use('/api/ops', require('./routes/ops'));
app.use('/api/search', require('./routes/search'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/orgs', require('./routes/orgs'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));

app.use(notFound);
app.use(errorHandler);

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Shutting down (${signal})`);
  stopBackgroundJobs();
  const forceTimer = setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 15000);
  if (typeof forceTimer.unref === 'function') forceTimer.unref();

  try {
    if (httpServer) {
      await new Promise((resolve) => httpServer.close(resolve));
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    clearTimeout(forceTimer);
    process.exit(0);
  } catch (err) {
    logger.error('Shutdown error', { error: err.message });
    process.exit(1);
  }
}

async function start() {
  await connectDB();
  startBackgroundJobs();
  httpServer = app.listen(PORT, () =>
    logger.info(`Dream Wave AI server listening on port ${PORT}`, {
      version: APP_VERSION,
      releaseChannel: RELEASE_CHANNEL,
    })
  );
  httpServer.keepAliveTimeout = Number(process.env.HTTP_KEEPALIVE_MS) || 65000;
  httpServer.headersTimeout = Number(process.env.HTTP_HEADERS_TIMEOUT_MS) || 70000;
  httpServer.requestTimeout = Number(process.env.HTTP_REQUEST_TIMEOUT_MS) || 120000;
  httpServer.on('error', (err) => {
    logger.error('HTTP server failed to bind', { error: err.message, code: err.code });
    process.exit(1);
  });
  return httpServer;
}

if (require.main === module) {
  start().catch((err) => {
    logger.error('Failed to start server', { error: err.message });
    process.exit(1);
  });
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', {
      error: reason instanceof Error ? reason.message : String(reason),
    });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    shutdown('uncaughtException');
  });
}

module.exports = app;
module.exports.start = start;
module.exports.shutdown = shutdown;
module.exports.setShuttingDown = (value) => {
  shuttingDown = Boolean(value);
};
module.exports.isShuttingDown = () => shuttingDown;
module.exports.APP_VERSION = APP_VERSION;
module.exports.RELEASE_CHANNEL = RELEASE_CHANNEL;
