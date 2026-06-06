import { FormInput } from "@/components/common/form/form-input";
import { FilterSelect } from "@/components/common/form/filter-select";
import type { RegisterUser, RoleEnum } from "@/lib/api/types";
import { useBatchCreateUsersMutation } from "@/lib/api/users";
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
  const { mutateAsync: batchCreateUsersMutate } = useBatchCreateUsersMutation();

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

      await batchCreateUsersMutate([payload]);
      showSuccess("User created successfully!");
      onSaved();
      onClose();
    } catch (err) {
      handleError(err, "Could not create user");
      throw err;
    }
  }, [
    manualForm,
    isFormValid,
    showSuccess,
    onSaved,
    onClose,
    handleError,
    batchCreateUsersMutate,
  ]);

  useEffect(() => {
    onReady(isFormValid, handleSubmit);
  }, [isFormValid, handleSubmit, onReady]);

  return (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Full name *"
          placeholder="Nguyen Van A"
          value={manualForm.fullName}
          onChange={(e) =>
            setManualForm((prev) => ({
              ...prev,
              fullName: e.target.value,
            }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
          error={touched.fullName && isFullNameInvalid}
          helperText="Full name is required"
          icon={<User size={18} />}
          iconPosition="start"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Username *"
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
          helperText="Must start with a letter, be 3-32 characters long (letters and numbers)"
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
          helperText="Email is invalid"
          icon={<Mail size={18} />}
          iconPosition="start"
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormInput
          label="Password *"
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
          helperText="At least 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character"
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
            label="Role *"
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
            Select the role for the account
          </FormHelperText>
        </Box>
      </Grid>
    </Grid>
  );
}
