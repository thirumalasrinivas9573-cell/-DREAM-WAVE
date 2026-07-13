const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
  OTP_TTL_MS,
  generateOtp,
  hashOtp,
  isOtpValid,
  canResend,
  assertAttempts,
} = require('../utils/otp');
const { sendOtpEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const { sendOTP: twilioSendOTP, verifyOTP: twilioVerifyOTP } = require('../services/twilioVerify');
const { issueSession, rotateRefreshToken, revokeRefreshToken, revokeAllForUser, generateAccessToken, setRefreshCookie, clearRefreshCookie, readRefreshFromReq, listSessions, revokeSessionById } = require('../utils/tokenService');
const { bootstrapPortalProfile } = require('../utils/portalBootstrap');
const {
  assertE164,
  maskPhone,
  isPhoneVerified,
  consumeVerified,
  markVerified,
} = require('../utils/phoneOtpGuard');

const generateToken = (id) => generateAccessToken(id);

async function completeLoginSession(req, res, user, options = {}) {
  await bootstrapPortalProfile(user);
  const ua = req.headers['user-agent'] || '';
  const remember = options.remember !== undefined
    ? Boolean(options.remember)
    : req.body?.remember !== false;
  const { token, refreshToken, ttl } = await issueSession(user._id, ua, { remember });
  setRefreshCookie(res, refreshToken, ttl);
  return res.json({
    success: true,
    message: 'Login successful',
    token,
    refreshToken,
    user: publicUser(user),
  });
}

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  aaid: user.aaid,
  level: user.level,
  credits: user.credits,
  streak: user.streak,
  emailVerified: Boolean(user.emailVerified),
  phone: user.phone || '',
  phoneVerified: Boolean(user.phoneVerified),
  profileImage: user.profileImage,
  certificates: user.certificates,
  role: user.role || null,
  onboardingCompleted: Boolean(user.onboardingCompleted),
  organizationName: user.organizationName || '',
  learningGoal: user.learningGoal || '',
  registrationComplete: user.registrationComplete !== false,
});

const fail = (res, error) => {
  const status = error.statusCode || 500;
  if (status >= 500) console.error('[auth]', error.message);
  const body = {
    success: false,
    message: error.message || 'Server error',
  };
  if (error.code) body.code = error.code;
  if (error.verified === false) body.verified = false;
  return res.status(status).json(body);
};

function issueEmailLoginChallenge(user) {
  return jwt.sign(
    { purpose: 'login_email_otp', userId: String(user._id), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '10m' },
  );
}

function readEmailLoginChallenge(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'login_email_otp' || !payload.userId || !payload.email) return null;
    return payload;
  } catch {
    return null;
  }
}

function issueLoginChallenge(user) {
  return jwt.sign(
    {
      purpose: 'login_otp',
      userId: String(user._id),
      phone: user.phone,
    },
    process.env.JWT_SECRET,
    { expiresIn: '10m' },
  );
}

function readLoginChallenge(token) {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.purpose !== 'login_otp' || !payload.userId || !payload.phone) return null;
    return payload;
  } catch {
    return null;
  }
}

async function issueEmailOtp(user, purpose = 'verification') {
  const gate = canResend(user.emailOtpSentAt);
  if (!gate.ok) {
    const err = new Error(`Please wait ${Math.ceil(gate.waitMs / 1000)}s before requesting another code.`);
    err.statusCode = 429;
    throw err;
  }
  const otp = generateOtp();
  user.verificationOTP = hashOtp(otp);
  user.verificationOTPExpires = new Date(Date.now() + OTP_TTL_MS);
  user.emailOtpAttempts = 0;
  user.emailOtpSentAt = new Date();
  await user.save();
  await sendOtpEmail({ to: user.email, name: user.name, otp, purpose });
}

async function findUserByIdentifier(identifier) {
  const raw = String(identifier || '').trim();
  if (!raw) return null;
  if (raw.startsWith('+') || /^\d{10,15}$/.test(raw)) {
    try {
      const phone = assertE164(raw.startsWith('+') ? raw : `+${raw}`);
      return User.findOne({ phone });
    } catch {
      return null;
    }
  }
  return User.findOne({ email: raw.toLowerCase() });
}

// @desc    Register user (legacy — still available; email OTP delivered privately)
// @route   POST /api/auth/signup | /api/auth/register
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const userExists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: String(email).toLowerCase().trim(),
      password,
      emailVerified: false,
      registrationComplete: true,
      role: 'student',
    });

    try {
      await issueEmailOtp(user, 'verification');
    } catch (mailErr) {
      console.error('[auth] signup email delivery failed:', mailErr.message);
      return res.status(503).json({
        success: false,
        message: 'Account created but we could not send the verification email. Try resend OTP.',
        requiresVerification: true,
        email: user.email,
      });
    }

    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Account created. Enter the verification code sent to your email before signing in.',
      email: user.email,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: false,
        role: user.role,
      },
    });
  } catch (error) {
    return fail(res, error);
  }
};

/**
 * Login — email or mobile + password.
 * On success: send Twilio Verify OTP (no JWT yet).
 */
exports.login = async (req, res) => {
  try {
    const { email, phone, password, portal, identifier } = req.body;
    const id = identifier || email || phone;
    if (!id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or mobile, and password are required',
      });
    }

    const user = await findUserByIdentifier(id);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.registrationComplete === false) {
      return res.status(403).json({
        success: false,
        message: 'Please finish registration (mobile verification) before signing in.',
        requiresRegistration: true,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.suspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }

    const portalRole = ['institution', 'company', 'student'].includes(portal) ? portal : null;
    if (portalRole && user.role && user.role !== portalRole && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Please use the ${user.role} portal.`,
        role: user.role,
      });
    }

    const otpChannel = req.body.otpChannel
      || (portalRole === 'institution' || portalRole === 'company' ? 'email' : 'phone');

    if (otpChannel === 'email') {
      await issueEmailOtp(user, 'login');
      const challengeToken = issueEmailLoginChallenge(user);
      return res.json({
        success: true,
        requiresOtp: true,
        requiresEmailOtp: true,
        otpChannel: 'email',
        message: 'Verification code sent to your email.',
        challengeToken,
        email: user.email,
        expiresInSeconds: 300,
      });
    }

    if (!user.phone || !user.phoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'This account has no verified mobile number. Use email OTP or complete registration.',
        code: 'PHONE_REQUIRED',
      });
    }

    await twilioSendOTP(user.phone);
    const challengeToken = issueLoginChallenge(user);

    res.json({
      success: true,
      requiresOtp: true,
      otpChannel: 'phone',
      message: 'OTP sent successfully.',
      challengeToken,
      phone: user.phone,
      phoneMasked: maskPhone(user.phone),
      expiresInSeconds: 600,
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.aaidLogin = async (req, res) => {
  return res.status(410).json({
    success: false,
    code: 'AAID_LOGIN_DISABLED',
    message: 'AAID-only login is disabled. Sign in with email or mobile, password, and OTP.',
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    return fail(res, error);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const base = {
      success: true,
      message: 'If an account exists for that email, a verification code has been sent.',
    };

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.json(base);

    const gate = canResend(user.emailOtpSentAt);
    if (!gate.ok) {
      return res.status(429).json({
        message: `Please wait ${Math.ceil(gate.waitMs / 1000)}s before requesting another code.`,
      });
    }

    const otp = generateOtp();
    user.resetPasswordOTP = hashOtp(otp);
    user.resetPasswordOTPExpires = new Date(Date.now() + OTP_TTL_MS);
    user.emailOtpSentAt = new Date();
    user.emailOtpAttempts = 0;
    await user.save();
    await sendPasswordResetEmail({ to: user.email, name: user.name, otp });

    res.json(base);
  } catch (error) {
    return fail(res, error);
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !['verify', 'reset'].includes(purpose)) {
      return res.status(400).json({ message: 'Email and purpose (verify|reset) are required' });
    }

    const base = {
      success: true,
      message: 'If an account exists for that email, a new code has been sent.',
    };

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.json(base);

    if (purpose === 'verify') {
      await issueEmailOtp(user, 'verification');
    } else {
      const gate = canResend(user.emailOtpSentAt);
      if (!gate.ok) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(gate.waitMs / 1000)}s before requesting another code.`,
        });
      }
      const otp = generateOtp();
      user.resetPasswordOTP = hashOtp(otp);
      user.resetPasswordOTPExpires = new Date(Date.now() + OTP_TTL_MS);
      user.emailOtpSentAt = new Date();
      user.emailOtpAttempts = 0;
      await user.save();
      await sendPasswordResetEmail({ to: user.email, name: user.name, otp });
    }

    res.json(base);
  } catch (error) {
    return fail(res, error);
  }
};

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
      assertAttempts(user.emailOtpAttempts);
      if (!isOtpValid(user.verificationOTP, user.verificationOTPExpires, otp)) {
        user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
        await user.save();
        return res.status(400).json({ message: 'Invalid or expired verification code' });
      }
      user.emailVerified = true;
      user.verificationOTP = null;
      user.verificationOTPExpires = null;
      user.emailOtpAttempts = 0;
      await user.save();

      return completeLoginSession(req, res, user, { remember: req.body?.remember !== false });
    }

    assertAttempts(user.emailOtpAttempts);
    if (!isOtpValid(user.resetPasswordOTP, user.resetPasswordOTPExpires, otp)) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    return res.json({
      success: true,
      message: 'Code verified. You can reset your password.',
      resetAllowed: true,
      email: user.email,
    });
  } catch (error) {
    return fail(res, error);
  }
};

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

    res.json({ success: true, message: 'Password updated successfully. You can sign in now.' });
  } catch (error) {
    return fail(res, error);
  }
};

const VALID_ROLES = ['student', 'institution', 'company', 'admin'];
const PORTAL_ROLES = ['student', 'institution', 'company'];
const SELF_ASSIGNABLE_ROLES = ['student', 'institution', 'company'];

exports.completeOnboarding = async (req, res) => {
  try {
    const { role, organizationName, learningGoal } = req.body;
    if (!role || !SELF_ASSIGNABLE_ROLES.includes(role)) {
      return res.status(400).json({
        message: 'A valid role is required (student, institution, company)',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    user.onboardingCompleted = true;
    if (typeof organizationName === 'string') user.organizationName = organizationName.trim();
    if (typeof learningGoal === 'string') user.learningGoal = learningGoal.trim();
    await user.save();

    res.json({ success: true, message: 'Onboarding completed', user: publicUser(user) });
  } catch (error) {
    return fail(res, error);
  }
};

// ── Twilio Verify phone OTP endpoints ─────────────────────────────────────────

/**
 * POST /api/auth/send-phone-otp
 * Body: { phone: "+91XXXXXXXXXX" }
 */
exports.sendPhoneOtp = async (req, res) => {
  try {
    const phone = assertE164(req.body.phone);
    await twilioSendOTP(phone);
    res.json({
      success: true,
      message: 'OTP sent successfully.',
      expiresInSeconds: 600,
      phoneMasked: maskPhone(phone),
    });
  } catch (error) {
    return fail(res, error);
  }
};

/**
 * POST /api/auth/verify-phone-otp
 * Body: { phone, code, challengeToken? }
 * With challengeToken → completes login and returns JWT.
 */
exports.verifyPhoneOtp = async (req, res) => {
  try {
    const phone = assertE164(req.body.phone);
    const code = req.body.code || req.body.otp;
    if (!code) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid or expired OTP.',
      });
    }

    try {
      await twilioVerifyOTP(phone, code);
    } catch (verifyErr) {
      console.log('[TwilioVerify] OTP Failed', { phone: maskPhone(phone), code: verifyErr.code });
      return res.status(verifyErr.statusCode || 400).json({
        success: false,
        verified: false,
        message: verifyErr.message === 'OTP Expired'
          ? 'OTP Expired'
          : verifyErr.message === 'Too Many Requests'
            ? 'Too Many Requests'
            : 'Invalid or expired OTP.',
        code: verifyErr.code || 'OTP_INCORRECT',
      });
    }

    const challengeToken = req.body.challengeToken;
    if (challengeToken) {
      const challenge = readLoginChallenge(challengeToken);
      if (!challenge || challenge.phone !== phone) {
        return res.status(401).json({
          success: false,
          verified: false,
          message: 'Login session expired. Sign in again.',
        });
      }

      const user = await User.findById(challenge.userId);
      if (!user || user.phone !== phone) {
        return res.status(401).json({
          success: false,
          verified: false,
          message: 'Login session expired. Sign in again.',
        });
      }

      user.phoneVerified = true;
      user.phoneOTP = null;
      user.phoneOTPExpires = null;
      await user.save();

      return completeLoginSession(req, res, user, { remember: req.body?.remember !== false });
    }

    await markVerified(phone);
    return res.json({
      success: true,
      verified: true,
    });
  } catch (error) {
    error.verified = false;
    return fail(res, error);
  }
};

/**
 * Create account only after Twilio phone verification.
 * POST /api/auth/register-verified
 */
exports.registerVerified = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      portal,
      organizationName,
      learningGoal,
    } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, mobile, and password are required',
      });
    }
    if (!PORTAL_ROLES.includes(portal)) {
      return res.status(400).json({
        success: false,
        message: 'portal must be student, institution, or company',
      });
    }
    if (confirmPassword != null && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const e164 = assertE164(phone);
    if (!(await isPhoneVerified(e164))) {
      return res.status(400).json({
        success: false,
        message: 'Verify your mobile number with OTP before creating an account.',
        code: 'PHONE_NOT_VERIFIED',
      });
    }
    // Consume verification so it cannot be reused for another signup
    await consumeVerified(e164);

    const normalized = String(email).toLowerCase().trim();
    const existingEmail = await User.findOne({ email: normalized });
    if (existingEmail && existingEmail.registrationComplete !== false) {
      return res.status(400).json({ success: false, message: 'User already exists. Please sign in.' });
    }
    const existingPhone = await User.findOne({ phone: e164, registrationComplete: { $ne: false } });
    if (existingPhone && String(existingPhone.email) !== normalized) {
      return res.status(400).json({
        success: false,
        message: 'This mobile number is already registered.',
      });
    }

    let user = existingEmail;
    if (!user) {
      user = new User({
        name: String(name).trim(),
        email: normalized,
        password,
        phone: e164,
        phoneVerified: true,
        emailVerified: true,
        role: portal,
        registrationComplete: true,
        onboardingCompleted: true,
        organizationName: typeof organizationName === 'string' ? organizationName.trim() : '',
        learningGoal: typeof learningGoal === 'string' ? learningGoal.trim() : '',
      });
    } else {
      user.name = String(name).trim();
      user.password = password;
      user.phone = e164;
      user.phoneVerified = true;
      user.emailVerified = true;
      user.role = portal;
      user.registrationComplete = true;
      user.onboardingCompleted = true;
      if (typeof organizationName === 'string') user.organizationName = organizationName.trim();
      if (typeof learningGoal === 'string') user.learningGoal = learningGoal.trim();
    }

    // Clear any legacy hashed phone OTPs
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    user.phoneOtpAttempts = 0;
    await user.save();

    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        portal: user.role || 'student',
      });
    } catch (mailErr) {
      console.error('[auth] welcome email failed:', mailErr.message);
    }

    await bootstrapPortalProfile(user);
    const ua = req.headers['user-agent'] || '';
    const remember = req.body?.remember !== false;
    const { token, refreshToken, ttl } = await issueSession(user._id, ua, { remember });
    setRefreshCookie(res, refreshToken, ttl);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      refreshToken,
      user: publicUser(user),
    });
  } catch (error) {
    return fail(res, error);
  }
};

// ── Portal registration (Twilio Verify for mobile) ────────────────────────────

exports.portalInit = async (req, res) => {
  try {
    const { name, email, portal } = req.body;
    if (!name || !email || !PORTAL_ROLES.includes(portal)) {
      return res.status(400).json({
        message: 'Name, email, and portal (student|institution|company) are required',
      });
    }

    const normalized = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalized });
    if (existing && existing.registrationComplete !== false) {
      return res.status(400).json({ message: 'User already exists. Please sign in.' });
    }

    const tempPassword = crypto.randomBytes(24).toString('hex');
    let user = existing;
    if (!user) {
      user = new User({
        name: String(name).trim(),
        email: normalized,
        password: tempPassword,
        role: portal,
        emailVerified: false,
        phoneVerified: false,
        registrationComplete: false,
        onboardingCompleted: false,
      });
      await user.save();
    } else {
      user.name = String(name).trim();
      user.role = portal;
      user.emailVerified = false;
      await user.save();
    }

    await issueEmailOtp(user, 'verification');

    res.status(201).json({
      success: true,
      message: 'Verification code sent to your email',
      email: normalized,
      portal,
      step: 'verify-email',
      resendAfterSeconds: 60,
      expiresInSeconds: 300,
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.portalSendPhone = async (req, res) => {
  try {
    const { email, phone, countryCode } = req.body;
    if (!email || !phone) {
      return res.status(400).json({ message: 'Email and phone are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ message: 'Registration session not found. Start again.' });
    }
    if (!user.emailVerified) {
      return res.status(400).json({ message: 'Verify email before mobile verification' });
    }

    let e164 = String(phone).trim();
    if (!e164.startsWith('+')) {
      const cc = String(countryCode || '+91').startsWith('+') ? countryCode : `+${countryCode || '91'}`;
      e164 = `${cc}${e164.replace(/\D/g, '').replace(/^0+/, '')}`;
    }
    e164 = assertE164(e164);

    user.phone = e164;
    user.phoneVerified = false;
    // Clear legacy self-managed OTP fields — Twilio Verify owns the code
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    user.phoneOtpAttempts = 0;
    user.phoneOtpSentAt = new Date();
    await user.save();

    await twilioSendOTP(e164);

    res.json({
      success: true,
      message: 'OTP sent successfully.',
      phoneMasked: maskPhone(e164),
      step: 'verify-phone',
      resendAfterSeconds: 45,
      expiresInSeconds: 600,
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.portalVerifyPhone = async (req, res) => {
  try {
    const { email, otp, code } = req.body;
    const phoneCode = code || otp;
    if (!email || !phoneCode) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid or expired OTP.',
      });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.phone) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Invalid or expired OTP.',
      });
    }

    try {
      await twilioVerifyOTP(user.phone, phoneCode);
    } catch (verifyErr) {
      return res.status(verifyErr.statusCode || 400).json({
        success: false,
        verified: false,
        message: 'Invalid or expired OTP.',
      });
    }

    user.phoneVerified = true;
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    user.phoneOtpAttempts = 0;
    await user.save();
    await markVerified(user.phone);

    res.json({
      success: true,
      verified: true,
      message: 'Mobile verified successfully',
      step: 'create-password',
      user: publicUser(user),
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.portalComplete = async (req, res) => {
  try {
    const { email, password, confirmPassword, organizationName, learningGoal } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (confirmPassword != null && password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'Registration session not found' });
    if (!user.emailVerified || !user.phoneVerified) {
      return res.status(400).json({ message: 'Email and mobile must be verified first' });
    }

    user.password = password;
    user.registrationComplete = true;
    user.onboardingCompleted = true;
    if (typeof organizationName === 'string') user.organizationName = organizationName.trim();
    if (typeof learningGoal === 'string') user.learningGoal = learningGoal.trim();
    user.phoneOTP = null;
    user.phoneOTPExpires = null;
    await user.save();

    try {
      await sendWelcomeEmail({
        to: user.email,
        name: user.name,
        portal: user.role || 'student',
      });
    } catch (mailErr) {
      console.error('[auth] welcome email failed:', mailErr.message);
    }

    return completeLoginSession(req, res, user);
  } catch (error) {
    return fail(res, error);
  }
};

exports.portalResendPhone = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email || '').toLowerCase().trim() });
    const base = { success: true, message: 'If registration is in progress, a new code was sent.' };
    if (!user || !user.phone) return res.json(base);

    await twilioSendOTP(user.phone);
    user.phoneOtpSentAt = new Date();
    await user.save();

    res.json({
      ...base,
      message: 'OTP sent successfully.',
      resendAfterSeconds: 45,
      expiresInSeconds: 600,
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.verifyLoginEmailOtp = async (req, res) => {
  try {
    const { challengeToken, otp, code } = req.body;
    const tokenOtp = otp || code;
    if (!challengeToken || !tokenOtp) {
      return res.status(400).json({ success: false, message: 'challengeToken and otp are required' });
    }
    const challenge = readEmailLoginChallenge(challengeToken);
    if (!challenge) {
      return res.status(401).json({ success: false, message: 'Login session expired. Sign in again.' });
    }
    const user = await User.findById(challenge.userId);
    if (!user || user.email !== challenge.email) {
      return res.status(401).json({ success: false, message: 'Login session expired. Sign in again.' });
    }
    assertAttempts(user.emailOtpAttempts);
    if (!isOtpValid(user.verificationOTP, user.verificationOTPExpires, tokenOtp)) {
      user.emailOtpAttempts = (user.emailOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
    }
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    user.emailOtpAttempts = 0;
    user.emailVerified = true;
    await user.save();
    return completeLoginSession(req, res, user, { remember: req.body?.remember !== false });
  } catch (error) {
    return fail(res, error);
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = readRefreshFromReq(req);
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'refreshToken is required' });
    }
    const rotated = await rotateRefreshToken(refreshToken, req.headers['user-agent'] || '');
    if (!rotated) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    const user = await User.findById(rotated.userId).select('-password');
    if (!user || user.suspended) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, message: 'Session invalid' });
    }
    setRefreshCookie(res, rotated.refreshToken, rotated.ttl);
    res.json({
      success: true,
      token: rotated.accessToken,
      refreshToken: rotated.refreshToken,
      user: publicUser(user),
    });
  } catch (error) {
    return fail(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = readRefreshFromReq(req);
    await revokeRefreshToken(refreshToken);
    if (req.body?.allSessions && (req.user?.id || req.user?._id)) {
      await revokeAllForUser(req.user.id || req.user._id);
    }
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    return fail(res, error);
  }
};

exports.listSessions = async (req, res) => {
  try {
    const current = readRefreshFromReq(req);
    const sessions = await listSessions(req.user.id || req.user._id, current);
    res.json({ success: true, sessions });
  } catch (error) {
    return fail(res, error);
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await revokeSessionById(req.user.id || req.user._id, id);
    if (!result.deletedCount) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    res.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    return fail(res, error);
  }
};

exports.revokeAllSessions = async (req, res) => {
  try {
    await revokeAllForUser(req.user.id || req.user._id);
    clearRefreshCookie(res);
    res.json({ success: true, message: 'All sessions revoked' });
  } catch (error) {
    return fail(res, error);
  }
};
