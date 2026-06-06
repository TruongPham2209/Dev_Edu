import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
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
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Forum", href: "/forum", icon: MessagesSquare },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Forum", href: "/admin/posts", icon: MessagesSquare },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Discounts", href: "/admin/discounts", icon: Percent },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
