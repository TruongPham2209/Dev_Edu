"use client";

import type { FeedbackResponse, SubmissionResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  formatBytes,
  getFileIcon,
  getFileNameFromKey,
} from "@/lib/util/file-utils";
import {
  Avatar,
  Box,
  Card,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Download, MessageSquare, Trash2 } from "lucide-react";

interface SubmissionInfoTabProps {
  selectedSubmission: SubmissionResponse;
  isAdmin?: boolean;
  feedbacks: FeedbackResponse[];
  feedbacksLoading: boolean;
  onDeleteFeedbackClick: (fb: FeedbackResponse) => void;
  triggerDownload: (fileObjectKey: string) => Promise<void>;
}

export function SubmissionInfoTab({
  selectedSubmission,
  isAdmin = false,
  feedbacks,
  feedbacksLoading,
  onDeleteFeedbackClick,
  triggerDownload,
}: SubmissionInfoTabProps) {
  return (
    <Box sx={{ overflowX: "hidden" }}>
      {/* File Info Card */}
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}
      >
        Attached Files
      </Typography>

      <Card
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 1,
          bgcolor: "grey.50",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          mb: 4,
        }}
      >
        <Stack
          component="div"
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                bgcolor: "white",
                border: "1px solid rgba(148,163,184,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {getFileIcon(selectedSubmission.fileName)}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedSubmission.fileName ||
                  getFileNameFromKey(selectedSubmission.fileObjectKey)}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Size: {formatBytes(selectedSubmission.fileSize)} &bull; Type:
                {selectedSubmission.contentType || "Unknown"}
              </Typography>
            </Box>
          </Box>

          <Tooltip title="Download" arrow>
            <IconButton
              onClick={() => triggerDownload(selectedSubmission.fileObjectKey)}
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: "success.main",
                color: "white",
                boxShadow: "0 6px 16px rgba(34,197,94,0.18)",
                transition: "all 0.22s ease",
                "&:hover": {
                  bgcolor: "success.dark",
                  transform: "translateY(-2px) scale(1.04)",
                  boxShadow: "0 10px 22px rgba(34,197,94,0.24)",
                },
                "&:active": {
                  transform: "scale(0.98)",
                },
              }}
            >
              <Download size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Card>

      {/* Feedback Thread Section */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          mb: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: "text.primary",
        }}
      >
        <MessageSquare size={16} />
        <span>Lecturer's Feedback and Comments</span>
      </Typography>

      {feedbacksLoading ? (
        <Stack component="div" spacing={2} sx={{ mb: 3 }}>
          {/* Skeleton Feedback Row 1 */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              borderColor: "rgba(148, 163, 184, 0.1)",
            }}
          >
            <Stack component="div" direction="row" spacing={2}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box sx={{ flex: 1 }}>
                <Stack
                  component="div"
                  direction="row"
                  sx={{ justifyContent: "space-between", mb: 1 }}
                >
                  <Skeleton variant="text" width="30%" height={16} />
                  <Skeleton variant="text" width="20%" height={14} />
                </Stack>
                <Skeleton
                  variant="text"
                  width="90%"
                  height={16}
                  sx={{ mb: 0.5 }}
                />
                <Skeleton variant="text" width="60%" height={16} />
              </Box>
            </Stack>
          </Card>
          {/* Skeleton Feedback Row 2 */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 1,
              borderColor: "rgba(148, 163, 184, 0.1)",
            }}
          >
            <Stack component="div" direction="row" spacing={2}>
              <Skeleton variant="circular" width={32} height={32} />
              <Box sx={{ flex: 1 }}>
                <Stack
                  component="div"
                  direction="row"
                  sx={{ justifyContent: "space-between", mb: 1 }}
                >
                  <Skeleton variant="text" width="25%" height={16} />
                  <Skeleton variant="text" width="22%" height={14} />
                </Stack>
                <Skeleton variant="text" width="80%" height={16} />
              </Box>
            </Stack>
          </Card>
        </Stack>
      ) : feedbacks.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "grey.25",
            borderRadius: 1,
            border: "1px dashed rgba(148, 163, 184, 0.18)",
            mb: 3,
          }}
        >
          <MessageSquare
            size={28}
            style={{ color: "#cbd5e1", marginBottom: 8 }}
          />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            No feedback has been submitted yet
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Enter instructions or modifications for students in the form below.
          </Typography>
        </Box>
      ) : (
        <Stack
          component="div"
          spacing={1.5}
          sx={{
            mb: 3,
            maxH: 260,
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
          }}
        >
          {feedbacks.map((fb) => (
            <Box
              key={fb.id}
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: "white",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                display: "flex",
                gap: 2,
                position: "relative",
                transition: "all 0.2s",
                "&:hover": {
                  borderColor: "success.light",
                },
                "&:hover .delete-fb-action": {
                  opacity: 1,
                },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "success.50",
                  color: "success.main",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                }}
              >
                {fb.lecturer ? fb.lecturer.slice(0, 2).toUpperCase() : "GV"}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    Giảng viên: {fb.lecturer}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {formatServerDate(fb.createdAt, "datetime")}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.primary",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.5,
                  }}
                >
                  {fb.feedback}
                </Typography>
              </Box>

              {/* Delete Feedback Button (Reveals on hover, if isMine is true OR user is ADMIN) */}
              {(fb.isMine || isAdmin) && (
                <IconButton
                  className="delete-fb-action"
                  color="error"
                  size="small"
                  onClick={() => onDeleteFeedbackClick(fb)}
                  sx={{
                    position: "absolute",
                    right: 6,
                    bottom: 6,
                    opacity: 0,
                    transition: "opacity 0.2s",
                    bgcolor: "error.50",
                    "&:hover": { bgcolor: "error.100" },
                  }}
                >
                  <Trash2 size={13} />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
