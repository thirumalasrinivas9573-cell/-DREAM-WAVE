import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const DepartmentsPage = dynamic(
  () =>
    import("@/components/institution/institution-entities").then((mod) => mod.DepartmentsPage),
  { loading: () => <RouteLoading label="Loading departments" /> },
);

export const metadata: Metadata = {
  title: "Departments",
  description: "Manage departments",
};

export default function Page() {
  return <DepartmentsPage />;
}
