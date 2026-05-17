"use client";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { CourseManageCard } from "@/components/course/course-manage-card";
import { getAssignedCourses } from "@/lib/api/courses";
import { getEnrollments } from "@/lib/api/enrollments";
import { getLecturesByCourse } from "@/lib/api/lectures";
import type { CourseResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type CourseStats = {
  students: number;
  lectures: number;
};

export default function LecturerDashboardPage() {
  const { handleError } = useApiWithToast();

  // State
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Stats state
  const [stats, setStats] = useState<Record<string, CourseStats>>({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Ref for intersection observer
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadCourses = useCallback(
    async (cursor?: string | null, isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setError(false);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await getAssignedCourses(cursor || undefined);

        if (isInitial) {
          setCourses(data.contents);
        } else {
          setCourses((prev) => [...prev, ...data.contents]);
        }
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        setError(true);
        handleError(err, "Không thể tải danh sách khóa học");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [handleError],
  );

  // Initial load and filter change
  useEffect(() => {
    loadCourses(null, true);
  }, [loadCourses]);

  // Stats loading logic (batches when courses change)
  useEffect(() => {
    if (courses.length === 0) return;

    const loadStats = async () => {
      // Only load stats for courses that don't have them yet
      const missingStats = courses.filter((c) => !stats[c.id]);
      if (missingStats.length === 0) return;

      setLoadingStats(true);
      try {
        const lectureCounts = await Promise.all(
          missingStats.map(async (course) => {
            try {
              const lectures = await getLecturesByCourse(course.id);
              return [course.id, lectures.length] as const;
            } catch {
              return [course.id, 0] as const;
            }
          }),
        );

        const nextStats = { ...stats };
        missingStats.forEach((course) => {
          const lectures =
            lectureCounts.find(([id]) => id === course.id)?.[1] || 0;
          // Simple heuristic for students for now as getEnrollments() might not be filtered by courseId easily
          nextStats[course.id] = {
            students: 0, // Placeholder
            lectures,
          };
        });
        setStats(nextStats);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [courses, stats]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          nextCursor &&
          !loadingMore &&
          !loading
        ) {
          loadCourses(nextCursor);
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, loadingMore, loading, loadCourses]);

  const handleRetry = () => {
    loadCourses(null, true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={2}>
        {/* Management Header Section */}
        <Box
          sx={{
            pt: 1,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "rgba(15, 23, 42, 0.08)",
          }}
        >
          {/* Breadcrumb / Context */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", fontWeight: 600 }}
            >
              Giảng viên
            </Typography>
            <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
              /
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Quản lý Khóa học
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: 3,
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mb: 1, alignItems: "center" }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "rgba(37, 99, 235, 0.05)",
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <LayoutGrid size={24} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                    fontSize: { xs: "1.5rem", md: "1.875rem" },
                  }}
                >
                  Quản lý Khóa học
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  maxWidth: 600,
                }}
              >
                Hệ thống điều phối và quản lý nội dung giảng dạy. Tại đây bạn có
                thể theo dõi danh sách, cập nhật bài giảng và giám sát hoạt động
                của học viên.
              </Typography>
            </Box>

            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <Stack
                direction="row"
                spacing={3}
                sx={{
                  borderRight: "1px solid",
                  borderColor: "rgba(15, 23, 42, 0.08)",
                  pr: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    Đang quản lý
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#0f172a" }}
                  >
                    {loading ? "..." : courses.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      display: "block",
                    }}
                  >
                    Active
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800, color: "#10b981" }}
                  >
                    {loading ? "..." : courses.length}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  bgcolor: "#0f172a",
                  "&:hover": { bgcolor: "#1e293b" },
                }}
              >
                Tạo khóa học mới
              </Button>
            </Stack>
          </Box>
        </Box>

        {/* Content Section */}
        {error ? (
          <ErrorState
            title="Đã có lỗi xảy ra"
            subtitle="Không thể kết nối với máy chủ. Vui lòng kiểm tra lại đường truyền."
            onRetry={handleRetry}
          />
        ) : loading && courses.length === 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(5, 1fr)",
              },
              gap: 2.5,
            }}
          >
            {Array.from({ length: 10 }).map((_, index) => (
              <CourseManageCard
                key={index}
                id=""
                title=""
                description=""
                href=""
                loading
              />
            ))}
          </Box>
        ) : courses.length === 0 ? (
          <EmptyState
            title="Chưa có khóa học nào được phân công"
            subtitle="Bạn hiện chưa có khóa học nào trong danh sách quản lý. Khi có khóa học mới, chúng sẽ xuất hiện tại đây."
            icon={<LayoutGrid size={48} />}
          />
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: 2.5,
              }}
            >
              {courses.map((course) => {
                const courseStats = stats[course.id] || {
                  students: 0,
                  lectures: 0,
                };
                return (
                  <CourseManageCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={
                      course.thumbnailUrl || course.thumbnailObjectKey
                    }
                    status={course.validTo ? "INACTIVE" : "ACTIVE"} // Simple logic for status if not provided
                    studentCount={courseStats.students}
                    lectureCount={courseStats.lectures}
                    updatedAt={course.createdAt}
                    href={`/lecturer/courses/${course.id}`}
                  />
                );
              })}
            </Box>

            {/* Infinite Scroll Trigger */}
            <Box
              ref={observerTarget}
              sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
                opacity: nextCursor ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              {loadingMore && (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Đang tải thêm khóa học...
                  </Typography>
                </Stack>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
