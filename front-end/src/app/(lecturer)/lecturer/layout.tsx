import type { Metadata } from "next";
import { LecturerLayout } from "@/components/layout/lecturer/page";

export const metadata: Metadata = {
  title: "Lecturer Studio",
  description:
    "Không gian dành cho giảng viên quản lý lớp học và nội dung giảng dạy.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <LecturerLayout>{children}</LecturerLayout>;
}
