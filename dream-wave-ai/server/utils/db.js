const mongoose = require('mongoose');

const connectDB = async () => {
  const url = process.env.MONGODB_URL;

  if (!url) {
    console.error('❌ MONGODB_URL is not set in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(url, { serverSelectionTimeoutMS: 15000 });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err.message);
    console.log('⏳ Retrying in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
