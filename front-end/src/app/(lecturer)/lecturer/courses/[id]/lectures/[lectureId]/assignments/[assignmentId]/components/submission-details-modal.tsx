"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { X, Info, History } from "lucide-react";
import type {
  SubmissionResponse,
  FileUploadResponse,
  FeedbackResponse,
  SubmissionLogResponse,
} from "@/lib/api/types";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

// Tabs sub-components
import { SubmissionInfoTab } from "./submission-info-tab";
import { SubmissionHistoryTab } from "./submission-history-tab";

interface SubmissionDetailsModalProps {
  open: boolean;
  onClose: () => void;
  selectedSubmission: SubmissionResponse | null;
  assignmentId: string;
  fileMetadata: FileUploadResponse | null;
  fileMetadataLoading: boolean;
  feedbacks: FeedbackResponse[];
  feedbacksLoading: boolean;
  onAddFeedback: (feedbackText: string) => Promise<void>;
  onDeleteFeedback: (feedbackId: string) => Promise<void>;
  history: SubmissionLogResponse[];
  historyLoading: boolean;
  historyHasMore: boolean;
  onLoadMoreHistory: () => Promise<void>;
  triggerDownload: (fileObjectKey: string) => Promise<void>;
  formatServerDate: (date: string, type: "date" | "datetime") => string;
  getFileNameFromKey: (key: string) => string;
  getFileIcon: (fileName?: string) => React.ReactNode;
  formatBytes: (bytes?: number) => string;
}

export function SubmissionDetailsModal({
  open,
  onClose,
  selectedSubmission,
  assignmentId,
  fileMetadata,
  fileMetadataLoading,
  feedbacks,
  feedbacksLoading,
  onAddFeedback,
  onDeleteFeedback,
  history,
  historyLoading,
  historyHasMore,
  onLoadMoreHistory,
  triggerDownload,
  formatServerDate,
  getFileNameFromKey,
  getFileIcon,
  formatBytes,
}: SubmissionDetailsModalProps) {
  const [modalActiveTab, setModalActiveTab] = useState<"info" | "history">(
    "info",
  );
  const [newFeedback, setNewFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [confirmFeedbackDelete, setConfirmFeedbackDelete] = useState<
    string | null
  >(null);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newFeedback.trim();
    if (!text) return;

    setSubmittingFeedback(true);
    try {
      await onAddFeedback(text);
      setNewFeedback("");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleFeedbackDeleteConfirm = async () => {
    if (!confirmFeedbackDelete) return;
    try {
      await onDeleteFeedback(confirmFeedbackDelete);
    } finally {
      setConfirmFeedbackDelete(null);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.15)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "grey.50",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "text.primary" }}
            >
              Chi tiết bài nộp học viên
            </Typography>
            {selectedSubmission && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                Học viên: {selectedSubmission.studentUsername} &bull; Nộp lúc:{" "}
                {formatServerDate(selectedSubmission.submittedAt, "datetime")}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflowX: "hidden" }}>
          {selectedSubmission && (
            <Stack spacing={3}>
              {/* Tabs within Modal */}
              <Tabs
                value={modalActiveTab}
                onChange={(_, val) => setModalActiveTab(val)}
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  minHeight: 40,
                  "& .MuiTabs-indicator": {
                    height: 3,
                    borderRadius: "3px 3px 0 0",
                    bgcolor: "success.main",
                  },
                }}
              >
                <Tab
                  value="info"
                  icon={<Info size={16} />}
                  iconPosition="start"
                  label="Thông tin bài nộp"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    minHeight: 40,
                    color: "text.secondary",
                    "&.Mui-selected": { color: "success.main" },
                  }}
                />
                <Tab
                  value="history"
                  icon={<History size={16} />}
                  iconPosition="start"
                  label="Lịch sử hoạt động"
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    minHeight: 40,
                    color: "text.secondary",
                    "&.Mui-selected": { color: "success.main" },
                  }}
                />
              </Tabs>

              {/* MODAL TAB 1: INFORMATION & FEEDBACK */}
              {modalActiveTab === "info" && (
                <SubmissionInfoTab
                  selectedSubmission={selectedSubmission}
                  fileMetadata={fileMetadata}
                  fileMetadataLoading={fileMetadataLoading}
                  feedbacks={feedbacks}
                  feedbacksLoading={feedbacksLoading}
                  newFeedback={newFeedback}
                  setNewFeedback={setNewFeedback}
                  submittingFeedback={submittingFeedback}
                  onSubmitFeedback={handleFeedbackSubmit}
                  onDeleteFeedbackClick={setConfirmFeedbackDelete}
                  triggerDownload={triggerDownload}
                  formatServerDate={formatServerDate}
                  getFileNameFromKey={getFileNameFromKey}
                  getFileIcon={getFileIcon}
                  formatBytes={formatBytes}
                />
              )}

              {/* MODAL TAB 2: ACTIVITY TIMELINE (INFINITE SCROLL) */}
              {modalActiveTab === "history" && (
                <SubmissionHistoryTab
                  history={history}
                  historyLoading={historyLoading}
                  historyHasMore={historyHasMore}
                  onLoadMoreHistory={onLoadMoreHistory}
                  formatServerDate={formatServerDate}
                />
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* --- CONFIRM FEEDBACK DELETION DIALOG --- */}
      <ConfirmDialog
        open={Boolean(confirmFeedbackDelete)}
        title="Xóa nhận xét phản hồi này?"
        description="Nhận xét của bạn sẽ bị gỡ bỏ vĩnh viễn khỏi danh sách phản hồi của bài nộp này."
        confirmLabel="Đồng ý xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={handleFeedbackDeleteConfirm}
        onCancel={() => setConfirmFeedbackDelete(null)}
      />
    </>
  );
}
