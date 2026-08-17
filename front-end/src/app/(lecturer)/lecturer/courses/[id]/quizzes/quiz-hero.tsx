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
        separator={<ChevronRight size={14} style={{ flexShrink: 0, marginTop: 3 }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "flex-start",
            flexWrap: "wrap",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "flex-start",
          },
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.75, sm: 1 },
            mt: "3px",
            color: "text.disabled",
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
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.4,
            "&:hover": { color: "primary.main" },
          }}
        >
          <Home size={14} style={{ flexShrink: 0 }} />
          {roleAccess === "STUDENT" ? "Home" : "Dashboard"}
        </MuiLink>

        <MuiLink
          component={Link}
          underline="hover"
          href={courseDetailPath}
          sx={{
            display: "inline-flex",
            alignItems: "flex-start",
            gap: 0.75,
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "text.secondary",
            lineHeight: 1.4,
            "&:hover": { color: "primary.main" },
          }}
        >
          <BookOpen size={14} style={{ flexShrink: 0, marginTop: 3 }} />
          {isLoading ? (
            <Skeleton width={100} height={20} />
          ) : (
            <Typography
              component="span"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 500,
                lineHeight: 1.4,
                color: "inherit",
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
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
              alignItems: "flex-start",
              gap: 0.75,
              color: "text.primary",
            }}
          >
            <ClipboardList size={14} style={{ flexShrink: 0, marginTop: 3 }} />
            <Typography
              component="span"
              sx={{
                fontSize: "0.85rem",
                fontWeight: 600,
                lineHeight: 1.4,
                color: "text.primary",
                display: "-webkit-box",
                WebkitLineClamp: { xs: 2, sm: 1 },
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                wordBreak: "break-word",
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
