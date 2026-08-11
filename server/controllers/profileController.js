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

<<<<<<< Updated upstream
const storage = multer.memoryStorage();
const upload = multer({ storage });
=======
const fail = (res, status, message, code = 'PROFILE_ERROR') => res.status(status).json({ success: false, code, message })
const pick = (source, fields) => Object.fromEntries(fields.filter((field) => source[field] !== undefined).map((field) => [field, source[field]]))
const slugify = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32)
const safeUrl = (value) => {
  if (!value) return ''
  try {
    const url = new URL(value)
    if (!['https:', 'http:'].includes(url.protocol)) return ''
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return ''
    return url.toString().slice(0, 1000)
  } catch {
    if (String(value).startsWith('/api/profile/assets/')) return String(value)
    return ''
  }
}

function cleanProfilePayload(body) {
  const result = pick(body, PROFILE_FIELDS)
  for (const field of ['profilePhoto', 'coverBanner']) {
    if (result[field] !== undefined) result[field] = safeUrl(result[field])
  }
  if (result.displayName !== undefined) result.displayName = String(result.displayName).trim().slice(0, 120)
  if (result.headline !== undefined) result.headline = String(result.headline).trim().slice(0, 180)
  if (result.bio !== undefined) result.bio = String(result.bio).trim().slice(0, 2000)
  if (result.location !== undefined) result.location = String(result.location).trim().slice(0, 200)
  if (result.languages !== undefined) result.languages = Array.isArray(result.languages) ? result.languages.slice(0, 20).map((item) => String(item).trim().slice(0, 80)).filter(Boolean) : []
  if (result.links !== undefined) result.links = Array.isArray(result.links) ? result.links.slice(0, 12).map((item) => ({
    label: String(item.label || '').trim().slice(0, 80),
    url: safeUrl(item.url),
  })).filter((item) => item.label && item.url) : []
  if (result.academic !== undefined) {
    const academic = result.academic || {}
    result.academic = {
      institution: String(academic.institution || '').trim().slice(0, 200),
      department: String(academic.department || '').trim().slice(0, 200),
      course: String(academic.course || '').trim().slice(0, 200),
      semester: String(academic.semester || '').trim().slice(0, 40),
      year: String(academic.year || '').trim().slice(0, 40),
      cgpa: Math.max(0, Math.min(10, Number(academic.cgpa) || 0)),
      completedCourses: Array.isArray(academic.completedCourses) ? academic.completedCourses.slice(0, 100).map((item) => String(item).trim().slice(0, 200)).filter(Boolean) : [],
      activeCourses: Array.isArray(academic.activeCourses) ? academic.activeCourses.slice(0, 100).map((item) => String(item).trim().slice(0, 200)).filter(Boolean) : [],
    }
  }
  if (result.careerDirection !== undefined && result.careerDirection && typeof result.careerDirection === 'object') {
    result.careerDirection = {
      targetRole: String(result.careerDirection.targetRole || '').trim().slice(0, 120),
      interests: Array.isArray(result.careerDirection.interests)
        ? result.careerDirection.interests.slice(0, 12).map((item) => String(item).trim().slice(0, 80)).filter(Boolean)
        : [],
      visibility: ['private', 'unlisted', 'public'].includes(result.careerDirection.visibility)
        ? result.careerDirection.visibility
        : 'public',
    }
  }
  return result
}

async function uniqueUsername(name, userId) {
  const base = slugify(name) || 'student'
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const username = attempt === 0 ? `${base}-${String(userId).slice(-5)}` : `${base}-${crypto.randomBytes(2).toString('hex')}`
    if (!RESERVED.has(username) && !await StudentProfile.exists({ username })) return username
  }
  return `student-${crypto.randomBytes(6).toString('hex')}`
}

async function ensureProfile(userId) {
  let profile = await StudentProfile.findOne({ userId })
  if (profile) return profile
  const user = await User.findById(userId).select('name profileImage certificates')
  if (!user) return null
  try {
    profile = await StudentProfile.create({
      userId,
      username: await uniqueUsername(user.name, userId),
      displayName: user.name,
      profilePhoto: user.profileImage || '',
      credentials: (user.certificates || []).slice(0, 100).map((item) => ({
        title: item.title,
        category: item.type === 'skill' ? 'skill' : 'other',
        issuer: 'Dream Wave (legacy)',
        documentUrl: safeUrl(item.url),
        issuedAt: item.issuedAt,
        verificationStatus: 'unverified',
        visibility: 'private',
      })),
    })
  } catch (error) {
    if (error.code !== 11000) throw error
    profile = await StudentProfile.findOne({ userId })
  }
  return profile
}

async function learningSummary(userId, profile) {
  const [goals, tasks, roadmaps, reading, focus] = await Promise.all([
    Goal.find({ userId }).select('status completed progress').lean(),
    Task.find({ userId, status: { $ne: 'archived' } }).select('status completed actualMinutes').lean(),
    Roadmap.find({ userId, status: { $ne: 'archived' } }).select('status progress').lean(),
    LibraryProgress.find({ userId }).select('percent readingMinutes').lean(),
    FocusSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(String(userId)), status: 'completed' } },
      { $group: { _id: null, seconds: { $sum: '$durationSeconds' } } },
    ]),
  ])
  const completedGoals = goals.filter((item) => item.completed || item.status === 'completed').length
  const completedTasks = tasks.filter((item) => item.completed || item.status === 'completed').length
  const booksRead = reading.filter((item) => item.percent >= 100).length
  const readingMinutes = reading.reduce((sum, item) => sum + (item.readingMinutes || 0), 0)
  const focusMinutes = Math.round((focus[0]?.seconds || 0) / 60)
  return {
    goals: { total: goals.length, completed: completedGoals, active: goals.filter((item) => item.status === 'active').length },
    roadmaps: { total: roadmaps.length, completed: roadmaps.filter((item) => item.progress?.percent >= 100).length },
    books: { started: reading.filter((item) => item.percent > 0).length, read: booksRead, readingMinutes },
    tasks: { total: tasks.length, completed: completedTasks },
    certificates: profile?.credentials?.length || 0,
    projects: profile?.projects?.length || 0,
    learningMinutes: readingMinutes + focusMinutes,
    learningHours: Math.round((readingMinutes + focusMinutes) / 6) / 10,
  }
}

function privateUser(user) {
  return {
        id: user._id,
        name: user.name,
        email: user.email,
    phone: user.phone || '',
        aaid: user.aaid,
    level: user.level || 1,
    credits: user.credits || 0,
    streak: user.streak || 0,
    profileImage: user.profileImage || '',
    emailVerified: Boolean(user.emailVerified),
    phoneVerified: Boolean(user.phoneVerified),
  }
}

exports.getProfile = async (req, res) => {
  try {
    const [user, profile] = await Promise.all([
      User.findById(req.user._id || req.user.id).select('name email phone aaid level credits streak profileImage emailVerified phoneVerified').lean(),
      ensureProfile(req.user._id || req.user.id),
    ])
    if (!user || !profile) return fail(res, 404, 'Student profile not found', 'NOT_FOUND')
    const summary = await learningSummary(user._id, profile)
    return res.json({ success: true, user: privateUser(user), profile, summary })
  } catch (error) {
    console.error('[profile.get]', error.message)
    return fail(res, 500, 'Failed to load student profile')
  }
}
>>>>>>> Stashed changes

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
