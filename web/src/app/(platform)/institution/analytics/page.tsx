import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const InstitutionAnalyticsPage = dynamic(
  () =>
    import("@/components/institution/institution-insights").then((mod) => mod.InstitutionAnalyticsPage),
  { loading: () => <RouteLoading label="Loading analytics" /> },
);

export const metadata: Metadata = {
  title: "Analytics",
  description: "Institution analytics",
};

export default function Page() {
  return <InstitutionAnalyticsPage />;
}
