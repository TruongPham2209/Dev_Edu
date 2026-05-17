"use client";

import {
  createCourse,
  deleteCourse,
  getCategories,
  getCourses,
  updateCourse,
} from "@/lib/api/courses";
import type { CategoryResponse, CourseResponse, CourseRequest } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export function LecturerCourseManagement() {
  const { handleError, showSuccess } = useApiWithToast();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null,
  );
  const [formData, setFormData] = useState<CourseRequest>({
    categoryId: "",
    title: "",
    description: "",
    price: 0,
    thumbnailObjectKey: "",
    lecturerUsernames: [],
  });

  useEffect(() => {
    loadCourses();
    loadCategories();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data.contents);
    } catch (error) {
      handleError(error, "Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      handleError(error, "Không thể tải danh mục");
    }
  };

  const handleOpenDialog = (course?: CourseResponse) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        id: course.id,
        categoryId: "",
        title: course.title,
        description: course.description,
        price: course.originalPrice ?? 0,
        thumbnailObjectKey: course.thumbnailObjectKey,
        lecturerUsernames: course.lecturers ?? [],
      });
    } else {
      setEditingCourse(null);
      setFormData({
        categoryId: "",
        title: "",
        description: "",
        price: 0,
        thumbnailObjectKey: "",
        lecturerUsernames: [],
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingCourse) {
        await updateCourse(formData);
        showSuccess("Khóa học đã được cập nhật thành công");
      } else {
        await createCourse(formData);
        showSuccess("Khóa học đã được tạo thành công");
      }
      setOpenDialog(false);
      loadCourses();
    } catch (error) {
      handleError(error, "Không thể lưu khóa học");
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("Bạn có chắc muốn xóa khóa học này?")) {
      try {
        await deleteCourse(courseId);
        showSuccess("Khóa học đã được xóa thành công");
        loadCourses();
      } catch (error) {
        handleError(error, "Không thể xóa khóa học");
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Quản lý khóa học
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: "#1d4ed8" }}
        >
          Thêm khóa học
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f3f4f6" }}>
                <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giá</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Giảng viên</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>
                    {course.originalPrice != null
                      ? `${course.originalPrice.toLocaleString()} VND`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {course.lecturers?.join(", ") || "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      textAlign: "right",
                      display: "flex",
                      gap: 1,
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(course)}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(course.id)}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCourse ? "Sửa khóa học" : "Thêm khóa học"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            fullWidth
            label="Tiêu đề"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mô tả"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            type="number"
            label="Giá (VND)"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
          />
          <TextField
            fullWidth
            select
            label="Danh mục"
            value={formData.categoryId}
            onChange={(e) =>
              setFormData({ ...formData, categoryId: e.target.value })
            }
            slotProps={{
              select: {
                native: true,
              },
            }}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Huỷ</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ bgcolor: "#1d4ed8" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
