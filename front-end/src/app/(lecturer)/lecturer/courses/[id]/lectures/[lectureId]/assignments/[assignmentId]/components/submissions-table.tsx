"use client";

import { EmptyState } from "@/components/common/empty-state";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import type { SubmissionResponse } from "@/lib/api/types";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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
        borderColor: "rgba(148, 163, 184, 0.14)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: 3,
          py: 2,
          bgcolor: "grey.50",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, color: "#1e293b" }}
        >
          Danh sách bài tập học viên đã nộp
        </Typography>
      </Box>
      <CardContent sx={{ p: 0 }}>
        {submissionsLoading && submissions.length === 0 ? (
          <Box sx={{ p: 4 }}>
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
          <Box sx={{ p: 4 }}>
            <EmptyState
              title="Chưa có bài nộp nào"
              subtitle="Bài tập này hiện chưa được học viên nào hoàn thiện hoặc gửi bài làm."
              icon={<Users size={40} />}
            />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "grey.50" }}>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      pl: 3,
                    }}
                  >
                    Học viên
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                    }}
                  >
                    Thời gian nộp
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                    }}
                  >
                    Tệp đính kèm
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: "0.85rem",
                      pr: 3,
                      textAlign: "right",
                    }}
                  >
                    Hành động
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
                    <TableCell sx={{ pl: 3 }}>
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
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          {submission.studentUsername}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Submitted Date */}
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 500 }}
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
                          maxWidth: 260,
                          borderRadius: 1.5,
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "grey.100",
                            borderColor: "success.main",
                            color: "success.main",
                          },
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell sx={{ pr: 3, textAlign: "right" }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: "flex-end" }}
                      >
                        <Tooltip title="Xem chi tiết & Phản hồi" arrow>
                          <IconButton
                            size="small"
                            onClick={() => openSubmissionDetails(submission)}
                            sx={{
                              width: 38,
                              height: 38,
                              border: "1px solid",
                              borderColor: "grey.200",
                              borderRadius: 2,
                              bgcolor: "white",
                              color: "grey.600",
                              transition: "all 0.22s ease",

                              "&:hover": {
                                bgcolor: "#f8fafc",
                                borderColor: "primary.light",
                                color: "primary.main",
                                transform: "translateY(-2px) scale(1.04)",
                                boxShadow: "0 8px 18px rgba(59,130,246,0.14)",
                              },
                            }}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Tải xuống tệp tin" arrow>
                          <IconButton
                            size="small"
                            onClick={() =>
                              triggerDownload(submission.fileObjectKey)
                            }
                            sx={{
                              width: 38,
                              height: 38,
                              border: "1px solid",
                              borderColor: "grey.200",
                              borderRadius: 2,
                              bgcolor: "white",
                              color: "info.main",
                              transition: "all 0.22s ease",

                              "&:hover": {
                                bgcolor: "#f0f9ff",
                                borderColor: "info.light",
                                color: "info.dark",
                                transform: "translateY(-2px) scale(1.04)",
                                boxShadow: "0 8px 18px rgba(14,165,233,0.16)",
                              },
                            }}
                          >
                            <Download size={18} />
                          </IconButton>
                        </Tooltip>
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
