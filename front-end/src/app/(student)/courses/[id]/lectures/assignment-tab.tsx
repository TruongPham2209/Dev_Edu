"use client";

import { EmptyState } from "@/components/common/empty-state";
import { getAssignments } from "@/lib/api/assignments";
import { AssignmentResponse } from "@/lib/api/types";
import {
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ClipboardList, Eye, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { AssignmentModal } from "./assignment-modal";
import ButtonAction from "@/components/common/button-action";

interface TabAssignmentsProps {
  lectureId: string;
}

export function TabAssignments({ lectureId }: TabAssignmentsProps) {
  const theme = useTheme();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentResponse | null>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await getAssignments(lectureId);
        setAssignments(data);
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [lectureId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        title="No assignments yet"
        subtitle="This lesson does not have any assignments yet."
      />
    );
  }

  return (
    <>
      <Stack spacing={1.5}>
        {assignments.map((assignment) => (
          <Paper
            key={assignment.id}
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              transition: "all 0.2s ease-in-out",
              bgcolor: "background.paper",
              "&:hover": {
                borderColor: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.01),
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ClipboardList size={22} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mb: 0.5 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {assignment.title}
                  </Typography>
                  {assignment.submittedAt ? (
                    <Chip
                      label="Submitted"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                        height: 20,
                        fontSize: "0.65rem",
                        borderRadius: 0.5,
                      }}
                    />
                  ) : (
                    <Chip
                      label="Pending"
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{
                        fontWeight: 700,
                        height: 20,
                        fontSize: "0.65rem",
                        borderRadius: 0.5,
                      }}
                    />
                  )}
                </Stack>

                <Typography
                  variant="body2"
                  component="div"
                  color="text.secondary"
                  sx={{
                    mb: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontSize: "0.825rem",
                    "& *": {
                      margin: 0,
                      display: "inline",
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                />
              </Box>

              <ButtonAction
                tooltip={assignment.submittedAt ? "View Details" : "Submit"}
                icon={
                  assignment.submittedAt ? (
                    <Eye size={18} />
                  ) : (
                    <Upload size={18} />
                  )
                }
                variant={assignment.submittedAt ? "soft-dark" : "contained"}
                color="primary"
                onClick={() => setSelectedAssignment(assignment)}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {selectedAssignment && (
        <AssignmentModal
          open={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          assignment={selectedAssignment}
          onSuccess={() => {
            // Refresh assignments to update status
            getAssignments(lectureId).then((data) => {
              setAssignments(data);
              // Update selectedAssignment to reflect new status (e.g. submittedAt)
              const updated = data.find((a) => a.id === selectedAssignment?.id);
              if (updated) setSelectedAssignment(updated);
            });
          }}
        />
      )}
    </>
  );
}
