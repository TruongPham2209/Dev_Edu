"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import type { SubmissionResponse } from "@/lib/type/assignments";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
} from "@mui/material";
import { Download, Eye, Paperclip, Users } from "lucide-react";
import { useEffect, useRef } from "react";

interface SubmissionsListProps {
  submissions: SubmissionResponse[];
  submissionsLoading: boolean;
  submissionsHasMore: boolean;
  loadSubmissions: (reset?: boolean) => Promise<void>;
  triggerDownload: (fileObjectKey: string) => Promise<void>;
  openSubmissionDetails: (submission: SubmissionResponse) => void;
}

export function SubmissionsList({
  submissions,
  submissionsLoading,
  submissionsHasMore,
  loadSubmissions,
  triggerDownload,
  openSubmissionDetails,
}: SubmissionsListProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Auto-trigger loadSubmissions on scroll via Intersection Observer
  useEffect(() => {
    if (!submissionsHasMore || submissionsLoading || submissions.length === 0)
      return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadSubmissions(false);
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    submissionsHasMore,
    submissionsLoading,
    submissions.length,
    loadSubmissions,
  ]);

  const getFileNameFromKey = (key: string) => {
    if (!key) return "Tệp đính kèm";
    return key.split("/").pop() || key;
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 20px rgba(0, 0, 0, 0.4)"
            : "0 4px 20px rgba(15, 23, 42, 0.02)",
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2.5 },
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "0.95rem", sm: "1.05rem" },
          }}
        >
          Submissions list
        </Typography>
        <Chip
          label={`${submissions.length} submissions`}
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 1.5 }}
        />
      </Box>

      <CardContent sx={{ p: 0 }}>
        {submissionsLoading && submissions.length === 0 ? (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Stack component="div" spacing={2}>
              <Skeleton
                variant="rectangular"
                height={52}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={52}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={52}
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Box>
        ) : submissions.length === 0 ? (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <EmptyState
              title="No submissions yet"
              subtitle="No submissions for this assignment yet."
              icon={<Users size={40} />}
            />
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      width: "30%",
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid",
                      borderRight: "1px dashed",
                      borderColor: "divider",
                      pl: 3,
                    }}
                  >
                    Student
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "20%",
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid",
                      borderRight: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    Submitted Time
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "35%",
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid",
                      borderRight: "1px dashed",
                      borderColor: "divider",
                    }}
                  >
                    Attachment
                  </TableCell>
                  <TableCell
                    sx={{
                      width: "15%",
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: "0.875rem",
                      borderBottom: "2px solid",
                      borderColor: "divider",
                      pr: 3,
                      textAlign: "right",
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow
                    key={submission.id}
                    hover
                    sx={{
                      transition: "background-color 0.2s",
                      "&:hover": { bgcolor: "action.hover" },
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {/* Student Info */}
                    <TableCell
                      sx={{
                        pl: 3,
                        borderRight: "1px dashed",
                        borderColor: "divider",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Stack
                        component="div"
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            bgcolor: (theme) =>
                              alpha(
                                theme.palette.success.main,
                                theme.palette.mode === "dark" ? 0.2 : 0.1,
                              ),
                            color: "success.main",
                          }}
                        >
                          {submission.studentUsername.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {submission.studentUsername}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell
                      sx={{
                        borderRight: "1px dashed",
                        borderColor: "divider",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", fontWeight: 600 }}
                      >
                        {formatServerDate(submission.submittedAt, "datetime")}
                      </Typography>
                    </TableCell>

                    {/* File Chip */}
                    <TableCell
                      sx={{
                        borderRight: "1px dashed",
                        borderColor: "divider",
                        borderBottom: "1px solid",
                      }}
                    >
                      <Chip
                        icon={<Paperclip size={13} />}
                        label={
                          submission.fileName ||
                          getFileNameFromKey(submission.fileObjectKey)
                        }
                        variant="outlined"
                        onClick={() =>
                          triggerDownload(submission.fileObjectKey)
                        }
                        sx={{
                          maxWidth: 320,
                          borderRadius: 1.5,
                          cursor: "pointer",
                          fontWeight: 600,
                          borderColor: "divider",
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: "action.hover",
                            borderColor: "success.main",
                            color: "success.main",
                          },
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      sx={{
                        pr: 3,
                        textAlign: "right",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack
                        component="div"
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <ButtonAction
                          tooltip="Details & Feedback"
                          icon={<Eye size={16} />}
                          variant="outline"
                          color="default"
                          onClick={() => openSubmissionDetails(submission)}
                        />
                        <ButtonAction
                          tooltip="Download file"
                          icon={<Download size={16} />}
                          variant="soft"
                          color="primary"
                          onClick={() =>
                            triggerDownload(submission.fileObjectKey)
                          }
                        />
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Intersection Anchor for Infinite Scroll loading */}
        {submissionsHasMore && (
          <Box
            ref={observerRef}
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 4,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            {submissionsLoading && (
              <Stack
                component="div"
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", color: "primary.main" }}
              >
                <CircularProgress size={18} thickness={5} color="inherit" />
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", fontWeight: 500 }}
                >
                  Loading ...
                </Typography>
              </Stack>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
