import { useBatchCreateUsersMutation } from "@/lib/api/users";
import type { RoleEnum } from "@/lib/type/enum";
import type { RegisterUser } from "@/lib/type/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Alert,
  Box,
  Button,
  IconButton,
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
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{2,31}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
}

interface ImportTabProps {
  onReady: (
    isValid: boolean,
    submitFn: () => Promise<void>,
    itemCount: number,
  ) => void;
  onSaved: () => Promise<void>;
  onClose: () => void;
}

export function ImportTab({ onReady, onSaved, onClose }: ImportTabProps) {
  const { handleError, showSuccess } = useApiWithToast();
  const { mutateAsync: batchCreateUsersMutate } = useBatchCreateUsersMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importedUsers, setImportedUsers] = useState<RegisterUser[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const handleSubmit = useCallback(async () => {
    if (importedUsers.length === 0) {
      return Promise.reject(new Error("No valid users to import"));
    }

    try {
      await batchCreateUsersMutate(importedUsers);
      showSuccess(`Created ${importedUsers.length} users successfully!`);
      await onSaved();
      onClose();
    } catch (err) {
      handleError(err, "Could not create users");
      throw err;
    }
  }, [
    importedUsers,
    showSuccess,
    onSaved,
    onClose,
    handleError,
    batchCreateUsersMutate,
  ]);

  useEffect(() => {
    const isValid = importedUsers.length > 0 && importErrors.length === 0;
    onReady(isValid, handleSubmit, importedUsers.length);
  }, [importedUsers.length, importErrors.length, handleSubmit, onReady]);

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const headers = [["username", "email", "password", "fullName", "role"]];
    const sampleRow = [
      [
        "nguyena",
        "nguyena@example.com",
        "NguyenA123!",
        "Nguyen Van A",
        "STUDENT",
      ],
      ["tranb", "tranb@example.com", "TranB456!", "Tran Thi B", "LECTURER"],
      ["adminc", "adminc@example.com", "AdminC789!", "Vu Van C", "ADMIN"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...sampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Import_Users_Template.xlsx");
  };

  // Parse Excel File
  const parseExcelFile = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows =
          XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        if (rows.length === 0) {
          setImportErrors([
            {
              row: 1,
              field: "File",
              value: "",
              message:
                "Your file does not contain any data rows other than the header row.",
            },
          ]);
          setImportedUsers([]);
          return;
        }

        const errors: ImportError[] = [];
        const parsedUsers: RegisterUser[] = [];
        const seenUsernames = new Set<string>();
        const seenEmails = new Set<string>();

        rows.forEach((row, index) => {
          const rowNum = index + 2; // Row index is 0-based, header is row 1
          const username = String(row.username || row.Username || "").trim();
          const email = String(row.email || row.Email || "").trim();
          const password = String(row.password || row.Password || "").trim();
          const fullName = String(
            row.fullName ||
              row.FullName ||
              row["Họ và tên"] ||
              row["Ho va ten"] ||
              "",
          ).trim();
          let rawRole = String(
            row.role || row.Role || row["Vai trò"] || row["Vai tro"] || "",
          )
            .trim()
            .toUpperCase();

          // Role parsing
          if (
            rawRole === "STUDENT" ||
            rawRole === "HỌC VIÊN" ||
            rawRole === "HOC VIEN" ||
            rawRole === "STUDENT"
          ) {
            rawRole = "STUDENT";
          } else if (
            rawRole === "LECTURER" ||
            rawRole === "GIẢNG VIÊN" ||
            rawRole === "GIANG VIEN" ||
            rawRole === "INSTRUCTOR"
          ) {
            rawRole = "LECTURER";
          } else if (
            rawRole === "ADMIN" ||
            rawRole === "QUẢN TRỊ VIÊN" ||
            rawRole === "QUAN TRI VIEN"
          ) {
            rawRole = "ADMIN";
          } else if (!rawRole) {
            errors.push({
              row: rowNum,
              field: "role",
              value: "",
              message: "Role is required (STUDENT, LECTURER, ADMIN)",
            });
          } else {
            errors.push({
              row: rowNum,
              field: "role",
              value: rawRole,
              message: `Invalid role: "${rawRole}". Accepted: STUDENT, LECTURER, ADMIN`,
            });
          }

          // Validate username
          if (!username) {
            errors.push({
              row: rowNum,
              field: "username",
              value: "",
              message: "Username is required",
            });
          } else if (!usernameRegex.test(username)) {
            errors.push({
              row: rowNum,
              field: "username",
              value: username,
              message:
                "Invalid username (must start with a letter, be 3-32 characters long - letters and numbers only)",
            });
          } else if (seenUsernames.has(username)) {
            errors.push({
              row: rowNum,
              field: "username",
              value: username,
              message: "Username is duplicated in the uploaded file",
            });
          } else {
            seenUsernames.add(username);
          }

          // Validate email
          if (!email) {
            errors.push({
              row: rowNum,
              field: "email",
              value: "",
              message: "Email is required",
            });
          } else if (!emailRegex.test(email)) {
            errors.push({
              row: rowNum,
              field: "email",
              value: email,
              message: "Email is invalid",
            });
          } else if (seenEmails.has(email)) {
            errors.push({
              row: rowNum,
              field: "email",
              value: email,
              message: "Email is duplicated in the uploaded file",
            });
          } else {
            seenEmails.add(email);
          }

          // Validate password
          if (!password) {
            errors.push({
              row: rowNum,
              field: "password",
              value: "",
              message: "Password is required",
            });
          } else if (!passwordRegex.test(password)) {
            errors.push({
              row: rowNum,
              field: "password",
              value: "******",
              message:
                "Password is weak (at least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character)",
            });
          }

          // Validate fullName
          if (!fullName) {
            errors.push({
              row: rowNum,
              field: "fullName",
              value: "",
              message: "Full name is required",
            });
          }

          if (errors.filter((e) => e.row === rowNum).length === 0) {
            parsedUsers.push({
              username,
              email,
              password,
              fullName,
              role: rawRole as RoleEnum,
            });
          }
        });

        if (errors.length > 0) {
          setImportErrors(errors);
          setImportedUsers([]);
          setFile(null);
        } else {
          setImportErrors([]);
          setImportedUsers(parsedUsers);
        }
      } catch (err) {
        setImportErrors([
          {
            row: 0,
            field: "File",
            value: "",
            message:
              "Could not parse file data. Please ensure the Excel format is correct.",
          },
        ]);
        setImportedUsers([]);
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const ext = droppedFile.name.split(".").pop()?.toLowerCase();
      if (ext !== "xlsx" && ext !== "xls") {
        setImportErrors([
          {
            row: 0,
            field: "File",
            value: droppedFile.name,
            message: "System only support Excel (.xlsx, .xls)",
          },
        ]);
        return;
      }
      setFile(droppedFile);
      parseExcelFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseExcelFile(selectedFile);
    }
  };

  const handleRemoveImportUser = (index: number) => {
    setImportedUsers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          You can create bulk users by uploading an Excel template file with the
          entered information.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Download size={16} />}
          onClick={handleDownloadTemplate}
          sx={{
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 700,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          Download Template
        </Button>
      </Stack>

      {importedUsers.length === 0 && importErrors.length === 0 ? (
        // Drag and drop zone
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 240,
            p: 4.5,
            border: "2px dashed",
            borderColor: dragActive ? "primary.main" : "divider",
            borderRadius: 3.5,
            bgcolor: dragActive ? "rgba(37, 99, 235, 0.04)" : "grey.50",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "rgba(37, 99, 235, 0.02)",
            },
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls"
            hidden
            onChange={handleFileChange}
          />
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: "rgba(37, 99, 235, 0.06)",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Upload size={24} />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}
          >
            Drag and drop Excel file here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Or click to select a file from your computer. Supports .xlsx, .xls
          </Typography>
        </Box>
      ) : importErrors.length > 0 ? (
        // Error List Table
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "100%",
            alignItems: "center",
            mx: "auto",
          }}
        >
          <Alert
            severity="error"
            action={
              <Button
                color="error"
                size="small"
                variant="outlined"
                onClick={() => {
                  setImportErrors([]);
                  setFile(null);
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "background.paper",
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                }}
              >
                Choose Another File
              </Button>
            }
            sx={{
              width: "100%",
              borderRadius: 2.5,
              alignItems: "center",
              "& .MuiAlert-message": {
                width: "100%",
                display: "flex",
                alignItems: "center",
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Your file contains {importErrors.length} validation error
              {importErrors.length > 1 ? "s" : ""}. Please correct the Excel
              file and upload it again.
            </Typography>
          </Alert>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              mx: "auto",
              borderRadius: 3,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              maxHeight: 280,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      width: 90,
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Line
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      width: 140,
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Column / Field
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      width: 160,
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Current Value
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      color: "error.main",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Error Description
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importErrors.map((err, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: 650,
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {err.row > 0 ? `Line ${err.row}` : "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        color: "text.primary",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {err.field === "fullName"
                        ? "Full Name"
                        : err.field.charAt(0).toUpperCase() +
                          err.field.slice(1)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        fontFamily: "monospace",
                        whiteSpace: "nowrap",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {err.value || <em style={{ opacity: 0.5 }}>Empty</em>}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "error.main",
                        fontWeight: 500,
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                        }}
                      >
                        <AlertCircle size={15} style={{ flexShrink: 0 }} />
                        <span>{err.message}</span>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ) : (
        // Success Imported Users List Table
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
            alignItems: "center",
            mx: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "success.main",
              }}
            >
              <CheckCircle2 size={18} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Valid {importedUsers.length} users from file &quot;
                {file?.name}&quot;
              </Typography>
            </Box>
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={() => {
                setImportedUsers([]);
                setFile(null);
              }}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Remove Selected File
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              width: "100%",
              mx: "auto",
              borderRadius: 3,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              maxHeight: 280,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      width: 60,
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    No
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Full Name
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Username
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Email
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Role
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      verticalAlign: "middle",
                      py: 1.2,
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importedUsers.map((usr, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell
                      align="center"
                      sx={{
                        color: "text.secondary",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {idx + 1}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {usr.fullName}
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {usr.username}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        verticalAlign: "middle",
                        py: 1,
                      }}
                    >
                      {usr.email}
                    </TableCell>
                    <TableCell sx={{ verticalAlign: "middle", py: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          px: 1,
                          py: 0.25,
                          borderRadius: 1.5,
                          textTransform: "uppercase",
                          display: "inline-block",
                          bgcolor:
                            usr.role === "ADMIN"
                              ? "rgba(239, 68, 68, 0.08)"
                              : usr.role === "LECTURER"
                                ? "rgba(245, 158, 11, 0.08)"
                                : "rgba(59, 130, 246, 0.08)",
                          color:
                            usr.role === "ADMIN"
                              ? "#ef4444"
                              : usr.role === "LECTURER"
                                ? "#f59e0b"
                                : "#3b82f6",
                          border:
                            usr.role === "ADMIN"
                              ? "1px solid rgba(239, 68, 68, 0.12)"
                              : usr.role === "LECTURER"
                                ? "1px solid rgba(245, 158, 11, 0.12)"
                                : "1px solid rgba(59, 130, 246, 0.12)",
                        }}
                      >
                        {usr.role}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ verticalAlign: "middle", py: 1 }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImportUser(idx)}
                        sx={{
                          color: "error.main",
                          "&:hover": {
                            bgcolor: "rgba(239, 68, 68, 0.05)",
                          },
                        }}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}
