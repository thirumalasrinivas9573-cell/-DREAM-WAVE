"use client";

import { useEffect, useMemo, useState } from "react";

import { AiPageHeader } from "@/components/ai/ai-shared";
import { CareerIntelNav } from "@/components/ai/career/career-nav";
import { EmptyState } from "@/components/common/empty-state";
import { Spinner } from "@/components/common/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCareerIntelStore } from "@/store/career-intel-store";
import type { CareerJobStatus } from "@/types/career-intelligence";

export function CareerJobsPage() {
  const hydrate = useCareerIntelStore((s) => s.hydrate);
  const hydrated = useCareerIntelStore((s) => s.hydrated);
  const jobs = useCareerIntelStore((s) => s.jobs);
  const setJobStatus = useCareerIntelStore((s) => s.setJobStatus);
  const [filter, setFilter] = useState<"all" | CareerJobStatus | "internship">(
    "all",
  );

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (filter === "all") return true;
      if (filter === "internship") return job.type === "internship";
      return job.status === filter;
    });
  }, [filter, jobs]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading job matches" />
      </div>
    );
  }

  return (
    <div className="container-app page-stack flex flex-1 flex-col py-8 md:py-10">
      <AiPageHeader
        title="Job matching"
        description="Recommended jobs, internships, company matches, and application tracking."
      />
      <CareerIntelNav />

      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: "all", label: "All" },
            { id: "recommended", label: "Recommended" },
            { id: "internship", label: "Internships" },
            { id: "saved", label: "Saved" },
            { id: "applied", label: "Applied" },
          ] as const
        ).map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={filter === item.id ? "default" : "outline"}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No matching roles"
          description="Adjust filters or save roles from recommendations."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((job) => (
            <Card
              key={job.id}
              className="transition-transform hover:-translate-y-0.5"
            >
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{job.title}</CardTitle>
                    <CardDescription>
                      {job.company} · {job.location}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{job.matchScore}% match</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>{job.type}</Badge>
                  <Badge
                    variant={
                      job.eligibility === "eligible" ? "default" : "secondary"
                    }
                  >
                    {job.eligibility}
                  </Badge>
                  {job.salary ? (
                    <Badge variant="outline">{job.salary}</Badge>
                  ) : null}
                </div>
                <p className="text-muted-foreground text-xs">
                  Skills: {job.skills.join(", ")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setJobStatus(job.id, "saved")}
                    disabled={job.status === "saved"}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setJobStatus(job.id, "applied")}
                    disabled={job.status === "applied"}
                  >
                    Mark applied
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
