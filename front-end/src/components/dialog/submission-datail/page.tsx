"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import type {
  FeedbackResponse,
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { History, Info, X } from "lucide-react";
import { useState } from "react";

// Tabs sub-components
import { CommentInput } from "@/components/common/comment-input";
import { SubmissionHistoryTab } from "./submission-history-tab";
import { SubmissionInfoTab } from "./submission-info-tab";

interface SubmissionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedSubmission: SubmissionResponse | null;
  isAdmin?: boolean;
  feedbacks: FeedbackResponse[];
  feedbacksLoading: boolean;
  onAddFeedback: (feedbackText: string) => Promise<void>;
  onDeleteFeedback: (feedbackId: string) => Promise<void>;
  history: SubmissionLogResponse[];
  historyLoading: boolean;
  historyHasMore: boolean;
  onLoadMoreHistory: () => Promise<void>;
  triggerDownload: (fileObjectKey: string) => Promise<void>;
}

export function SubmissionDetailsDialog({
  open,
  onClose,
  selectedSubmission,
  isAdmin = false,
  feedbacks,
  feedbacksLoading,
  onAddFeedback,
  onDeleteFeedback,
  history,
  historyLoading,
  historyHasMore,
  onLoadMoreHistory,
  triggerDownload,
}: SubmissionDetailsDialogProps) {
  const [modalActiveTab, setModalActiveTab] = useState<"info" | "history">(
    "info",
  );
  const [newFeedback, setNewFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [deletingFeedback, setDeletingFeedback] = useState(false);
  const [confirmFeedbackDelete, setConfirmFeedbackDelete] =
    useState<FeedbackResponse | null>(null);

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
    setDeletingFeedback(true);
    try {
      await onDeleteFeedback(confirmFeedbackDelete.id);
    } finally {
      setConfirmFeedbackDelete(null);
      setDeletingFeedback(false);
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
        transitionDuration={{ enter: 225, exit: 0 }}
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
              Student Assignment Details
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflowX: "hidden" }}>
          {selectedSubmission && (
            <Stack component="div" spacing={3}>
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
                  label="Submission Details"
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
                  label="Activity History"
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
                  isAdmin={isAdmin}
                  feedbacks={feedbacks}
                  feedbacksLoading={feedbacksLoading}
                  onDeleteFeedbackClick={setConfirmFeedbackDelete}
                  triggerDownload={triggerDownload}
                />
              )}

              {/* MODAL TAB 2: ACTIVITY TIMELINE (INFINITE SCROLL) */}
              {modalActiveTab === "history" && (
                <SubmissionHistoryTab
                  history={history}
                  historyLoading={historyLoading}
                  historyHasMore={historyHasMore}
                  onLoadMoreHistory={onLoadMoreHistory}
                />
              )}
            </Stack>
          )}
        </DialogContent>

        {/* Fixed Comment Input at Dialog Bottom */}
        {modalActiveTab === "info" && selectedSubmission && (
          <Box
            sx={{
              p: 3,
              pt: 2,
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            <CommentInput
              title="Add Feedback/Comment"
              placeholder="Write a feedback..."
              value={newFeedback}
              onChange={setNewFeedback}
              onSubmit={() =>
                handleFeedbackSubmit({
                  preventDefault: () => {},
                } as React.FormEvent)
              }
              submitting={submittingFeedback}
              avatarColor="success.main"
            />
          </Box>
        )}
      </Dialog>

      {/* --- CONFIRM FEEDBACK DELETION DIALOG --- */}
      <ConfirmDialog
        open={Boolean(confirmFeedbackDelete)}
        title="Delete this feedback?"
        description={
          confirmFeedbackDelete
            ? `Feedback "${
                confirmFeedbackDelete.feedback.length > 50
                  ? confirmFeedbackDelete.feedback.substring(0, 50) + "..."
                  : confirmFeedbackDelete.feedback
              }" from lecturer ${confirmFeedbackDelete.lecturer} will be permanently removed from the feedback list.`
            : ""
        }
        confirmLabel={deletingFeedback ? "Deleting..." : "Confirm Delete"}
        cancelLabel="Cancel"
        onConfirm={handleFeedbackDeleteConfirm}
        onCancel={() => !deletingFeedback && setConfirmFeedbackDelete(null)}
      />
    </>
  );
}
