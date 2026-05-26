"use client";

import { CourseCard } from "@/components/card/course-card";
import { CourseResponse } from "@/lib/api/types";
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
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#f3e8ff",
            borderRadius: 3,
            color: "#9333ea",
          }}
        >
          <Award size={28} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Related courses
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.5 }}>
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
