const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { message: 'Too many requests.' } }));
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'Too many login attempts.' } }));

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Serve frontend — no cache for HTML so updates show immediately
app.use(express.static('frontend', {
  maxAge: '1d',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// MongoDB connection
const connectMongo = () => {
  mongoose.connect(process.env.MONGODB_URL, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection failed:', err.message));
};

connectMongo();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected, retrying in 5s...');
  setTimeout(connectMongo, 5000);
});

// Routes
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/posts',    require('./routes/posts'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/ambition', require('./routes/ambition'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/chat',     require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/tasks',    require('./routes/tasks'));
app.use('/api/reels',    require('./routes/reels'));
app.use('/api/roadmap',  require('./routes/roadmap'));
app.use('/api/comrades', require('./routes/comrades'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/mentor',   require('./routes/mentor'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/health`);
});
