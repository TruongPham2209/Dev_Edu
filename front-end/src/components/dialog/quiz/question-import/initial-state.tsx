"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import type { QuestionType } from "@/lib/type/quizzes";
import {
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { AlertTriangle, Download } from "lucide-react";
import React from "react";

export interface QuotaItem {
  questionType: QuestionType;
  requiredCount: number;
  currentCount: number;
  remaining: number;
}

interface ImportInitialStateProps {
  quotaBreakdown: QuotaItem[];
  isQuotaFull: boolean;
  isProcessingFile: boolean;
  isPendingStatus: boolean;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onDownloadTemplate: () => void;
}

export function ImportInitialState({
  quotaBreakdown,
  isQuotaFull,
  isProcessingFile,
  isPendingStatus,
  selectedFile,
  onFileChange,
  onDownloadTemplate,
}: ImportInitialStateProps) {
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "text.secondary" }}
        >
          Current Question Quota Overview
        </Typography>

        {/* Download Sample Excel Template Button */}
        <Button
          variant="outlined"
          color="secondary"
          size="small"
          disabled={isProcessingFile}
          onClick={onDownloadTemplate}
          startIcon={<Download size={15} />}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Download Sample Template (.xlsx)
        </Button>
      </Box>

      {/* Quota Summary Grid */}
      <Grid container spacing={2}>
        {quotaBreakdown.map((q) => {
          let label = q.questionType as string;
          if (q.questionType === "SINGLE_CHOICE") label = "Single Choice";
          if (q.questionType === "MULTIPLE_CHOICE") label = "Multiple Choice";
          if (q.questionType === "ESSAY") label = "Essay";

          const isFull = q.remaining === 0;
          const percent =
            q.requiredCount > 0
              ? Math.min(
                  100,
                  Math.round((q.currentCount / q.requiredCount) * 100),
                )
              : 0;

          const colSize =
            quotaBreakdown.length === 1
              ? 12
              : quotaBreakdown.length === 2
                ? 6
                : 4;

          return (
            <Grid key={q.questionType} size={{ xs: 12, sm: colSize }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isFull
                    ? (theme) =>
                        alpha(
                          theme.palette.success.main,
                          theme.palette.mode === "dark" ? 0.15 : 0.04,
                        )
                    : (theme) =>
                        alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === "dark" ? 0.15 : 0.03,
                        ),
                  borderColor: isFull
                    ? (theme) => alpha(theme.palette.success.main, 0.3)
                    : (theme) => alpha(theme.palette.primary.main, 0.2),
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 8px 24px rgba(0, 0, 0, 0.4)"
                        : "0 8px 24px rgba(15, 23, 42, 0.06)",
                    borderColor: isFull ? "success.main" : "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {label}
                  </Typography>

                  <Chip
                    label={isFull ? "Full" : `${q.remaining} remaining`}
                    size="small"
                    color={isFull ? "success" : "primary"}
                    variant={isFull ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      height: 22,
                    }}
                  />
                </Box>

                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{ alignItems: "baseline", mb: 1.25 }}
                >
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      color: isFull ? "success.main" : "primary.main",
                      lineHeight: 1,
                    }}
                  >
                    {q.currentCount}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "text.secondary" }}
                  >
                    / {q.requiredCount} required
                  </Typography>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={percent}
                  color={isFull ? "success" : "primary"}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isFull
                      ? (theme) => alpha(theme.palette.success.main, 0.15)
                      : (theme) => alpha(theme.palette.primary.main, 0.12),
                  }}
                />
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {isQuotaFull && (
        <Alert
          severity="warning"
          icon={<AlertTriangle size={18} />}
          sx={{ borderRadius: 2 }}
        >
          All question type quotas are full. You cannot import additional
          questions until you delete existing questions or increase matrix
          required counts.
        </Alert>
      )}

      {/* Reusable FileUpload Component */}
      <Box>
        {isProcessingFile ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: "center",
              borderStyle: "dashed",
              bgcolor: "action.hover",
            }}
          >
            <Stack spacing={2} sx={{ alignItems: "center" }}>
              <CircularProgress size={32} color="primary" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Reading and parsing Excel file...
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <FileUpload
            file={selectedFile}
            onChange={onFileChange}
            accept=".xlsx, .xls"
            fileType="document"
            height={180}
            maxSizeMB={10}
            helperText={
              isPendingStatus
                ? "Questions cannot be imported when quiz is pending approval."
                : isQuotaFull
                  ? "Question quotas are full."
                  : "Upload an Excel file (.xlsx or .xls) containing quiz questions."
            }
          />
        )}
      </Box>
    </Stack>
  );
}
