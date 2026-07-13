/**
 * Canonical portal roles for Dream Wave AI.
 * Role is stored on User.role; this module documents allowed values.
 */
const ROLES = Object.freeze({
  STUDENT: 'student',
  INSTITUTION: 'institution',
  COMPANY: 'company',
  ADMIN: 'admin',
});

const AUTH_ROLES = Object.freeze([ROLES.STUDENT, ROLES.INSTITUTION, ROLES.COMPANY]);

function isAuthRole(role) {
  return AUTH_ROLES.includes(role);
}

module.exports = { ROLES, AUTH_ROLES, isAuthRole };
