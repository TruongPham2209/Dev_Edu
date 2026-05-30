"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  CircularProgress,
  Button,
} from "@mui/material";
import { useState, useEffect, useRef, useMemo } from "react";
import { useEnrolledUsersInfiniteQuery } from "@/lib/api/enrollments";
import type { EnrollmentUserResponse } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import { ListSkeleton } from "@/components/skeleton";
import { Users } from "lucide-react";

export const StudentsTab = ({ courseId }: { courseId: string }) => {
  const { handleError } = useApiWithToast();

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    fetchNextPage: fetchNext,
    error,
  } = useEnrolledUsersInfiniteQuery(courseId);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load students");
    }
  }, [error, handleError]);

  const students = useMemo(() => {
    const raw = data?.pages.flatMap((page) => page.contents) || [];
    return Array.from(new Map(raw.map((s) => [s.id, s])).values());
  }, [data]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchNext();
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 1 }}>
        <ListSkeleton count={4} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <Users className="text-blue-500" size={24} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Enrolled Students
          </Typography>
        </Box>

        {students.length === 0 ? (
          <EmptyState
            title="No students enrolled yet"
            subtitle="Share your course to start getting students."
          />
        ) : (
          <Stack spacing={2}>
            {students.map((student) => (
              <Box
                key={student.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "grey.50" },
                  transition: "background-color 0.2s",
                }}
              >
                <Avatar sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
                  {student.fullName
                    ? student.fullName.charAt(0).toUpperCase()
                    : student.username.charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {student.fullName || student.username}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    @{student.username}
                  </Typography>
                </Box>
                {student.enrolledAt && (
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Enrolled on {formatServerDate(student.enrolledAt)}
                  </Typography>
                )}
              </Box>
            ))}

            {hasMore && (
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 2, pt: 2 }}
              >
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  variant="outlined"
                  sx={{ borderRadius: 8, px: 4 }}
                >
                  {loadingMore ? <CircularProgress size={20} /> : "Load More"}
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
