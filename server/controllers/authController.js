const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');
const OrgMembership = require('../models/OrgMembership');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/sendEmail');
const logger = require('../utils/logger');
const schemas = require('../config/schemas');
const { toAssetUrl } = require('../utils/assetUrl');
const { PORTALS, ORG_TYPES } = require('../config/constants');
const { auditFromRequest, writeAudit, clientIp } = require('../utils/audit');

exports.signupSchema = schemas.signup;
exports.loginSchema = schemas.login;

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  aaid: user.aaid,
  role: user.role,
  profileImage: user.profileImage,
  bio: user.bio,
  level: user.level,
  credits: user.credits,
  streak: user.streak,
  learningStreak: user.learningStreak,
  plan: user.plan,
  organizationId: user.organizationId || null,
  targetCareer: user.targetCareer,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive !== false,
  certificates: user.certificates,
  preferences: user.preferences,
  createdAt: user.createdAt,
});

exports.publicUser = publicUser;

async function resolveLoginContext(user, portal) {
  let organization = null;
  let membership = null;
  let resolvedPortal = PORTALS.STUDENT;

  if (user.organizationId) {
    const org = await Organization.findById(user.organizationId).lean();
    const mem = await OrgMembership.findOne({ org: user.organizationId, user: user._id }).lean();
    if (org) {
      organization = {
        id: org._id,
        name: org.name,
        slug: org.slug,
        type: org.type || ORG_TYPES.INSTITUTION,
        plan: org.plan,
      };
      membership = mem ? { role: mem.role } : null;
      if (org.type === ORG_TYPES.COMPANY) resolvedPortal = PORTALS.COMPANY;
      else if (org.type === ORG_TYPES.INSTITUTION || org.type === ORG_TYPES.TEAM) {
        resolvedPortal = PORTALS.INSTITUTION;
      }
    }
  }

  if (portal && portal !== PORTALS.STUDENT) {
    if (!organization) {
      throw new AppError(`No organization found for ${portal} login`, 403);
    }
    if (portal === PORTALS.INSTITUTION && organization.type === ORG_TYPES.COMPANY) {
      throw new AppError('This account belongs to a company organization. Use company login.', 403);
    }
    if (portal === PORTALS.COMPANY && organization.type !== ORG_TYPES.COMPANY) {
      throw new AppError('This account belongs to an institution. Use institution login.', 403);
    }
    resolvedPortal = portal;
  }

  return { organization, membership, portal: resolvedPortal };
}

function bumpStreak(user) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
  if (last) last.setHours(0, 0, 0, 0);
  if (!last) user.streak = 1;
  else {
    const diffDays = Math.round((today - last) / 86400000);
    if (diffDays === 1) user.streak = (user.streak || 0) + 1;
    else if (diffDays > 1) user.streak = 1;
  }
  user.lastActiveDate = new Date();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshCookieMaxAgeMs() {
  const raw = process.env.JWT_REFRESH_EXPIRE || '7d';
  const m = String(raw).match(/^(\d+)([smhd])$/i);
  if (!m) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2].toLowerCase()];
  return n * (unit || 86_400_000);
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('dw_refresh', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: refreshCookieMaxAgeMs(),
    path: '/api/auth',
  });
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('dw_refresh', {
    path: '/api/auth',
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
}

async function issueTokens(user, req, res) {
  const accessToken = user.getSignedJwtToken();
  const refreshToken = user.getRefreshToken();
  user.refreshTokens = (user.refreshTokens || [])
    .filter((t) => t.expiresAt > new Date())
    .slice(-4);
  user.refreshTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    userAgent: req.get('user-agent') || '',
  });
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password, inviteToken } = req.body;
  if (await User.findOne({ email })) throw new AppError('Email already registered', 400);

  const OrgInvite = require('../models/OrgInvite');
  const { acceptPendingInvite } = require('../services/orgInviteService');

  if (inviteToken) {
    const invite = await OrgInvite.findOne({
      tokenHash: OrgInvite.hashToken(inviteToken),
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });
    if (!invite) throw new AppError('Invite is invalid or expired', 400);
    if (invite.email !== String(email).toLowerCase().trim()) {
      throw new AppError('Invite email does not match signup email', 400);
    }
  }

  // Admin role is never granted via signup (use admin user update only).
  const user = await User.create({ name, email, password, role: 'user' });
  bumpStreak(user);
  await acceptPendingInvite(user, inviteToken);

  const verifyToken = user.getEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/verify-email/${verifyToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your Dream Wave AI email',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p>Welcome to Dream Wave AI.</p><p><a href="${verifyUrl}">Verify email</a></p>`,
  });

  const { accessToken } = await issueTokens(user, req, res);
  logger.info('User signed up', { userId: String(user._id) });
  await writeAudit({
    actor: user._id,
    action: 'auth.signup',
    resource: 'user',
    resourceId: user._id,
    ip: clientIp(req),
    requestId: req.requestId,
  });
  res.status(201).json({
    success: true,
    token: accessToken,
    data: { user: publicUser(user) },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password, portal } = req.body;
  const ip = clientIp(req);
  try {
    const ops = require('../services/opsIntelligenceService');
    const lock = await ops.isLoginLocked({ email, ip });
    if (lock.locked) {
      await ops.recordSecurityEvent({
        type: 'login_locked',
        severity: 'high',
        email: String(email || '').toLowerCase(),
        ip,
        path: req.originalUrl,
        requestId: req.requestId,
        meta: { failedLogins: lock.failedLogins, until: lock.until },
      });
      throw new AppError('Too many failed login attempts. Try again later.', 429, {
        failureClass: 'auth',
      });
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    await writeAudit({
      actor: user?._id || null,
      action: 'auth.login_failed',
      resource: 'user',
      resourceId: user?._id,
      meta: { email: String(email || '').toLowerCase() },
      ip,
      requestId: req.requestId,
    });
    try {
      const ops = require('../services/opsIntelligenceService');
      await ops.recordSecurityEvent({
        type: 'login_failed',
        severity: 'low',
        user: user?._id || null,
        email: String(email || '').toLowerCase(),
        ip,
        path: req.originalUrl,
        requestId: req.requestId,
      });
      await ops.detectSuspiciousActivity({ email, ip });
    } catch {
      /* non-blocking */
    }
    throw new AppError('Invalid credentials', 401, { failureClass: 'auth' });
  }
  if (user.isActive === false) {
    try {
      const ops = require('../services/opsIntelligenceService');
      await ops.recordSecurityEvent({
        type: 'account_disabled_attempt',
        severity: 'medium',
        user: user._id,
        email: user.email,
        ip: clientIp(req),
        path: req.originalUrl,
        requestId: req.requestId,
      });
    } catch {
      /* non-blocking */
    }
    throw new AppError('Account is disabled.', 403, { failureClass: 'auth' });
  }
  bumpStreak(user);
  const context = await resolveLoginContext(user, portal);
  const { accessToken } = await issueTokens(user, req, res);
  await writeAudit({
    organizationId: user.organizationId,
    actor: user._id,
    action: 'auth.login',
    resource: 'user',
    resourceId: user._id,
    meta: { portal: context.portal },
    ip: clientIp(req),
    requestId: req.requestId,
  });
  try {
    const ops = require('../services/opsIntelligenceService');
    await ops.recordSecurityEvent({
      type: 'login_success',
      severity: 'info',
      user: user._id,
      organizationId: user.organizationId,
      email: user.email,
      ip: clientIp(req),
      path: req.originalUrl,
      requestId: req.requestId,
      meta: { portal: context.portal },
    });
  } catch {
    /* non-blocking */
  }
  res.json({
    success: true,
    token: accessToken,
    data: {
      user: publicUser(user),
      portal: context.portal,
      organization: context.organization,
      membership: context.membership,
    },
  });
});

exports.sendEmailOtp = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.json({ success: true, message: 'Email already verified' });
  }
  const code = req.user.issueEmailOtp();
  await req.user.save({ validateBeforeSave: false });
  await sendEmail({
    to: req.user.email,
    subject: 'Dream Wave AI — Email verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your Dream Wave verification code:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px">${code}</p><p>Expires in 10 minutes.</p>`,
  });
  res.json({ success: true, message: 'OTP sent to your email' });
});

exports.verifyEmailOtp = asyncHandler(async (req, res) => {
  const { code } = req.body;
  if (!code) throw new AppError('OTP code is required', 400);
  if (req.user.isEmailVerified) {
    return res.json({
      success: true,
      message: 'Email already verified',
      data: { user: publicUser(req.user) },
    });
  }
  if (req.user.emailOtpLockedUntil && req.user.emailOtpLockedUntil > new Date()) {
    throw new AppError('Too many OTP attempts. Try again later.', 429, { failureClass: 'auth' });
  }
  if (!req.user.verifyEmailOtp(code)) {
    req.user.emailOtpAttempts = (req.user.emailOtpAttempts || 0) + 1;
    if (req.user.emailOtpAttempts >= 5) {
      req.user.emailOtpLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      req.user.emailOtpAttempts = 0;
      req.user.emailOtpHash = undefined;
      req.user.emailOtpExpire = undefined;
    }
    await req.user.save({ validateBeforeSave: false });
    throw new AppError('Invalid or expired OTP', 400, { failureClass: 'auth' });
  }
  req.user.isEmailVerified = true;
  req.user.emailOtpHash = undefined;
  req.user.emailOtpExpire = undefined;
  req.user.emailOtpAttempts = 0;
  req.user.emailOtpLockedUntil = undefined;
  req.user.emailVerificationToken = undefined;
  req.user.emailVerificationExpire = undefined;
  await req.user.save({ validateBeforeSave: false });
  await auditFromRequest(req, {
    action: 'auth.email_verified_otp',
    resource: 'user',
    resourceId: req.user._id,
  });
  res.json({
    success: true,
    message: 'Email verified',
    data: { user: publicUser(req.user) },
  });
});

exports.refresh = asyncHandler(async (req, res) => {
  // Browser clients: httpOnly cookie only. Body refreshToken is rejected for XSS hardening.
  const token = req.cookies?.dw_refresh;
  if (!token) throw new AppError('Refresh token required', 401);
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }
  if (decoded.type !== 'refresh') throw new AppError('Invalid refresh token', 401);
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('User not found', 401);
  if (user.isActive === false) throw new AppError('Account is disabled.', 403, { failureClass: 'auth' });
  const hashed = hashToken(token);
  const stored = (user.refreshTokens || []).find(
    (t) => t.tokenHash === hashed && t.expiresAt > new Date()
  );
  if (!stored) {
    // Possible refresh-token reuse after rotation — revoke all sessions.
    user.refreshTokens = [];
    await user.save({ validateBeforeSave: false });
    clearRefreshCookie(res);
    try {
      const ops = require('../services/opsIntelligenceService');
      await ops.recordSecurityEvent({
        type: 'token_reuse',
        severity: 'high',
        user: user._id,
        email: user.email,
        ip: clientIp(req),
        path: req.originalUrl,
        requestId: req.requestId,
      });
    } catch {
      /* non-blocking */
    }
    await writeAudit({
      actor: user._id,
      action: 'auth.refresh_reuse',
      resource: 'user',
      resourceId: user._id,
      ip: clientIp(req),
      requestId: req.requestId,
    });
    throw new AppError('Session expired. Please log in again.', 401);
  }

  user.refreshTokens = user.refreshTokens.filter((t) => t.tokenHash !== hashed);
  const { accessToken } = await issueTokens(user, req, res);
  res.json({ success: true, token: accessToken, data: { user: publicUser(user) } });
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.dw_refresh;
  let userId = null;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        algorithms: ['HS256'],
      });
      userId = decoded.id;
    } catch {
      /* ignore invalid cookie */
    }
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const hashed = hashToken(token);
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t.tokenHash !== hashed);
        await user.save({ validateBeforeSave: false });
      }
    }
  }
  clearRefreshCookie(res);
  await writeAudit({
    actor: userId || null,
    action: 'auth.logout',
    resource: 'user',
    resourceId: userId,
    ip: clientIp(req),
    requestId: req.requestId,
  });
  res.json({ success: true, message: 'Logged out' });
});

exports.sessions = asyncHandler(async (req, res) => {
  const sessions = (req.user.refreshTokens || []).map((t) => ({
    id: t._id,
    userAgent: t.userAgent,
    createdAt: t.createdAt,
    expiresAt: t.expiresAt,
  }));
  res.json({ success: true, data: { sessions } });
});

exports.revokeSession = asyncHandler(async (req, res) => {
  req.user.refreshTokens = (req.user.refreshTokens || []).filter(
    (t) => String(t._id) !== String(req.params.id)
  );
  await req.user.save({ validateBeforeSave: false });
  await auditFromRequest(req, {
    action: 'auth.session_revoked',
    resource: 'user',
    resourceId: req.user._id,
    meta: { sessionId: req.params.id },
  });
  res.json({ success: true, message: 'Session revoked' });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpire: { $gt: Date.now() },
  });
  if (!user) throw new AppError('Invalid or expired verification token', 400);
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });
  await writeAudit({
    actor: user._id,
    action: 'auth.email_verified',
    resource: 'user',
    resourceId: user._id,
    ip: clientIp(req),
    requestId: req.requestId,
  });
  res.json({ success: true, message: 'Email verified', data: { user: publicUser(user) } });
});

exports.resendVerification = asyncHandler(async (req, res) => {
  if (req.user.isEmailVerified) {
    return res.json({ success: true, message: 'Email already verified' });
  }
  const token = req.user.getEmailVerificationToken();
  await req.user.save({ validateBeforeSave: false });
  const verifyUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/verify-email/${token}`;
  await sendEmail({
    to: req.user.email,
    subject: 'Verify your Dream Wave AI email',
    text: `Verify your email: ${verifyUrl}`,
    html: `<p><a href="${verifyUrl}">Verify email</a></p>`,
  });
  res.json({ success: true, message: 'Verification email sent' });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
  }
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${(process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0]}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Dream Wave AI — Password Reset',
    text: `Reset your password: ${resetUrl}\nThis link expires in 30 minutes.`,
    html: `<p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
  await writeAudit({
    actor: user._id,
    action: 'auth.password_reset_requested',
    resource: 'user',
    resourceId: user._id,
    ip: clientIp(req),
    requestId: req.requestId,
  });
  res.json({ success: true, message: 'If that email exists, a reset link was sent.' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpire: { $gt: Date.now() },
  }).select('+password');
  if (!user) throw new AppError('Invalid or expired reset token', 400);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.refreshTokens = [];
  await user.save();
  await writeAudit({
    actor: user._id,
    action: 'auth.password_reset',
    resource: 'user',
    resourceId: user._id,
    ip: clientIp(req),
    requestId: req.requestId,
  });
  const { accessToken } = await issueTokens(user, req, res);
  res.json({
    success: true,
    token: accessToken,
    data: { user: publicUser(user) },
    message: 'Password updated',
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, targetCareer } = req.body;
  if (name) req.user.name = name.slice(0, 80);
  if (bio !== undefined) req.user.bio = String(bio).slice(0, 500);
  if (targetCareer !== undefined) req.user.targetCareer = String(targetCareer).slice(0, 120);
  if (req.file) req.user.profileImage = toAssetUrl(req.file.filename);
  await req.user.save();
  res.json({ success: true, data: { user: publicUser(req.user) } });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 400);
  }
  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();
  clearRefreshCookie(res);
  await auditFromRequest(req, {
    action: 'auth.password_changed',
    resource: 'user',
    resourceId: user._id,
  });
  res.json({ success: true, message: 'Password changed' });
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const { theme, language, notifications, emailUpdates, focusMinutes } = req.body;
  if (theme) req.user.preferences.theme = theme;
  if (language) req.user.preferences.language = language;
  if (notifications !== undefined) req.user.preferences.notifications = notifications;
  if (emailUpdates !== undefined) req.user.preferences.emailUpdates = emailUpdates;
  if (focusMinutes !== undefined) req.user.preferences.focusMinutes = focusMinutes;
  await req.user.save();
  res.json({ success: true, data: { preferences: req.user.preferences } });
});
