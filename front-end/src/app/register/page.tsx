"use client";

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
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/users";
import { useAuth } from "@/lib/use-auth";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  const handleChange =
    (field: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await register(form);
      showSuccess("Đăng ký thành công");
      router.push("/login");
    } catch (error) {
      handleError(error, "Không thể đăng ký");
    } finally {
      setLoading(false);
    }
  };

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
          Ship faster with structured learning.
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 460 }}
        >
          Xây dựng hồ sơ kỹ thuật và theo dõi tiến độ học tập trong một
          workspace duy nhất.
        </Typography>
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 4,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Verified security • SOC2-ready
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, fontWeight: 600 }}>
            Zero spam. Zero fluff. Just outcomes.
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
            maxWidth: 480,
            width: "100%",
            borderRadius: 4,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08)",
          }}
        >
          <CardContent>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                  Create account
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Bắt đầu hành trình học tập cùng SkillForge.
                </Typography>
              </Box>

              <Stack spacing={2}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary" }}
                >
                  Basic Information
                </Typography>
                <TextField
                  label="Họ và tên"
                  value={form.fullName}
                  onChange={handleChange("fullName")}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={18} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <TextField
                  label="Username"
                  value={form.username}
                  onChange={handleChange("username")}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ShieldCheck size={18} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>

              <Stack spacing={2}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "text.secondary" }}
                >
                  Account Information
                </Typography>
                <TextField
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange("email")}
                  fullWidth
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
                  type="password"
                  value={form.password}
                  onChange={handleChange("password")}
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock size={18} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Create account"}
              </Button>
              <Divider />
              <Button component={Link} href="/login" size="small">
                Đã có tài khoản? Đăng nhập
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
