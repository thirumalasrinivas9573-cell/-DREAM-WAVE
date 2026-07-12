"use client";

import type { ReactNode } from "react";

import { InstitutionGate } from "@/components/institution/institution-gate";

type InstitutionLayoutProps = {
  children: ReactNode;
};

export default function InstitutionSectionLayout({
  children,
}: InstitutionLayoutProps) {
  return <InstitutionGate>{children}</InstitutionGate>;
}
