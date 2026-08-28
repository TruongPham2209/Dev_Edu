"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { SearchInput } from "@/components/common/form/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalDocumentsInfiniteQuery } from "@/lib/api/documents";
import type { GlobalDocumentResponse } from "@/lib/type/documents";
import type {
  QuizQuestionResponse,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import { formatBytes } from "@/lib/util/file-utils";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Library,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

interface AiGeneratorDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmitFromFile: (data: {
    file: File;
    description: string;
    saveDocument: boolean;
  }) => Promise<void>;
  onSubmitFromDocument: (data: {
    documentId: string;
    description: string;
    saveDocument: boolean;
  }) => Promise<void>;
  typeConfigs: QuizTypeConfigResponse[];
  existingQuestions: QuizQuestionResponse[];
  loading?: boolean;
}

export function AiGeneratorDialog({
  open,
  onClose,
  onSubmitFromFile,
  onSubmitFromDocument,
  typeConfigs,
  existingQuestions,
  loading = false,
}: AiGeneratorDialogProps) {
  // Tab 0: Direct Upload PDF, Tab 1: Global Library
  const [activeTab, setActiveTab] = useState<number>(0);

  // Tab 0 states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saveDocument, setSaveDocument] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab 1 states
  const [selectedDocument, setSelectedDocument] =
    useState<GlobalDocumentResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Prompt / description
  const [description, setDescription] = useState<string>("");
  const [touched, setTouched] = useState<boolean>(false);

  // Fetch Global Documents for Tab 1
  const {
    data: libraryData,
    isLoading: isLoadingLibrary,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGlobalDocumentsInfiniteQuery(debouncedSearch, {
    enabled: open && activeTab === 1,
  });

  const libraryDocuments = useMemo(() => {
    if (!libraryData?.pages) return [];
    return libraryData.pages.flatMap((page: any) => {
      if (!page) return [];
      if (Array.isArray(page)) return page;
      if (Array.isArray(page.contents)) return page.contents;
      if (Array.isArray(page.content)) return page.content;
      if (Array.isArray(page.items)) return page.items;
      return [];
    });
  }, [libraryData]);

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

  // Reset dialog state on open/close
  React.useEffect(() => {
    if (open) {
      setActiveTab(0);
      setSelectedFile(null);
      setSaveDocument(false);
      setFileError(null);
      setSelectedDocument(null);
      setSearchTerm("");
      setDescription("");
      setTouched(false);
    }
  }, [open]);

  // File drop / select handler
  const handleFileSelected = (file: File) => {
    setFileError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF files (.pdf) are supported.");
      setSelectedFile(null);
      return;
    }
    const maxSizeBytes = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSizeBytes) {
      setFileError("File size must not exceed 30MB.");
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  // Validation
  const errors = useMemo(() => {
    return {
      file:
        activeTab === 0 && !selectedFile ? "Please select a PDF document." : "",
      document:
        activeTab === 1 && !selectedDocument
          ? "Please select a document from the library."
          : "",
      description:
        description.trim().length < 5
          ? "Please provide generation instructions (at least 5 characters)."
          : "",
    };
  }, [activeTab, selectedFile, selectedDocument, description]);

  const isValid = useMemo(() => {
    if (totalRemainingSlots <= 0) return false;
    if (errors.description) return false;
    if (activeTab === 0 && (errors.file || !!fileError)) return false;
    if (activeTab === 1 && errors.document) return false;
    return true;
  }, [totalRemainingSlots, errors, activeTab, fileError]);

  // Submit Handler
  const handleSubmit = async () => {
    setTouched(true);
    if (!isValid) return;

    try {
      if (activeTab === 0 && selectedFile) {
        await onSubmitFromFile({
          file: selectedFile,
          description: description.trim(),
          saveDocument,
        });
      } else if (activeTab === 1 && selectedDocument) {
        await onSubmitFromDocument({
          documentId: selectedDocument.id,
          description: description.trim(),
          saveDocument: false,
        });
      }
    } catch {
      // Error notifications are handled in parent mutations
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="AI Quiz Generation"
      headerIcon={<Sparkles size={24} />}
      submitText={
        loading
          ? "Initiating Generation..."
          : `Generate ${totalRemainingSlots} Questions with AI`
      }
      isSubmitDisabled={!isValid || loading}
      maxWidth="md"
    >
      <Stack spacing={3}>
        {/* Capacity / Slots Remaining Banner */}
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "primary.50",
            borderColor: "rgba(59, 130, 246, 0.3)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "primary.dark" }}
              >
                Question Matrix Slots Remaining: {totalRemainingSlots}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                AI will generate questions to fill the missing slots in your
                matrix configurations.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {quotaBreakdown.map((q) => (
                <Chip
                  key={q.questionType}
                  label={`${q.questionType}: ${q.remaining} slots left`}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.725rem",
                    bgcolor: "background.paper",
                  }}
                />
              ))}
            </Stack>
          </Stack>
        </Paper>

        {/* Source Mode Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, val) => setActiveTab(val)}
            variant="fullWidth"
          >
            <Tab
              icon={<UploadCloud size={18} />}
              iconPosition="start"
              label="Direct PDF Upload"
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
            <Tab
              icon={<Library size={18} />}
              iconPosition="start"
              label="Global Document Library"
              sx={{ fontWeight: 700, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {/* TAB 0: Direct PDF Upload */}
        {activeTab === 0 && (
          <Stack spacing={2}>
            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor:
                  touched && (errors.file || fileError)
                    ? "error.main"
                    : selectedFile
                      ? "success.main"
                      : "rgba(15, 23, 42, 0.2)",
                borderRadius: 2,
                p: { xs: 3, sm: 4 },
                textAlign: "center",
                cursor: "pointer",
                bgcolor: selectedFile
                  ? "rgba(34, 197, 94, 0.03)"
                  : "rgba(15, 23, 42, 0.01)",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(37, 99, 235, 0.02)",
                },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                hidden
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              {selectedFile ? (
                <Stack
                  alignItems="center"
                  spacing={1}
                  sx={{ position: "relative" }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "50%",
                      bgcolor: "success.50",
                      color: "success.main",
                    }}
                  >
                    <FileText size={36} />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(selectedFile.size)} • PDF Document
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    variant="text"
                    startIcon={<X size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    sx={{ mt: 1 }}
                  >
                    Remove & Replace File
                  </Button>
                </Stack>
              ) : (
                <Stack alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "50%",
                      bgcolor: "rgba(37, 99, 235, 0.06)",
                      color: "primary.main",
                    }}
                  >
                    <UploadCloud size={32} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 600, color: "text.primary" }}
                    >
                      Drag and drop your PDF syllabus/textbook here
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      or click to browse from your computer (Max 30MB)
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Box>

            {touched && (errors.file || fileError) && (
              <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                {fileError || errors.file}
              </Typography>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={saveDocument}
                  onChange={(e) => setSaveDocument(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Save document to Global Library upon successful quiz
                  generation
                </Typography>
              }
            />
          </Stack>
        )}

        {/* TAB 1: Global Document Library */}
        {activeTab === 1 && (
          <Stack spacing={2}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search processed documents in library..."
            />

            {isLoadingLibrary ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : libraryDocuments.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: "center",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No documents found in Global Library. You can upload a new PDF
                  via the &quot;Direct PDF Upload&quot; tab.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={1.5} sx={{ maxHeight: 260, overflowY: "auto", pr: 0.5 }}>
                <Grid container spacing={1.5}>
                  {libraryDocuments.map((doc) => {
                    const isSelected = selectedDocument?.id === doc.id;
                    return (
                      <Grid key={doc.id} size={{ xs: 12, sm: 6 }}>
                        <Card
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            borderColor: isSelected
                              ? "primary.main"
                              : "divider",
                            bgcolor: isSelected
                              ? "rgba(37, 99, 235, 0.04)"
                              : "background.paper",
                            boxShadow: isSelected
                              ? "0 0 0 1.5px rgba(37, 99, 235, 0.6)"
                              : "none",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <CardActionArea
                            onClick={() => setSelectedDocument(doc)}
                            sx={{ p: 1.5 }}
                          >
                            <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="flex-start"
                              >
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: isSelected
                                      ? "primary.main"
                                      : "action.hover",
                                    color: isSelected ? "white" : "text.secondary",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <BookOpen size={18} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="subtitle2"
                                    noWrap
                                    sx={{ fontWeight: 700 }}
                                  >
                                    {doc.title || doc.fileName}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    noWrap
                                    sx={{ display: "block" }}
                                  >
                                    {formatBytes(doc.fileSize)} • Ready
                                  </Typography>
                                </Box>
                                {isSelected && (
                                  <CheckCircle2
                                    size={18}
                                    className="text-blue-600 shrink-0"
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {hasNextPage && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    sx={{ alignSelf: "center", mt: 1 }}
                  >
                    {isFetchingNextPage ? "Loading more..." : "Load More Documents"}
                  </Button>
                )}
              </Stack>
            )}

            {touched && errors.document && (
              <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
                {errors.document}
              </Typography>
            )}
          </Stack>
        )}

        {/* Prompt / Custom Instructions */}
        <FormInput
          label="AI Prompt & Generation Instructions *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="E.g., Focus on advanced questions about Concurrency, Memory Management, and practical scenario-based problem solving..."
          multiline
          rows={3}
          error={touched && !!errors.description}
          helperText={
            touched && errors.description
              ? errors.description
              : "Specify topic focus, difficulty level, or specific nuances for the AI generation model."
          }
        />
      </Stack>
    </FormDialog>
  );
}