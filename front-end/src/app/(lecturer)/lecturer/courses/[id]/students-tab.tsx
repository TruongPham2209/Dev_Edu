"use client";

import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/skeleton";
import { useEnrolledUsersInfiniteQuery } from "@/lib/api/enrollments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { Users } from "lucide-react";
import { useEffect, useMemo } from "react";

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
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Users className="text-blue-500" size={24} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
          >
            Enrolled Students
          </Typography>
        </Box>

        {students.length === 0 ? (
          <EmptyState
            title="No students enrolled yet"
            subtitle="Share your course to start getting students."
          />
        ) : (
          <Stack spacing={3}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              {students.map((student) => (
                <Box
                  key={student.id}
                  sx={{
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "space-between",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1.5, sm: 2 },
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    "&:hover": {
                      bgcolor: "grey.50",
                      borderColor: "primary.main",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      src={student.avatarUrl || undefined}
                      sx={{
                        width: { xs: 40, sm: 48 },
                        height: { xs: 40, sm: 48 },
                        bgcolor: "primary.main",
                        fontWeight: 700,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      {student.fullName
                        ? student.fullName.charAt(0).toUpperCase()
                        : student.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {student.fullName || student.username}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: { xs: "0.775rem", sm: "0.85rem" },
                        }}
                      >
                        @{student.username}
                      </Typography>
                    </Box>
                  </Box>
                  {student.enrolledAt && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.75rem", sm: "0.825rem" },
                        bgcolor: "grey.100",
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1,
                        fontWeight: 500,
                        alignSelf: { xs: "flex-end", sm: "center" },
                      }}
                    >
                      Enrolled: {formatServerDate(student.enrolledAt)}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>

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
