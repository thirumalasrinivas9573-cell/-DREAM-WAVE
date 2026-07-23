"use client";

import { useEffect, useMemo } from "react";

import { AiPageHeader } from "@/components/ai/ai-shared";
import { CareerIntelNav } from "@/components/ai/career/career-nav";
import { Spinner } from "@/components/common/spinner";
import {
  MiniBarChart,
  ProgressBar,
  SmartStatCard,
} from "@/components/dashboard/dashboard-ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareerIntelStore } from "@/store/career-intel-store";

export function CareerAnalyticsPage() {
  const hydrate = useCareerIntelStore((s) => s.hydrate);
  const hydrated = useCareerIntelStore((s) => s.hydrated);
  const readinessScore = useCareerIntelStore((s) => s.readinessScore);
  const interviewReadiness = useCareerIntelStore((s) => s.interviewReadiness);
  const placementReadiness = useCareerIntelStore((s) => s.placementReadiness);
  const growthSeries = useCareerIntelStore((s) => s.growthSeries);
  const goals = useCareerIntelStore((s) => s.goals);
  const interviews = useCareerIntelStore((s) => s.interviews);
  const jobs = useCareerIntelStore((s) => s.jobs);
  const resumeVersions = useCareerIntelStore((s) => s.resumeVersions);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const goalCompletion = useMemo(() => {
    if (!goals.length) return 0;
    return Math.round(
      (goals.filter((goal) => goal.done).length / goals.length) * 100,
    );
  }, [goals]);

  const appliedCount = jobs.filter((job) => job.status === "applied").length;
  const latestResume = resumeVersions[0];

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading career analytics" />
      </div>
    );
  }

  return (
    <div className="container-app page-stack flex flex-1 flex-col py-8 md:py-10">
      <AiPageHeader
        title="Career analytics"
        description="Growth charts, placement readiness, interview readiness, and goal completion."
      />
      <CareerIntelNav />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SmartStatCard
          label="Career growth"
          value={`${readinessScore}%`}
          trend="+6%"
        />
        <SmartStatCard
          label="Placement readiness"
          value={`${placementReadiness}%`}
          hint={`${appliedCount} applied`}
        />
        <SmartStatCard
          label="Interview readiness"
          value={`${interviewReadiness}%`}
          hint={`${interviews.length} sessions`}
        />
        <SmartStatCard
          label="Goal completion"
          value={`${goalCompletion}%`}
          hint={`${goals.filter((g) => g.done).length}/${goals.length} done`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Career growth chart</CardTitle>
            <CardDescription>Readiness score by week.</CardDescription>
          </CardHeader>
          <CardContent>
            <MiniBarChart
              values={growthSeries}
              labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7"]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning & placement progress</CardTitle>
            <CardDescription>
              Combined readiness across career dimensions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressBar value={readinessScore} label="Overall readiness" />
            <ProgressBar value={interviewReadiness} label="Interview readiness" />
            <ProgressBar value={placementReadiness} label="Placement readiness" />
            <ProgressBar value={goalCompletion} label="Goal completion" />
            <ProgressBar
              value={latestResume?.score ?? 0}
              label="Latest resume score"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
