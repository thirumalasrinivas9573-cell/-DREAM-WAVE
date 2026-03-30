// Load .env only in development — on Render, env vars are injected by the platform
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: require('path').join(__dirname, '.env') });
}
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB    = require('./utils/db');
const { initFirebase } = require('./services/firebaseService');

const app = express();

// ── CORS & JSON ──
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'null' // allow file:// origin
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    // Allow any netlify.app subdomain automatically
    if (origin.endsWith('.netlify.app')) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// ── DB + Firebase ──
console.log('MONGO URL:', process.env.MONGODB_URL ? '[loaded]' : '[missing]');
connectDB();
initFirebase();

// ── Static: serve generated PDFs ──
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// ── Routes ──
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/user',       require('./routes/user'));
app.use('/api/goal',       require('./routes/goal'));
app.use('/api/ai',         require('./routes/ai'));
app.use('/api/report',     require('./routes/report'));
app.use('/api/roadmap',    require('./routes/roadmap'));
app.use('/api/tasks',      require('./routes/tasks'));
app.use('/api/books',      require('./routes/books'));
app.use('/api/daily-life', require('./routes/dailyLife'));
app.use('/api/mentor',     require('./routes/mentor'));
app.use('/api/community',  require('./routes/community'));

// ── Health + test ──
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV || 'development' }));
app.get('/test',   (req, res) => res.send('Dream Wave AI backend is running ✅'));
// Align with frontend expectation
app.get('/api/test', (req, res) => res.json({ message: 'Backend working ✅' }));

// ── 404 handler ──
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
function startServer(port, triedNext = false) {
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && !triedNext) {
      console.warn(`⚠️ Port ${port} in use, retrying on ${port + 1}...`);
      startServer(port + 1, true);
    } else {
      console.error('Server start error:', err.message);
      process.exit(1);
    }
  });
}
startServer(DEFAULT_PORT);
