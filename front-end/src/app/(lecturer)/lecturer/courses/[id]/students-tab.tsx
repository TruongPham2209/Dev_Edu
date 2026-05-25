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
import { useState, useEffect, useRef } from "react";
import { getEnrolledUsers } from "@/lib/api/enrollments";
import type { EnrollmentUserResponse } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/date-utils";
import { ListSkeleton } from "@/components/skeleton";
import { Users } from "lucide-react";

export const StudentsTab = ({ courseId }: { courseId: string }) => {
  const { handleError } = useApiWithToast();
  const [students, setStudents] = useState<EnrollmentUserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const loadInitial = async () => {
      try {
        setLoading(true);
        const res = await getEnrolledUsers(courseId);
        const unique = Array.from(
          new Map(res.contents.map((s) => [s.id, s])).values(),
        );
        setStudents(unique);
        setNextCursor(res.nextCursor || null);
      } catch (err) {
        handleError(err, "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    loadInitial();
  }, [courseId, handleError]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    try {
      setLoadingMore(true);
      const res = await getEnrolledUsers(courseId, nextCursor);
      setStudents((prev) => {
        const combined = [...prev, ...res.contents];
        return Array.from(new Map(combined.map((s) => [s.id, s])).values());
      });
      setNextCursor(res.nextCursor || null);
    } catch (err) {
      handleError(err, "Failed to load more students");
    } finally {
      setLoadingMore(false);
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

            {nextCursor && (
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
