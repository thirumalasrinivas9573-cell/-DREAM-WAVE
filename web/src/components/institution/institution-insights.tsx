"use client";

import { useEffect, useMemo } from "react";

import { Spinner } from "@/components/common/spinner";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInstitutionStore } from "@/store/institution-store";

export function InstitutionAnalyticsPage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const departments = useInstitutionStore((s) => s.departments);
  const students = useInstitutionStore((s) => s.students);
  const teachers = useInstitutionStore((s) => s.teachers);
  const courses = useInstitutionStore((s) => s.courses);
  const classes = useInstitutionStore((s) => s.classes);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const byStatus = useMemo(() => {
    const counts = { active: 0, inactive: 0, pending: 0 };
    for (const student of students) {
      counts[student.status] += 1;
    }
    return counts;
  }, [students]);

  const deptLoad = useMemo(
    () =>
      departments.map((dept) => ({
        name: dept.name,
        students: dept.studentCount,
        faculty: dept.facultyCount,
      })),
    [departments],
  );

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading analytics" />
      </div>
    );
  }

  const ratio =
    teachers.length === 0
      ? 0
      : Math.round((students.length / teachers.length) * 10) / 10;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-8 md:py-10">
      <InstitutionPageHeader
        title="Analytics dashboard"
        description="Enrollment health, teaching load, and department distribution."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Student / teacher ratio", value: ratio },
          { label: "Courses offered", value: courses.length },
          { label: "Scheduled classes", value: classes.length },
          {
            label: "Pending students",
            value: byStatus.pending,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student status mix</CardTitle>
            <CardDescription>Active vs inactive vs pending.</CardDescription>
            <ul className="mt-4 space-y-3">
              {(
                [
                  ["active", byStatus.active],
                  ["inactive", byStatus.inactive],
                  ["pending", byStatus.pending],
                ] as const
              ).map(([label, value]) => {
                const pct = students.length
                  ? Math.round((value / students.length) * 100)
                  : 0;
                return (
                  <li key={label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="capitalize">{label}</span>
                      <span>
                        {value} ({pct}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department load</CardTitle>
            <CardDescription>Students and faculty by department.</CardDescription>
            <ul className="mt-4 space-y-3">
              {deptLoad.map((dept) => (
                <li
                  key={dept.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="font-medium">{dept.name}</span>
                  <span className="text-muted-foreground">
                    {dept.students} students · {dept.faculty} faculty
                  </span>
                </li>
              ))}
            </ul>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export function InstitutionReportsPage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const profile = useInstitutionStore((s) => s.profile);
  const departments = useInstitutionStore((s) => s.departments);
  const students = useInstitutionStore((s) => s.students);
  const teachers = useInstitutionStore((s) => s.teachers);
  const courses = useInstitutionStore((s) => s.courses);
  const classes = useInstitutionStore((s) => s.classes);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading reports" />
      </div>
    );
  }

  const generatedAt = new Date().toLocaleString();

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-8 md:py-10">
      <InstitutionPageHeader
        title="Institution reports"
        description="Printable operational summary for leadership reviews."
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-10 print:hidden"
            onClick={() => window.print()}
          >
            Print / PDF
          </Button>
        }
      />

      <Card id="institution-report">
        <CardHeader>
          <CardTitle>{profile.name} — operations summary</CardTitle>
          <CardDescription>Generated {generatedAt}</CardDescription>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 text-sm">
            {[
              ["Departments", departments.length],
              ["Courses", courses.length],
              ["Teachers", teachers.length],
              ["Students", students.length],
              ["Classes", classes.length],
              ["Active students", students.filter((s) => s.status === "active").length],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="border-border flex justify-between rounded-xl border px-3 py-2"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-medium">Department roster</h3>
            <ul className="space-y-2 text-sm">
              {departments.map((dept) => (
                <li key={dept.id}>
                  {dept.name} ({dept.code}) — {dept.head} · {dept.studentCount}{" "}
                  students
                </li>
              ))}
            </ul>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function InstitutionNotificationsPage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const notifications = useInstitutionStore((s) => s.notifications);
  const markNotificationRead = useInstitutionStore(
    (s) => s.markNotificationRead,
  );
  const markAllNotificationsRead = useInstitutionStore(
    (s) => s.markAllNotificationsRead,
  );

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading notifications" />
      </div>
    );
  }

  const unread = notifications.filter((item) => !item.read).length;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-8 md:py-10">
      <InstitutionPageHeader
        title="Notification center"
        description={`${unread} unread · ${notifications.length} total`}
        actions={
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={unread === 0}
            onClick={() => markAllNotificationsRead()}
          >
            Mark all read
          </Button>
        }
      />

      <div className="space-y-3">
        {notifications.map((item) => (
          <Card
            key={item.id}
            className={item.read ? "opacity-80" : "ring-ring/40 ring-1"}
          >
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="mt-1">{item.body}</CardDescription>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {item.category} ·{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
                {!item.read ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => markNotificationRead(item.id)}
                  >
                    Mark read
                  </Button>
                ) : null}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
