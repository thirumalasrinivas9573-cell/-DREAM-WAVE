"use client";

import {
  Briefcase,
  Building2,
  Download,
  FileBarChart,
  GraduationCap,
  Printer,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";

import { RouteLoading } from "@/components/common/route-loading";
import { exportCsv } from "@/components/institution/academics/academic-ui";
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
import { usePlacementManagementStore } from "@/store/placement-management-store";

function useHydratedPlacements() {
  const hydrated = usePlacementManagementStore((s) => s.hydrated);
  const hydrate = usePlacementManagementStore((s) => s.hydrate);
  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);
  return hydrated;
}

export function PlacementAnalyticsPage() {
  const hydrated = useHydratedPlacements();
  const recruiters = usePlacementManagementStore((s) => s.recruiters);
  const applications = usePlacementManagementStore((s) => s.applications);
  const offers = usePlacementManagementStore((s) => s.offers);
  const internships = usePlacementManagementStore((s) => s.internships);

  const analytics = useMemo(() => {
    const departments = [...new Set(applications.map((a) => a.department))];
    const placedByDept = departments.map(
      (dept) =>
        applications.filter(
          (a) => a.department === dept && (a.stage === "selected" || a.stage === "offer-accepted"),
        ).length,
    );
    const companies = recruiters.slice(0, 6).map((r) => r.name.split(" ")[0] ?? r.name);
    const companyHiring = recruiters.slice(0, 6).map((r) => r.pastPlacements);
    const acceptedOffers = offers.filter((o) => o.status === "accepted").length;
    const totalOffers = offers.length;
    return {
      years: ["2021", "2022", "2023", "2024", "2025", "2026"],
      placementPct: [72, 78, 81, 85, 88, 91],
      packages: [8, 10, 12, 14, 16, 18],
      departments,
      placedByDept,
      companies,
      companyHiring,
      conversionLabels: ["Internships", "Converted"],
      conversionValues: [internships.length, offers.filter((o) => o.status === "accepted").length],
      offerLabels: ["Accepted", "Released", "Declined", "Expired"],
      offerValues: [
        offers.filter((o) => o.status === "accepted").length,
        offers.filter((o) => o.status === "released").length,
        offers.filter((o) => o.status === "declined").length,
        offers.filter((o) => o.status === "expired").length,
      ],
      acceptanceRate: totalOffers ? Math.round((acceptedOffers / totalOffers) * 100) : 0,
    };
  }, [applications, internships.length, offers, recruiters]);

  if (!hydrated) return <RouteLoading label="Loading placement analytics" />;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-6 sm:py-8">
      <InstitutionPageHeader
        eyebrow="Placement Management"
        title="Placement Analytics"
        description="Placement rate, package trends, department outcomes, and recruiter intelligence."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        <InstitutionLineChart title="Placement %" description="Placement rate across six academic years." labels={analytics.years} values={analytics.placementPct} />
        <InstitutionLineChart title="Average Package (LPA)" description="Average package trend over time." labels={analytics.years} values={analytics.packages} />
        <InstitutionBarChart title="Department-wise Placements" description="Students placed grouped by department." labels={analytics.departments} values={analytics.placedByDept} />
        <InstitutionBarChart title="Company-wise Hiring" description="Historical hiring by leading recruiters." labels={analytics.companies} values={analytics.companyHiring} />
        <InstitutionBarChart title="Internship Conversion" description="Internships versus converted offers." labels={analytics.conversionLabels} values={analytics.conversionValues} />
        <InstitutionDistributionChart title="Offer Acceptance" description="Distribution of offer outcomes." labels={analytics.offerLabels} values={analytics.offerValues} />
      </div>
    </div>
  );
}

export function PlacementReportsPage() {
  const hydrated = useHydratedPlacements();
  const recruiters = usePlacementManagementStore((s) => s.recruiters);
  const internships = usePlacementManagementStore((s) => s.internships);
  const applications = usePlacementManagementStore((s) => s.applications);
  const offers = usePlacementManagementStore((s) => s.offers);

  const companyName = useCallback(
    (id: string) => recruiters.find((r) => r.id === id)?.name ?? "—",
    [recruiters],
  );

  const reports = useMemo(
    () => [
      {
        title: "Placement Reports",
        description: "Placed students with company and package details.",
        icon: GraduationCap,
        count: applications.filter((a) => a.stage === "selected" || a.stage === "offer-accepted").length,
        export: () =>
          exportCsv(
            "placement-report.csv",
            ["Student", "Company", "Role", "Department", "Stage"],
            applications
              .filter((a) => a.stage === "selected" || a.stage === "offer-accepted")
              .map((a) => [a.studentName, companyName(a.companyId), a.role, a.department, a.stage]),
          ),
      },
      {
        title: "Internship Reports",
        description: "Internship listings and open positions.",
        icon: Briefcase,
        count: internships.length,
        export: () =>
          exportCsv(
            "internship-report.csv",
            ["Title", "Company", "Duration", "Mode", "Stipend", "Positions", "Status"],
            internships.map((i) => [i.title, companyName(i.companyId), i.duration, i.workMode, i.stipend, i.openPositions, i.status]),
          ),
      },
      {
        title: "Recruiter Reports",
        description: "Registered recruiters and hiring footprint.",
        icon: Building2,
        count: recruiters.length,
        export: () =>
          exportCsv(
            "recruiter-report.csv",
            ["Company", "Industry", "HR", "Location", "Past Placements", "Status"],
            recruiters.map((r) => [r.name, r.industry, r.hrContact, r.location, r.pastPlacements, r.status]),
          ),
      },
      {
        title: "Department Reports",
        description: "Applications grouped by department.",
        icon: FileBarChart,
        count: new Set(applications.map((a) => a.department)).size,
        export: () =>
          exportCsv(
            "department-placement-report.csv",
            ["Department", "Applications", "Placed"],
            [...new Set(applications.map((a) => a.department))].map((dept) => [
              dept,
              applications.filter((a) => a.department === dept).length,
              applications.filter((a) => a.department === dept && (a.stage === "selected" || a.stage === "offer-accepted")).length,
            ]),
          ),
      },
      {
        title: "Offer Reports",
        description: "Offer letters with acceptance status.",
        icon: FileBarChart,
        count: offers.length,
        export: () =>
          exportCsv(
            "offer-report.csv",
            ["Student", "Company", "Role", "Salary", "Joining", "Status"],
            offers.map((o) => [o.studentName, companyName(o.companyId), o.role, o.salary, o.joiningDate, o.status]),
          ),
      },
      {
        title: "Student Placement Reports",
        description: "Complete student application pipeline.",
        icon: Users,
        count: applications.length,
        export: () =>
          exportCsv(
            "student-placement-report.csv",
            ["Student", "Company", "Role", "Type", "Department", "CGPA", "Stage"],
            applications.map((a) => [a.studentName, companyName(a.companyId), a.role, a.type, a.department, a.cgpa, a.stage]),
          ),
      },
    ],
    [applications, companyName, internships, offers, recruiters],
  );

  if (!hydrated) return <RouteLoading label="Loading placement reports" />;

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-6 sm:py-8">
      <InstitutionPageHeader
        eyebrow="Placement Management"
        title="Placement Reports"
        description="Generate placement, internship, recruiter, department, and offer reports."
        actions={
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => {
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
                <p className="mb-4 text-3xl font-semibold">{report.count}</p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={report.export}>
                    <Download aria-hidden="true" />
                    Export Excel
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => window.print()}>
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
