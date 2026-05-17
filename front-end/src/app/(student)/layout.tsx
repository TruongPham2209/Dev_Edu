import type { Metadata } from "next";
import { StudentLayout } from "@/components/layout/student-layout";

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Trang học viên với catalog khóa học, lợi ích và lộ trình học.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <StudentLayout>{children}</StudentLayout>;
}
