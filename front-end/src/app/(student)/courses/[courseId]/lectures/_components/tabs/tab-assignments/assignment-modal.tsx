"use client";

import {
  createSubmission,
  deleteSubmission,
  getFeedbacks,
  getSubmissionTracking,
} from "@/lib/api/assignments";
import {
  AssignmentResponse,
  FeedbackResponse,
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/api/types";
import {
  getDownloadUrl,
  getFileMetadata,
  getPreSignedUploadUrl,
} from "@/lib/api/files";
import { formatServerDate } from "@/lib/date-utils";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  LinearProgress,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MessageSquare,
  Trash2,
  Upload,
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
  const [tabValue, setTabValue] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [history, setHistory] = useState<SubmissionLogResponse[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (tabValue === 1) loadHistoryAndFeedback();
    }
  }, [open, tabValue, assignment]); // React to any change in assignment (e.g. submittedAt)

  const loadHistoryAndFeedback = async () => {
    setLoadingHistory(true);

    try {
      const promises: Promise<any>[] = [
        // 1. Load Activity Tracking
        getSubmissionTracking(assignment.id)
          .then((data) => setHistory(data.contents))
          .catch((err) => console.error("Failed to load tracking", err)),

        // 2. Load Feedbacks (always)
        getFeedbacks(assignment.id)
          .then(setFeedbacks)
          .catch((err) => console.error("Failed to load feedbacks", err)),
      ];

      // 3. Load Metadata if submitted
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
      console.error("Failed to load history and details", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
      setTabValue(1); // Move to submission tab
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

        <Box sx={{ px: 2, bgcolor: "background.default" }}>
          <Tabs
            value={tabValue}
            onChange={(_, v) => setTabValue(v)}
            sx={{
              minHeight: 40,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 40,
                px: 1,
                minWidth: 100,
              },
            }}
          >
            <Tab label="Hướng dẫn" />
            <Tab label="Bài nộp & Phản hồi" />
          </Tabs>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0, flex: 1, overflowY: "auto" }}>
        {tabValue === 0 && (
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={3}>
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
                  Yêu cầu bài tập
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
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-wrap",
                      color: "text.primary",
                      lineHeight: 1.7,
                    }}
                  >
                    {assignment.description}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600, display: "block", mb: 0.5 }}
                >
                  Hạn nộp bài:{" "}
                  <Box component="span" sx={{ color: "text.primary", ml: 1 }}>
                    Không có thời hạn
                  </Box>
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={3}>
              {/* Current Submission State */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Trạng thái bài nộp
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
                            Đang gỡ bài nộp...
                          </Typography>
                        </Stack>
                        <Button
                          size="small"
                          color="warning"
                          variant="outlined"
                          onClick={handleUndo}
                          sx={{ borderRadius: 1, fontWeight: 700 }}
                        >
                          Hoàn tác
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
                        borderRadius: 1.5,
                        bgcolor: "background.paper",
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
                          spacing={2}
                          sx={{ alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              bgcolor: alpha(theme.palette.success.main, 0.1),
                              color: "success.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <CheckCircle2 size={24} />
                          </Box>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: "success.main" }}
                            >
                              Đã nộp bài thành công
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Nộp lúc:{" "}
                              {formatServerDate(
                                assignment.submittedAt,
                                "datetime",
                              )}
                            </Typography>
                            {submissionMetadata && (
                              <Paper
                                variant="outlined"
                                sx={{
                                  mt: 1.5,
                                  p: 1.25,
                                  bgcolor: "action.hover",
                                  borderRadius: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  transition: "all 0.2s",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.02,
                                    ),
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    p: 0.75,
                                    borderRadius: 0.75,
                                    bgcolor: "background.paper",
                                    color: "text.secondary",
                                    display: "flex",
                                  }}
                                >
                                  <FileText size={18} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 700,
                                      display: "block",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      color: "text.primary",
                                    }}
                                  >
                                    {submissionMetadata.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontSize: "0.7rem" }}
                                  >
                                    {(submissionMetadata.size / 1024).toFixed(
                                      1,
                                    )}{" "}
                                    KB •{" "}
                                    {submissionMetadata.type
                                      .split("/")[1]
                                      ?.toUpperCase()}
                                  </Typography>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(
                                      submissionMetadata.objectKey,
                                    );
                                  }}
                                  sx={{
                                    color: "primary.main",
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.05,
                                    ),
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.1,
                                      ),
                                    },
                                  }}
                                >
                                  <Download size={16} />
                                </IconButton>
                              </Paper>
                            )}
                          </Box>
                        </Stack>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={handleDeleteWithUndo}
                          sx={{
                            borderRadius: 1,
                            alignSelf: "flex-start",
                            mt: 0.5,
                          }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </Paper>
                  )
                ) : (
                  <Box>
                    <Paper
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files?.[0])
                          setFile(e.dataTransfer.files[0]);
                      }}
                      sx={{
                        border: "1px dashed",
                        borderColor: file ? "primary.main" : "divider",
                        borderRadius: 1.5,
                        p: 4,
                        textAlign: "center",
                        bgcolor: file
                          ? alpha(theme.palette.primary.main, 0.04)
                          : "action.hover",
                        transition: "all 0.2s",
                        cursor: "pointer",
                        "&:hover": {
                          borderColor: "primary.main",
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Upload size={24} />
                        </Box>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {file ? file.name : "Tải lên bài làm"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Kéo thả tệp tin hoặc nhấn để chọn
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>

                    {file && (
                      <Fade in={!!file}>
                        <Box sx={{ mt: 2 }}>
                          {uploading ? (
                            <Paper
                              sx={{
                                p: 2,
                                borderRadius: 1.5,
                                border: "1px solid",
                                borderColor: "divider",
                              }}
                            >
                              <Stack spacing={1.5}>
                                <Stack
                                  direction="row"
                                  sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 700 }}
                                  >
                                    Đang tải lên...
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 800 }}
                                  >
                                    {uploadProgress}%
                                  </Typography>
                                </Stack>
                                <LinearProgress
                                  variant="determinate"
                                  value={uploadProgress}
                                  sx={{ height: 6, borderRadius: 3 }}
                                />
                              </Stack>
                            </Paper>
                          ) : (
                            <Stack direction="row" spacing={1.5}>
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={handleUpload}
                                size="medium"
                                sx={{ borderRadius: 1.5, fontWeight: 700 }}
                              >
                                Xác nhận nộp bài
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                onClick={() => setFile(null)}
                                sx={{ borderRadius: 1.5 }}
                              >
                                Hủy
                              </Button>
                            </Stack>
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
                  <MessageSquare size={18} /> Phản hồi từ giảng viên
                </Typography>

                {loadingHistory ? (
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
                    Chưa có phản hồi cho bài nộp này.
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {feedbacks.map((fb) => (
                      <Paper
                        key={fb.id}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderRadius: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          position: "relative",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ mb: 1.5, alignItems: "center" }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 700,
                              fontSize: "0.75rem",
                            }}
                          >
                            {fb.lecturer.charAt(0)}
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 700, display: "block" }}
                            >
                              {fb.lecturer}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.65rem" }}
                            >
                              Giảng viên • {formatServerDate(fb.createdAt)}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1.6,
                            color: "text.primary",
                            p: 1.5,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {fb.feedback}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Lower Priority History Section */}
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    textTransform: "uppercase",
                  }}
                >
                  <Clock size={14} /> Lịch sử hoạt động
                </Typography>
                {loadingHistory ? (
                  <CircularProgress size={16} />
                ) : history.length === 0 ? (
                  <Typography variant="caption" color="text.disabled">
                    Không có lịch sử
                  </Typography>
                ) : (
                  <Stack spacing={0}>
                    {history.map((log, index) => (
                      <Box
                        key={log.id}
                        sx={{
                          position: "relative",
                          pl: 2.5,
                          pb: index === history.length - 1 ? 0 : 1.5,
                          borderLeft: "1px solid",
                          borderColor: "divider",
                          ml: 0.75,
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            left: -4,
                            top: 4,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor:
                              log.status === "SUBMITTED"
                                ? "success.main"
                                : "error.main",
                          }}
                        />
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {log.status === "SUBMITTED"
                              ? "Bạn đã nộp bài"
                              : "Bạn đã hủy nộp bài"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "text.disabled", fontSize: "0.65rem" }}
                          >
                            {formatServerDate(log.updatedAt, "datetime")}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Box>
        )}
      </DialogContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleUndo}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleUndo}
          severity="warning"
          variant="filled"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleUndo}
              sx={{ fontWeight: 700 }}
            >
              HOÀN TÁC
            </Button>
          }
          sx={{ borderRadius: 2, boxShadow: theme.shadows[6] }}
        >
          Đã gỡ bài nộp của bạn
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
