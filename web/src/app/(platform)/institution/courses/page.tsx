import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { RouteLoading } from "@/components/common/route-loading";

const CoursesPage = dynamic(
  () =>
    import("@/components/institution/institution-entities").then((mod) => mod.CoursesPage),
  { loading: () => <RouteLoading label="Loading courses" /> },
);

export const metadata: Metadata = {
  title: "Courses",
  description: "Manage courses",
};

export default function Page() {
  return <CoursesPage />;
}
