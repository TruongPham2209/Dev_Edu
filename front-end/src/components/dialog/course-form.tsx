"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import { FilterSelect } from "@/components/common/form/filter-select";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { RichTextEditor } from "@/components/common/form/rich-text-editor";
import { SearchInput } from "@/components/common/form/search-input";
import { useCourseByIdQuery } from "@/lib/api/courses";
import { useSearchUsersQuery } from "@/lib/api/users";
import type {
  CategoryResponse,
  CourseRequest,
  CourseResponse,
} from "@/lib/type/courses";
import type { UserResponse } from "@/lib/type/users";
import {
  Box,
  Chip,
  FormHelperText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen, DollarSign, FolderPlus, Save, Type } from "lucide-react";
import { useMemo, useState } from "react";

type CourseFormDialogProps = {
  open: boolean;
  title: string;
  categories: CategoryResponse[];
  initialValue: CourseRequest;
  editingCourse?: CourseResponse | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (payload: CourseRequest, selectedFile: File | null) => Promise<void>;
};

export function CourseFormDialog({
  open,
  title,
  categories,
  initialValue,
  editingCourse,
  saving = false,
  onClose,
  onSave,
}: CourseFormDialogProps) {
  const [form, setForm] = useState<CourseRequest>(initialValue);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState(false);

  // Lecturer search & assignment state
  const [lecturerSearchQuery, setLecturerSearchQuery] = useState("");
  const [lecturerInputFocused, setLecturerInputFocused] = useState(false);

  const isUpdate = Boolean(initialValue.id);
  const { data: courseDetails, isLoading: loadingDetails } = useCourseByIdQuery(
    initialValue.id || "",
    {
      enabled: open && isUpdate && !!initialValue.id,
    },
  );

  const { data: searchData, isLoading: isSearchingLecturers } =
    useSearchUsersQuery(0, lecturerSearchQuery, "LECTURER", {
      enabled: lecturerInputFocused,
    });

  const lecturerSearchResults = useMemo(() => {
    return searchData?.contents || [];
  }, [searchData]);

  const [prevInitial, setPrevInitial] = useState({
    open,
    id: initialValue.id,
    initialValue,
  });
  const [prevDetails, setPrevDetails] = useState<CourseResponse | null | undefined>(null);

  if (courseDetails && prevDetails !== courseDetails) {
    setPrevDetails(courseDetails);
    setForm((prev) => ({
      ...prev,
      lecturerUsernames: courseDetails.lecturers ?? [],
      description: courseDetails.description || prev.description,
    }));
  }

  if (
    prevInitial.open !== open ||
    prevInitial.id !== initialValue.id ||
    prevInitial.initialValue !== initialValue
  ) {
    setPrevInitial({ open, id: initialValue.id, initialValue });
    if (open) {
      let targetCategoryId = initialValue.categoryId;

      if (isUpdate) {
        // Update mode: Fallback to first category if active category doesn't exist
        const categoryExists = categories.some(
          (c) => c.id === initialValue.categoryId,
        );
        if (!categoryExists && categories.length > 0) {
          targetCategoryId = categories[0].id;
        }
      } else {
        // Create mode: Default select the first category
        if (
          (!targetCategoryId || targetCategoryId.trim() === "") &&
          categories.length > 0
        ) {
          targetCategoryId = categories[0].id;
        }
      }

      setForm((prev) => ({
        ...initialValue,
        categoryId: targetCategoryId,
        lecturerUsernames:
          prev.lecturerUsernames || initialValue.lecturerUsernames || [],
      }));
      setSelectedFile(null);
      setTouched(false);
    }
  }

  // Comprehensive, strict validation
  const errors = useMemo(() => {
    const isUpdate = Boolean(initialValue.id);
    // Strip HTML tags for character count check in description
    const strippedDesc = form.description.replace(/<[^>]*>/g, "").trim();

    return {
      title: form.title.trim().length < 3,
      description: strippedDesc.length < 10,
      categoryId: !form.categoryId || form.categoryId.trim().length === 0,
      price: Number.isNaN(form.price) || form.price < 0,
      thumbnail: !isUpdate && !selectedFile && !form.thumbnailObjectKey, // In create, image is REQUIRED
      lecturers: form.lecturerUsernames.length === 0,
    };
  }, [form, selectedFile, initialValue.id]);

  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  const handleSave = async () => {
    setTouched(true);
    if (!isValid) return;

    const payload: CourseRequest = {
      id: form.id,
      categoryId: form.categoryId,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      thumbnailObjectKey: form.thumbnailObjectKey.trim(),
      lecturerUsernames: form.lecturerUsernames,
    };
    await onSave(payload, selectedFile);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={title}
      headerIcon={<BookOpen size={20} />}
      submitText={editingCourse ? "Save Changes" : "Create Course"}
      submitIcon={editingCourse ? <Save size={16} /> : <FolderPlus size={16} />}
      isSubmitDisabled={!isValid || saving || loadingDetails}
      maxWidth="md"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          pointerEvents: saving ? "none" : "auto",
          opacity: saving ? 0.7 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {loadingDetails ? (
          <Stack spacing={3}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 2, flex: 7 }}
              />
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 2, flex: 3 }}
              />
            </Stack>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 2, flex: 7 }}
              />
              <Skeleton
                variant="rectangular"
                height={56}
                sx={{ borderRadius: 2, flex: 3 }}
              />
            </Stack>
            <Skeleton
              variant="rectangular"
              height={160}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
          </Stack>
        ) : (
          <>
            {/* Row 1: Title and Price */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2.5,
              }}
            >
              <Box sx={{ flex: 7 }}>
                <FormInput
                  label="Course Title"
                  placeholder="e.g., Advanced Next.js & React 19"
                  value={form.title}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  error={touched && errors.title}
                  helperText="Title should be at least 3 characters"
                  icon={<Type size={18} />}
                  iconPosition="start"
                  slotProps={{
                    htmlInput: {
                      style: { fontWeight: 500 },
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: 3 }}>
                <FormInput
                  label="Price (VND)"
                  type="number"
                  placeholder="0"
                  value={form.price}
                  disabled={saving}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      price: Number(event.target.value),
                    }))
                  }
                  error={touched && errors.price}
                  helperText="Price must be 0 or more"
                  icon={<DollarSign size={18} />}
                  iconPosition="start"
                />
              </Box>
            </Box>

            {/* Row 2: Lecturer and Category */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2.5,
              }}
            >
              <Box
                sx={{
                  flex: 7,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box sx={{ position: "relative", zIndex: 50, height: 56 }}>
                  <SearchInput<UserResponse>
                    value={lecturerSearchQuery}
                    onChange={setLecturerSearchQuery}
                    onClear={() => setLecturerSearchQuery("")}
                    onFocus={() => setLecturerInputFocused(true)}
                    placeholder="Search & Assign Lecturers..."
                    showDropdown={
                      lecturerInputFocused &&
                      (lecturerSearchResults.length > 0 ||
                        isSearchingLecturers ||
                        lecturerSearchQuery.trim().length > 0)
                    }
                    loading={isSearchingLecturers}
                    dropdownItems={lecturerSearchResults.map((u: UserResponse) => ({
                      label: u.fullName,
                      value: u.username,
                      original: u,
                    }))}
                    renderDropdownItem={(item) => (
                      <Stack spacing={0.5}>
                        <Typography
                          sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                          className="search-item-text"
                        >
                          {item.original?.fullName || item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          @{item.original?.username} • {item.original?.email}
                        </Typography>
                      </Stack>
                    )}
                    onDropdownItemSelect={(username) => {
                      if (!form.lecturerUsernames.includes(username)) {
                        setForm((prev) => ({
                          ...prev,
                          lecturerUsernames: [
                            ...prev.lecturerUsernames,
                            username,
                          ],
                        }));
                      }
                      setLecturerSearchQuery("");
                    }}
                    maxWidth="100%"
                  />
                </Box>
                {touched && errors.lecturers && (
                  <FormHelperText error sx={{ mx: 1.5 }}>
                    At least one lecturer is required
                  </FormHelperText>
                )}

                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 0.5 }}
                >
                  {form.lecturerUsernames.map((username) => (
                    <Chip
                      key={username}
                      label={`@${username}`}
                      onDelete={
                        saving
                          ? undefined
                          : () => {
                            setForm((prev) => ({
                              ...prev,
                              lecturerUsernames:
                                prev.lecturerUsernames.filter(
                                  (n) => n !== username,
                                ),
                            }));
                          }
                      }
                      disabled={saving}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 600,
                        bgcolor: "action.hover",
                        color: "text.primary",
                        border: "1px solid",
                        borderColor: "divider",
                        "& .MuiChip-deleteIcon": {
                          color: "text.secondary",
                          "&:hover": { color: "error.main" },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 3,
                  display: "flex",
                  flexDirection: "column",
                  "& .MuiFormControl-root": { width: "100% !important" },
                  pointerEvents: saving ? "none" : "auto",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <FilterSelect
                  label="Category"
                  value={form.categoryId}
                  onChange={(val) =>
                    setForm((prev) => ({
                      ...prev,
                      categoryId: val,
                    }))
                  }
                  items={categories.map((category) => ({
                    id: category.id,
                    title: category.name,
                  }))}
                  defaultLabel="Select Category"
                  defaultValue=""
                />
                {touched && errors.categoryId && (
                  <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                    Category is required
                  </FormHelperText>
                )}
              </Box>
            </Box>

            {/* Row 3: Image Selection */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "text.primary", mb: 1 }}
              >
                Course Cover Image
              </Typography>
              <FileUpload
                value={editingCourse?.thumbnailUrl}
                file={selectedFile}
                onChange={setSelectedFile}
                error={touched && errors.thumbnail}
                helperText={
                  touched && errors.thumbnail
                    ? "Thumbnail image is required"
                    : ""
                }
                height={160}
                accept="image/*"
              />
            </Box>

            {/* Row 4: Rich-text Description */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Course Description
              </Typography>
              <RichTextEditor
                value={form.description}
                onChange={(html) =>
                  setForm((prev) => ({ ...prev, description: html }))
                }
                disableImage={true}
              />
              {touched && errors.description && (
                <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
                  Description should be at least 10 characters
                </FormHelperText>
              )}
            </Box>
          </>
        )}
      </Box>
    </FormDialog>
  );
}
