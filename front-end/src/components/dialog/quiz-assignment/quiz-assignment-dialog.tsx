"use client";

import { FilterSelect } from "@/components/common/form/filter-select";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import type { CreateAssignmentRequest, QuizResponse } from "@/lib/type/quizzes";
import { toLocalIsoString } from "@/lib/util/date-utils";
import { Box, FormControlLabel, Stack, Switch } from "@mui/material";
import { Clock } from "lucide-react";
import { useMemo, useState } from "react";

interface QuizAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateAssignmentRequest) => Promise<void>;
  approvedQuizzes?: QuizResponse[];
  loading?: boolean;
  defaultQuizId?: string;
  quizTitle?: string;
}

const EMPTY_APPROVED_QUIZZES: QuizResponse[] = [];

export function QuizAssignmentDialog({
  open,
  onClose,
  onSave,
  approvedQuizzes = EMPTY_APPROVED_QUIZZES,
  loading = false,
  defaultQuizId = "",
  quizTitle = "",
}: QuizAssignmentDialogProps) {
  const [quizId, setQuizId] = useState<string>(
    () => defaultQuizId || (approvedQuizzes[0]?.id ?? ""),
  );
  const [assignmentName, setAssignmentName] = useState<string>(
    () =>
      quizTitle ||
      approvedQuizzes.find(
        (q) => q.id === (defaultQuizId || (approvedQuizzes[0]?.id ?? "")),
      )?.title ||
      "",
  );
  const [startTime, setStartTime] = useState<string>(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [endTime, setEndTime] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [maxAttempts, setMaxAttempts] = useState<number>(1);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
    {},
  );

  const [prevProps, setPrevProps] = useState({ open, defaultQuizId, quizTitle });

  if (
    prevProps.open !== open ||
    prevProps.defaultQuizId !== defaultQuizId ||
    prevProps.quizTitle !== quizTitle
  ) {
    setPrevProps({ open, defaultQuizId, quizTitle });
    if (open) {
      const selectedId = defaultQuizId || (approvedQuizzes[0]?.id ?? "");
      setQuizId(selectedId);
      const selectedQuizTitle = approvedQuizzes.find(
        (q) => q.id === selectedId,
      )?.title;
      setAssignmentName(quizTitle || selectedQuizTitle || "");

      const now = new Date();
      const nowIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setStartTime(nowIso);
      setEndTime("");
      setDurationMinutes(45);
      setMaxAttempts(1);
      setShuffleQuestions(true);
      setShuffleOptions(true);
      setTouchedFields({});
    }
  }

  const quizItems = useMemo(
    () =>
      approvedQuizzes.map((q) => ({
        id: q.id,
        title: `${q.title}${q.courseTitle ? ` (${q.courseTitle})` : ""}`,
      })),
    [approvedQuizzes],
  );

  const markTouched = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Real-time Validation Errors
  const validationErrors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (!quizId) {
      errs.quizId = "Quiz selection is required.";
    }

    if (!assignmentName.trim()) {
      errs.assignmentName = "Assignment name is required.";
    }

    if (!startTime) {
      errs.startTime = "Start time is required.";
    }

    if (endTime && startTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      if (end <= start) {
        errs.endTime = "End time must be strictly after start time.";
      }
    }

    if (
      !durationMinutes ||
      Number.isNaN(durationMinutes) ||
      durationMinutes <= 0
    ) {
      errs.durationMinutes = "Duration must be greater than 0 minutes.";
    }

    if (!maxAttempts || Number.isNaN(maxAttempts) || maxAttempts <= 0) {
      errs.maxAttempts = "Max attempts must be at least 1.";
    }

    return errs;
  }, [
    quizId,
    assignmentName,
    startTime,
    endTime,
    durationMinutes,
    maxAttempts,
  ]);

  const isValid = Object.keys(validationErrors).length === 0;

  const handleSubmit = async () => {
    // Touch all fields on submit attempt
    setTouchedFields({
      quizId: true,
      assignmentName: true,
      startTime: true,
      endTime: true,
      durationMinutes: true,
      maxAttempts: true,
    });

    if (!isValid || loading) return;

    const payload: CreateAssignmentRequest = {
      quizId,
      assignmentName: assignmentName.trim(),
      startTime: toLocalIsoString(startTime),
      endTime: endTime ? toLocalIsoString(endTime) : null,
      durationMinutes,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
    };

    await onSave(payload);
  };

  return (
    <FormDialog
      open={open}
      title={
        quizTitle ? `Create Assignment for "${quizTitle}"` : "Create Assignment"
      }
      headerIcon={<Clock size={24} />}
      onClose={loading ? () => { } : onClose}
      onSubmit={handleSubmit}
      isSubmitDisabled={!isValid || loading}
      submitText="Create Assignment"
      cancelText="Cancel"
      maxWidth="sm"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
        {/* Quiz Picker (If approvedQuizzes provided and defaultQuizId not explicitly set) */}
        {!defaultQuizId && approvedQuizzes.length > 0 && (
          <FilterSelect
            label="Select Approved Quiz *"
            value={quizId}
            onChange={(val) => {
              setQuizId(val);
              markTouched("quizId");
              const selectedQuiz = approvedQuizzes.find((q) => q.id === val);
              if (selectedQuiz?.title) {
                setAssignmentName(selectedQuiz.title);
              }
            }}
            items={quizItems}
            disabled={loading}
          />
        )}

        {/* Assignment Name */}
        <FormInput
          label="Assignment Name *"
          placeholder="e.g. Midterm Examination - Group A"
          value={assignmentName}
          onChange={(e) => {
            setAssignmentName(e.target.value);
            markTouched("assignmentName");
          }}
          onBlur={() => markTouched("assignmentName")}
          disabled={loading}
          error={Boolean(
            touchedFields.assignmentName && validationErrors.assignmentName,
          )}
          helperText={
            touchedFields.assignmentName && validationErrors.assignmentName
              ? validationErrors.assignmentName
              : undefined
          }
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <FormInput
              label="Start Time *"
              type="datetime-local"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                markTouched("startTime");
              }}
              onBlur={() => markTouched("startTime")}
              disabled={loading}
              error={Boolean(
                touchedFields.startTime && validationErrors.startTime,
              )}
              helperText={
                touchedFields.startTime && validationErrors.startTime
                  ? validationErrors.startTime
                  : undefined
              }
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormInput
              label="End Time (Optional)"
              type="datetime-local"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                markTouched("endTime");
              }}
              onBlur={() => markTouched("endTime")}
              disabled={loading}
              error={Boolean(touchedFields.endTime && validationErrors.endTime)}
              helperText={
                touchedFields.endTime && validationErrors.endTime
                  ? validationErrors.endTime
                  : undefined
              }
            />
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <FormInput
              label="Duration (Minutes) *"
              type="number"
              value={String(durationMinutes)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setDurationMinutes(Number.isNaN(val) ? 0 : val);
                markTouched("durationMinutes");
              }}
              onBlur={() => markTouched("durationMinutes")}
              disabled={loading}
              error={Boolean(
                touchedFields.durationMinutes &&
                validationErrors.durationMinutes,
              )}
              helperText={
                touchedFields.durationMinutes &&
                  validationErrors.durationMinutes
                  ? validationErrors.durationMinutes
                  : undefined
              }
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <FormInput
              label="Max Attempts *"
              type="number"
              value={String(maxAttempts)}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setMaxAttempts(Number.isNaN(val) ? 0 : val);
                markTouched("maxAttempts");
              }}
              onBlur={() => markTouched("maxAttempts")}
              disabled={loading}
              error={Boolean(
                touchedFields.maxAttempts && validationErrors.maxAttempts,
              )}
              helperText={
                touchedFields.maxAttempts && validationErrors.maxAttempts
                  ? validationErrors.maxAttempts
                  : undefined
              }
            />
          </Box>
        </Stack>

        <Stack direction="column" spacing={1} sx={{ pt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={shuffleQuestions}
                onChange={(e) => setShuffleQuestions(e.target.checked)}
                disabled={loading}
              />
            }
            label="Shuffle Question Order"
          />
          <FormControlLabel
            control={
              <Switch
                checked={shuffleOptions}
                onChange={(e) => setShuffleOptions(e.target.checked)}
                disabled={loading}
              />
            }
            label="Shuffle Options"
          />
        </Stack>
      </Box>
    </FormDialog>
  );
}
