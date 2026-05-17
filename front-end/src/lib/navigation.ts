import { BookOpen, House, MessagesSquare } from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
