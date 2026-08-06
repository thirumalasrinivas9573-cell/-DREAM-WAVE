"use client";

import Link from "next/link";
import { useEffect } from "react";

import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { PartnershipMetricGrid } from "@/components/institution/partnerships/partnership-ui";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { COMPANY_ROUTES } from "@/constants/partnership";
import { usePartnershipStore } from "@/store/partnership-store";
import { useRecruitmentStore } from "@/store/recruitment-store";

export function CompanyPortalDashboard() {
  const { token, user } = useAuth();
  const stats = usePartnershipStore((s) => s.stats);
  const fetchStats = usePartnershipStore((s) => s.fetchStats);
  const partnerships = usePartnershipStore((s) => s.partnerships);
  const fetchPartnerships = usePartnershipStore((s) => s.fetchPartnerships);
  const atsStats = useRecruitmentStore((s) => s.stats);
  const fetchAtsStats = useRecruitmentStore((s) => s.fetchOverview);

  useEffect(() => {
    if (!token) return;
    void fetchStats(token);
    void fetchPartnerships(token, { requestStatus: "pending" });
    void fetchAtsStats(token);
  }, [token, fetchStats, fetchPartnerships, fetchAtsStats]);

  const pendingCount = partnerships.filter((p) => p.requestStatus === "pending").length;

  return (
    <div className="space-y-8">
      <InstitutionPageHeader
        eyebrow="Company platform"
        title="Company Dashboard"
        description={`Hiring pipeline and institution partnerships for ${user?.organizationName || "your organization"}.`}
        actions={
          <Link href={COMPANY_ROUTES.institutionNetwork} className={buttonVariants()}>
            Institution Network
          </Link>
        }
      />

      {stats ? (
        <section aria-label="Partnership overview">
          <PartnershipMetricGrid stats={stats} variant="company" />
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recruitment alerts</CardTitle>
          <CardDescription>
            {atsStats
              ? `${atsStats.newApplicants} new applicant(s) · ${atsStats.interviewsToday} interview(s) today · ${atsStats.offersPending} offer(s) pending`
              : "Loading recruitment metrics…"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={COMPANY_ROUTES.recruitment} className={buttonVariants({ variant: "outline" })}>
            Open Applicant Tracking
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partnership alerts</CardTitle>
          <CardDescription>
            {pendingCount
              ? `${pendingCount} pending institution request(s) need review.`
              : "No pending partnership requests."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={COMPANY_ROUTES.institutionNetwork} className={buttonVariants({ variant: "outline" })}>
            Open Institution Network
          </Link>
        </CardContent>
      </Card>

      <CompanyDashboard {...(user?.organizationName ? { org: user.organizationName } : {})} />
    </div>
  );
}
