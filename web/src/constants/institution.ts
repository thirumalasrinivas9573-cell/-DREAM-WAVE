import { ROUTES as BASE } from "@/constants/routes";

/**
 * Institution platform routes.
 */
export const INSTITUTION_ROUTES = {
  root: "/institution",
  home: "/institution",
  dashboard: "/institution/dashboard",
  college: "/institution/college",
  school: "/institution/school",
  profile: "/institution/profile",
  departments: "/institution/departments",
  branches: "/institution/branches",
  courses: "/institution/courses",
  subjects: "/institution/subjects",
  teachers: "/institution/teachers",
  students: "/institution/students",
  classes: "/institution/classes",
  members: "/institution/members",
  settings: "/institution/settings",
  reports: "/institution/reports",
  analytics: "/institution/analytics",
  notifications: "/institution/notifications",
} as const;

export type InstitutionRoute =
  (typeof INSTITUTION_ROUTES)[keyof typeof INSTITUTION_ROUTES];

export const INSTITUTION_NAV = [
  { label: "Home", href: INSTITUTION_ROUTES.home, primary: true },
  { label: "Dashboard", href: INSTITUTION_ROUTES.dashboard },
  { label: "College", href: INSTITUTION_ROUTES.college },
  { label: "School", href: INSTITUTION_ROUTES.school },
  { label: "Departments", href: INSTITUTION_ROUTES.departments },
  { label: "Branches", href: INSTITUTION_ROUTES.branches },
  { label: "Courses", href: INSTITUTION_ROUTES.courses },
  { label: "Subjects", href: INSTITUTION_ROUTES.subjects },
  { label: "Teachers", href: INSTITUTION_ROUTES.teachers },
  { label: "Students", href: INSTITUTION_ROUTES.students },
  { label: "Classes", href: INSTITUTION_ROUTES.classes },
  { label: "Members", href: INSTITUTION_ROUTES.members },
  { label: "Analytics", href: INSTITUTION_ROUTES.analytics },
  { label: "Reports", href: INSTITUTION_ROUTES.reports },
  { label: "Notifications", href: INSTITUTION_ROUTES.notifications },
  { label: "Profile", href: INSTITUTION_ROUTES.profile },
  { label: "Settings", href: INSTITUTION_ROUTES.settings },
  { label: "Account", href: BASE.settings },
] as const;
