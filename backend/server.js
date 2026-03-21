const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Use Google DNS for reliable resolution
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Gzip compression
app.use(compression());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts, please try again later.' }
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
app.use(express.static('frontend', {
  maxAge: '1d',
  etag: true
}));

// MongoDB connection
const mongoOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  heartbeatFrequencyMS: 10000
};

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/dreamwave', mongoOptions)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, reconnecting...');
  mongoose.connect(process.env.MONGODB_URL, mongoOptions);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ambition', require('./routes/ambition'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/payments', require('./routes/payments'));

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
  console.log(`Server running on port ${PORT}`);
  console.log(`App: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
});
