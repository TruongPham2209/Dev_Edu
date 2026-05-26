import type { RoleEnum } from "@/lib/api/types";
import { Shield, User, UserCheck } from "lucide-react";

export const ROLE_OPTIONS = [
  {
    id: "STUDENT" as RoleEnum,
    title: "Học viên (Student)",
    icon: <User size={16} style={{ color: "#3b82f6" }} />,
  },
  {
    id: "LECTURER" as RoleEnum,
    title: "Giảng viên (Lecturer)",
    icon: <UserCheck size={16} style={{ color: "#f59e0b" }} />,
  },
  {
    id: "ADMIN" as RoleEnum,
    title: "Quản trị viên (Admin)",
    icon: <Shield size={16} style={{ color: "#ef4444" }} />,
  },
];
