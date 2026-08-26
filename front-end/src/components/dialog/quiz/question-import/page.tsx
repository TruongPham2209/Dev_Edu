"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { FormDialog } from "@/components/common/form/form-dialog";
import { useToast } from "@/lib/toast-context";
import type {
  QuestionType,
  QuizOptionRequest,
  QuizQuestionRequest,
  QuizQuestionResponse,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import { Box, Typography } from "@mui/material";
import { FileSpreadsheet } from "lucide-react";
import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  ExceededErrorItem,
  FormatErrorItem,
  ImportErrorState,
} from "./error-state";
import { ImportInitialState } from "./initial-state";
import { ImportSuccessState } from "./success-state";

interface QuestionImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (questions: QuizQuestionRequest[]) => Promise<void>;
  typeConfigs: QuizTypeConfigResponse[];
  existingQuestions: QuizQuestionResponse[];
  isPendingStatus?: boolean;
}

export function QuestionImportDialog({
  open,
  onClose,
  onSave,
  typeConfigs,
  existingQuestions,
  isPendingStatus = false,
}: QuestionImportDialogProps) {
  const toast = useToast();

  // States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Parsed valid questions for State 2 (Success)
  const [parsedQuestions, setParsedQuestions] = useState<QuizQuestionRequest[]>(
    [],
  );

  // Errors for State 3 (Error)
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [formatErrors, setFormatErrors] = useState<FormatErrorItem[]>([]);
  const [exceededErrors, setExceededErrors] = useState<ExceededErrorItem[]>([]);

  // Confirm dialog state for removing a question in State 2
  const [questionToRemoveIndex, setQuestionToRemoveIndex] = useState<
    number | null
  >(null);

  // Quota breakdown per question type
  const quotaBreakdown = useMemo(() => {
    return typeConfigs.map((cfg) => {
      const currentCount = existingQuestions.filter(
        (q) => q.questionType === cfg.questionType,
      ).length;
      const remaining = Math.max(0, cfg.requiredCount - currentCount);
      return {
        questionType: cfg.questionType,
        requiredCount: cfg.requiredCount,
        currentCount,
        remaining,
      };
    });
  }, [typeConfigs, existingQuestions]);

  const totalRemainingSlots = useMemo(() => {
    return quotaBreakdown.reduce((acc, q) => acc + q.remaining, 0);
  }, [quotaBreakdown]);

  const isQuotaFull = totalRemainingSlots === 0;

  // Reset internal state
  const handleReset = () => {
    setSelectedFile(null);
    setParsedQuestions([]);
    setGeneralError(null);
    setFormatErrors([]);
    setExceededErrors([]);
    setIsProcessingFile(false);
    setIsSaving(false);
  };

  const handleClose = () => {
    if (isProcessingFile || isSaving) return;
    handleReset();
    onClose();
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const headers = [
      [
        "Type",
        "Content",
        "Option 1",
        "Is Correct 1",
        "Option 2",
        "Is Correct 2",
        "Option 3",
        "Is Correct 3",
        "Option 4",
        "Is Correct 4",
        "Explanation",
      ],
      [
        "SINGLE_CHOICE",
        "What is the output of typeof null in JavaScript?",
        "null",
        "FALSE",
        "object",
        "TRUE",
        "undefined",
        "FALSE",
        "number",
        "FALSE",
        "typeof null returns 'object' due to historical reasons.",
      ],
      [
        "MULTIPLE_CHOICE",
        "Which of the following are primitive data types in JavaScript?",
        "String",
        "TRUE",
        "Boolean",
        "TRUE",
        "Object",
        "FALSE",
        "Number",
        "TRUE",
        "Object is a non-primitive type.",
      ],
      [
        "ESSAY",
        "Explain the event loop in JavaScript and how asynchronous operations work.",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Questions");
    XLSX.writeFile(wb, "quiz_questions_import_template.xlsx");
  };

  // Helper to parse question type string from cell
  const parseQuestionTypeStr = (raw: unknown): QuestionType | null => {
    if (!raw) return null;
    const str = String(raw).trim().toUpperCase().replace(/[\s-]/g, "_");
    if (str === "SINGLE_CHOICE" || str === "SINGLECHOICE" || str === "SINGLE")
      return "SINGLE_CHOICE";
    if (
      str === "MULTIPLE_CHOICE" ||
      str === "MULTIPLECHOICE" ||
      str === "MULTIPLE"
    )
      return "MULTIPLE_CHOICE";
    if (str === "ESSAY") return "ESSAY";
    return null;
  };

  // Helper to parse boolean from cell
  const parseIsCorrect = (val: unknown): boolean => {
    if (val === true || val === 1) return true;
    if (typeof val === "string") {
      const s = val.trim().toUpperCase();
      return s === "TRUE" || s === "YES" || s === "1" || s === "ĐÚNG";
    }
    return false;
  };

  // Handle File Upload & Excel Parsing
  const handleFileUpload = (file: File) => {
    if (!file) return;
    const filename = file.name.toLowerCase();

    // Reset current parsing states
    setGeneralError(null);
    setFormatErrors([]);
    setExceededErrors([]);
    setParsedQuestions([]);

    // Check extension
    if (!filename.endsWith(".xlsx") && !filename.endsWith(".xls")) {
      toast.error(
        "The uploaded file is not a valid Excel file (.xlsx or .xls).",
      );
      setSelectedFile(null);
      return;
    }

    setIsProcessingFile(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          toast.error("The Excel file contains no worksheets.");
          setSelectedFile(null);
          setIsProcessingFile(false);
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (!rows || rows.length <= 1) {
          toast.error("The Excel file contains no data rows.");
          setSelectedFile(null);
          setIsProcessingFile(false);
          return;
        }

        // Process data rows starting from row 1 (row 0 is header)
        const formatErrList: FormatErrorItem[] = [];
        const validQuestions: QuizQuestionRequest[] = [];
        const importedTypeCounts: Record<QuestionType, number> = {
          SINGLE_CHOICE: 0,
          MULTIPLE_CHOICE: 0,
          ESSAY: 0,
        };

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (
            !row ||
            row.length === 0 ||
            row.every(
              (c) => c === undefined || c === null || String(c).trim() === "",
            )
          ) {
            continue; // Skip empty rows
          }

          const qNum = i; // Question number corresponds to row index
          const qErrors: string[] = [];

          const rawType = row[0];
          const qType = parseQuestionTypeStr(rawType);
          if (!qType) {
            qErrors.push(
              `Invalid question type "${rawType || "Empty"}". Must be SINGLE_CHOICE, MULTIPLE_CHOICE, or ESSAY.`,
            );
          } else {
            // Check if question type is allowed in current typeConfigs
            const isConfigured = typeConfigs.some(
              (c) => c.questionType === qType,
            );
            if (!isConfigured) {
              qErrors.push(
                `Question type "${qType}" is not configured in this quiz's matrix type configs.`,
              );
            }
          }

          const content = row[1] ? String(row[1]).trim() : "";
          if (!content) {
            qErrors.push("Missing question content.");
          }

          // Options parsing for SINGLE_CHOICE and MULTIPLE_CHOICE
          const options: QuizOptionRequest[] = [];
          if (qType === "SINGLE_CHOICE" || qType === "MULTIPLE_CHOICE") {
            // Col index 2,3 -> Opt 1; 4,5 -> Opt 2; 6,7 -> Opt 3; 8,9 -> Opt 4; etc.
            let optIdx = 0;
            for (let col = 2; col < row.length; col += 2) {
              const optText = row[col] ? String(row[col]).trim() : "";
              if (optText) {
                const isCorrect = parseIsCorrect(row[col + 1]);
                options.push({
                  optionText: optText,
                  isCorrect,
                  orderIndex: optIdx++,
                });
              }
            }

            if (options.length < 2) {
              qErrors.push(
                `Must have at least 2 options (found ${options.length}).`,
              );
            }

            const correctCount = options.filter((o) => o.isCorrect).length;
            if (qType === "SINGLE_CHOICE" && correctCount !== 1) {
              qErrors.push(
                `Single Choice question must have exactly 1 correct answer (found ${correctCount}).`,
              );
            }
            if (qType === "MULTIPLE_CHOICE" && correctCount < 1) {
              qErrors.push(
                `Multiple Choice question must have at least 1 correct answer (found ${correctCount}).`,
              );
            }
          }

          if (qErrors.length > 0) {
            formatErrList.push({
              questionNumber: qNum,
              questionTypeStr: rawType ? String(rawType).trim() : "N/A",
              contentSnippet: content || "[No Content]",
              errors: qErrors,
            });
          } else if (qType) {
            importedTypeCounts[qType]++;
            validQuestions.push({
              questionType: qType,
              content,
              orderIndex: validQuestions.length,
              options: options.length > 0 ? options : undefined,
            });
          }
        }

        // 1. If format errors exist, trigger State 3 (Format Errors)
        if (formatErrList.length > 0) {
          setFormatErrors(formatErrList);
          setIsProcessingFile(false);
          return;
        }

        // 2. Check Exceeded Quantity Errors
        const exceededList: ExceededErrorItem[] = [];

        typeConfigs.forEach((cfg) => {
          const quota = quotaBreakdown.find(
            (q) => q.questionType === cfg.questionType,
          );
          const remaining = quota ? quota.remaining : 0;
          const imported = importedTypeCounts[cfg.questionType] || 0;

          if (imported > remaining) {
            exceededList.push({
              type: cfg.questionType,
              importedCount: imported,
              allowedCount: remaining,
            });
          }
        });

        if (exceededList.length > 0) {
          setExceededErrors(exceededList);
          setIsProcessingFile(false);
          return;
        }

        if (validQuestions.length === 0) {
          setGeneralError("No valid questions found in the file.");
          setIsProcessingFile(false);
          return;
        }

        // 3. Success! Set parsed questions (State 2)
        setParsedQuestions(validQuestions);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Invalid file format.";
        toast.error(`Failed to parse Excel file: ${message}`);
        setSelectedFile(null);
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.onerror = () => {
      toast.error("Error reading the selected file.");
      setSelectedFile(null);
      setIsProcessingFile(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Handle Save
  const handleSaveQuestions = async () => {
    if (parsedQuestions.length === 0) return;
    setIsSaving(true);
    try {
      await onSave(parsedQuestions);
      handleReset();
      onClose();
    } catch {
      // Error handling is handled in parent callback or toast
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Remove Question in Success State
  const handleConfirmRemoveQuestion = () => {
    if (questionToRemoveIndex === null) return;
    const updated = parsedQuestions.filter(
      (_, idx) => idx !== questionToRemoveIndex,
    );
    if (updated.length === 0) {
      handleReset();
    } else {
      // Re-index remaining questions
      const reindexed = updated.map((q, idx) => ({ ...q, orderIndex: idx }));
      setParsedQuestions(reindexed);
    }
    setQuestionToRemoveIndex(null);
  };

  // Determine current dialog state
  const hasFormatErrors = formatErrors.length > 0;
  const hasExceededErrors = exceededErrors.length > 0;
  const hasGeneralError = !!generalError;
  const isErrorState = hasFormatErrors || hasExceededErrors || hasGeneralError;
  const isSuccessState = parsedQuestions.length > 0 && !isErrorState;
  const isUnimportedState = !isSuccessState && !isErrorState;

  const targetQuestionToRemove =
    questionToRemoveIndex !== null
      ? parsedQuestions[questionToRemoveIndex]
      : null;

  return (
    <>
      <FormDialog
        open={open}
        onClose={handleClose}
        onSubmit={handleSaveQuestions}
        title="Import Questions from Excel"
        headerIcon={<FileSpreadsheet size={24} />}
        submitText={
          isSaving ? "Saving..." : `Save ${parsedQuestions.length} Questions`
        }
        cancelText="Close"
        isSubmitDisabled={
          !isSuccessState ||
          parsedQuestions.length === 0 ||
          isProcessingFile ||
          isSaving
        }
        maxWidth="md"
      >
        <Box sx={{ width: "100%" }}>
          {/* STATE 1: UNIMPORTED STATE */}
          {isUnimportedState && (
            <ImportInitialState
              quotaBreakdown={quotaBreakdown}
              isQuotaFull={isQuotaFull}
              isProcessingFile={isProcessingFile}
              isPendingStatus={isPendingStatus}
              selectedFile={selectedFile}
              onFileChange={(file) => {
                setSelectedFile(file);
                if (file) {
                  handleFileUpload(file);
                }
              }}
              onDownloadTemplate={handleDownloadTemplate}
            />
          )}

          {/* STATE 2: IMPORT SUCCESS STATE */}
          {isSuccessState && (
            <ImportSuccessState
              parsedQuestions={parsedQuestions}
              isSaving={isSaving}
              onRemoveQuestionClick={(idx) => setQuestionToRemoveIndex(idx)}
              onReset={handleReset}
            />
          )}

          {/* STATE 3: IMPORT ERROR STATE */}
          {isErrorState && (
            <ImportErrorState
              generalError={generalError}
              exceededErrors={exceededErrors}
              formatErrors={formatErrors}
              onReset={handleReset}
            />
          )}
        </Box>
      </FormDialog>

      {/* Confirm Dialog for Removing an Imported Question */}
      <ConfirmDialog
        open={questionToRemoveIndex !== null}
        title="Remove Question from Import List"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        confirmColor="error"
        onCancel={() => setQuestionToRemoveIndex(null)}
        onConfirm={handleConfirmRemoveQuestion}
        description={
          targetQuestionToRemove && (
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to remove{" "}
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                Question {questionToRemoveIndex! + 1}
              </Box>
              : &quot;
              {targetQuestionToRemove.content.length > 50
                ? `${targetQuestionToRemove.content.substring(0, 50)}...`
                : targetQuestionToRemove.content}
              &quot;?
            </Typography>
          )
        }
      />
    </>
  );
}
