import { CourseHeroInfo } from "@/components/common/hero-section/course-hero-info";
import type { CourseResponse } from "@/lib/api/types";
import { Breadcrumbs, Link as MuiLink, Stack, Typography } from "@mui/material";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export const CourseHero = ({ course }: { course: CourseResponse }) => {
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
          href="/lecturer"
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
          Dashboard
        </MuiLink>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {course.title}
        </Typography>
      </Breadcrumbs>

      <CourseHeroInfo course={course} />
    </Stack>
  );
};
