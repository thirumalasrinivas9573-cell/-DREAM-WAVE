require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB    = require('./utils/db');
const { initFirebase } = require('./services/firebaseService');

const app = express();

// ── CORS — allow all origins in production ──
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));

// ── DB + Firebase ──
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

// ── 404 handler ──
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// ── Error handler ──
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
