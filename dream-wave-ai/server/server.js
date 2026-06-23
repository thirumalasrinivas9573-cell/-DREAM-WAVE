// Load .env only in development — on Render, env vars are injected by the platform
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
}
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB    = require('./utils/db');
const { initFirebase } = require('./services/firebaseService');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger  = require('./utils/logger');

const app = express();

// ── CORS & JSON ──
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'null',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    // Allow all localhost ports in development
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    // Allow Netlify deployments
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    // Allow explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Log and reject unknown origins
    logger.warn('[CORS] Blocked origin', { origin });
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// ── DB + Firebase ──
connectDB();
initFirebase();

// ── Static: serve generated PDFs ──
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ── Async route wrapper — prevents unhandled promise rejections crashing server ──
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ── Routes ──
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/user',       require('./routes/user'));
app.use('/api/goals',      require('./routes/goals'));      // Goals Engine
app.use('/api/goal',       require('./routes/goal'));       // legacy goal chat
app.use('/api/learn',      require('./routes/learn'));      // Learning Engine: quiz, animation, resume
app.use('/api/training',   require('./routes/training'));   // Training System: skill queue, 4-day cycle
app.use('/api/ai',         require('./routes/ai'));
app.use('/api/report',     require('./routes/report'));
app.use('/api/roadmap',    require('./routes/roadmap'));
app.use('/api/tasks',      require('./routes/tasks'));
app.use('/api/books',      require('./routes/books'));
app.use('/api/daily-life', require('./routes/dailyLife'));
app.use('/api/mentor',     require('./routes/mentor'));
app.use('/api',            require('./routes/mentor'));     // alias mentor-chat
app.use('/api/krishna',    require('./routes/krishna'));
app.use('/api/community',  require('./routes/community'));

// ── Health + test ──
app.get('/health',   (req, res) => res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV || 'development', port: process.env.PORT || 5001 }));
app.get('/test',     (req, res) => res.send('Dream Wave AI backend is running ✅'));
app.get('/api/test', (req, res) => res.json({ message: 'Backend working ✅', port: process.env.PORT || 5001 }));

// ── Global error handlers (MUST be last) ──
app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5001;
function startServer(port) {
  const server = app.listen(port, () => {
    logger.info(`Dream Wave AI Server started`, { port, env: process.env.NODE_ENV || 'development' });
    console.log(`🚀 Server running on port ${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${port} in use, trying ${port + 1}`);
      startServer(port + 1);
    } else {
      logger.error('Server start error', { error: err.message });
      process.exit(1);
    }
  });
}
startServer(DEFAULT_PORT);

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err?.message || String(err) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err?.message, stack: err?.stack });
  process.exit(1);
});
