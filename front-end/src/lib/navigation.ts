import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  ClipboardList,
  Compass,
  GraduationCap,
  House,
  LayoutDashboard,
  MessagesSquare,
  Percent,
  Settings,
  Tags,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const studentNavItems: NavItem[] = [
  { label: "Home", href: "/home", icon: House },
  { label: "Explore", href: "/courses", icon: Compass },
  { label: "My Courses", href: "/my-courses", icon: GraduationCap },
  { label: "Forum", href: "/forum", icon: MessagesSquare },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Forum", href: "/admin/posts", icon: MessagesSquare },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Quizzes", href: "/admin/quizzes", icon: ClipboardList },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Percent },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
