const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const reportRoutes = require('./routes/report');
const roadmapRoutes = require('./routes/roadmap');
const booksRoutes = require('./routes/books');
const taskRoutes = require('./routes/tasks');
const dailyRoutes = require('./routes/daily');
const mentorRoutes = require('./routes/mentor');
const communityRoutes = require('./routes/community');
const profileRoutes = require('./routes/profile');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/dreamwave', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server running', status: 'OK' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/profile', profileRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
