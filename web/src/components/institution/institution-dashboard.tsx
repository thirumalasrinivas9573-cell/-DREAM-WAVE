"use client";

import {
  BellRing,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  GraduationCap,
  Megaphone,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";

import { RouteLoading } from "@/components/common/route-loading";
import {
  InstitutionActivityList,
  InstitutionBarChart,
  InstitutionDistributionChart,
  InstitutionLineChart,
  InstitutionMetricCard,
  InstitutionQuickAction,
} from "@/components/institution/institution-dashboard-ui";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { INSTITUTION_ROUTES } from "@/constants/institution";
import {
  INSTITUTION_ANALYTICS,
  INSTITUTION_DASHBOARD_METRICS,
  INSTITUTION_NOTICE_GROUPS,
  INSTITUTION_QUICK_ACTIONS,
  INSTITUTION_RECENT_ACTIVITY,
} from "@/constants/institution-dashboard";
import { cn } from "@/lib/utils";
import { useInstitutionStore } from "@/store/institution-store";

export function InstitutionDashboardPage() {
  const hydrated = useInstitutionStore((state) => state.hydrated);
  const hydrate = useInstitutionStore((state) => state.hydrate);
  const profile = useInstitutionStore((state) => state.profile);
  const departments = useInstitutionStore((state) => state.departments);
  const courses = useInstitutionStore((state) => state.courses);
  const students = useInstitutionStore((state) => state.students);
  const teachers = useInstitutionStore((state) => state.teachers);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const totals = useMemo(() => {
    const departmentStudents = departments.reduce(
      (total, department) => total + department.studentCount,
      0,
    );
    const departmentFaculty = departments.reduce(
      (total, department) => total + department.facultyCount,
      0,
    );

    return {
      students: Math.max(students.length, departmentStudents),
      faculty: Math.max(teachers.length, departmentFaculty),
      activeCourses: courses.filter((course) => course.status === "active").length,
    };
  }, [courses, departments, students.length, teachers.length]);

  if (!hydrated) {
    return <RouteLoading label="Loading institution dashboard" />;
  }

  const metrics = [
    {
      label: "Total Students",
      value: totals.students.toLocaleString(),
      hint: "Across all active programs",
      trend: "+6.8%",
      icon: GraduationCap,
    },
    {
      label: "Total Faculty",
      value: totals.faculty,
      hint: "Academic and visiting faculty",
      trend: "+4",
      icon: Users,
    },
    {
      label: "Departments",
      value: departments.length,
      hint: "Academic units",
      icon: Building2,
    },
    {
      label: "Courses",
      value: totals.activeCourses,
      hint: "Active programs",
      icon: BookOpen,
    },
    {
      label: "Admissions",
      value: INSTITUTION_DASHBOARD_METRICS.admissions,
      hint: "Current intake cycle",
      trend: "+12.4%",
      icon: UserCheck,
    },
    {
      label: "Placement Rate",
      value: `${INSTITUTION_DASHBOARD_METRICS.placementRate}%`,
      hint: "Graduating cohort",
      trend: "+3.2%",
      icon: TrendingUp,
    },
    {
      label: "Internships",
      value: INSTITUTION_DASHBOARD_METRICS.internships,
      hint: "Active student placements",
      icon: BriefcaseBusiness,
    },
    {
      label: "Upcoming Events",
      value: INSTITUTION_DASHBOARD_METRICS.upcomingEvents,
      hint: "Next 30 days",
      icon: CalendarDays,
    },
    {
      label: "Announcements",
      value: INSTITUTION_DASHBOARD_METRICS.announcements,
      hint: "Published this month",
      icon: Megaphone,
    },
    {
      label: "Active Recruiters",
      value: INSTITUTION_DASHBOARD_METRICS.activeRecruiters,
      hint: "Current hiring partners",
      icon: BellRing,
    },
  ] as const;

  return (
    <div className="container-app flex flex-1 flex-col gap-8 py-6 sm:py-8">
      <InstitutionPageHeader
        eyebrow="Organization overview"
        title="Institution Dashboard"
        description={`Welcome back. Here is the operational pulse of ${profile.name}.`}
        actions={
          <Link
            href={INSTITUTION_ROUTES.reports}
            className={cn(buttonVariants({ variant: "outline" }), "h-10")}
          >
            Generate report
          </Link>
        }
      />

      <section aria-labelledby="institution-metrics-heading">
        <h2 id="institution-metrics-heading" className="sr-only">
          Institution metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((metric) => (
            <InstitutionMetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-actions-heading" className="space-y-3">
        <div>
          <h2 id="quick-actions-heading" className="text-lg font-semibold tracking-tight">
            Quick actions
          </h2>
          <p className="text-muted-foreground text-sm">
            Start frequent administrative workflows.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {INSTITUTION_QUICK_ACTIONS.map((action) => (
            <InstitutionQuickAction key={action.label} {...action} />
          ))}
        </div>
      </section>

      <section aria-labelledby="analytics-heading" className="space-y-3">
        <div>
          <h2 id="analytics-heading" className="text-lg font-semibold tracking-tight">
            Institutional analytics
          </h2>
          <p className="text-muted-foreground text-sm">
            Typed visualization contracts ready for live reporting APIs.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <InstitutionLineChart
            title="Admissions Trend"
            description="Applications received during the current cycle."
            labels={INSTITUTION_ANALYTICS.admissions.labels}
            values={INSTITUTION_ANALYTICS.admissions.values}
          />
          <InstitutionLineChart
            title="Student Growth"
            description="Enrollment growth over six academic years."
            labels={INSTITUTION_ANALYTICS.students.labels}
            values={INSTITUTION_ANALYTICS.students.values}
          />
          <InstitutionDistributionChart
            title="Placement Statistics"
            description="Current graduating cohort placement pipeline."
            labels={INSTITUTION_ANALYTICS.placements.labels}
            values={INSTITUTION_ANALYTICS.placements.values}
          />
          <InstitutionBarChart
            title="Department Distribution"
            description="Student share by academic department."
            labels={INSTITUTION_ANALYTICS.departments.labels}
            values={INSTITUTION_ANALYTICS.departments.values}
          />
          <InstitutionBarChart
            title="Course Popularity"
            description="Relative demand across leading courses."
            labels={INSTITUTION_ANALYTICS.courses.labels}
            values={INSTITUTION_ANALYTICS.courses.values}
          />
          <InstitutionDistributionChart
            title="Faculty Distribution"
            description="Faculty composition by appointment level."
            labels={INSTITUTION_ANALYTICS.faculty.labels}
            values={INSTITUTION_ANALYTICS.faculty.values}
          />
        </div>
      </section>

      <section
        aria-label="Institution activity and announcements"
        className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]"
      >
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              Admissions, faculty, courses, events, and communications.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InstitutionActivityList items={INSTITUTION_RECENT_ACTIVITY} />
          </CardContent>
        </Card>

        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>Announcements and notices</CardTitle>
                <CardDescription>
                  Priority communication for the institution.
                </CardDescription>
              </div>
              <Link
                href={INSTITUTION_ROUTES.announcements}
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {INSTITUTION_NOTICE_GROUPS.map((group, index) => (
                <section key={group.title} aria-labelledby={`notice-group-${index}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <h3
                      id={`notice-group-${index}`}
                      className="text-sm font-semibold capitalize"
                    >
                      {group.title}
                    </h3>
                    <Badge variant="outline">{group.items.length}</Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="border-border bg-muted/20 rounded-lg border px-3 py-2 text-sm"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
