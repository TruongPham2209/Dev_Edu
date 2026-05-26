"use client";

import { CourseCard } from "@/components/card/course-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import type { CourseResponse } from "@/lib/api/types";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Award, ChevronRight, Search } from "lucide-react";

interface CourseListProps {
  courses: CourseResponse[];
  loading: boolean;
  initialLoad: boolean;
  nextCursor: string | null;
  loadingMore: boolean;
  onLoadMore: () => void;
  onClearFilters: () => void;
}

export const CourseList = ({
  courses,
  loading,
  initialLoad,
  nextCursor,
  loadingMore,
  onLoadMore,
  onClearFilters,
}: CourseListProps) => {
  return (
    <>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              letterSpacing: "-0.02em",
            }}
          >
            <Award size={32} color="#38bdf8" /> Featured courses
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", mt: 1, ml: 5 }}>
            Featured courses recommended by our community.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: { xs: 2.5, md: 3.5 },
        }}
      >
        {loading || initialLoad ? (
          Array.from({ length: 10 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : courses.length === 0 ? (
          <Box
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              py: 12,
              bgcolor: "#ffffff",
              borderRadius: 6,
              border: "2px dashed #cbd5e1",
              boxShadow: "inset 0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Search size={40} color="#94a3b8" />
            </Box>
            <Typography
              variant="h5"
              color="#0f172a"
              sx={{ fontWeight: 800, mb: 1 }}
            >
              No courses found
            </Typography>
            <Typography
              variant="body1"
              color="#64748b"
              sx={{ maxWidth: 400, margin: "0 auto" }}
            >
              It seems we don't have any courses that match your search. Please
              try changing the keyword or category.
            </Typography>
            <Button
              variant="outlined"
              onClick={onClearFilters}
              sx={{ mt: 3, borderRadius: 50, px: 4, fontWeight: 700 }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </Box>

      {/* ==========================================
          5. LOAD MORE PAGING
          ========================================== */}
      {nextCursor && !loading && !initialLoad && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={loadingMore}
            endIcon={!loadingMore && <ChevronRight size={20} />}
            sx={{
              minWidth: 240,
              borderRadius: 50,
              py: 1.5,
              fontSize: "1.05rem",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#e2e8f0",
              color: "#475569",
              bgcolor: "#ffffff",
              boxShadow: "0 4px 15px -5px rgba(0,0,0,0.05)",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0ea5e9",
                bgcolor: "#f0f9ff",
                color: "#0284c7",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px -5px rgba(2, 132, 199, 0.2)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {loadingMore ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Load More"
            )}
          </Button>
        </Box>
      )}
    </>
  );
};
