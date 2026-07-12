import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const InstitutionReportsPage = dynamic(
  () =>
    import("@/components/institution/institution-insights").then((mod) => mod.InstitutionReportsPage),
  { loading: () => <RouteLoading label="Loading reports" /> },
);

export const metadata: Metadata = {
  title: "Institution Reports",
  description: "Institution reports",
};

export default function Page() {
  return <InstitutionReportsPage />;
}
