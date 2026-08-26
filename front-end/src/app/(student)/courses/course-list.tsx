"use client";

import { CourseCard } from "@/components/card/course-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import type { CourseResponse } from "@/lib/type/courses";
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
          mb: { xs: 2.5, sm: 4 },
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
              color: "text.primary",
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" },
            }}
          >
            <Award size={26} color="#38bdf8" style={{ flexShrink: 0 }} />{" "}
            Featured courses
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mt: { xs: 0.5, sm: 1 },
              ml: { xs: 0, sm: 4.5 },
              fontSize: { xs: "0.85rem", sm: "1rem" },
            }}
          >
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
          },
          gap: { xs: 2, sm: 2.5, md: 3.5 },
        }}
      >
        {loading || initialLoad ? (
          Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : courses.length === 0 ? (
          <Box
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              py: { xs: 6, sm: 12 },
              px: { xs: 2, sm: 4 },
              bgcolor: "background.paper",
              borderRadius: { xs: 4, sm: 6 },
              border: "2px dashed",
              borderColor: "divider",
              boxShadow: "inset 0 4px 20px rgba(0,0,0,0.02)",
            }}
          >
            <Box
              sx={{
                width: { xs: 60, sm: 80 },
                height: { xs: 60, sm: 80 },
                borderRadius: "50%",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <Search size={32} color="currentColor" style={{ opacity: 0.5 }} />
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                mb: 1,
                color: "text.primary",
                fontSize: { xs: "1.1rem", sm: "1.5rem" },
              }}
            >
              No courses found
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 400,
                margin: "0 auto",
                color: "text.secondary",
                fontSize: { xs: "0.85rem", sm: "1rem" },
              }}
            >
              It seems we don&apos;t have any courses that match your search. Please
              try changing the keyword or category.
            </Typography>
            <Button
              variant="outlined"
              onClick={onClearFilters}
              sx={{
                mt: 3,
                borderRadius: 50,
                px: { xs: 3, sm: 4 },
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.95rem" },
              }}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: 5, sm: 8 },
          }}
        >
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={loadingMore}
            endIcon={!loadingMore ? <ChevronRight size={20} /> : undefined}
            sx={{
              minWidth: { xs: 200, sm: 240 },
              borderRadius: 50,
              py: { xs: 1.2, sm: 1.5 },
              px: { xs: 3, sm: 4 },
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "divider",
              color: "text.primary",
              bgcolor: "background.paper",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 15px -5px rgba(0,0,0,0.5)"
                  : "0 4px 15px -5px rgba(0,0,0,0.05)",
              "&:hover": {
                borderWidth: 2,
                borderColor: "primary.main",
                bgcolor: "action.hover",
                color: "primary.main",
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 8px 20px -5px rgba(59, 130, 246, 0.3)"
                    : "0 8px 20px -5px rgba(2, 132, 199, 0.2)",
              },
              "&.Mui-disabled": {
                borderWidth: 2,
                borderColor: "divider",
                bgcolor: "action.disabledBackground",
                color: "text.disabled",
                opacity: 0.8,
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {loadingMore ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <CircularProgress size={20} color="primary" />
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    color: "primary.main",
                  }}
                >
                  Loading courses...
                </Typography>
              </Box>
            ) : (
              "Load More"
            )}
          </Button>
        </Box>
      )}
    </>
  );
};
