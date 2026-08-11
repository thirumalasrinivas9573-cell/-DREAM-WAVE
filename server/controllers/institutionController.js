const Organization = require('../models/Organization');
const OrgMembership = require('../models/OrgMembership');
const OrgNotification = require('../models/OrgNotification');
const Branch = require('../models/Branch');
const Department = require('../models/Department');
const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const ClassSection = require('../models/ClassSection');
const TimetableEntry = require('../models/TimetableEntry');
const AttendanceRecord = require('../models/AttendanceRecord');
const asyncHandler = require('../utils/asyncHandler');
const { AppError } = require('../middleware/errorHandler');
const { pick } = require('../utils/helpers');
const { INSTITUTION_KINDS, MEMBER_KINDS } = require('../config/constants');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');
const { assertCanUseAi, consumeAiCredit, refundAiCredit, recordAiUsage } = require('../services/entitlements');

async function loadOrg(req) {
  const org = await Organization.findById(req.params.id);
  if (!org) throw new AppError('Organization not found', 404);
  return org;
}

function publicInstitution(org) {
  return {
    id: org._id,
    name: org.name,
    slug: org.slug,
    type: org.type || 'institution',
    institutionKind: org.institutionKind || INSTITUTION_KINDS.SCHOOL,
    plan: org.plan,
    owner: org.owner,
    profile: org.profile || {},
    settings: org.settings || {},
    createdAt: org.createdAt,
    updatedAt: org.updatedAt,
  };
}

exports.getProfile = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  res.json({
    success: true,
    data: {
      organization: publicInstitution(org),
      membership: {
        role: req.orgMembership.role,
        memberKind: req.orgMembership.memberKind || MEMBER_KINDS.STAFF,
      },
    },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  if (req.body.name) {
    const name = String(req.body.name).trim();
    if (name.length < 2 || name.length > 120) {
      throw new AppError('Organization name must be 2–120 characters', 400);
    }
    org.name = name;
  }
  if (req.body.institutionKind) {
    const kind = String(req.body.institutionKind).toLowerCase();
    if (!Object.values(INSTITUTION_KINDS).includes(kind)) {
      throw new AppError('Invalid institution kind', 400);
    }
    org.institutionKind = kind;
  }
  if (req.body.profile && typeof req.body.profile === 'object') {
    org.profile = {
      ...(org.profile?.toObject?.() || org.profile || {}),
      ...pick(req.body.profile, [
        'description',
        'website',
        'phone',
        'email',
        'address',
        'city',
        'state',
        'country',
        'logoUrl',
      ]),
    };
  }
  await org.save();
  res.json({ success: true, data: { organization: publicInstitution(org) } });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  org.settings = {
    ...(org.settings?.toObject?.() || org.settings || {}),
    ...pick(req.body, [
      'timezone',
      'locale',
      'attendanceRequiredPercent',
      'notificationsEnabled',
      'academicYearLabel',
    ]),
  };
  await org.save();
  res.json({ success: true, data: { settings: org.settings, organization: publicInstitution(org) } });
});

exports.dashboard = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  const orgId = org._id;
  const [
    overview,
    branches,
    departments,
    years,
    courses,
    subjects,
    classes,
    timetable,
    attendanceToday,
    teachers,
    students,
  ] = await Promise.all([
    analyticsService.getOrgOverview(orgId),
    Branch.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    Department.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    AcademicYear.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    Course.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    Subject.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    ClassSection.countDocuments({ organizationId: orgId, active: { $ne: false } }),
    TimetableEntry.countDocuments({ organizationId: orgId }),
    AttendanceRecord.countDocuments({
      organizationId: orgId,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
    OrgMembership.countDocuments({ org: orgId, memberKind: MEMBER_KINDS.TEACHER }),
    OrgMembership.countDocuments({ org: orgId, memberKind: MEMBER_KINDS.STUDENT }),
  ]);

  const currentYear = await AcademicYear.findOne({ organizationId: orgId, isCurrent: true });
  const currentSemester = await Semester.findOne({ organizationId: orgId, isCurrent: true });

  res.json({
    success: true,
    data: {
      organization: publicInstitution(org),
      overview,
      structure: {
        branches,
        departments,
        academicYears: years,
        courses,
        subjects,
        classes,
        timetableEntries: timetable,
        attendanceMarkedToday: attendanceToday,
        teachers,
        students,
      },
      currentAcademicYear: currentYear,
      currentSemester,
      viewerRole: req.orgMembership?.role || null,
    },
  });
});

exports.listTeachers = asyncHandler(async (req, res) => {
  const members = await OrgMembership.find({
    org: req.params.id,
    memberKind: MEMBER_KINDS.TEACHER,
  })
    .populate('user', 'name email aaid plan')
    .populate('department', 'name code')
    .populate('branch', 'name code')
    .sort({ createdAt: 1 })
    .limit(200);
  res.json({
    success: true,
    data: {
      teachers: members.map((m) => ({
        id: m._id,
        role: m.role,
        memberKind: m.memberKind,
        title: m.title,
        department: m.department,
        branch: m.branch,
        user: m.user
          ? { id: m.user._id, name: m.user.name, email: m.user.email, aaid: m.user.aaid }
          : null,
        createdAt: m.createdAt,
      })),
    },
  });
});

exports.listStudents = asyncHandler(async (req, res) => {
  const filter = { org: req.params.id, memberKind: MEMBER_KINDS.STUDENT };
  const members = await OrgMembership.find(filter)
    .populate('user', 'name email aaid plan')
    .populate('department', 'name code')
    .populate('branch', 'name code')
    .sort({ createdAt: 1 })
    .limit(500);
  res.json({
    success: true,
    data: {
      students: members.map((m) => ({
        id: m._id,
        role: m.role,
        memberKind: m.memberKind,
        title: m.title,
        department: m.department,
        branch: m.branch,
        user: m.user
          ? { id: m.user._id, name: m.user.name, email: m.user.email, aaid: m.user.aaid }
          : null,
        createdAt: m.createdAt,
      })),
    },
  });
});

exports.updateMemberProfile = asyncHandler(async (req, res) => {
  const membership = await OrgMembership.findOne({
    _id: req.params.membershipId,
    org: req.params.id,
  }).populate('user', 'name email');
  if (!membership) throw new AppError('Membership not found', 404);

  if (req.body.memberKind) {
    const kind = String(req.body.memberKind).toLowerCase();
    if (!Object.values(MEMBER_KINDS).includes(kind)) {
      throw new AppError('Invalid member kind', 400);
    }
    membership.memberKind = kind;
  }
  if (req.body.title !== undefined) membership.title = String(req.body.title).slice(0, 120);
  if (req.body.department !== undefined) membership.department = req.body.department || null;
  if (req.body.branch !== undefined) membership.branch = req.body.branch || null;
  await membership.save();

  res.json({
    success: true,
    data: {
      membership: {
        id: membership._id,
        role: membership.role,
        memberKind: membership.memberKind,
        title: membership.title,
        department: membership.department,
        branch: membership.branch,
        user: membership.user
          ? {
              id: membership.user._id,
              name: membership.user.name,
              email: membership.user.email,
            }
          : null,
      },
    },
  });
});

exports.analytics = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  const data = await analyticsService.getInstitutionAnalytics(org._id);
  res.json({ success: true, data });
});

exports.generateReport = asyncHandler(async (req, res) => {
  await consumeAiCredit(req.user, 1);
  try {
  const org = await loadOrg(req);
  const analytics = await analyticsService.getInstitutionAnalytics(org._id);
  const focus = req.body.focus || 'overall institutional performance';
  const prompt = `Write an institution leadership report for ${org.name} (${org.institutionKind || 'institution'}). Focus: ${focus}. Data: ${JSON.stringify(analytics).slice(0, 6000)}`;
  const report = (await aiService.runMode('mentor', [{ role: 'user', content: prompt }])).content;
  res.json({
    success: true,
    data: {
      title: req.body.title || `${org.name} Institution Report`,
      report,
      analytics,
      generatedAt: new Date().toISOString(),
    },
  });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.aiAssist = asyncHandler(async (req, res) => {
  const org = await loadOrg(req);
  const message = String(req.body.message || '').trim();
  if (message.length < 2) throw new AppError('Message is required', 400);
  await consumeAiCredit(req.user, 1);
  try {
  const context = `Institution: ${org.name}. Kind: ${org.institutionKind}. Plan: ${org.plan}.`;
  const result = await aiService.runMode(
    req.body.mode || 'mentor',
    [{ role: 'user', content: message }],
    context
  );
  res.json({
    success: true,
    data: { reply: result.content, mode: result.mode || req.body.mode || 'mentor' },
  });
  } catch (err) {
    await refundAiCredit(req.user, 1);
    throw err;
  }
});

exports.listNotifications = asyncHandler(async (req, res) => {
  const membership = req.orgMembership;
  const audienceAllowed = ['all'];
  if (membership?.role === 'owner' || membership?.role === 'admin') {
    audienceAllowed.push('admins', 'teachers', 'students', 'staff');
  } else if (membership?.memberKind === 'teacher') {
    audienceAllowed.push('teachers', 'staff');
  } else if (membership?.memberKind === 'student') {
    audienceAllowed.push('students');
  } else {
    audienceAllowed.push('staff');
  }

  const notes = await OrgNotification.find({
    organizationId: req.params.id,
    audience: { $in: audienceAllowed },
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({
    success: true,
    data: {
      notifications: notes.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        audience: n.audience,
        link: n.link,
        read: (n.readBy || []).some((id) => String(id) === String(req.user._id)),
        createdAt: n.createdAt,
      })),
    },
  });
});

exports.createNotification = asyncHandler(async (req, res) => {
  await loadOrg(req);
  const note = await OrgNotification.create({
    organizationId: req.params.id,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'info',
    audience: req.body.audience || 'all',
    link: req.body.link || '/institution',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: { notification: note } });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  const note = await OrgNotification.findOne({
    _id: req.params.notificationId,
    organizationId: req.params.id,
  });
  if (!note) throw new AppError('Notification not found', 404);
  if (!(note.readBy || []).some((id) => String(id) === String(req.user._id))) {
    note.readBy.push(req.user._id);
    await note.save();
  }
  res.json({ success: true, data: { notification: note } });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const note = await OrgNotification.findOneAndDelete({
    _id: req.params.notificationId,
    organizationId: req.params.id,
  });
  if (!note) throw new AppError('Notification not found', 404);
  res.json({ success: true, message: 'Notification deleted' });
});
