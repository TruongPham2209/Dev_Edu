"use client";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCourses,
  updateCategory,
} from "@/lib/api/courses";
import type { CategoryResponse, CategoryRequest, CourseResponse } from "@/lib/api/types";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

export function AdminDashboard() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryRequest | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryRequest>({
    name: "",
    description: "",
    thumbnailObjectKey: "",
  });

  const loadData = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        getCourses(),
        getCategories("ALL"),
      ]);
      setCourses(coursesData.contents);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCategoryDialog = (category?: CategoryResponse) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        id: category.id,
        name: category.name,
        description: category.description,
        thumbnailObjectKey: category.thumbnailObjectKey,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        thumbnailObjectKey: "",
      });
    }
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await updateCategory(categoryForm);
      } else {
        await createCategory(categoryForm);
      }
      setOpenCategoryDialog(false);
      loadData();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm("Bạn có chắc muốn xóa danh mục này?")) {
      try {
        await deleteCategory(categoryId);
        loadData();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const totalCourseValue = courses.reduce(
    (sum, c) => sum + (c.originalPrice ?? 0),
    0,
  );

  return (
    <Stack spacing={4}>
      {/* Metrics */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng số khóa học
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#c2410c" }}
              >
                {courses.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Danh mục
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#c2410c" }}
              >
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tổng giá trị khóa học (VND)
              </Typography>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#c2410c" }}
              >
                {totalCourseValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Categories Management */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Quản lý danh mục
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog()}
              sx={{ bgcolor: "#c2410c" }}
            >
              Thêm danh mục
            </Button>
          </Box>

          <Stack spacing={2}>
            {categories.map((category) => (
              <Box
                key={category.id}
                sx={{
                  p: 2,
                  border: "1px solid #e5e7eb",
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>
                    {category.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {category.description}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenCategoryDialog(category)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Xóa
                  </Button>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={() => setOpenCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            fullWidth
            label="Tên danh mục"
            value={categoryForm.name}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, name: e.target.value })
            }
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Mô tả"
            value={categoryForm.description}
            onChange={(e) =>
              setCategoryForm({ ...categoryForm, description: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="URL hình ảnh"
            value={categoryForm.thumbnailObjectKey}
            onChange={(e) =>
              setCategoryForm({
                ...categoryForm,
                thumbnailObjectKey: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Huỷ</Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            sx={{ bgcolor: "#c2410c" }}
          >
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
