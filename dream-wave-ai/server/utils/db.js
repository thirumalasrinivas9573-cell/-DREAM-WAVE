const mongoose = require('mongoose');

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS:          45000,
  connectTimeoutMS:         10000,
  maxPoolSize:              10,
  heartbeatFrequencyMS:     10000,  // ping every 10s to keep connection alive
  maxIdleTimeMS:            60000,  // close idle connections after 60s
};

let retryTimer = null;   // prevent multiple simultaneous retries
let connected  = false;

const connectDB = async () => {
  // Already connected — skip
  if (connected || mongoose.connection.readyState === 1) return;

  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error('❌ MONGODB_URL is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(url, MONGO_OPTIONS);
    connected = true;
    if (retryTimer) { clearTimeout(retryTimer); retryTimer = null; }
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (!retryTimer) {
      console.log('⏳ Retrying in 5 seconds...');
      retryTimer = setTimeout(() => { retryTimer = null; connectDB(); }, 5000);
    }
  }
};

mongoose.connection.on('connected',    () => { connected = true;  console.log('✅ MongoDB Connected'); });
mongoose.connection.on('disconnected', () => { connected = false; console.warn('🟡 MongoDB Disconnected — will auto-reconnect'); });
mongoose.connection.on('error',        (err) => console.error('🔴 MongoDB Error:', err.message));

module.exports = connectDB;
