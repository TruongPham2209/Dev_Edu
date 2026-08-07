import { StudentLayout } from "@/components/layout/web-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description:
    "Student Dashboard with course catalog, benefits, and learning path.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StudentLayout>{children}</StudentLayout>;
}
