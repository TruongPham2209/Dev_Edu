"use client";

import { loginAction, type LoginActionState } from "@/app/login/actions";
import { getMe } from "@/lib/api/users";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

import { setAuthSession } from "@/lib/auth-storage";
import { decodeJwt } from "@/lib/auth/jwt";
import { getPrimaryRole, getRedirectPathForRoles } from "@/lib/auth/constants";

const initialState: LoginActionState = {
  error: null,
  fieldErrors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="contained" size="large" disabled={pending}>
      {pending ? "Signing In..." : "Sign In"}
    </Button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, initialState);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    async function syncAuth() {
      if (state.success && state.token) {
        // Temporarily set token so apiCall can authorize the /me request
        localStorage.setItem("auth_token", state.token);

        let role = "STUDENT";
        let fullName = state.username?.split("@")[0] || "User";
        let id = "";
        let email = "";
        let avatarUrl = undefined;

        try {
          const me = await getMe();
          role = me.role;
          fullName = me.fullName || me.username || fullName;
          id = me.id || "";
          email = me.email || "";
          avatarUrl = me.avatarUrl;
        } catch (e) {
          console.error("Failed to fetch user info, using fallback.", e);
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

        // Role-based routing using priorities: ADMIN > LECTURER > STUDENT
        const redirectPath = getRedirectPathForRoles(roles);
        router.push(redirectPath);

        router.refresh();
      }
    }

    syncAuth();
  }, [state, router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
      }}
    >
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          px: 8,
          py: 6,
          background:
            "radial-gradient(circle at top left, rgba(37, 99, 235, 0.16), transparent 45%), radial-gradient(circle at 70% 20%, rgba(124, 58, 237, 0.12), transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
        }}
      >
        <Typography variant="overline" sx={{ letterSpacing: "0.3em", mb: 2 }}>
          SkillForge
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 2 }}>
          Build developer skills that ship.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 460 }}
        >
          Học tập theo lộ trình kỹ thuật, không gian học tập tối ưu cho lập
          trình viên và kỹ sư.
        </Typography>
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 4,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            fontFamily: "var(--font-geist-mono)",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            $ skillforge login --username dev
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            ✔ Authenticated. Workspace synced.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 6,
        }}
      >
        <Card
          sx={{
            maxWidth: 460,
            width: "100%",
            borderRadius: 4,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <CardContent>
            <Stack spacing={3} component="form" action={formAction}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Sign in
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Đăng nhập để tiếp tục học tập.
                </Typography>
              </Box>
              {state.error ? (
                <Typography color="error" variant="body2">
                  {state.error}
                </Typography>
              ) : null}
              <TextField
                label="Email"
                name="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                fullWidth
                error={Boolean(state.fieldErrors?.username)}
                helperText={state.fieldErrors?.username}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                fullWidth
                error={Boolean(state.fieldErrors?.password)}
                helperText={state.fieldErrors?.password}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="text"
                          size="small"
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          sx={{ minWidth: "auto" }}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <SubmitButton />
              <Divider>or</Divider>
              <Button
                variant="outlined"
                size="large"
                startIcon={<Chrome size={18} />}
                type="button"
              >
                Continue with Google
              </Button>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button component={Link} href="/register" size="small">
                  Tạo tài khoản
                </Button>
                <Button size="small" type="button">
                  Quên mật khẩu
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
