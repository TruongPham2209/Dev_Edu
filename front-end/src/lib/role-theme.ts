export type RoleKey = "student" | "lecturer" | "admin";

export type RoleTheme = {
  brand: string;
  roleLabel: string;
  description: string;
  accent: string;
  accentSoft: string;
  background: string;
  glow: string;
  chips: string[];
  navItems: Array<{
    label: string;
    href: string;
  }>;
};

export const roleThemes: Record<RoleKey, RoleTheme> = {
  student: {
    brand: "SkillForge",
    roleLabel: "Student portal",
    description:
      "Khám phá khóa học, mentor và lộ trình học tập theo mục tiêu nghề nghiệp.",
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    background:
      "linear-gradient(180deg, var(--bg-linear-1, #f8fafc) 0%, var(--bg-linear-2, #f1f5f9) 48%, var(--bg-linear-3, #f8fafc) 100%)",
    glow: "radial-gradient(circle at top left, var(--bg-radial-1, rgba(37, 99, 235, 0.12)), transparent 40%), radial-gradient(circle at top right, var(--bg-radial-2, rgba(124, 58, 237, 0.1)), transparent 35%)",
    chips: ["Live cohorts", "Project-based learning", "Career support"],
    navItems: [
      { label: "Home", href: "/home" },
      { label: "Courses", href: "/courses" },
      { label: "Forum", href: "/forum" },
    ],
  },
  lecturer: {
    brand: "SkillForge Studio",
    roleLabel: "Lecturer studio",
    description:
      "Quản lý bài giảng, lịch dạy và tiến độ lớp học từ một không gian tập trung.",
    accent: "#7c3aed",
    accentSoft: "rgba(124, 58, 237, 0.12)",
    background:
      "linear-gradient(180deg, var(--bg-linear-1, #f8fafc) 0%, var(--bg-linear-2, #f1f5f9) 48%, var(--bg-linear-3, #f8fafc) 100%)",
    glow: "radial-gradient(circle at top left, var(--bg-radial-2, rgba(124, 58, 237, 0.12)), transparent 40%), radial-gradient(circle at top right, var(--bg-radial-1, rgba(37, 99, 235, 0.1)), transparent 35%)",
    chips: ["Lesson pipeline", "Live sessions", "Student progress"],
    navItems: [],
  },
  admin: {
    brand: "SkillForge Control",
    roleLabel: "Admin console",
    description:
      "Theo dõi doanh thu, kiểm duyệt nội dung và sức khỏe hệ thống đào tạo.",
    accent: "#2563eb",
    accentSoft: "rgba(37, 99, 235, 0.12)",
    background:
      "linear-gradient(180deg, var(--bg-linear-1, #f8fafc) 0%, var(--bg-linear-2, #f1f5f9) 50%, var(--bg-linear-3, #f8fafc) 100%)",
    glow: "radial-gradient(circle at top left, var(--bg-radial-1, rgba(37, 99, 235, 0.12)), transparent 40%), radial-gradient(circle at top right, var(--bg-radial-2, rgba(124, 58, 237, 0.1)), transparent 35%)",
    chips: ["Revenue watch", "Moderation queue", "Governance"],
    navItems: [
      { label: "Dashboard", href: "/admin" },
      { label: "Categories", href: "/admin/categories" },
      { label: "Courses", href: "/admin/courses" },
    ],
  },
};
