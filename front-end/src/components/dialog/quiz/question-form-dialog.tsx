"use client";

import type { FilterItem } from "@/components/common/form/filter-select";
import { FilterSelect } from "@/components/common/form/filter-select";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import type {
  QuestionType,
  QuizOptionRequest,
  QuizQuestionRequest,
  QuizQuestionResponse,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Checkbox,
  Grid,
  IconButton,
  Paper,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import { FileQuestion, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface QuestionFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: QuizQuestionRequest) => Promise<void>;
  initialData?: QuizQuestionResponse | null;
  availableTypeConfigs: QuizTypeConfigResponse[];
  defaultType?: QuestionType;
  isDuplicate?: boolean;
  loading?: boolean;
}

export function QuestionFormDialog({
  open,
  onClose,
  onSave,
  initialData,
  availableTypeConfigs,
  defaultType,
  isDuplicate = false,
  loading = false,
}: QuestionFormDialogProps) {
  const [questionType, setQuestionType] =
    useState<QuestionType>("SINGLE_CHOICE");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState<QuizOptionRequest[]>([
    { optionText: "", isCorrect: true, orderIndex: 0 },
    { optionText: "", isCorrect: false, orderIndex: 1 },
    { optionText: "", isCorrect: false, orderIndex: 2 },
    { optionText: "", isCorrect: false, orderIndex: 3 },
  ]);
  const [touched, setTouched] = useState(false);

  // FilterItems for FilterSelect
  const typeSelectItems: FilterItem[] = useMemo(() => {
    if (availableTypeConfigs.length === 0) {
      return [
        { id: "SINGLE_CHOICE", title: "Single Choice" },
        { id: "MULTIPLE_CHOICE", title: "Multiple Choice" },
        { id: "ESSAY", title: "Essay" },
      ];
    }
    return availableTypeConfigs.map((cfg) => {
      let title = cfg.questionType as string;
      if (cfg.questionType === "SINGLE_CHOICE") title = "Single Choice";
      if (cfg.questionType === "MULTIPLE_CHOICE") title = "Multiple Choice";
      if (cfg.questionType === "ESSAY") title = "Essay";
      return { id: cfg.questionType, title };
    });
  }, [availableTypeConfigs]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuestionType(initialData.questionType);
        setContent(initialData.content);
        if (initialData.options && initialData.options.length > 0) {
          setOptions(
            initialData.options.map((opt, idx) => ({
              id: isDuplicate ? undefined : opt.id,
              optionText: opt.optionText,
              isCorrect: !!opt.isCorrect,
              orderIndex: idx,
            })),
          );
        } else {
          setOptions([
            { optionText: "", isCorrect: true, orderIndex: 0 },
            { optionText: "", isCorrect: false, orderIndex: 1 },
          ]);
        }
      } else {
        const initialType =
          defaultType ||
          (availableTypeConfigs[0]?.questionType as QuestionType) ||
          "SINGLE_CHOICE";
        setQuestionType(initialType);
        setContent("");
        setOptions([
          { optionText: "", isCorrect: true, orderIndex: 0 },
          { optionText: "", isCorrect: false, orderIndex: 1 },
          { optionText: "", isCorrect: false, orderIndex: 2 },
          { optionText: "", isCorrect: false, orderIndex: 3 },
        ]);
      }
      setTouched(false);
    }
  }, [open, initialData, defaultType, availableTypeConfigs, isDuplicate]);

  // Option handlers
  const handleAddOption = () => {
    setOptions((prev) => [
      ...prev,
      { optionText: "", isCorrect: false, orderIndex: prev.length },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((opt, i) => ({ ...opt, orderIndex: i })),
    );
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, optionText: text } : opt)),
    );
  };

  const handleToggleCorrect = (index: number) => {
    if (questionType === "SINGLE_CHOICE") {
      setOptions((prev) =>
        prev.map((opt, i) => ({ ...opt, isCorrect: i === index })),
      );
    } else {
      setOptions((prev) =>
        prev.map((opt, i) =>
          i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt,
        ),
      );
    }
  };

  // Validation
  const errors = useMemo(() => {
    const isContentEmpty = !content.trim();

    if (questionType === "ESSAY") {
      return {
        content: isContentEmpty ? "Question content cannot be empty." : "",
        options: "",
      };
    }

    const hasEmptyOption = options.some((opt) => !opt.optionText.trim());
    const correctCount = options.filter((opt) => opt.isCorrect).length;

    let optionsError = "";
    if (options.length < 2) {
      optionsError = "Choice questions must have at least 2 options.";
    } else if (hasEmptyOption) {
      optionsError = "All options must have non-empty text.";
    } else if (questionType === "SINGLE_CHOICE" && correctCount !== 1) {
      optionsError =
        "Single Choice question must have exactly 1 correct answer.";
    } else if (questionType === "MULTIPLE_CHOICE" && correctCount === 0) {
      optionsError =
        "Multiple Choice question must have at least 1 correct answer.";
    }

    return {
      content: isContentEmpty ? "Question content cannot be empty." : "",
      options: optionsError,
    };
  }, [content, questionType, options]);

  const isValid = useMemo(() => {
    return !errors.content && !errors.options;
  }, [errors]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;

    await onSave({
      questionType,
      content: content.trim(),
      orderIndex: initialData ? initialData.orderIndex : 0,
      options:
        questionType === "ESSAY"
          ? []
          : options.map((opt, i) => ({
              ...opt,
              optionText: opt.optionText.trim(),
              orderIndex: i,
            })),
    });
  };

  let title = "Add Question";
  if (isDuplicate) title = "Duplicate Question";
  else if (initialData) title = "Edit Question";

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={title}
      headerIcon={<FileQuestion size={24} />}
      submitText={
        isDuplicate
          ? "Create Duplicate"
          : initialData
            ? "Save Changes"
            : "Add Question"
      }
      isSubmitDisabled={!isValid || loading}
      maxWidth="md"
    >
      <Stack spacing={2.5}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FilterSelect
              label="Question Type *"
              value={questionType}
              onChange={(val) => setQuestionType(val as QuestionType)}
              items={typeSelectItems}
            />
          </Grid>
        </Grid>

        <FormInput
          label="Question Content *"
          multiline
          minRows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter question text or prompt here..."
          error={touched && !!errors.content}
          helperText={touched ? errors.content : undefined}
        />

        {/* Options Section for Choice Questions */}
        {questionType !== "ESSAY" && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Answer Options (
                {questionType === "SINGLE_CHOICE"
                  ? "Radio - Select 1"
                  : "Checkbox - Select $\\ge 1$"}
                )
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={14} />}
                onClick={handleAddOption}
                sx={{ borderRadius: 2 }}
              >
                Add Option
              </Button>
            </Box>

            {touched && errors.options && (
              <Typography
                variant="caption"
                color="error"
                sx={{ display: "block", mb: 1, fontWeight: 600 }}
              >
                ⚠️ {errors.options}
              </Typography>
            )}

            <Stack spacing={1.5}>
              {options.map((opt, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    bgcolor: opt.isCorrect
                      ? "rgba(34, 197, 94, 0.05)"
                      : "transparent",
                    borderColor: opt.isCorrect
                      ? "rgba(34, 197, 94, 0.3)"
                      : "rgba(0,0,0,0.12)",
                  }}
                >
                  {questionType === "SINGLE_CHOICE" ? (
                    <Radio
                      checked={opt.isCorrect}
                      onChange={() => handleToggleCorrect(idx)}
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Checkbox
                      checked={opt.isCorrect}
                      onChange={() => handleToggleCorrect(idx)}
                      color="success"
                      size="small"
                    />
                  )}

                  <Box sx={{ flexGrow: 1 }}>
                    <FormInput
                      value={opt.optionText}
                      onChange={(e) =>
                        handleOptionTextChange(idx, e.target.value)
                      }
                      placeholder={`Option ${idx + 1} text...`}
                    />
                  </Box>

                  <IconButton
                    size="small"
                    color="error"
                    disabled={options.length <= 2}
                    onClick={() => handleRemoveOption(idx)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </FormDialog>
  );
}
