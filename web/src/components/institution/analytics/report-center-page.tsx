"use client";

import {
  BookOpen,
  Briefcase,
  Building2,
  FileBarChart,
  FlaskConical,
  GraduationCap,
  Landmark,
  type LucideIcon,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { RouteLoading } from "@/components/common/route-loading";
import { exportCsv } from "@/components/institution/academics/academic-ui";
import { ExportBar } from "@/components/institution/analytics/analytics-ui";
import { useInstitutionAnalytics } from "@/components/institution/analytics/use-institution-analytics";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { EntityFilterSelect } from "@/components/institution/shared/entity-toolbar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { INSTITUTION_ROUTES } from "@/constants/institution";

type ReportDef = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: LucideIcon;
  ready?: boolean;
  build: (data: ReturnType<typeof useInstitutionAnalytics>["data"]) => {
    header: string[];
    rows: Array<Array<string | number>>;
  };
};

const REPORTS: ReportDef[] = [
  {
    id: "admissions",
    title: "Admissions Report",
    description: "Application funnel, acceptance and enrollment metrics.",
    category: "Admissions",
    icon: UserCheck,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Total Applications", data.counts.applications],
        ["Approved", data.admission.approved],
        ["Rejected", data.admission.rejected],
        ["Enrolled", data.admission.enrolled],
        ["Acceptance Rate %", data.admission.acceptanceRate],
        ["Enrollment Rate %", data.admission.enrollmentRate],
      ],
    }),
  },
  {
    id: "students",
    title: "Students Report",
    description: "Enrollment distribution and academic performance.",
    category: "Students",
    icon: Users,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Total Students", data.counts.students],
        ["Average CGPA", data.student.avgCgpa],
        ["Average Attendance %", data.student.avgAttendance],
        ["Graduation Rate %", data.student.graduationRate],
        ["Dropout Rate %", data.student.dropoutRate],
      ],
    }),
  },
  {
    id: "faculty",
    title: "Faculty Report",
    description: "Faculty strength, qualifications and research output.",
    category: "Faculty",
    icon: GraduationCap,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Total Faculty", data.counts.faculty],
        ["Teaching", data.faculty.teaching],
        ["Non-teaching", data.faculty.nonTeaching],
        ["Research Papers", data.research.researchPapers],
        ["Publications", data.research.publications],
      ],
    }),
  },
  {
    id: "academic",
    title: "Academic Report",
    description: "Departments, programs, courses and curriculum coverage.",
    category: "Academic",
    icon: BookOpen,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Departments", data.counts.departments],
        ["Programs", data.counts.programs],
        ["Active Courses", data.counts.courses],
        ["Subjects", data.counts.subjects],
      ],
    }),
  },
  {
    id: "placement",
    title: "Placement Report",
    description: "Placement rate, packages and recruiter engagement.",
    category: "Placement",
    icon: Briefcase,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Placement Rate %", data.placement.placementRate],
        ["Placed Students", data.placement.placedStudents],
        ["Highest Package", data.placement.highestPackage],
        ["Average Package", data.placement.avgPackage],
        ["Offer Acceptance %", data.placement.offerAcceptance],
        ["Recruiters", data.counts.recruiters],
      ],
    }),
  },
  {
    id: "research",
    title: "Research Report",
    description: "Publications, patents, projects and grants.",
    category: "Research",
    icon: FlaskConical,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Research Papers", data.research.researchPapers],
        ["Publications", data.research.publications],
        ["Patents", data.research.patents],
        ["Projects", data.research.projects],
      ],
    }),
  },
  {
    id: "financial",
    title: "Financial Report",
    description: "Fee collection, expenditure and grants overview.",
    category: "Finance",
    icon: Landmark,
    ready: true,
    build: () => ({
      header: ["Metric", "Value"],
      rows: [
        ["Status", "Architecture ready"],
        ["Fee Collection", "Pending integration"],
        ["Expenditure", "Pending integration"],
      ],
    }),
  },
  {
    id: "summary",
    title: "Institution Summary",
    description: "Consolidated executive summary across all modules.",
    category: "Executive",
    icon: Building2,
    build: (data) => ({
      header: ["Metric", "Value"],
      rows: [
        ["Health Score", data.scores.health],
        ["Total Students", data.counts.students],
        ["Faculty", data.counts.faculty],
        ["Departments", data.counts.departments],
        ["Placement Rate %", data.placement.placementRate],
        ["Publications", data.research.publications],
      ],
    }),
  },
];

const CATEGORIES = [...new Set(REPORTS.map((report) => report.category))];

export function ReportCenterPage() {
  const { hydrated, data } = useInstitutionAnalytics();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return REPORTS.filter((report) => {
      const matchesQuery =
        !query ||
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query);
      const matchesCategory = !category || report.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [category, search]);

  if (!hydrated) {
    return <RouteLoading label="Loading reports" />;
  }

  const handleExport = (report: ReportDef) => {
    const { header, rows } = report.build(data);
    exportCsv(`${report.id}-report.csv`, header, rows);
  };

  return (
    <div className="space-y-8">
      <InstitutionPageHeader
        eyebrow="Decision intelligence"
        title="Report Center"
        description="Generate, export and share institution-wide reports across every module."
        actions={
          <Link href={INSTITUTION_ROUTES.analytics} className={buttonVariants({ variant: "outline" })}>
            Analytics Center
          </Link>
        }
      />

      <Card className="bg-card/80 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden="true" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-11 pl-9"
              placeholder="Search reports…"
              aria-label="Search reports"
            />
          </div>
          <div className="sm:w-56">
            <EntityFilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={CATEGORIES.map((value) => ({ value, label: value }))}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-sm" aria-live="polite">
        {filtered.length} report{filtered.length === 1 ? "" : "s"} available
      </p>

      {filtered.length === 0 ? (
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <FileBarChart className="text-muted-foreground size-10" aria-hidden="true" />
            <p className="font-medium">No reports match your search</p>
            <p className="text-muted-foreground text-sm">Adjust the search term or category filter.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => {
            const Icon = report.icon;
            return (
              <Card key={report.id} className="bg-card/80 flex flex-col backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <Badge variant="muted">{report.category}</Badge>
                  </div>
                  <CardTitle className="mt-2 text-base">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                  {report.ready ? (
                    <Badge variant="outline" className="mt-2 w-fit">
                      Architecture ready
                    </Badge>
                  ) : null}
                </CardHeader>
                <CardContent className="mt-auto">
                  <ExportBar
                    onExportCsv={() => handleExport(report)}
                    onPrint={() => window.print()}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
