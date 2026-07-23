"use client";

import type { ReactNode } from "react";

import { InstitutionGate } from "@/components/institution/institution-gate";
import { InstitutionShell } from "@/components/institution/institution-shell";

type InstitutionLayoutProps = {
  children: ReactNode;
};

export default function InstitutionSectionLayout({
  children,
}: InstitutionLayoutProps) {
  return (
    <InstitutionGate>
      <InstitutionShell>{children}</InstitutionShell>
    </InstitutionGate>
  );
}
