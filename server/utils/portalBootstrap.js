const Institution = require('../models/Institution');
const CompanyProfile = require('../models/CompanyProfile');
const { ensureUniqueSlug } = require('./portalHelpers');

async function bootstrapPortalProfile(user) {
  if (!user?.role) return null;
  if (user.role === 'institution') {
    const existing = await Institution.findOne({ ownerId: user._id });
    if (existing) return existing;
    const name = user.organizationName || `${user.name}'s Institution`;
    return Institution.create({
      ownerId: user._id,
      name,
      slug: await ensureUniqueSlug(Institution, name),
      contact: { email: user.email },
      status: 'approved',
    });
  }
  if (user.role === 'company') {
    const existing = await CompanyProfile.findOne({ ownerId: user._id });
    if (existing) return existing;
    const name = user.organizationName || `${user.name}'s Company`;
    return CompanyProfile.create({
      ownerId: user._id,
      name,
      slug: await ensureUniqueSlug(CompanyProfile, name),
      contact: { email: user.email },
      status: 'approved',
    });
  }
  return null;
}

module.exports = { bootstrapPortalProfile };
