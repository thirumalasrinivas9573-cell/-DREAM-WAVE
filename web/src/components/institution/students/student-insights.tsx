"use client";

import {
  Download,
  FileBarChart,
  GraduationCap,
  Printer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useMemo } from "react";

import { RouteLoading } from "@/components/common/route-loading";
import {
  InstitutionBarChart,
  InstitutionDistributionChart,
  InstitutionLineChart,
} from "@/components/institution/institution-dashboard-ui";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useStudentManagementStore } from "@/store/student-management-store";
import type { ManagedStudent } from "@/types/student-management";

function exportStudents(fileName: string, students: ManagedStudent[]) {
  const header = [
    "Student ID",
    "Roll Number",
    "Name",
    "Department",
    "Course",
    "Semester",
    "CGPA",
    "Status",
    "Placement Status",
  ];
  const rows = students.map((student) => [
    student.id,
    student.rollNumber,
    student.fullName,
    student.department,
    student.course,
    student.semester,
    student.cgpa,
    student.status,
    student.placement.status,
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StudentAnalyticsPage() {
  const hydrated = useStudentManagementStore((state) => state.hydrated);
  const hydrate = useStudentManagementStore((state) => state.hydrate);
  const students = useStudentManagementStore((state) => state.students);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const analytics = useMemo(() => {
    const departments = [...new Set(students.map((student) => student.department))];
    const courses = [...new Set(students.map((student) => student.course))];
    const placementLabels = ["Placed", "Interviewing", "Ready", "Preparing"];
    const academicBands = ["9+ CGPA", "8–8.9", "7–7.9", "Below 7"];

    return {
      growthLabels: ["2021", "2022", "2023", "2024", "2025", "2026"],
      growthValues: [1880, 2040, 2220, 2410, 2580, 2740],
      departments,
      departmentValues: departments.map(
        (department) =>
          students.filter((student) => student.department === department).length,
      ),
      courses,
      courseValues: courses.map(
        (course) => students.filter((student) => student.course === course).length,
      ),
      placementLabels,
      placementValues: [
        students.filter((student) => student.placement.status === "placed").length,
        students.filter((student) => student.placement.status === "interviewing")
          .length,
        students.filter(
          (student) => student.placement.status === "placement-ready",
        ).length,
        students.filter((student) => student.placement.status === "preparing")
          .length,
      ],
      academicBands,
      academicValues: [
        students.filter((student) => student.cgpa >= 9).length,
        students.filter((student) => student.cgpa >= 8 && student.cgpa < 9).length,
        students.filter((student) => student.cgpa >= 7 && student.cgpa < 8).length,
        students.filter((student) => student.cgpa < 7).length,
      ],
      graduationValues: [310, 346, 388, 421, 458, 492],
    };
  }, [students]);

  if (!hydrated) return <RouteLoading label="Loading student analytics" />;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-6 sm:py-8">
      <InstitutionPageHeader
        eyebrow="Student Management"
        title="Student Analytics"
        description="Enrollment, academic, placement, and graduation intelligence."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <InstitutionLineChart
          title="Student Growth"
          description="Institution enrollment over six academic years."
          labels={analytics.growthLabels}
          values={analytics.growthValues}
        />
        <InstitutionBarChart
          title="Department Distribution"
          description="Students grouped by academic department."
          labels={analytics.departments}
          values={analytics.departmentValues}
        />
        <InstitutionBarChart
          title="Course Distribution"
          description="Current enrollment across courses."
          labels={analytics.courses}
          values={analytics.courseValues}
        />
        <InstitutionDistributionChart
          title="Placement Status"
          description="Placement pipeline distribution."
          labels={analytics.placementLabels}
          values={analytics.placementValues}
        />
        <InstitutionDistributionChart
          title="Academic Performance"
          description="Students grouped by current CGPA band."
          labels={analytics.academicBands}
          values={analytics.academicValues}
        />
        <InstitutionLineChart
          title="Graduation Trends"
          description="Graduating students across six cohorts."
          labels={analytics.growthLabels}
          values={analytics.graduationValues}
        />
      </div>
    </div>
  );
}

const STUDENT_REPORTS = [
  {
    title: "Students Per Department",
    description: "Department-level student register.",
    icon: Users,
    filter: () => true,
  },
  {
    title: "Semester Distribution",
    description: "Students grouped by current semester.",
    icon: FileBarChart,
    filter: () => true,
  },
  {
    title: "Gender Distribution",
    description: "Student demographic distribution.",
    icon: Users,
    filter: () => true,
  },
  {
    title: "Academic Performance",
    description: "Students requiring academic review.",
    icon: TrendingUp,
    filter: (student: ManagedStudent) => student.cgpa < 7.5 || student.backlogs > 0,
  },
  {
    title: "Placement Readiness",
    description: "Students ready for placement activity.",
    icon: GraduationCap,
    filter: (student: ManagedStudent) => student.placement.readiness >= 70,
  },
  {
    title: "Graduation Statistics",
    description: "Graduated and final-semester students.",
    icon: GraduationCap,
    filter: (student: ManagedStudent) =>
      student.status === "graduated" || student.semester === "Semester 8",
  },
] as const;

export function StudentReportsPage() {
  const hydrated = useStudentManagementStore((state) => state.hydrated);
  const hydrate = useStudentManagementStore((state) => state.hydrate);
  const students = useStudentManagementStore((state) => state.students);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  if (!hydrated) return <RouteLoading label="Loading student reports" />;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-6 sm:py-8">
      <InstitutionPageHeader
        eyebrow="Student Management"
        title="Student Reports"
        description="Generate academic, demographic, placement, and graduation reports."
        actions={
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STUDENT_REPORTS.map((report) => {
          const records = students.filter(report.filter);
          const Icon = report.icon;
          return (
            <Card key={report.title} className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <span className="bg-primary/10 text-primary mb-2 flex size-10 items-center justify-center rounded-xl">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <CardTitle>{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-3xl font-semibold">{records.length}</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() =>
                      exportStudents(
                        `${report.title.toLowerCase().replaceAll(" ", "-")}.csv`,
                        records,
                      )
                    }
                  >
                    <Download aria-hidden="true" />
                    Export Excel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
