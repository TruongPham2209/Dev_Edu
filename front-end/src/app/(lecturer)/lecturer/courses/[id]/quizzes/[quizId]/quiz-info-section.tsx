"use client";

import { FormInput } from "@/components/common/form/form-input";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import type { QuizStatus } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Save } from "lucide-react";
import { useState } from "react";

interface QuizInfoSectionProps {
  quizTitle: string;
  description?: string;
  status?: QuizStatus;
  isPendingStatus: boolean;
  isSaving: boolean;
  onSave: (title: string, description: string) => Promise<void>;
}

export function QuizInfoSection({
  quizTitle,
  description = "",
  status,
  isPendingStatus,
  isSaving,
  onSave,
}: QuizInfoSectionProps) {
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  const [touchedInfo, setTouchedInfo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedInfo(true);
    const currentTitle = localTitle.trim() || quizTitle;
    if (!currentTitle) return;

    await onSave(currentTitle, localDescription.trim() || description);
  };

  const currentTitleValue = localTitle || quizTitle;
  const currentDescValue = localDescription || description;

  return (
    <Card variant="outlined" sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Quiz Information
          </Typography>
          {status && <QuizStatusChip status={status} />}
        </Box>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <FormInput
              label="Quiz Title *"
              value={currentTitleValue}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Quiz title..."
              disabled={isPendingStatus}
              error={touchedInfo && !currentTitleValue.trim()}
              helperText={
                touchedInfo && !currentTitleValue.trim()
                  ? "Quiz title is required"
                  : undefined
              }
            />

            <FormInput
              label="Description"
              multiline
              minRows={2}
              value={currentDescValue}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="Quiz description / instructions..."
              disabled={isPendingStatus}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Tooltip
                title={
                  isPendingStatus
                    ? "Quiz Information cannot be updated when Quiz is pending approval."
                    : ""
                }
              >
                <span>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSaving || isPendingStatus}
                    startIcon={<Save size={16} />}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
                  >
                    {isSaving ? "Saving..." : "Save Quiz Details"}
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
