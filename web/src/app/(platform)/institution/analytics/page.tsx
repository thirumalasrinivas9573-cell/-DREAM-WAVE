import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const AnalyticsCenterPage = dynamic(
  () =>
    import("@/components/institution/analytics/analytics-center-page").then((mod) => mod.AnalyticsCenterPage),
  { loading: () => <RouteLoading label="Loading analytics" /> },
);

export const metadata: Metadata = {
  title: "Analytics",
  description: "Enterprise analytics and decision intelligence center",
};

export default function Page() {
  return <AnalyticsCenterPage />;
}
