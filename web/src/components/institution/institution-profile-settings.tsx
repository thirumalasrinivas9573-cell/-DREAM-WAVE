"use client";

import { useEffect, useState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Spinner } from "@/components/common/spinner";
import { EntityForm } from "@/components/institution/entity-form";
import { InstitutionPageHeader } from "@/components/institution/institution-ui";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useInstitutionStore } from "@/store/institution-store";
import type { InstitutionProfile, InstitutionSettings } from "@/types/institution";

export function InstitutionProfilePage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const profile = useInstitutionStore((s) => s.profile);
  const updateProfile = useInstitutionStore((s) => s.updateProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading profile" />
      </div>
    );
  }

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-8 md:py-10">
      <InstitutionPageHeader
        title="Institution profile"
        description="Public and operational identity for your organization."
      />
      {saved ? (
        <AuthAlert
          variant="success"
          title="Profile updated"
          description="Institution profile details were saved locally."
        />
      ) : null}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organization details</CardTitle>
          <div className="mt-4">
            <EntityForm
              initialValues={{
                name: profile.name,
                type: profile.type,
                code: profile.code,
                email: profile.email,
                phone: profile.phone,
                website: profile.website,
                address: profile.address,
                city: profile.city,
                state: profile.state,
                country: profile.country,
                accreditation: profile.accreditation,
                establishedYear: profile.establishedYear,
                description: profile.description,
              }}
              fields={[
                { name: "name", label: "Institution name", required: true },
                {
                  name: "type",
                  label: "Type",
                  type: "select",
                  required: true,
                  options: [
                    { value: "college", label: "College" },
                    { value: "school", label: "School" },
                    { value: "university", label: "University" },
                    { value: "training", label: "Training center" },
                  ],
                },
                { name: "code", label: "Institution code", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "phone", label: "Phone", required: true },
                { name: "website", label: "Website" },
                { name: "address", label: "Address", required: true },
                { name: "city", label: "City", required: true },
                { name: "state", label: "State", required: true },
                { name: "country", label: "Country", required: true },
                { name: "accreditation", label: "Accreditation" },
                { name: "establishedYear", label: "Established year" },
                {
                  name: "description",
                  label: "Description",
                  type: "textarea",
                },
              ]}
              onCancel={() => setSaved(false)}
              onSubmit={(values) => {
                updateProfile(values as unknown as Partial<InstitutionProfile>);
                setSaved(true);
              }}
              submitLabel="Save profile"
            />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function InstitutionSettingsPage() {
  const hydrated = useInstitutionStore((s) => s.hydrated);
  const hydrate = useInstitutionStore((s) => s.hydrate);
  const settings = useInstitutionStore((s) => s.settings);
  const updateSettings = useInstitutionStore((s) => s.updateSettings);
  const resetDemoData = useInstitutionStore((s) => s.resetDemoData);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) hydrate();
  }, [hydrate, hydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner label="Loading settings" />
      </div>
    );
  }

  return (
    <div className="container-app flex flex-1 flex-col gap-6 py-8 md:py-10">
      <InstitutionPageHeader
        title="Organization settings"
        description="Academic year defaults, notifications, and workspace preferences."
      />
      {saved ? (
        <AuthAlert
          variant="success"
          title="Settings saved"
          description="Organization settings were updated."
        />
      ) : null}
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <div className="mt-4">
            <EntityForm
              initialValues={{
                timezone: settings.timezone,
                academicYear: settings.academicYear,
                defaultLanguage: settings.defaultLanguage,
                allowSelfEnrollment: settings.allowSelfEnrollment
                  ? "true"
                  : "false",
                notifyParents: settings.notifyParents ? "true" : "false",
              }}
              fields={[
                { name: "timezone", label: "Timezone", required: true },
                {
                  name: "academicYear",
                  label: "Academic year",
                  required: true,
                },
                {
                  name: "defaultLanguage",
                  label: "Default language",
                  required: true,
                },
                {
                  name: "allowSelfEnrollment",
                  label: "Allow self enrollment",
                  type: "select",
                  options: [
                    { value: "true", label: "Enabled" },
                    { value: "false", label: "Disabled" },
                  ],
                },
                {
                  name: "notifyParents",
                  label: "Notify parents/guardians",
                  type: "select",
                  options: [
                    { value: "true", label: "Enabled" },
                    { value: "false", label: "Disabled" },
                  ],
                },
              ]}
              onCancel={() => setSaved(false)}
              onSubmit={(values) => {
                updateSettings({
                  timezone: values.timezone || settings.timezone,
                  academicYear: values.academicYear || settings.academicYear,
                  defaultLanguage:
                    values.defaultLanguage || settings.defaultLanguage,
                  allowSelfEnrollment: values.allowSelfEnrollment === "true",
                  notifyParents: values.notifyParents === "true",
                } satisfies Partial<InstitutionSettings>);
                setSaved(true);
              }}
              submitLabel="Save settings"
            />
          </div>
        </CardHeader>
      </Card>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Demo data</CardTitle>
          <p className="text-muted-foreground mt-2 text-sm">
            Reset institution records to the seeded demo dataset stored in this
            browser.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-fit"
            onClick={() => setResetOpen(true)}
          >
            Reset demo data
          </Button>
        </CardHeader>
      </Card>
      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset demo data"
        description="Reset all institution demo data to the seeded dataset stored in this browser?"
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          resetDemoData();
          setSaved(false);
        }}
      />
    </div>
  );
}
