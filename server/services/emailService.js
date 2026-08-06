/**
 * Dream Wave — production email via Resend.
 * API key ONLY from process.env.RESEND_API_KEY (never hardcode).
 */
const { Resend } = require('resend');

let client = null;

function getFrom() {
  return process.env.EMAIL_FROM || 'Dream Wave AI <onboarding@resend.dev>';
}

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const err = new Error('RESEND_API_KEY is not configured in server/.env');
    err.statusCode = 503;
    throw err;
  }
  if (!client) client = new Resend(key);
  return client;
}

/**
 * Validate email env on startup. Throws if missing in production;
 * warns in development so the API can still boot for non-email routes.
 */
function validateEmailEnv({ fatalInProduction = true } = {}) {
  const missing = [];
  if (!process.env.RESEND_API_KEY) missing.push('RESEND_API_KEY');
  if (!process.env.EMAIL_FROM) missing.push('EMAIL_FROM');

  if (missing.length === 0) {
    console.log('[email] Resend configured · from =', getFrom());
    return { ok: true };
  }

  const msg = `[email] Missing env: ${missing.join(', ')}. OTP emails will fail until set.`;
  if (fatalInProduction && process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
  console.warn(msg);
  return { ok: false, missing };
}

async function sendRawEmail({ to, subject, html, text }) {
  const resend = getResend();
  const { data, error } = await resend.emails.send({
    from: getFrom(),
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text: text || undefined,
  });
  if (error) {
    const err = new Error(error.message || 'Failed to send email via Resend');
    err.statusCode = 502;
    err.resend = error;
    throw err;
  }
  return { id: data?.id, delivered: true, channel: 'resend' };
}

function otpHtml({ name, otp, purpose }) {
  const title = purpose === 'reset' ? 'Password reset code' : 'Verification code';
  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#0B0B12;color:#F8FAFC;padding:32px">
    <div style="max-width:480px;margin:0 auto;background:rgba(255,255,255,0.04);border:1px solid rgba(139,92,246,0.35);border-radius:16px;padding:28px">
      <h1 style="margin:0 0 8px;font-size:20px;color:#C4B5FD">AA Dream Wave</h1>
      <p style="opacity:0.8;margin:0 0 16px">Hi ${name || 'there'},</p>
      <p style="margin:0 0 8px">Your ${title} is:</p>
      <div style="font-size:32px;letter-spacing:0.35em;font-weight:800;text-align:center;padding:18px;background:rgba(139,92,246,0.18);border-radius:12px;margin:16px 0">${otp}</div>
      <p style="opacity:0.6;font-size:13px;margin:0">Expires in 5 minutes. If you did not request this, ignore this email.</p>
    </div>
  </div>`;
}

/** Send 6-digit OTP — never log the code */
async function sendOTPEmail({ to, name, otp, purpose = 'verification' }) {
  if (!otp) throw new Error('OTP is required');
  return sendRawEmail({
    to,
    subject: purpose === 'reset'
      ? 'Dream Wave — Password reset code'
      : 'Dream Wave — Your verification code',
    html: otpHtml({ name, otp, purpose }),
    text: `Your Dream Wave code is ${otp}. It expires in 5 minutes.`,
  });
}

async function sendWelcomeEmail({ to, name, portal }) {
  const portalLabel = portal === 'institution' ? 'Institution'
    : portal === 'company' ? 'Company' : 'Student';
  return sendRawEmail({
    to,
    subject: 'Welcome to Dream Wave AI',
    html: `
    <div style="font-family:Inter,Arial,sans-serif;background:#0B0B12;color:#F8FAFC;padding:32px">
      <div style="max-width:480px;margin:0 auto;border:1px solid rgba(139,92,246,0.35);border-radius:16px;padding:28px">
        <h1 style="color:#C4B5FD;margin-top:0">Welcome, ${name || 'explorer'} 🌊</h1>
        <p>Your <strong>${portalLabel}</strong> account on Dream Wave AI is ready.</p>
        <p style="opacity:0.7">Sign in to your portal and start building your future with AI.</p>
      </div>
    </div>`,
    text: `Welcome to Dream Wave AI, ${name || ''}. Your ${portalLabel} account is ready.`,
  });
}

async function sendPasswordResetEmail({ to, name, otp }) {
  return sendOTPEmail({ to, name, otp, purpose: 'reset' });
}

async function sendInstitutionApprovalEmail({ to, name, organizationName, approved = true }) {
  const status = approved ? 'approved' : 'needs attention';
  return sendRawEmail({
    to,
    subject: `Dream Wave — Institution account ${status}`,
    html: `
    <div style="font-family:Inter,Arial,sans-serif;background:#0B0B12;color:#F8FAFC;padding:32px">
      <div style="max-width:480px;margin:0 auto;border:1px solid rgba(14,165,233,0.4);border-radius:16px;padding:28px">
        <h1 style="color:#7DD3FC;margin-top:0">Institution ${status}</h1>
        <p>Hi ${name || 'Admin'},</p>
        <p>Your institution <strong>${organizationName || 'organization'}</strong> has been <strong>${status}</strong> on Dream Wave AI.</p>
      </div>
    </div>`,
    text: `Institution ${organizationName || ''} ${status} on Dream Wave AI.`,
  });
}

async function sendCompanyApprovalEmail({ to, name, organizationName, approved = true }) {
  const status = approved ? 'approved' : 'needs attention';
  return sendRawEmail({
    to,
    subject: `Dream Wave — Company account ${status}`,
    html: `
    <div style="font-family:Inter,Arial,sans-serif;background:#0B0B12;color:#F8FAFC;padding:32px">
      <div style="max-width:480px;margin:0 auto;border:1px solid rgba(16,185,129,0.4);border-radius:16px;padding:28px">
        <h1 style="color:#6EE7B7;margin-top:0">Company ${status}</h1>
        <p>Hi ${name || 'Admin'},</p>
        <p>Your company <strong>${organizationName || 'organization'}</strong> has been <strong>${status}</strong> on Dream Wave AI.</p>
      </div>
    </div>`,
    text: `Company ${organizationName || ''} ${status} on Dream Wave AI.`,
  });
}

// Backward-compatible alias used by authController
async function sendOtpEmail(args) {
  return sendOTPEmail(args);
}

module.exports = {
  validateEmailEnv,
  sendOTPEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendInstitutionApprovalEmail,
  sendCompanyApprovalEmail,
  sendRawEmail,
  getFrom,
};
