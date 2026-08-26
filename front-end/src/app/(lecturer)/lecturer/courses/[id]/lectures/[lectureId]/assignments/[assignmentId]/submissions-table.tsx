"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import type { SubmissionResponse } from "@/lib/type/assignments";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Download, Eye, Paperclip, Users } from "lucide-react";

interface SubmissionsTableProps {
  submissions: SubmissionResponse[];
  submissionsLoading: boolean;
  submissionsHasMore: boolean;
  loadSubmissions: (reset?: boolean) => Promise<void>;
  triggerDownload: (fileObjectKey: string) => Promise<void>;
  openSubmissionDetails: (submission: SubmissionResponse) => void;
  formatServerDate: (date: string, type: "date" | "datetime") => string;
  getFileNameFromKey: (key: string) => string;
}

export function SubmissionsTable({
  submissions,
  submissionsLoading,
  submissionsHasMore,
  loadSubmissions,
  triggerDownload,
  openSubmissionDetails,
  formatServerDate,
  getFileNameFromKey,
}: SubmissionsTableProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: "action.hover",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          Student submissions
        </Typography>
      </Box>
      <CardContent sx={{ p: 0 }}>
        {submissionsLoading && submissions.length === 0 ? (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Stack spacing={2}>
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ borderRadius: 2 }}
              />
            </Stack>
          </Box>
        ) : submissions.length === 0 ? (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <EmptyState
              title="No submissions yet"
              subtitle="This assignment has not been completed or submitted by any student yet."
              icon={<Users size={40} />}
            />
          </Box>
        ) : (
          <TableContainer
            sx={{ overflowX: "auto !important", maxWidth: "100%" }}
          >
            <Table sx={{ minWidth: 560 }}>
              <TableHead sx={{ bgcolor: "action.hover" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      pl: { xs: 2, sm: 3 },
                    }}
                  >
                    Student
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                    }}
                  >
                    Submitted time
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                    }}
                  >
                    Attached file
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      pr: { xs: 2, sm: 3 },
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
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    {/* Student Info */}
                    <TableCell sx={{ pl: { xs: 2, sm: 3 } }}>
                      <Stack
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
                            bgcolor: "success.light",
                            color: "success.contrastText",
                          }}
                        >
                          {submission.studentUsername.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                          }}
                        >
                          {submission.studentUsername}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.primary",
                          fontWeight: 500,
                          fontSize: { xs: "0.75rem", sm: "0.85rem" },
                        }}
                      >
                        {formatServerDate(submission.submittedAt, "datetime")}
                      </Typography>
                    </TableCell>

                    {/* File Chip */}
                    <TableCell>
                      <Chip
                        icon={<Paperclip size={13} />}
                        label={getFileNameFromKey(submission.fileObjectKey)}
                        variant="outlined"
                        onClick={() =>
                          triggerDownload(submission.fileObjectKey)
                        }
                        sx={{
                          maxWidth: { xs: 160, sm: 260 },
                          borderRadius: 1.5,
                          cursor: "pointer",
                          fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                          "&:hover": {
                            bgcolor: "action.selected",
                            borderColor: "success.main",
                            color: "success.main",
                          },
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell
                      sx={{ pr: { xs: 2, sm: 3 }, textAlign: "right" }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <ButtonAction
                          color="default"
                          variant="soft-dark"
                          icon={<Eye size={18} />}
                          tooltip="View details & Respond"
                          onClick={() => openSubmissionDetails(submission)}
                        />
                        <ButtonAction
                          color="success"
                          variant="soft-dark"
                          icon={<Download size={18} />}
                          tooltip="Download file"
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

        {/* Submissions Infinite Load Button */}
        <InfiniteLoadButton
          loading={submissionsLoading}
          hasMore={submissionsHasMore}
          onLoadMore={() => loadSubmissions(false)}
        />
      </CardContent>
    </Card>
  );
}
