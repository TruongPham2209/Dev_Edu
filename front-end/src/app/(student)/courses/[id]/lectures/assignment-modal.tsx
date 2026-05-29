"use client";

import { FileUpload } from "@/components/common/file-upload";
import {
  createSubmission,
  deleteSubmission,
  getFeedbacks,
} from "@/lib/api/assignments";
import {
  getDownloadUrl,
  getFileMetadata,
  getPreSignedUploadUrl,
} from "@/lib/api/files";
import { AssignmentResponse, FeedbackResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Clock,
  Download,
  FileText,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AssignmentModalProps {
  open: boolean;
  onClose: () => void;
  assignment: AssignmentResponse;
  onSuccess: () => void;
}

export function AssignmentModal({
  open,
  onClose,
  assignment,
  onSuccess,
}: AssignmentModalProps) {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Undo Logic
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);
  const [submissionMetadata, setSubmissionMetadata] = useState<{
    id: string;
    name: string;
    size: number;
    type: string;
    objectKey: string;
  } | null>(null);
  const undoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (open) {
      loadDetails();
    }
  }, [open, assignment]);

  const loadDetails = async () => {
    setLoadingDetails(true);

    try {
      const promises: Promise<any>[] = [
        // 1. Load Feedbacks
        getFeedbacks(assignment.id)
          .then(setFeedbacks)
          .catch((err) => console.error("Failed to load feedbacks", err)),
      ];

      // 2. Load Metadata if submitted
      if (assignment.submittedAt && assignment.fileObjectKey) {
        promises.push(
          getFileMetadata(assignment.fileObjectKey)
            .then((meta) =>
              setSubmissionMetadata({
                id: assignment.id,
                name: meta.originalFileName,
                size: meta.fileSize || 0,
                type: meta.contentType,
                objectKey: assignment.fileObjectKey!,
              }),
            )
            .catch((err) =>
              console.error("Failed to load submission metadata", err),
            ),
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to load details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    try {
      // 1. Get Pre-signed URL
      const preSigned = await getPreSignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      setUploadProgress(40);

      // 2. Upload to S3
      if (preSigned.uploadUrl) {
        const uploadRes = await fetch(preSigned.uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        if (!uploadRes.ok) throw new Error("Failed to upload to S3");
      }

      setUploadProgress(80);

      // 3. Create Submission
      await createSubmission({
        assignmentId: assignment.id,
        fileObjectKey: preSigned.objectKey,
      });

      setUploadProgress(100);
      onSuccess();
      setFile(null);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (objectKey: string) => {
    try {
      const res = await getDownloadUrl(objectKey);
      if (res.downloadUrl) {
        window.open(res.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to get download URL", err);
    }
  };

  const handleDeleteWithUndo = () => {
    // Optimistic UI: we can't easily undo state across parents without complex lifting,
    // but we can close the feedback/submission view and show toast.
    setIsDeleting(true);
    setSnackbarOpen(true);
    setLastDeletedId(assignment.id);

    undoIntervalRef.current = setTimeout(() => {
      deleteSubmission(assignment.id).then(() => {
        setIsDeleting(false);
        setSnackbarOpen(false);
        onSuccess();
      });
    }, 5000);
  };

  const handleUndo = () => {
    if (undoIntervalRef.current) clearTimeout(undoIntervalRef.current);
    setIsDeleting(false);
    setSnackbarOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1.5,
            overflow: "hidden",
            height: "80vh",
            maxHeight: 700,
            display: "flex",
            flexDirection: "column",
            boxShadow: theme.shadows[10],
          },
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.default",
          }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                p: 0.75,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                color: "text.primary",
                display: "flex",
              }}
            >
              <FileText size={20} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {assignment.title}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ borderRadius: 1 }}>
            <X size={18} />
          </IconButton>
        </DialogTitle>
      </Box>

      <DialogContent sx={{ p: 0, flex: 1, overflowY: "auto" }}>
        <Box sx={{ p: 2.5 }}>
          <Stack spacing={4}>
            {/* Instructions Section */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  mb: 1,
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Assignment Requirements
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: "action.hover",
                  borderStyle: "solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    color: "text.primary",
                    lineHeight: 1.7,
                    fontSize: "0.875rem",
                    "& img": {
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: 1,
                    },
                    "& p": { m: 0, mb: 1.5 },
                    "& p:last-child": { mb: 0 },
                    "& a": { color: "primary.main" },
                    "& ul, & ol": { pl: 2.5, mb: 1.5 },
                    "& h1, & h2, & h3, & h4": { fontWeight: 700, mt: 2, mb: 1 },
                  }}
                  dangerouslySetInnerHTML={{ __html: assignment.description }}
                />
              </Paper>
            </Box>

            <Divider />

            {/* Submission Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Your Submission
              </Typography>

              {assignment.submittedAt ? (
                isDeleting ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "warning.main",
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.warning.main, 0.04),
                    }}
                  >
                    <Stack
                      direction="row"
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Clock
                          size={18}
                          className="animate-spin-slow"
                          color={theme.palette.warning.main}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Unsubmitting...
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        color="warning"
                        variant="outlined"
                        onClick={handleUndo}
                        sx={{ borderRadius: 1, fontWeight: 700 }}
                      >
                        Undo
                      </Button>
                    </Stack>
                  </Paper>
                ) : (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center", flex: 1, minWidth: 0 }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            display: "flex",
                          }}
                        >
                          <FileText size={24} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {submissionMetadata?.name || "Uploaded File"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {submissionMetadata
                              ? `${(submissionMetadata.size / 1024).toFixed(1)} KB • `
                              : ""}
                            Submitted at:{" "}
                            {formatServerDate(
                              assignment.submittedAt,
                              "datetime",
                            )}
                          </Typography>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Download">
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (submissionMetadata) {
                                  handleDownload(submissionMetadata.objectKey);
                                }
                              }}
                              disabled={!submissionMetadata}
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                "&:hover": {
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.2,
                                  ),
                                },
                              }}
                            >
                              <Download size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Remove Submission">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={handleDeleteWithUndo}
                            sx={{
                              bgcolor: alpha(theme.palette.error.main, 0.1),
                              "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.2),
                              },
                            }}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                )
              ) : (
                <Box>
                  <FileUpload
                    file={file}
                    onChange={handleFileChange}
                    maxSizeMB={50}
                    fileType="document"
                  />

                  {file && (
                    <Fade in={!!file}>
                      <Box sx={{ mt: 2 }}>
                        {uploading ? (
                          <Paper
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "primary.main",
                              bgcolor: alpha(theme.palette.primary.main, 0.02),
                            }}
                          >
                            <Stack spacing={2}>
                              <Stack
                                direction="row"
                                sx={{
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: "primary.main",
                                  }}
                                >
                                  Uploading {file.name}...
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                  }}
                                >
                                  {uploadProgress}%
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={uploadProgress}
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Stack>
                          </Paper>
                        ) : (
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.paper",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              sx={{
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            >
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    display: "block",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {file.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </Typography>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="outlined"
                                  color="inherit"
                                  onClick={() => setFile(null)}
                                  sx={{
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="contained"
                                  onClick={handleUpload}
                                  sx={{
                                    borderRadius: 1.5,
                                    textTransform: "none",
                                    boxShadow: theme.shadows[4],
                                  }}
                                >
                                  Submit
                                </Button>
                              </Stack>
                            </Stack>
                          </Paper>
                        )}
                      </Box>
                    </Fade>
                  )}
                </Box>
              )}
            </Box>

            <Divider />

            {/* Prioritized Teacher Feedback Section */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <MessageSquare size={18} /> Teacher feedback
              </Typography>

              {loadingDetails ? (
                <Stack spacing={1.5}>
                  {[1].map((i) => (
                    <Paper
                      key={i}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        height: 80,
                        bgcolor: "action.hover",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                  ))}
                </Stack>
              ) : feedbacks.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    fontStyle: "italic",
                    display: "block",
                    textAlign: "center",
                    py: 2,
                  }}
                >
                  No feedback yet.
                </Typography>
              ) : (
                <Stack spacing={2.5}>
                  {feedbacks.map((fb) => (
                    <Stack
                      key={fb.id}
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: "flex-start" }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          flexShrink: 0,
                          mt: 0.5,
                        }}
                      >
                        {fb.lecturer.charAt(0)}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: alpha(theme.palette.text.primary, 0.06),
                            borderRadius: "18px",
                            px: 2,
                            py: 1.25,
                            display: "inline-block",
                            maxWidth: "100%",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: "text.primary",
                              mb: 0.25,
                            }}
                          >
                            {fb.lecturer}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.primary",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.5,
                            }}
                          >
                            {fb.feedback}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            mt: 0.5,
                            px: 1.5,
                          }}
                        >
                          {formatServerDate(fb.createdAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
