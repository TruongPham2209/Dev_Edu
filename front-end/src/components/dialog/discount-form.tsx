"use client";

import { FormDialog } from "@/components/common/form-dialog";
import { FormInput } from "@/components/common/form-input";
import { createCourseDiscount } from "@/lib/api/enrollments";
import type {
  CourseDiscountRequest,
  CourseDiscountResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Grid, Typography } from "@mui/material";
import { Calendar, HelpCircle, Percent, Tag } from "lucide-react";
import { useEffect, useState } from "react";

interface DiscountFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: (discount: CourseDiscountResponse) => void;
  courseId?: string | null;
}

export function DiscountFormDialog({
  open,
  onClose,
  onSaved,
  courseId = null,
}: DiscountFormDialogProps) {
  const { handleError, showSuccess } = useApiWithToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    discountPercentage: "",
    validFrom: "",
    validTo: "",
  });

  const [touched, setTouched] = useState({
    description: false,
    discountPercentage: false,
    validFrom: false,
    validTo: false,
  });

  // Reset form when open changes
  useEffect(() => {
    if (open) {
      setForm({
        description: "",
        discountPercentage: "",
        validFrom: "",
        validTo: "",
      });
      setTouched({
        description: false,
        discountPercentage: false,
        validFrom: false,
        validTo: false,
      });
    }
  }, [open]);

  // Validations
  const isDescriptionInvalid = !form.description.trim();

  const percentageNum = Number(form.discountPercentage);
  const isPercentageInvalid =
    !form.discountPercentage ||
    isNaN(percentageNum) ||
    percentageNum <= 0 ||
    percentageNum > 100;

  const isValidFromInvalid = !form.validFrom;
  const isValidToInvalid = !form.validTo;

  const isDateOrderInvalid =
    form.validFrom &&
    form.validTo &&
    new Date(form.validTo) < new Date(form.validFrom);

  const isFormValid =
    !isDescriptionInvalid &&
    !isPercentageInvalid &&
    !isValidFromInvalid &&
    !isValidToInvalid &&
    !isDateOrderInvalid;

  const handleSave = async () => {
    setTouched({
      description: true,
      discountPercentage: true,
      validFrom: true,
      validTo: true,
    });

    if (!isFormValid) {
      return;
    }

    try {
      setLoading(true);

      const requestPayload: CourseDiscountRequest = {
        courseId: courseId || null,
        description: form.description.trim(),
        discountPercentage: Number(form.discountPercentage),
        validFrom: new Date(form.validFrom).toISOString(),
        validTo: new Date(form.validTo).toISOString(),
      };

      const newDiscount = await createCourseDiscount(requestPayload);
      showSuccess(
        courseId
          ? "Đã tạo lịch giảm giá cho khóa học thành công!"
          : "Đã tạo giảm giá chung thành công!",
      );
      onSaved(newDiscount);
      onClose();
    } catch (err) {
      handleError(err, "Không thể tạo lịch giảm giá");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={courseId ? "Tạo Lịch Giảm Giá Khóa Học" : "Tạo Giảm Giá Chung"}
      headerIcon={<Tag size={20} />}
      submitText="Lưu giảm giá"
      isSubmitDisabled={loading || !isFormValid}
      maxWidth="sm"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
        {!courseId && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: "rgba(245, 158, 11, 0.04)",
              border: "1px solid rgba(245, 158, 11, 0.16)",
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              mb: 1,
            }}
          >
            <HelpCircle
              size={18}
              style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }}
            />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "#92400e",
                  mb: 0.25,
                  fontSize: "0.825rem",
                }}
              >
                Thiết lập Giảm giá chung (Tất cả khóa học)
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "#b45309", fontWeight: 550, lineHeight: 1.4 }}
              >
                Mức giảm giá này sẽ tự động áp dụng cho{" "}
                <strong>tất cả khóa học</strong>. Nếu bạn muốn thiết lập giảm
                giá riêng cho một khóa học cụ thể, vui lòng thực hiện trong phần
                Quản lý giảm giá tại trang Chi tiết khóa học đó.
              </Typography>
            </Box>
          </Box>
        )}

        <FormInput
          label="Mô tả chiến dịch giảm giá *"
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          disabled={loading}
          required
          error={touched.description && isDescriptionInvalid}
          helperText="Mô tả chiến dịch là bắt buộc"
          placeholder="Giảm giá 5/5"
          icon={<Tag size={18} />}
          iconPosition="start"
        />

        <FormInput
          label="Phần trăm giảm giá (1-100) *"
          placeholder="10%"
          value={form.discountPercentage}
          type="number"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, discountPercentage: e.target.value }))
          }
          onBlur={() =>
            setTouched((prev) => ({ ...prev, discountPercentage: true }))
          }
          disabled={loading}
          required
          error={touched.discountPercentage && isPercentageInvalid}
          helperText="Phần trăm giảm giá phải là số nguyên từ 1 đến 100"
          icon={<Percent size={18} />}
          iconPosition="start"
          slotProps={{
            htmlInput: { min: 1, max: 100 },
          }}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Thời gian bắt đầu *"
              type="date"
              value={form.validFrom}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, validFrom: e.target.value }))
              }
              onBlur={() =>
                setTouched((prev) => ({ ...prev, validFrom: true }))
              }
              disabled={loading}
              required
              error={touched.validFrom && isValidFromInvalid}
              helperText="Thời gian bắt đầu là bắt buộc"
              icon={<Calendar size={18} />}
              iconPosition="start"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormInput
              label="Thời gian kết thúc *"
              type="date"
              value={form.validTo}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, validTo: e.target.value }))
              }
              onBlur={() => setTouched((prev) => ({ ...prev, validTo: true }))}
              disabled={loading}
              required
              error={
                (touched.validTo && isValidToInvalid) ||
                (touched.validTo && Boolean(isDateOrderInvalid))
              }
              helperText={
                touched.validTo && isValidToInvalid
                  ? "Thời gian kết thúc là bắt buộc"
                  : touched.validTo && isDateOrderInvalid
                    ? "Thời gian kết thúc phải sau thời gian bắt đầu"
                    : ""
              }
              icon={<Calendar size={18} />}
              iconPosition="start"
            />
          </Grid>
        </Grid>
      </Box>
    </FormDialog>
  );
}
