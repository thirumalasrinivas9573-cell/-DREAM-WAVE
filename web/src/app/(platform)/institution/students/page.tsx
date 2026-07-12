import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const StudentsPage = dynamic(
  () =>
    import("@/components/institution/institution-entities").then((mod) => mod.StudentsPage),
  { loading: () => <RouteLoading label="Loading students" /> },
);

export const metadata: Metadata = {
  title: "Students",
  description: "Manage students",
};

export default function Page() {
  return <StudentsPage />;
}
