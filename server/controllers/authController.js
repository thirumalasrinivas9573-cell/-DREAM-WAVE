const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const OTP_TTL_MS = 10 * 60 * 1000;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const generateOtp = () =>
  String(crypto.randomInt(100000, 999999));

const hashOtp = (otp) =>
  crypto.createHash('sha256').update(String(otp)).digest('hex');

const isOtpValid = (storedHash, expiresAt, otp) => {
  if (!storedHash || !expiresAt) return false;
  if (new Date(expiresAt).getTime() < Date.now()) return false;
  return storedHash === hashOtp(otp);
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  aaid: user.aaid,
  level: user.level,
  credits: user.credits,
  streak: user.streak,
  emailVerified: Boolean(user.emailVerified),
  profileImage: user.profileImage,
  certificates: user.certificates,
  role: user.role || null,
  onboardingCompleted: Boolean(user.onboardingCompleted),
  organizationName: user.organizationName || '',
  learningGoal: user.learningGoal || '',
});

const withDevOtp = (payload, otp) => {
  if (process.env.NODE_ENV === 'production') return payload;
  return { ...payload, devOtp: otp };
};

// @desc    Register user
// @route   POST /api/auth/signup | /api/auth/register
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const otp = generateOtp();
    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false,
      verificationOTP: hashOtp(otp),
      verificationOTPExpires: new Date(Date.now() + OTP_TTL_MS),
    });

    console.log(`[auth] verification OTP for ${email}: ${otp}`);

    const token = generateToken(user._id);

    res.status(201).json(
      withDevOtp(
        {
          success: true,
          token,
          requiresVerification: true,
          user: publicUser(user),
        },
        otp,
      ),
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    AAID Login
// @route   POST /api/auth/aaid-login
exports.aaidLogin = async (req, res) => {
  try {
    const { aaid } = req.body;

    const user = await User.findOne({ aaid });
    if (!user) {
      return res.status(401).json({ message: 'Invalid AAID' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });

    // Always return success to avoid email enumeration
    const base = {
      success: true,
      message: 'If an account exists for that email, a verification code has been sent.',
    };

    if (!user) {
      return res.json(base);
    }

    const otp = generateOtp();
    user.resetPasswordOTP = hashOtp(otp);
    user.resetPasswordOTPExpires = new Date(Date.now() + OTP_TTL_MS);
    await user.save();

    console.log(`[auth] reset OTP for ${user.email}: ${otp}`);

    res.json(withDevOtp(base, otp));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend OTP (verify | reset)
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !['verify', 'reset'].includes(purpose)) {
      return res.status(400).json({ message: 'Email and purpose (verify|reset) are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    const base = {
      success: true,
      message: 'If an account exists for that email, a new code has been sent.',
    };

    if (!user) {
      return res.json(base);
    }

    const otp = generateOtp();
    if (purpose === 'verify') {
      user.verificationOTP = hashOtp(otp);
      user.verificationOTPExpires = new Date(Date.now() + OTP_TTL_MS);
    } else {
      user.resetPasswordOTP = hashOtp(otp);
      user.resetPasswordOTPExpires = new Date(Date.now() + OTP_TTL_MS);
    }
    await user.save();

    console.log(`[auth] ${purpose} OTP for ${user.email}: ${otp}`);

    res.json(withDevOtp(base, otp));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP (email verify or unlock password reset)
// @route   POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    if (!email || !otp || !['verify', 'reset'].includes(purpose)) {
      return res.status(400).json({
        message: 'Email, otp, and purpose (verify|reset) are required',
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    if (purpose === 'verify') {
      if (!isOtpValid(user.verificationOTP, user.verificationOTPExpires, otp)) {
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }
      user.emailVerified = true;
      user.verificationOTP = null;
      user.verificationOTPExpires = null;
      await user.save();

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: publicUser(user),
      });
    }

    if (!isOtpValid(user.resetPasswordOTP, user.resetPasswordOTPExpires, otp)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Keep OTP valid until password is reset; return short-lived reset token flag
    return res.json({
      success: true,
      message: 'Code verified. You can reset your password.',
      resetAllowed: true,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, otp, and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !isOtpValid(user.resetPasswordOTP, user.resetPasswordOTPExpires, otp)) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.password = password;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully. You can sign in now.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const VALID_ROLES = ['student', 'institution', 'company', 'admin'];

// @desc    Complete onboarding (role + profile details)
// @route   POST /api/auth/onboarding
exports.completeOnboarding = async (req, res) => {
  try {
    const { role, organizationName, learningGoal } = req.body;

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'A valid role is required (student, institution, company, admin)',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    user.onboardingCompleted = true;

    if (typeof organizationName === 'string') {
      user.organizationName = organizationName.trim();
    }
    if (typeof learningGoal === 'string') {
      user.learningGoal = learningGoal.trim();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Onboarding completed',
      user: publicUser(user),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
