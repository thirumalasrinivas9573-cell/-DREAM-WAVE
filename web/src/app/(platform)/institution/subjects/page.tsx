import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const SubjectsPage = dynamic(
  () =>
    import("@/components/institution/institution-entities").then((mod) => mod.SubjectsPage),
  { loading: () => <RouteLoading label="Loading subjects" /> },
);

export const metadata: Metadata = {
  title: "Subjects",
  description: "Manage subjects",
};

export default function Page() {
  return <SubjectsPage />;
}
