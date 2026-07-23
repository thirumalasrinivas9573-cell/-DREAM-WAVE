import { ROUTES as BASE } from "@/constants/routes";

/**
 * Institution platform routes.
 */
export const INSTITUTION_ROUTES = {
  root: "/institution",
  dashboard: "/institution/dashboard",
  admissions: "/institution/admissions",
  admissionsAnalytics: "/institution/admissions/analytics",
  admissionsReports: "/institution/admissions/reports",
  students: "/institution/students",
  studentAnalytics: "/institution/students/analytics",
  studentReports: "/institution/students/reports",
  faculty: "/institution/faculty",
  facultyAnalytics: "/institution/faculty/analytics",
  facultyReports: "/institution/faculty/reports",
  departments: "/institution/departments",
  courses: "/institution/courses",
  academics: "/institution/academics",
  academicsAnalytics: "/institution/academics/analytics",
  academicsReports: "/institution/academics/reports",
  placements: "/institution/placements",
  placementsAnalytics: "/institution/placements/analytics",
  placementsReports: "/institution/placements/reports",
  events: "/institution/events",
  gallery: "/institution/gallery",
  announcements: "/institution/announcements",
  campus: "/institution/campus",
  campusAnalytics: "/institution/campus/analytics",
  campusReports: "/institution/campus/reports",
  analytics: "/institution/analytics",
  reports: "/institution/reports",
  settings: "/institution/settings",
  help: "/institution/help",
  notifications: "/institution/notifications",
  profile: "/institution/profile",
  college: "/institution/college",
  school: "/institution/school",
  branches: "/institution/branches",
  subjects: "/institution/subjects",
  teachers: "/institution/teachers",
  classes: "/institution/classes",
  members: "/institution/members",
} as const;

export type InstitutionRoute =
  (typeof INSTITUTION_ROUTES)[keyof typeof INSTITUTION_ROUTES];

export const INSTITUTION_NAV = [
  { label: "Dashboard", href: INSTITUTION_ROUTES.dashboard, primary: true },
  { label: "Admissions", href: INSTITUTION_ROUTES.admissions },
  { label: "Students", href: INSTITUTION_ROUTES.students },
  { label: "Faculty", href: INSTITUTION_ROUTES.faculty },
  { label: "Departments", href: INSTITUTION_ROUTES.departments },
  { label: "Courses", href: INSTITUTION_ROUTES.courses },
  { label: "Placements", href: INSTITUTION_ROUTES.placements },
  { label: "Events", href: INSTITUTION_ROUTES.events },
  { label: "Gallery", href: INSTITUTION_ROUTES.gallery },
  { label: "Announcements", href: INSTITUTION_ROUTES.announcements },
  { label: "Analytics", href: INSTITUTION_ROUTES.analytics },
  { label: "Reports", href: INSTITUTION_ROUTES.reports },
  { label: "Settings", href: INSTITUTION_ROUTES.settings },
  { label: "Help", href: INSTITUTION_ROUTES.help },
] as const;

export const INSTITUTION_ACCOUNT_ROUTE = BASE.settings;
