import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const InstitutionHomePage = dynamic(
  () =>
    import("@/components/institution/institution-home").then((mod) => mod.InstitutionHomePage),
  { loading: () => <RouteLoading label="Loading institution" /> },
);

export const metadata: Metadata = {
  title: "Institution Home",
  description: "Institution platform home",
};

export default function Page() {
  return <InstitutionHomePage />;
}
