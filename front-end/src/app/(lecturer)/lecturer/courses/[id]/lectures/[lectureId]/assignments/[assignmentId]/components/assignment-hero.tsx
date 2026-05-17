"use client";

import type { AssignmentResponse } from "@/lib/api/types";
import { Box, Stack, Typography } from "@mui/material";
import { Calendar, FileText } from "lucide-react";

interface AssignmentHeroProps {
  assignment: AssignmentResponse;
  lectureTitle: string;
  submissionsTotal: number;
  formatServerDate: (date: string, type: "date" | "datetime") => string;
}

export function AssignmentHero({
  assignment,
  lectureTitle,
  formatServerDate,
}: AssignmentHeroProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        mb: 3,
        background: "#ffffff",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        boxShadow: `
          0 10px 40px rgba(15, 23, 42, 0.04),
          0 2px 10px rgba(15, 23, 42, 0.02)
        `,
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: { xs: 3, md: 4 },
          py: { xs: 3.5, md: 4 },
          background: `
            linear-gradient(
              135deg,
              #f0fdf4 0%,
              #ecfdf5 30%,
              #f0f9ff 70%,
              #fafafa 100%
            )
          `,
          borderBottom: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        {/* Decorative Glow Elements */}
        <Box
          sx={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.08)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.06)",
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{
            position: "relative",
            zIndex: 1,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          {/* Left Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 99,
                  bgcolor: "success.main",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
                }}
              >
                <FileText size={13} />
                <Typography
                  sx={{
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Bài tập
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontWeight: 600 }}
              >
                {lectureTitle}
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.6rem", md: "2.4rem" },
                letterSpacing: "-0.04em",
                color: "grey.900",
                mb: 1.5,
                maxWidth: "900px",
              }}
            >
              {assignment.title}
            </Typography>

            {/* Summary details */}
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", maxWidth: 800, lineHeight: 1.6 }}
            >
              Bài tập được chỉ định cho các học viên trong bài giảng này. Quản
              lý, tải xuống bài nộp và thêm phản hồi/nhận xét tương tác trực
              tiếp bên dưới.
            </Typography>
          </Box>

          {/* Right Meta Column */}
          <Box
            sx={{
              minWidth: { xs: "100%", md: 250 },
              p: 1,
              borderRadius: 1,
              bgcolor: "rgba(255, 255, 255, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.7)",
              boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "success.main",
                  }}
                >
                  <Calendar size={16} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Ngày khởi tạo
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "grey.900",
                    }}
                  >
                    {formatServerDate(assignment.createdAt, "date")}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
