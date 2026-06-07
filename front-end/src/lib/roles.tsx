import { User, UserCheck, Shield } from "lucide-react";
import type { RoleEnum } from "./type/enum";

export const ROLE_OPTIONS = [
  {
    id: "STUDENT" as RoleEnum,
    title: "Student",
    icon: <User size={16} style={{ color: "#3b82f6" }} />,
  },
  {
    id: "LECTURER" as RoleEnum,
    title: "Lecturer",
    icon: <UserCheck size={16} style={{ color: "#f59e0b" }} />,
  },
  {
    id: "ADMIN" as RoleEnum,
    title: "Administrator",
    icon: <Shield size={16} style={{ color: "#ef4444" }} />,
  },
];
