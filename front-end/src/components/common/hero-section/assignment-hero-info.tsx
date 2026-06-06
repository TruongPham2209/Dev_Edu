"use client";

import type { AssignmentResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Stack, Typography } from "@mui/material";
import { Calendar, ClipboardCheck, FileText, Users } from "lucide-react";

interface AssignmentHeroProps {
  assignment: AssignmentResponse;
  lectureTitle: string;
  submissionsTotal?: number;
}

export function AssignmentHeroInfo({
  assignment,
  lectureTitle,
  submissionsTotal,
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
        {/* Glowing background circles for visual depth */}
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.06)",
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -90,
            left: -70,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(59, 130, 246, 0.04)",
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <Stack
          component="div"
          direction={{ xs: "column", md: "row" }}
          spacing={4}
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
              component="div"
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 2 }}
            >
              <Box
                sx={{
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 99,
                  bgcolor: "success.main",
                  color: "white",
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                  boxShadow: "0 4px 12px rgba(34,197,94,0.18)",
                }}
              >
                <ClipboardCheck size={12} />
                <span>Assignment</span>
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
                fontSize: { xs: "1.8rem", md: "2.4rem" },
                letterSpacing: "-0.04em",
                color: "grey.900",
              }}
            >
              {assignment.title}
            </Typography>
          </Box>

          {/* Right Meta Column (Includes Created Date and Total Submissions) */}
          <Box
            sx={{
              minWidth: { xs: "100%", md: 250 },
              p: 2.5,
              borderRadius: 2.5,
              bgcolor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.7)",
              boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
            }}
          >
            <Stack component="div" spacing={2.5}>
              {/* Created Date */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "success.50",
                    color: "success.main",
                  }}
                >
                  <Calendar size={18} />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: "text.secondary",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                    }}
                  >
                    Created date
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "grey.900",
                    }}
                  >
                    {formatServerDate(assignment.createdAt, "date")}
                  </Typography>
                </Box>
              </Box>

              {/* Submissions Count */}
              {submissionsTotal !== undefined && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "info.50",
                      color: "info.main",
                    }}
                  >
                    <Users size={18} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: "text.secondary",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Total submissions
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        color: "grey.900",
                      }}
                    >
                      {submissionsTotal} submissions
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
