import { FormInput } from "@/components/common/form-input";
import { FilterSelect } from "@/components/common/filter-select";
import type { RegisterUser, RoleEnum } from "@/lib/api/types";
import { batchCreateUsers } from "@/lib/api/users";
import { ROLE_OPTIONS } from "@/lib/roles";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, FormHelperText, Grid } from "@mui/material";
import { AtSign, Eye, EyeOff, Mail, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{2,31}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface ManualTabProps {
  onReady: (isValid: boolean, submitFn: () => Promise<void>) => void;
  onSaved: () => void;
  onClose: () => void;
}

export function ManualTab({ onReady, onSaved, onClose }: ManualTabProps) {
  const { handleError, showSuccess } = useApiWithToast();

  const [manualForm, setManualForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "STUDENT" as RoleEnum,
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    fullName: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const isUsernameInvalid = !usernameRegex.test(manualForm.username);
  const isEmailInvalid = !emailRegex.test(manualForm.email);
  const isPasswordInvalid = !passwordRegex.test(manualForm.password);
  const isFullNameInvalid = !manualForm.fullName.trim();

  const isFormValid =
    !isUsernameInvalid &&
    !isEmailInvalid &&
    !isPasswordInvalid &&
    !isFullNameInvalid;

  const handleSubmit = useCallback(async () => {
    setTouched({
      username: true,
      email: true,
      password: true,
      fullName: true,
    });

    if (!isFormValid) {
      return Promise.reject(new Error("Form is invalid"));
    }

    try {
      const payload: RegisterUser = {
        username: manualForm.username.trim(),
        email: manualForm.email.trim(),
        password: manualForm.password,
        fullName: manualForm.fullName.trim(),
        role: manualForm.role,
      };

      await batchCreateUsers([payload]);
      showSuccess("Đã tạo người dùng mới thành công!");
      onSaved();
      onClose();
    } catch (err) {
      handleError(err, "Không thể tạo người dùng mới");
      throw err;
    }
  }, [manualForm, isFormValid, showSuccess, onSaved, onClose, handleError]);

  useEffect(() => {
    onReady(isFormValid, handleSubmit);
  }, [isFormValid, handleSubmit, onReady]);

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Họ và tên *"
          placeholder="Nguyễn Văn A"
          value={manualForm.fullName}
          onChange={(e) =>
            setManualForm((prev) => ({
              ...prev,
              fullName: e.target.value,
            }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
          error={touched.fullName && isFullNameInvalid}
          helperText="Họ và tên là bắt buộc"
          icon={<User size={18} />}
          iconPosition="start"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Tên đăng nhập (Username) *"
          placeholder="nguyena"
          value={manualForm.username}
          onChange={(e) =>
            setManualForm((prev) => ({
              ...prev,
              username: e.target.value.toLowerCase(),
            }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, username: true }))}
          error={touched.username && isUsernameInvalid}
          helperText="Phải bắt đầu bằng chữ cái, dài từ 3-32 ký tự chữ và số"
          icon={<AtSign size={18} />}
          iconPosition="start"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Email *"
          placeholder="nguyena@example.com"
          value={manualForm.email}
          onChange={(e) =>
            setManualForm((prev) => ({ ...prev, email: e.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={touched.email && isEmailInvalid}
          helperText="Email không đúng định dạng"
          icon={<Mail size={18} />}
          iconPosition="start"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Mật khẩu *"
          placeholder="User@123"
          type={showPassword ? "text" : "password"}
          value={manualForm.password}
          onChange={(e) =>
            setManualForm((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          error={touched.password && isPasswordInvalid}
          helperText="Tối thiểu 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt"
          icon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          iconPosition="end"
          onIconClick={() => setShowPassword((p) => !p)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Box
          sx={{
            width: "100%",
            "& .MuiFormControl-root": { width: "100% !important" },
          }}
        >
          <FilterSelect
            label="Vai trò *"
            value={manualForm.role}
            onChange={(val) =>
              setManualForm((prev) => ({
                ...prev,
                role: val as RoleEnum,
              }))
            }
            items={ROLE_OPTIONS}
          />
          <FormHelperText sx={{ mx: 1.5, mt: 0.5 }}>
            Chọn quyền hạn cho tài khoản
          </FormHelperText>
        </Box>
      </Grid>
    </Grid>
  );
}
