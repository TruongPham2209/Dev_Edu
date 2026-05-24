import type { RegisterUser, RoleEnum } from "@/lib/api/types";
import { batchCreateUsers } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
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
  onSaved: () => void;
  onClose: () => void;
}

export function ImportTab({ onReady, onSaved, onClose }: ImportTabProps) {
  const { handleError, showSuccess } = useApiWithToast();

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
      await batchCreateUsers(importedUsers);
      showSuccess(`Đã tạo thành công ${importedUsers.length} người dùng mới!`);
      onSaved();
      onClose();
    } catch (err) {
      handleError(err, "Không thể tạo danh sách người dùng");
      throw err;
    }
  }, [importedUsers, showSuccess, onSaved, onClose, handleError]);

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
        "Nguyễn Văn A",
        "STUDENT",
      ],
      ["tranb", "tranb@example.com", "TranB456!", "Trần Thị B", "LECTURER"],
      ["adminc", "adminc@example.com", "AdminC789!", "Vũ Văn C", "ADMIN"],
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
                "Tệp không chứa bất kỳ dòng dữ liệu nào ngoài dòng tiêu đề.",
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
              message: "Vai trò là trường bắt buộc (STUDENT, LECTURER, ADMIN)",
            });
          } else {
            errors.push({
              row: rowNum,
              field: "role",
              value: rawRole,
              message: `Vai trò không hợp lệ: "${rawRole}". Chấp nhận: STUDENT, LECTURER, ADMIN`,
            });
          }

          // Validate username
          if (!username) {
            errors.push({
              row: rowNum,
              field: "username",
              value: "",
              message: "Tên đăng nhập là trường bắt buộc",
            });
          } else if (!usernameRegex.test(username)) {
            errors.push({
              row: rowNum,
              field: "username",
              value: username,
              message:
                "Tên đăng nhập không hợp lệ (bắt đầu bằng chữ cái, dài từ 3-32 ký tự chữ và số)",
            });
          } else if (seenUsernames.has(username)) {
            errors.push({
              row: rowNum,
              field: "username",
              value: username,
              message: "Tên đăng nhập bị trùng lặp trong tệp tải lên",
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
              message: "Email là trường bắt buộc",
            });
          } else if (!emailRegex.test(email)) {
            errors.push({
              row: rowNum,
              field: "email",
              value: email,
              message: "Email không đúng định dạng",
            });
          } else if (seenEmails.has(email)) {
            errors.push({
              row: rowNum,
              field: "email",
              value: email,
              message: "Email bị trùng lặp trong tệp tải lên",
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
              message: "Mật khẩu là trường bắt buộc",
            });
          } else if (!passwordRegex.test(password)) {
            errors.push({
              row: rowNum,
              field: "password",
              value: "******",
              message:
                "Mật khẩu yếu (tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt)",
            });
          }

          // Validate fullName
          if (!fullName) {
            errors.push({
              row: rowNum,
              field: "fullName",
              value: "",
              message: "Họ và tên là trường bắt buộc",
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
              "Không thể phân tích dữ liệu tệp. Vui lòng đảm bảo đúng định dạng Excel.",
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
            message: "Hệ thống chỉ hỗ trợ định dạng Excel (.xlsx, .xls)",
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Bạn có thể tạo hàng loạt người dùng bằng cách tải lên file mẫu Excel đã
          nhập thông tin.
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
          }}
        >
          Tải file mẫu
        </Button>
      </Box>

      {importedUsers.length === 0 && importErrors.length === 0 ? (
        // Drag and drop zone
        <Box
          sx={{
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
            Kéo và thả file Excel vào đây
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hoặc nhấp để chọn tệp từ máy tính. Hỗ trợ định dạng .xlsx, .xls
          </Typography>
        </Box>
      ) : importErrors.length > 0 ? (
        // Error List Table
        <Box>
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Tệp của bạn chứa {importErrors.length} lỗi validation. Vui lòng sửa
              lại tệp Excel và tải lên lại.
            </Typography>
          </Alert>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              maxHeight: 300,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Dòng</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cột / Trường</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Giá trị hiện tại
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: "error.main" }}>
                    Mô tả lỗi
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importErrors.map((err, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ fontWeight: 650 }}>
                      {err.row > 0 ? `Dòng ${err.row}` : "-"}
                    </TableCell>
                    <TableCell
                      sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                      }}
                    >
                      {err.field}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "text.secondary",
                        fontFamily: "monospace",
                      }}
                    >
                      {err.value || <em style={{ opacity: 0.5 }}>Trống</em>}
                    </TableCell>
                    <TableCell sx={{ color: "error.main", fontWeight: 500 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <AlertCircle size={14} />
                        {err.message}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              variant="contained"
              color="inherit"
              size="small"
              onClick={() => {
                setImportErrors([]);
                setFile(null);
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Chọn file khác
            </Button>
          </Box>
        </Box>
      ) : (
        // Success Imported Users List Table
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
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
                Hợp lệ {importedUsers.length} người dùng từ tệp &quot;
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
              Xóa tệp đã chọn
            </Button>
          </Box>

          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(0,0,0,0.08)",
              maxHeight: 300,
            }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Họ và tên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Tên đăng nhập</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Vai trò</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {importedUsers.map((usr, idx) => (
                  <TableRow key={idx}>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>
                      {usr.fullName}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{usr.username}</TableCell>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {usr.email}
                    </TableCell>
                    <TableCell>
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
                    <TableCell align="right">
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
