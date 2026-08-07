"use client";

import { FormInput } from "@/components/common/form/form-input";
import { AuthLayout } from "@/components/layout/auth-layout";
import { useRegisterMutation } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { Eye, EyeOff, Lock, Mail, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const registerMutation = useRegisterMutation({
    onSuccess: () => {
      showSuccess(
        "Account registration successful! Redirecting to login page...",
      );
      setTimeout(() => {
        router.push("/login");
      }, 1000);
    },
    onError: (error) => {
      handleError(error, "Account registration failed");
      setErrorMsg(
        error.message ||
          "Account registration failed. Please check your information.",
      );
    },
  });

  const handleChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (fieldErrors[field]) {
        setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = () => {
    const errors: typeof fieldErrors = {};

    if (!form.fullName.trim()) {
      errors.fullName = "Please enter your full name.";
    } else if (form.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!form.username.trim()) {
      errors.username = "Please enter username.";
    } else if (form.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      errors.username =
        "Username can only contain letters, numbers and underscores.";
    }

    if (!form.email.trim()) {
      errors.email = "Please enter email.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Email is not valid.";
    }

    if (!form.password) {
      errors.password = "Please enter your password.";
    } else if (form.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    if (validate()) {
      registerMutation.mutate(form);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start your learning journey and build your career with DevEdu."
    >
      <Stack spacing={3.5} component="form" onSubmit={handleSubmit} noValidate>
        {errorMsg && (
          <Alert
            severity="error"
            sx={{ borderRadius: "12px", fontWeight: 550 }}
          >
            {errorMsg}
          </Alert>
        )}

        {/* Group 1: Basic Profile Info */}
        <Stack spacing={2.5}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#166534",
              fontWeight: 800,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid rgba(15, 23, 42, 0.05)",
              pb: 1,
            }}
          >
            Personal Information
          </Typography>

          <FormInput
            label="Full name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange("fullName")}
            error={Boolean(fieldErrors.fullName)}
            helperText={fieldErrors.fullName}
            placeholder="Nguyen Van A"
            icon={<User size={18} />}
            disabled={registerMutation.isPending}
          />

          <FormInput
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange("username")}
            error={Boolean(fieldErrors.username)}
            helperText={fieldErrors.username}
            placeholder="nguyenvana_dev"
            icon={<ShieldCheck size={18} />}
            disabled={registerMutation.isPending}
          />
        </Stack>

        {/* Group 2: Account Security Info */}
        <Stack spacing={2.5}>
          <Typography
            variant="subtitle2"
            sx={{
              color: "#166534",
              fontWeight: 800,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid rgba(15, 23, 42, 0.05)",
              pb: 1,
            }}
          >
            Account Security
          </Typography>

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange("email")}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            placeholder="nguyenvana@gmail.com"
            icon={<Mail size={18} />}
            disabled={registerMutation.isPending}
          />

          <FormInput
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange("password")}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password}
            placeholder="Your password..."
            icon={
              showPassword ? (
                <EyeOff size={18} strokeWidth={2.2} />
              ) : (
                <Eye size={18} strokeWidth={2.2} />
              )
            }
            iconPosition="end"
            disabled={registerMutation.isPending}
            onIconClick={() => setShowPassword((prev) => !prev)}
          />
        </Stack>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={registerMutation.isPending}
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: "14px",
            bgcolor: "#16a34a",
            color: "#ffffff",
            boxShadow: "0 4px 14px rgba(22, 163, 74, 0.25)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              bgcolor: "#15803d",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 20px rgba(22, 163, 74, 0.35)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
            "&.Mui-disabled": {
              bgcolor: alpha("#16a34a", 0.4),
              color: alpha("#ffffff", 0.8),
            },
            mt: 2,
          }}
        >
          {registerMutation.isPending ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <CircularProgress size={18} color="inherit" thickness={5} />
              <span>Creating account...</span>
            </Stack>
          ) : (
            "Create Account"
          )}
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            Already have an account?{" "}
            <Typography
              component={Link}
              href="/login"
              sx={{
                color: "#16a34a",
                fontWeight: 700,
                textDecoration: "none",
                transition: "color 0.2s ease",
                display: "inline-block",
                "&:hover": {
                  color: "#15803d",
                  textDecoration: "underline",
                },
              }}
            >
              Sign in now
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </AuthLayout>
  );
}
