"use client";

import { useCourseByIdQuery } from "@/lib/api/courses";
import type { RoleEnum } from "@/lib/type/enum";
import {
  Box,
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
        separator={<ChevronRight size={14} style={{ flexShrink: 0 }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "center",
            flexWrap: "nowrap",
            overflow: "hidden",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "center",
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            fontWeight: 500,
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.5, sm: 1 },
            color: "text.disabled",
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          },
        }}
      >
        <MuiLink
          component={Link}
          underline="hover"
          href={dashboardPath}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.4,
            flexShrink: 0,
            "&:hover": { color: "primary.main" },
          }}
        >
          <Home size={14} style={{ flexShrink: 0 }} />
          <span className="hidden sm:inline">
            {roleAccess === "STUDENT" ? "Home" : "Dashboard"}
          </span>
        </MuiLink>

        <MuiLink
          component={Link}
          underline="hover"
          href={courseDetailPath}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.4,
            minWidth: 0,
            "&:hover": { color: "primary.main" },
          }}
        >
          <BookOpen size={14} style={{ flexShrink: 0 }} />
          {isLoading ? (
            <Skeleton width={80} height={20} />
          ) : (
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.85rem" },
                fontWeight: 500,
                lineHeight: 1.4,
                color: "inherit",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: 130, sm: 260 },
                display: "inline-block",
              }}
              title={courseTitle || "Course Detail"}
            >
              {courseTitle || "Course Detail"}
            </Typography>
          )}
        </MuiLink>

        {quizTitle && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "text.primary",
              minWidth: 0,
            }}
          >
            <ClipboardList size={14} style={{ flexShrink: 0 }} />
            <Typography
              component="span"
              sx={{
                fontSize: { xs: "0.8rem", sm: "0.85rem" },
                fontWeight: 600,
                lineHeight: 1.4,
                color: "text.primary",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: { xs: 140, sm: 280, md: "none" },
                display: "inline-block",
              }}
              title={quizTitle}
            >
              {quizTitle}
            </Typography>
          </Box>
        )}
      </Breadcrumbs>
    </Stack>
  );
};
