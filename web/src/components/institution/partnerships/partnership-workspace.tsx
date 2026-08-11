"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { RouteLoading } from "@/components/common/route-loading";
import { ActivityTimeline } from "@/components/dashboard/dashboard-ui";
import { PartnershipRespondDialog } from "@/components/institution/partnerships/partnership-dialogs";
import {
  OrgLogo,
  PartnershipStatusBadge,
  resolveOrgFromPartnership,
} from "@/components/institution/partnerships/partnership-ui";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DOCUMENT_TYPES } from "@/types/partnership";
import { usePartnershipStore } from "@/store/partnership-store";

const WORKSPACE_TABS = [
  "Overview",
  "Recruitment",
  "Internships",
  "Campus Drives",
  "Events",
  "Projects",
  "Documents",
  "Communication",
  "Activity",
] as const;

type PartnershipWorkspaceProps = {
  partnershipId: string;
  portal: "institution" | "company";
  backHref: string;
};

export function PartnershipWorkspace({
  partnershipId,
  portal,
  backHref,
}: PartnershipWorkspaceProps) {
  const { token } = useAuth();
  const fetchPartnership = usePartnershipStore((s) => s.fetchPartnership);
  const addDocument = usePartnershipStore((s) => s.addDocument);
  const clearCurrent = usePartnershipStore((s) => s.clearCurrent);
  const loading = usePartnershipStore((s) => s.loading);
  const error = usePartnershipStore((s) => s.error);
  const partnership = usePartnershipStore((s) => s.currentPartnership);
  const activity = usePartnershipStore((s) => s.activity);
  const documents = usePartnershipStore((s) => s.documents);

  const [tab, setTab] = useState<(typeof WORKSPACE_TABS)[number]>("Overview");
  const [respondAction, setRespondAction] = useState<
    "accept" | "decline" | "info_requested" | null
  >(null);
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState<string>("MoU");
  const [docUrl, setDocUrl] = useState("");

  useEffect(() => {
    if (token) void fetchPartnership(token, partnershipId);
    return () => clearCurrent();
  }, [token, partnershipId, fetchPartnership, clearCurrent]);

  if (!token) return <RouteLoading label="Authenticating" />;
  if (loading && !partnership) return <RouteLoading label="Loading partnership" />;

  if (error || !partnership) {
    return (
      <EmptyState
        title="Partnership unavailable"
        description={error || "This partnership could not be loaded."}
        action={
          <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
            Go back
          </Link>
        }
      />
    );
  }

  const counterparty =
    portal === "institution"
      ? resolveOrgFromPartnership(partnership, "company")
      : resolveOrgFromPartnership(partnership, "institution");

  const canRespond =
    partnership.requestStatus === "pending" &&
    partnership.initiatedBy !== portal;

  return (
    <div className="space-y-8">
      <InstitutionPageHeader
        eyebrow="Partnership workspace"
        title={counterparty.name}
        description={`${partnership.relationshipType} · ${partnership.status}`}
        actions={
          <Link href={backHref} className={buttonVariants({ variant: "outline" })}>
            Back to network
          </Link>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <OrgLogo
          name={counterparty.name}
          {...(counterparty.logoUrl ? { logoUrl: counterparty.logoUrl } : {})}
        />
        <div className="flex flex-wrap gap-2">
          <PartnershipStatusBadge status={partnership.status} />
          <Badge variant="outline">{partnership.relationshipType}</Badge>
        </div>
        {canRespond ? (
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            <Button size="sm" onClick={() => setRespondAction("accept")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={() => setRespondAction("info_requested")}>
              Request info
            </Button>
            <Button size="sm" variant="destructive" onClick={() => setRespondAction("decline")}>
              Decline
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
        {WORKSPACE_TABS.map((item) => (
          <Button
            key={item}
            size="sm"
            variant={tab === item ? "default" : "outline"}
            onClick={() => setTab(item)}
          >
            {item}
          </Button>
        ))}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Partnership overview</CardTitle>
              <CardDescription>Key details and objectives</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Created:</span>{" "}
                {new Date(partnership.createdAt).toLocaleDateString()}
              </p>
              {partnership.startDate ? (
                <p>
                  <span className="text-muted-foreground">Start date:</span>{" "}
                  {new Date(partnership.startDate).toLocaleDateString()}
                </p>
              ) : null}
              {partnership.expectedDuration ? (
                <p>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  {partnership.expectedDuration}
                </p>
              ) : null}
              {partnership.contactPerson?.name ? (
                <p>
                  <span className="text-muted-foreground">Primary contact:</span>{" "}
                  {partnership.contactPerson.name}
                  {partnership.contactPerson.email
                    ? ` (${partnership.contactPerson.email})`
                    : ""}
                </p>
              ) : null}
              {partnership.objectives ? (
                <p>
                  <span className="text-muted-foreground">Objectives:</span>{" "}
                  {partnership.objectives}
                </p>
              ) : null}
              {partnership.description || partnership.message ? (
                <p>{partnership.description || partnership.message}</p>
              ) : null}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activity.length ? (
                <ActivityTimeline
                  items={activity.slice(0, 5).map((item) => ({
                    id: item._id,
                    title: item.title,
                    time: new Date(item.createdAt).toLocaleString(),
                    detail: item.description || "",
                  }))}
                />
              ) : (
                <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {["Recruitment", "Internships", "Campus Drives", "Events", "Projects"].includes(tab) ? (
        <Card>
          <CardHeader>
            <CardTitle>{tab}</CardTitle>
            <CardDescription>
              Foundation ready for Prompt 2 integration with existing placement modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2 text-sm">
            <p>
              This section will connect to existing{" "}
              {tab === "Recruitment" || tab === "Campus Drives"
                ? "placement drives and job listings"
                : tab === "Internships"
                  ? "internship listings"
                  : tab === "Events"
                    ? "campus events"
                    : "collaboration projects"}{" "}
              shared between {counterparty.name} and your organization.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="secondary">Linked IDs reserved</Badge>
              <Badge variant="outline">Version 2 Prompt 2</Badge>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {tab === "Documents" ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MoU & agreements</CardTitle>
              <CardDescription>
                Private documents visible only to authorized partnership members.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.length ? (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc._id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {doc.type} · {doc.uploadedByRole} ·{" "}
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={buttonVariants({ size: "sm", variant: "outline" })}
                        >
                          View
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  title="No documents yet"
                  description="Upload MoUs, agreements, or NDAs for this partnership."
                  titleAs="h3"
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="docName">Document name</Label>
                  <Input id="docName" value={docName} onChange={(e) => setDocName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docType">Type</Label>
                  <select
                    id="docType"
                    className="form-control w-full"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="docUrl">File URL (metadata)</Label>
                  <Input id="docUrl" value={docUrl} onChange={(e) => setDocUrl(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!docName || !token) return;
                  void addDocument(token, partnershipId, {
                    name: docName,
                    type: docType,
                    fileUrl: docUrl,
                  }).then(() => {
                    setDocName("");
                    setDocUrl("");
                  });
                }}
              >
                Add document
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {tab === "Communication" ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="size-4" aria-hidden="true" />
              Communication
            </CardTitle>
            <CardDescription>
              Messaging architecture placeholder — real-time messaging belongs to a later prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Contact {partnership.contactPerson?.name || counterparty.name} via{" "}
            {partnership.contactPerson?.email || "organization channels"}. Structured messaging
            will integrate here in a future release.
          </CardContent>
        </Card>
      ) : null}

      {tab === "Activity" ? (
        <Card>
          <CardHeader>
            <CardTitle>Activity timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length ? (
              <ActivityTimeline
                items={activity.map((item) => ({
                  id: item._id,
                  title: item.title,
                  time: new Date(item.createdAt).toLocaleString(),
                  detail: item.description || "",
                }))}
              />
            ) : (
              <EmptyState title="No activity yet" description="Partnership events will appear here." titleAs="h3" />
            )}
          </CardContent>
        </Card>
      ) : null}

      {respondAction && token ? (
        <PartnershipRespondDialog
          open={Boolean(respondAction)}
          onOpenChange={(open) => !open && setRespondAction(null)}
          token={token}
          partnershipId={partnershipId}
          action={respondAction}
        />
      ) : null}
    </div>
  );
}
