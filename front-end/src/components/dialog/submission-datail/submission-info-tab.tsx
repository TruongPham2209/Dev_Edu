"use client";

import ButtonAction from "@/components/common/button-action";
import type {
  FeedbackResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  formatBytes,
  getFileIcon,
  getFileNameFromKey,
} from "@/lib/util/file-utils";
import {
  alpha,
  Avatar,
  Box,
  Card,
  IconButton,
  Skeleton,
  Stack,
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
          p: { xs: 1.5, sm: 2 },
          borderRadius: 1,
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
          mb: { xs: 2.5, sm: 4 },
        }}
      >
        <Stack
          component="div"
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.25, sm: 2 },
              minWidth: 0,
              flex: 1,
            }}
          >
            <Box
              sx={{
                width: { xs: 38, sm: 44 },
                height: { xs: 38, sm: 44 },
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
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
                  fontSize: { xs: "0.825rem", sm: "0.875rem" },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {selectedSubmission.fileName ||
                  getFileNameFromKey(selectedSubmission.fileObjectKey)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: { xs: "0.725rem", sm: "0.775rem" },
                }}
              >
                Size: {formatBytes(selectedSubmission.fileSize)} &bull; Type:{" "}
                {selectedSubmission.contentType || "Unknown"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}>
            <ButtonAction
              tooltip="Download"
              icon={<Download size={20} />}
              variant="soft-dark"
              color="primary"
              onClick={() => triggerDownload(selectedSubmission.fileObjectKey)}
            />
          </Box>
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
          fontSize: { xs: "0.85rem", sm: "0.875rem" },
        }}
      >
        <MessageSquare size={16} />
        <span>Lecturer&apos;s Feedback and Comments</span>
      </Typography>

      {feedbacksLoading ? (
        <Stack component="div" spacing={2} sx={{ mb: 3 }}>
          {/* Skeleton Feedback Row 1 */}
          <Card
            variant="outlined"
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              borderColor: "divider",
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
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              borderColor: "divider",
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
            p: { xs: 2, sm: 3 },
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 1,
            border: "1px dashed",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <MessageSquare
            size={26}
            style={{ color: "inherit", opacity: 0.6, marginBottom: 8 }}
          />
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              fontSize: { xs: "0.825rem", sm: "0.875rem" },
            }}
          >
            No feedback has been submitted yet
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontSize: { xs: "0.725rem", sm: "0.775rem" },
            }}
          >
            Enter instructions or modifications for students in the form below.
          </Typography>
        </Box>
      ) : (
        <Stack
          component="div"
          spacing={1.5}
          sx={{
            mb: 3,
            maxH: { xs: 220, sm: 260 },
            overflowY: "auto",
            overflowX: "hidden",
            pr: 0.5,
          }}
        >
          {feedbacks.map((fb) => (
            <Box
              key={fb.id}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 1,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                gap: { xs: 1.25, sm: 2 },
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
                src={fb.lecturerAvatar}
                sx={{
                  width: { xs: 28, sm: 32 },
                  height: { xs: 28, sm: 32 },
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.success.main,
                      theme.palette.mode === "dark" ? 0.2 : 0.1,
                    ),
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
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      fontSize: { xs: "0.825rem", sm: "0.875rem" },
                    }}
                  >
                    {fb.lecturerFullName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.7rem", sm: "0.75rem" },
                    }}
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
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  }}
                >
                  {fb.feedback}
                </Typography>
              </Box>

              {/* Delete Feedback Button (Visible on mobile touch devices, reveals on hover for desktop) */}
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
                    opacity: { xs: 0.85, sm: 0 },
                    transition: "opacity 0.2s",
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.error.main,
                        theme.palette.mode === "dark" ? 0.2 : 0.1,
                      ),
                    p: 0.5,
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(
                          theme.palette.error.main,
                          theme.palette.mode === "dark" ? 0.3 : 0.2,
                        ),
                      opacity: 1,
                    },
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
