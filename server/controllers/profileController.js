const User = require('../models/User');
const multer = require('multer');
const firebase = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

// Initialize Firebase (in production, move this to config)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

const storage = multer.memoryStorage();
const upload = multer({ storage });

// @desc    Update profile
// @route   PUT /api/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    
    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        aaid: user.aaid,
        level: user.level,
        credits: user.credits,
        streak: user.streak,
        profileImage: user.profileImage,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile image
// @route   POST /api/profile/upload
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // For now, return a mock URL (implement Firebase in production)
    const mockUrl = `https://mock-storage.com/profiles/${req.user.id}.jpg`;
    
    const user = await User.findById(req.user.id);
    user.profileImage = mockUrl;
    await user.save();

    res.json({
      success: true,
      profileImage: mockUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get profile
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('goals')
      .populate('tasks')
      .select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Generate certificate
// @route   POST /api/profile/certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { type, title } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Generate certificate URL (mock for now)
    const certificateUrl = `https://certificates.dreamwave.ai/${user.aaid}/${type}_${Date.now()}.pdf`;
    
    user.certificates.push({
      type,
      title,
      url: certificateUrl,
      issuedAt: new Date()
    });
    
    await user.save();

    res.json({
      success: true,
      certificate: {
        type,
        title,
        url: certificateUrl,
        issuedAt: new Date()
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
