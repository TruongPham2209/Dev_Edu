"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import { useAssignmentsQuery } from "@/lib/api/assignments";
import {
  alpha,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ClipboardList, Eye, Upload } from "lucide-react";
import { useState } from "react";
import { AssignmentModal } from "./assignment-modal";

interface TabAssignmentsProps {
  lectureId: string;
}

export function TabAssignments({ lectureId }: TabAssignmentsProps) {
  const theme = useTheme();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);

  const { data: assignments = [], isLoading: loading } =
    useAssignmentsQuery(lectureId);

  const selectedAssignment = assignments.find(
    (a) => a.id === selectedAssignmentId,
  );

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
              p: { xs: 1.5, sm: 2 },
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
              direction="row"
              spacing={{ xs: 1.5, sm: 2 }}
              sx={{ alignItems: "center" }}
            >
              <Box
                sx={{
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  color: "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ClipboardList size={20} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary", fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
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
                        height: 18,
                        fontSize: "0.625rem",
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
                        height: 18,
                        fontSize: "0.625rem",
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
                    mb: 0.5,
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    fontSize: { xs: "0.775rem", sm: "0.825rem" },
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
                onClick={() => setSelectedAssignmentId(assignment.id)}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      {selectedAssignment && (
        <AssignmentModal
          open={!!selectedAssignment}
          onClose={() => setSelectedAssignmentId(null)}
          assignment={selectedAssignment}
        />
      )}
    </>
  );
}
