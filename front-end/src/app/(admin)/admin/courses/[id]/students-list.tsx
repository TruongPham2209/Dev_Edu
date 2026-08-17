"use client";

import { EmptyState } from "@/components/common/empty-state";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import { ListSkeleton } from "@/components/skeleton";
import { useEnrolledUsersInfiniteQuery } from "@/lib/api/enrollments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Users } from "lucide-react";
import { useEffect, useMemo } from "react";

interface StudentsListProps {
  courseId: string;
  onTotalCountChange?: (count: number) => void;
}

export const StudentsList = ({
  courseId,
  onTotalCountChange,
}: StudentsListProps) => {
  const { handleError } = useApiWithToast();

  // React Query Hooks
  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
    error,
  } = useEnrolledUsersInfiniteQuery(courseId);

  const students = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) ?? [];
  }, [data]);

  const totalElements = data?.pages[0]?.totalElements ?? 0;

  useEffect(() => {
    if (onTotalCountChange) {
      onTotalCountChange(totalElements);
    }
  }, [totalElements, onTotalCountChange]);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load student list");
    }
  }, [error, handleError]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasNextPage) return;
    fetchNextPage();
  };

  // Generate avatar colors based on initials
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#8b5cf6", // purple
      "#f59e0b", // amber
      "#ec4899", // pink
      "#14b8a6", // teal
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return "?";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: { xs: 420, sm: 480 }, // Consistent height for the User Row
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(16, 185, 129, 0.08)",
            color: "rgb(16, 185, 129)",
            width: 36,
            height: 36,
            border: "1px solid rgba(16, 185, 129, 0.12)",
          }}
        >
          <Users size={18} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.2,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Enrolled students
          </Typography>
          <Typography variant="caption" color="text.secondary">
            List of students enrolled in this course
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 0 },
        }}
      >
        {loading ? (
          <ListSkeleton count={4} />
        ) : students.length === 0 ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <EmptyState
              title="No enrolled students"
              subtitle="This course has no enrolled students yet."
            />
          </Box>
        ) : (
          <Stack spacing={0} sx={{ width: "100%" }}>
            {students.map((student, index) => {
              const initials = getInitials(student.fullName);
              const color = getAvatarColor(
                student.fullName || student.username,
              );

              return (
                <Box key={student.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.5, sm: 1.75 },
                      flexWrap: "wrap",
                      gap: 1,
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        bgcolor: "rgba(15, 23, 42, 0.02)",
                      },
                    }}
                  >
                    <Stack
                      component="div"
                      direction="row"
                      spacing={{ xs: 1.5, sm: 2 }}
                      sx={{ alignItems: "center", overflow: "hidden" }}
                    >
                      <Avatar
                        src={student.avatarUrl || undefined}
                        sx={{
                          bgcolor: color,
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          flexShrink: 0,
                          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.12)",
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "0.875rem", sm: "0.95rem" },
                            wordBreak: "break-word",
                          }}
                        >
                          {student.fullName || `@${student.username}`}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500, display: "block", wordBreak: "break-word" }}
                        >
                          @{student.username}
                        </Typography>
                      </Box>
                    </Stack>

                    {student.enrolledAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                      >
                        Enrolled At: {formatServerDate(student.enrolledAt)}
                      </Typography>
                    )}
                  </Box>
                  {index < students.length - 1 && (
                    <Divider
                      sx={{ mx: 3, borderColor: "rgba(15, 23, 42, 0.04)" }}
                    />
                  )}
                </Box>
              );
            })}

            {loadingMore && (
              <Box sx={{ py: 2, display: "flex", justifyContent: "center" }}>
                <Skeleton variant="circular" width={24} height={24} />
              </Box>
            )}

            <InfiniteLoadButton
              loading={loadingMore}
              hasMore={hasNextPage}
              onLoadMore={handleLoadMore}
            />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
