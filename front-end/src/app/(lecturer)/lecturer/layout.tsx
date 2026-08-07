import type { Metadata } from "next";
import { LecturerLayout } from "@/components/layout/lecturer-layout";

export const metadata: Metadata = {
  title: "Lecturer Studio",
  description:
    "Lecturer Studio for managing course content and student assignments.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LecturerLayout>{children}</LecturerLayout>;
}
