import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin/page";

export const metadata: Metadata = {
  title: "Admin Console",
  description:
    "Admin console for system management, course approval, and revenue tracking.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayout>{children}</AdminLayout>;
}
