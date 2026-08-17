"use client";

import type { QuestionType } from "@/lib/type/quizzes";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { XCircle } from "lucide-react";

export interface FormatErrorItem {
  questionNumber: number;
  questionTypeStr?: string;
  contentSnippet?: string;
  errors: string[];
}

export interface ExceededErrorItem {
  type: QuestionType;
  importedCount: number;
  allowedCount: number;
}

interface ImportErrorStateProps {
  generalError: string | null;
  exceededErrors: ExceededErrorItem[];
  formatErrors: FormatErrorItem[];
  onReset: () => void;
}

export function ImportErrorState({
  generalError,
  exceededErrors,
  formatErrors,
  onReset,
}: ImportErrorStateProps) {
  const hasGeneralError = !!generalError;
  const hasExceededErrors = exceededErrors.length > 0;
  const hasFormatErrors = formatErrors.length > 0;

  return (
    <Stack spacing={2.5}>
      <Alert
        severity="error"
        icon={<XCircle size={20} />}
        sx={{ borderRadius: 1 }}
      >
        <strong>Import Failed!</strong> Please fix the errors listed below and
        re-upload your Excel file.
      </Alert>

      {/* General Parsing Error */}
      {hasGeneralError && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "error.50",
            borderColor: "error.light",
          }}
        >
          <Typography
            variant="body2"
            color="error.main"
            sx={{ fontWeight: 600, wordBreak: "break-word" }}
          >
            {generalError}
          </Typography>
        </Paper>
      )}

      {/* Exceeded Quantity Errors */}
      {hasExceededErrors && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            bgcolor: "warning.50",
            borderColor: "warning.light",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "warning.dark", mb: 1 }}
          >
            Question Quantity Exceeds Matrix Quotas:
          </Typography>

          <Stack spacing={1}>
            {exceededErrors.map((err) => {
              let label = err.type as string;
              if (err.type === "SINGLE_CHOICE") label = "Single Choice";
              if (err.type === "MULTIPLE_CHOICE") label = "Multiple Choice";
              if (err.type === "ESSAY") label = "Essay";

              return (
                <Box
                  key={err.type}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    • {label}:
                  </Typography>
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{ fontWeight: 700 }}
                  >
                    {err.allowedCount} remaining allowed ({err.importedCount} in
                    file)
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Format Errors Table */}
      {hasFormatErrors && (
        <Stack spacing={1.5}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "error.main" }}
          >
            Question Format Error Items ({formatErrors.length} Questions with
            issues):
          </Typography>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2,
              borderColor: "error.light",
              boxShadow: "none",
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "error.50",
                      fontWeight: 700,
                      color: "error.dark",
                    },
                  }}
                >
                  <TableCell style={{ width: 80 }} align="center">
                    Row #
                  </TableCell>
                  <TableCell style={{ width: 130 }}>Type</TableCell>
                  <TableCell style={{ width: 260 }}>Content</TableCell>
                  <TableCell>Validation Errors</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formatErrors.map((fErr) => (
                  <TableRow
                    key={fErr.questionNumber}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                      "&:hover": { bgcolor: "rgba(239, 68, 68, 0.03)" },
                    }}
                  >
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 700,
                        color: "error.main",
                        verticalAlign: "top",
                      }}
                    >
                      #{fErr.questionNumber}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      <Chip
                        label={fErr.questionTypeStr || "N/A"}
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ fontWeight: 600, fontSize: "0.72rem" }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        fontSize: "0.82rem",
                        color: "text.primary",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        verticalAlign: "top",
                      }}
                    >
                      {fErr.contentSnippet || "—"}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "top" }}>
                      <Stack spacing={0.75}>
                        {fErr.errors.map((errText, eIdx) => (
                          <Box
                            key={eIdx}
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 0.8,
                              fontSize: "0.78rem",
                              color: "error.main",
                              fontWeight: 500,
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            <Box
                              sx={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                bgcolor: "error.main",
                                flexShrink: 0,
                                mt: 0.7,
                              }}
                            />
                            <Box sx={{ flex: 1 }}>{errText}</Box>
                          </Box>
                        ))}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      <Divider />

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onReset}
          sx={{ borderRadius: 2 }}
        >
          Re-select File
        </Button>
      </Stack>
    </Stack>
  );
}
