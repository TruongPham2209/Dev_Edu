"use client";

import { useLoginMutation, useMeQuery } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { Chrome, Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthLayout } from "@/components/layout/auth-layout";
import { FormInput } from "@/components/common/form/form-input";
import { setAuthSession } from "@/lib/auth-storage";
import { getPrimaryRole, getRedirectPathForRoles } from "@/lib/auth/constants";
import { decodeJwt } from "@/lib/auth/jwt";
import { useToast } from "@/lib/toast-context";

export default function LoginForm() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { refetch: fetchMe } = useMeQuery({ enabled: false });
  const { handleError, showSuccess } = useApiWithToast();

  const loginMutation = useLoginMutation({
    onSuccess: async (state) => {
      if (state.success && state.token) {
        // Temporarily set token so apiCall can authorize the /me request
        localStorage.setItem("auth_token", state.token);

        let role = "STUDENT";
        let fullName = state.username?.split("@")[0] || "User";
        let id = "";
        let email = "";
        let avatarUrl = undefined;

        try {
          const meResult = await fetchMe();
          if (!meResult.data) throw new Error("Failed to fetch user info");
          const me = meResult.data;
          role = me.role;
          fullName = me.fullName || me.username || fullName;
          id = me.id || "";
          email = me.email || "";
          avatarUrl = me.avatarUrl;
        } catch (e) {
          handleError(e, "Failed to fetch user info");
        }

        const decoded = decodeJwt(state.token);
        const roles = decoded?.roles || [role as any];
        const primaryRole = getPrimaryRole(roles);

        setAuthSession(state.token, {
          id,
          username: state.username || "User",
          fullName,
          role: primaryRole,
          roles: roles,
          email,
          avatarUrl,
        });

        showSuccess(`Welcome back, ${fullName}!`);

        // Role-based routing: ADMIN > LECTURER > STUDENT
        const redirectPath = getRedirectPathForRoles(roles);
        window.location.href = redirectPath;
      } else if (state.error) {
        setErrorMsg(state.error);
      }
    },
    onError: (error) => {
      setErrorMsg(
        error.message || "Email or password is not correct. Please try again.",
      );
    },
  });

  const validate = () => {
    const errors: { username?: string; password?: string } = {};
    if (!username.trim()) {
      errors.username = "Please enter your username or email";
    }

    if (!password) {
      errors.password = "Please enter your password";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    if (validate()) {
      loginMutation.mutate({ username, password });
    }
  };

  const handleForgotPassword = () => {
    toast.warning("Forgot password is not implemented yet.");
  };

  const handleGoogleLogin = () => {
    toast.warning("Google authentication is not implemented yet.");
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Sign in to continue your learning journey with DevEdu."
    >
      <Stack spacing={{ xs: 2.5, sm: 3.5 }} component="form" onSubmit={handleSubmit} noValidate>
        {errorMsg && (
          <Alert
            severity="error"
            sx={{ borderRadius: "12px", fontWeight: 550 }}
          >
            {errorMsg}
          </Alert>
        )}

        <FormInput
          label="Email Address"
          name="username"
          type="text"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            if (fieldErrors.username) {
              setFieldErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          error={Boolean(fieldErrors.username)}
          helperText={fieldErrors.username}
          placeholder="yourname@domain.com"
          icon={<Mail size={18} />}
          disabled={loginMutation.isPending}
        />

        <FormInput
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
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
          onIconClick={() => setShowPassword((prev) => !prev)}
          disabled={loginMutation.isPending}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loginMutation.isPending}
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            fontSize: { xs: "0.9375rem", sm: "1rem" },
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
          }}
        >
          {loginMutation.isPending ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <CircularProgress size={18} color="inherit" thickness={5} />
              <span>Signing In...</span>
            </Stack>
          ) : (
            "Sign In"
          )}
        </Button>

        <Divider
          sx={{
            "&::before, &::after": {
              borderColor: "rgba(15, 23, 42, 0.08)",
            },
            color: "text.secondary",
            fontSize: "0.85rem",
            fontWeight: 500,
          }}
        >
          or continue with
        </Divider>

        <Button
          variant="outlined"
          size="large"
          startIcon={<Chrome size={18} />}
          onClick={handleGoogleLogin}
          disabled={loginMutation.isPending}
          sx={{
            py: { xs: 1.1, sm: 1.3 },
            borderRadius: "14px",
            borderColor: "rgba(15, 23, 42, 0.08)",
            color: "#475569",
            fontWeight: 600,
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "#0f172a",
              bgcolor: "rgba(15, 23, 42, 0.03)",
              color: "#0f172a",
            },
          }}
        >
          Google Account
        </Button>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
            mt: 0.5,
          }}
        >
          <Typography
            variant="body2"
            component={Link}
            href="/register"
            sx={{
              color: "#16a34a",
              fontWeight: 700,
              textDecoration: "none",
              transition: "color 0.2s ease",
              "&:hover": {
                color: "#15803d",
                textDecoration: "underline",
              },
            }}
          >
            Register now
          </Typography>

          <Typography
            variant="body2"
            component="button"
            type="button"
            onClick={handleForgotPassword}
            sx={{
              background: "none",
              border: "none",
              p: 0,
              cursor: "pointer",
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.875rem",
              fontFamily: "inherit",
              transition: "color 0.2s ease",
              "&:hover": {
                color: "#0f172a",
                textDecoration: "underline",
              },
            }}
          >
            Forgot password?
          </Typography>
        </Box>
      </Stack>
    </AuthLayout>
  );
}
