"use client";

import { CourseCard } from "@/components/card/course-card";
import type { CourseResponse } from "@/lib/type/courses";
import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";
import { Award } from "lucide-react";

interface RelatedCourseListProps {
  relatedCourses: CourseResponse[];
  loadingRelated: boolean;
}

export const RelatedCourseList = ({
  relatedCourses,
  loadingRelated,
}: RelatedCourseListProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.25, sm: 2 },
          mb: { xs: 2.5, sm: 4 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: "#f3e8ff",
            borderRadius: 3,
            color: "#9333ea",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <Award size={24} />
        </Box>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
            }}
          >
            Related courses
          </Typography>
          <Typography
            sx={{
              color: "#64748b",
              mt: 0.5,
              fontSize: { xs: "0.85rem", sm: "0.95rem" },
            }}
          >
            You may also be interested in
          </Typography>
        </Box>
      </Box>

      {loadingRelated ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={i}>
              <Skeleton
                variant="rounded"
                height={320}
                sx={{ borderRadius: 4 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : relatedCourses.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "rgba(248, 250, 252, 0.5)",
          }}
        >
          <Typography sx={{ color: "#64748b" }}>
            No related courses found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {relatedCourses.map((relatedCourse) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={relatedCourse.id}>
              <CourseCard course={relatedCourse} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
