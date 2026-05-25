import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin/page";

export const metadata: Metadata = {
  title: "Admin Console",
  description:
    "Bảng điều khiển cho quản trị hệ thống, kiểm duyệt và doanh thu.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayout>{children}</AdminLayout>;
}
