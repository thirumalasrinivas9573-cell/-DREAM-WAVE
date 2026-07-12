"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Spinner } from "@/components/common/spinner";
import {
  ActivityTimeline,
  DashboardSection,
  ExportButton,
  MiniBarChart,
  ProgressBar,
  SimplePagination,
  SmartStatCard,
} from "@/components/dashboard/dashboard-ui";
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { INSTITUTION_ROUTES } from "@/constants/institution";
import { cn } from "@/lib/utils";
import { useInstitutionStore } from "@/store/institution-store";

export function InstitutionDashboardPage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const profile = useInstitutionStore((s) => s.profile);
  const departments = useInstitutionStore((s) => s.departments);
  const courses = useInstitutionStore((s) => s.courses);
  const students = useInstitutionStore((s) => s.students);
  const teachers = useInstitutionStore((s) => s.teachers);
  const classes = useInstitutionStore((s) => s.classes);
  const notifications = useInstitutionStore((s) => s.notifications);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const activeStudents = useMemo(
    () => students.filter((row) => row.status === "active").length,
    [students],
  );
  const activeTeachers = useMemo(
    () => teachers.filter((row) => row.status === "active").length,
    [teachers],
  );
  const fillRate = useMemo(() => {
    const capacity = classes.reduce((sum, row) => sum + row.capacity, 0);
    const enrolled = classes.reduce((sum, row) => sum + row.enrolled, 0);
    if (!capacity) return 0;
    return Math.round((enrolled / capacity) * 100);
  }, [classes]);

  const departmentLoad = useMemo(() => {
    return departments.map((dept) => {
      const courseIds = new Set(
        courses.filter((course) => course.departmentId === dept.id).map((c) => c.id),
      );
      const value = students.filter((student) => courseIds.has(student.courseId)).length;
      return {
        label: dept.name.slice(0, 8),
        value: Math.max(value, courses.filter((c) => c.departmentId === dept.id).length),
      };
    });
  }, [courses, departments, students]);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q),
    );
  }, [query, students]);

  const pageSize = 5;
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pagedStudents = filteredStudents.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const exportOverview = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            profile: profile.name,
            departments: departments.length,
            students: activeStudents,
            teachers: activeTeachers,
            fillRate,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "institution-dashboard-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="container-app flex flex-1 flex-col gap-8 py-8 md:py-10">
      <InstitutionPageHeader
        title="Institution dashboard"
        description={`Operational overview for ${profile.name}.`}
        actions={
          <>
            <ExportButton onClick={exportOverview} />
            <Link
              href={INSTITUTION_ROUTES.analytics}
              className={cn(buttonVariants({ variant: "outline" }), "h-10")}
            >
              Open analytics
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SmartStatCard label="Departments" value={departments.length} />
        <SmartStatCard
          label="Active courses"
          value={courses.filter((c) => c.status === "active").length}
        />
        <SmartStatCard label="Active students" value={activeStudents} trend="+3%" />
        <SmartStatCard label="Active teachers" value={activeTeachers} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardSection
          title="Attendance overview"
          description="Class capacity as a proxy attendance/utilization signal."
        >
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="text-4xl font-semibold tabular-nums">{fillRate}%</p>
              <ProgressBar value={fillRate} label="Average fill rate" />
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection
          title="Department statistics"
          description="Learner distribution across departments."
        >
          <Card>
            <CardContent className="pt-6">
              <MiniBarChart
                values={departmentLoad.map((item) => item.value)}
                labels={departmentLoad.map((item) => item.label)}
              />
            </CardContent>
          </Card>
        </DashboardSection>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Course overview" description="Programs currently active.">
          <Card>
            <CardContent className="space-y-2 pt-6">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.id}
                  className="border-border flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                >
                  <span className="truncate font-medium">{course.name}</span>
                  <Badge variant="outline">{course.status}</Badge>
                </div>
              ))}
              <Link
                href={INSTITUTION_ROUTES.courses}
                className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
              >
                Manage courses
              </Link>
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection
          title="Placement analytics"
          description="Outcome readiness snapshot for graduating cohorts."
        >
          <Card>
            <CardContent className="space-y-3 pt-6">
              <ProgressBar label="Internship readiness" value={68} />
              <ProgressBar label="Placement pipeline" value={54} />
              <ProgressBar label="Employer engagement" value={71} />
              <Link
                href={INSTITUTION_ROUTES.reports}
                className={cn(buttonVariants({ variant: "outline" }), "h-9")}
              >
                Open reports
              </Link>
            </CardContent>
          </Card>
        </DashboardSection>
      </div>

      <DashboardSection
        title="Student statistics"
        description="Search roster with pagination."
        action={
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Filter students…"
            className="h-9 w-48"
            aria-label="Filter students"
          />
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagedStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <Badge variant="muted">{student.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-3">
          <SimplePagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </DashboardSection>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection title="Teacher statistics" description="Faculty roster snapshot.">
          <Card>
            <CardContent className="space-y-2 pt-6">
              {teachers.slice(0, 5).map((teacher) => (
                <div
                  key={teacher.id}
                  className="border-border flex items-center justify-between rounded-xl border px-3 py-2 text-sm"
                >
                  <span>{teacher.name}</span>
                  <Badge variant="outline">{teacher.status}</Badge>
                </div>
              ))}
              <Link
                href={INSTITUTION_ROUTES.teachers}
                className={cn(buttonVariants({ variant: "link" }), "h-auto px-0")}
              >
                Manage teachers
              </Link>
            </CardContent>
          </Card>
        </DashboardSection>
        <DashboardSection title="Reports & alerts" description="Recent operational notifications.">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification center</CardTitle>
              <CardDescription>Latest campus updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                items={notifications.slice(0, 5).map((item) => ({
                  id: item.id,
                  title: item.title,
                  detail: item.body,
                  time: new Date(item.createdAt).toLocaleString(),
                }))}
              />
              <Link
                href={INSTITUTION_ROUTES.notifications}
                className={cn(buttonVariants({ variant: "link" }), "mt-2 h-auto px-0")}
              >
                View all
              </Link>
            </CardContent>
          </Card>
        </DashboardSection>
      </div>
    </div>
  );
}
