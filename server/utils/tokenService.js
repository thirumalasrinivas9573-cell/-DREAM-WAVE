const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL_MS = parseInt(process.env.JWT_REFRESH_TTL_MS || String(30 * 24 * 60 * 60 * 1000), 10);
const REFRESH_TTL_SHORT_MS = parseInt(process.env.JWT_REFRESH_TTL_SHORT_MS || String(24 * 60 * 60 * 1000), 10);
const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'dw_refresh';

function generateAccessToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: ACCESS_TTL });
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function cookieOptions(maxAgeMs) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: '/api/auth',
  };
}

function setRefreshCookie(res, raw, maxAgeMs) {
  if (!res || typeof res.cookie !== 'function') return;
  res.cookie(COOKIE_NAME, raw, cookieOptions(maxAgeMs));
}

function clearRefreshCookie(res) {
  if (!res || typeof res.clearCookie !== 'function') return;
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(0), maxAge: 0 });
}

function readRefreshFromReq(req) {
  return (
    req.body?.refreshToken ||
    req.cookies?.[COOKIE_NAME] ||
    null
  );
}

async function issueRefreshToken(userId, userAgent = '', { remember = true } = {}) {
  const raw = crypto.randomBytes(48).toString('hex');
  const ttl = remember ? REFRESH_TTL_MS : REFRESH_TTL_SHORT_MS;
  const expiresAt = new Date(Date.now() + ttl);
  const doc = await RefreshToken.create({
    userId,
    tokenHash: hashToken(raw),
    expiresAt,
    userAgent: String(userAgent).slice(0, 500),
    remember: Boolean(remember),
    lastUsedAt: new Date(),
  });
  return { raw, expiresAt, ttl, id: doc._id };
}

async function rotateRefreshToken(oldRaw, userAgent = '') {
  const oldHash = hashToken(oldRaw);
  const existing = await RefreshToken.findOne({ tokenHash: oldHash, expiresAt: { $gt: new Date() } });
  if (!existing) return null;
  const remember = existing.remember !== false;
  await RefreshToken.deleteOne({ _id: existing._id });
  const accessToken = generateAccessToken(existing.userId);
  const next = await issueRefreshToken(existing.userId, userAgent, { remember });
  return {
    userId: existing.userId,
    accessToken,
    refreshToken: next.raw,
    ttl: next.ttl,
    sessionId: next.id,
  };
}

async function revokeRefreshToken(raw) {
  if (!raw) return;
  await RefreshToken.deleteOne({ tokenHash: hashToken(raw) });
}

async function revokeAllForUser(userId) {
  await RefreshToken.deleteMany({ userId });
}

async function revokeSessionById(userId, sessionId) {
  return RefreshToken.deleteOne({ _id: sessionId, userId });
}

async function listSessions(userId, currentRaw) {
  const currentHash = currentRaw ? hashToken(currentRaw) : null;
  const rows = await RefreshToken.find({ userId, expiresAt: { $gt: new Date() } })
    .sort({ lastUsedAt: -1 })
    .select('_id userAgent createdAt lastUsedAt expiresAt remember tokenHash')
    .lean();
  return rows.map((r) => ({
    id: r._id,
    userAgent: r.userAgent || '',
    createdAt: r.createdAt,
    lastUsedAt: r.lastUsedAt || r.createdAt,
    expiresAt: r.expiresAt,
    remember: r.remember !== false,
    current: Boolean(currentHash && r.tokenHash === currentHash),
  }));
}

async function issueSession(userId, userAgent = '', { remember = true } = {}) {
  const token = generateAccessToken(userId);
  const next = await issueRefreshToken(userId, userAgent, { remember });
  return {
    token,
    refreshToken: next.raw,
    ttl: next.ttl,
    sessionId: next.id,
  };
}

async function touchSession(raw) {
  if (!raw) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(raw) },
    { $set: { lastUsedAt: new Date() } },
  );
}

module.exports = {
  generateAccessToken,
  issueSession,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
  revokeSessionById,
  listSessions,
  touchSession,
  setRefreshCookie,
  clearRefreshCookie,
  readRefreshFromReq,
  COOKIE_NAME,
  ACCESS_TTL,
  REFRESH_TTL_MS,
  REFRESH_TTL_SHORT_MS,
};
