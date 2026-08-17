import { CourseHeroInfo } from "@/components/common/hero-section/course-hero-info";
import type { CourseResponse } from "@/lib/type/courses";
import { Breadcrumbs, Link as MuiLink, Stack, Typography } from "@mui/material";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export const CourseHero = ({ course }: { course: CourseResponse }) => {
  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Breadcrumbs
        separator={<ChevronRight size={14} style={{ flexShrink: 0, marginTop: 3 }} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "flex-start",
            flexWrap: "nowrap",
            overflow: "hidden",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "flex-start",
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.5, sm: 1 },
            mt: "3px",
            color: "text.disabled",
            flexShrink: 0,
          },
        }}
      >
        <MuiLink
          component={Link}
          underline="hover"
          href="/lecturer"
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
          Dashboard
        </MuiLink>
        <Typography
          component="span"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: { xs: 2, sm: 1 },
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            wordBreak: "break-word",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "text.primary",
            lineHeight: 1.4,
          }}
          title={course.title}
        >
          {course.title}
        </Typography>
      </Breadcrumbs>

      <CourseHeroInfo course={course} />
    </Stack>
  );
};
