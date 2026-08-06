"use client";

import type { FilterItem } from "@/components/common/form/filter-select";
import { FilterSelect } from "@/components/common/form/filter-select";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import type {
  QuestionType,
  QuizTypeConfigRequest,
  QuizTypeConfigResponse,
  ScoringMethod,
} from "@/lib/type/quizzes";
import { Grid, Stack } from "@mui/material";
import { Layers } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface TypeConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: QuizTypeConfigRequest) => Promise<void>;
  initialData?: QuizTypeConfigResponse | null;
  existingTypes?: QuestionType[];
  loading?: boolean;
}

const QUESTION_TYPE_ITEMS: FilterItem[] = [
  { id: "SINGLE_CHOICE", title: "Single Choice" },
  { id: "MULTIPLE_CHOICE", title: "Multiple Choice" },
  { id: "ESSAY", title: "Essay" },
];

const SCORING_METHOD_ITEMS: FilterItem[] = [
  { id: "AUTO", title: "Automatic Grading (AUTO)" },
  { id: "MANUAL", title: "Manual Grading (MANUAL)" },
];

export function TypeConfigDialog({
  open,
  onClose,
  onSave,
  initialData,
  existingTypes = [],
  loading = false,
}: TypeConfigDialogProps) {
  const [questionType, setQuestionType] = useState<QuestionType>("SINGLE_CHOICE");
  const [requiredCount, setRequiredCount] = useState<string>("5");
  const [pointsPerQuestion, setPointsPerQuestion] = useState<string>("1");
  const [scoringMethod, setScoringMethod] = useState<ScoringMethod>("AUTO");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuestionType(initialData.questionType);
        setRequiredCount(String(initialData.requiredCount));
        setPointsPerQuestion(String(initialData.pointsPerQuestion));
        setScoringMethod(initialData.scoringMethod);
      } else {
        // Pick first available type not yet added
        const available = QUESTION_TYPE_ITEMS.find(
          (opt) => !existingTypes.includes(opt.id as QuestionType),
        );
        const defaultType = (available?.id || "SINGLE_CHOICE") as QuestionType;
        setQuestionType(defaultType);
        setRequiredCount("5");
        setPointsPerQuestion("1");
        setScoringMethod(defaultType === "ESSAY" ? "MANUAL" : "AUTO");
      }
      setTouched(false);
    }
  }, [open, initialData, existingTypes]);

  // Auto-set default scoring method when question type changes
  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    if (type === "ESSAY") {
      setScoringMethod("MANUAL");
    } else {
      setScoringMethod("AUTO");
    }
  };

  const parsedCount = Number(requiredCount);
  const parsedPoints = Number(pointsPerQuestion);

  const errors = useMemo(() => {
    const isDuplicate =
      !initialData && existingTypes.includes(questionType);
    return {
      questionType: isDuplicate
        ? "This question type has already been configured in the matrix."
        : "",
      requiredCount:
        isNaN(parsedCount) || parsedCount <= 0
          ? "Required question count must be greater than 0."
          : "",
      pointsPerQuestion:
        isNaN(parsedPoints) || parsedPoints <= 0
          ? "Points per question must be greater than 0."
          : "",
    };
  }, [initialData, existingTypes, questionType, parsedCount, parsedPoints]);

  const isValid = useMemo(() => {
    return !errors.questionType && !errors.requiredCount && !errors.pointsPerQuestion;
  }, [errors]);

  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;

    await onSave({
      questionType,
      requiredCount: parsedCount,
      pointsPerQuestion: parsedPoints,
      scoringMethod,
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={initialData ? "Edit Question Matrix Config" : "Add Question Matrix Config"}
      headerIcon={<Layers size={24} />}
      submitText={initialData ? "Save Changes" : "Add Config"}
      isSubmitDisabled={!isValid || loading}
      maxWidth="sm"
    >
      <Stack spacing={2.5}>
        <FilterSelect
          label="Question Type *"
          value={questionType}
          onChange={(val) => handleQuestionTypeChange(val as QuestionType)}
          items={QUESTION_TYPE_ITEMS}
          disabled={!!initialData} // Lock type when editing
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Required Questions Count *"
              type="number"
              value={requiredCount}
              onChange={(e) => setRequiredCount(e.target.value)}
              placeholder="E.g., 10"
              error={touched && !!errors.requiredCount}
              helperText={touched ? errors.requiredCount : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Points Per Question *"
              type="number"
              value={pointsPerQuestion}
              onChange={(e) => setPointsPerQuestion(e.target.value)}
              placeholder="E.g., 1.5"
              error={touched && !!errors.pointsPerQuestion}
              helperText={touched ? errors.pointsPerQuestion : undefined}
            />
          </Grid>
        </Grid>

        <FilterSelect
          label="Scoring Method *"
          value={scoringMethod}
          onChange={(val) => setScoringMethod(val as ScoringMethod)}
          items={SCORING_METHOD_ITEMS}
        />
      </Stack>
    </FormDialog>
  );
}
