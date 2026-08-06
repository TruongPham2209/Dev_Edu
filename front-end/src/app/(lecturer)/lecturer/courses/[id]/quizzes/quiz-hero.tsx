"use client";

import { useCourseByIdQuery } from "@/lib/api/courses";
import type { RoleEnum } from "@/lib/type/enum";
import {
  Breadcrumbs,
  Link as MuiLink,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen, ChevronRight, ClipboardList, Home } from "lucide-react";
import Link from "next/link";

interface QuizHeroProps {
  courseId: string;
  quizTitle?: string;
  roleAccess?: RoleEnum;
}

export const QuizHero = ({
  courseId,
  quizTitle,
  roleAccess = "LECTURER",
}: QuizHeroProps) => {
  const { data: course, isLoading } = useCourseByIdQuery(courseId, {
    enabled: !!courseId,
  });

  const courseTitle = course?.title;

  const dashboardPath =
    roleAccess === "ADMIN"
      ? "/admin"
      : roleAccess === "STUDENT"
        ? "/home"
        : "/lecturer";

  const courseDetailPath =
    roleAccess === "ADMIN"
      ? `/admin/courses/${courseId}`
      : roleAccess === "STUDENT"
        ? `/courses/${courseId}/lectures`
        : `/lecturer/courses/${courseId}`;

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Breadcrumbs
        separator={<ChevronRight size={14} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-separator": { mx: 1, color: "text.disabled" },
        }}
      >
        <MuiLink
          component={Link}
          underline="hover"
          href={dashboardPath}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <Home size={14} />
          {roleAccess === "STUDENT" ? "Home" : "Dashboard"}
        </MuiLink>

        <MuiLink
          component={Link}
          underline="hover"
          href={courseDetailPath}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <BookOpen size={14} />
          {isLoading ? (
            <Skeleton width={100} height={20} />
          ) : (
            courseTitle || "Course Detail"
          )}
        </MuiLink>

        {quizTitle && (
          <Typography
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "text.primary",
            }}
          >
            <ClipboardList size={14} />
            {quizTitle}
          </Typography>
        )}
      </Breadcrumbs>
    </Stack>
  );
};
