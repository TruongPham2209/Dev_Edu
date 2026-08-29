"use client";

import type { AssignmentResponse } from "@/lib/type/assignments";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Stack, Typography, alpha } from "@mui/material";
import { Calendar, ClipboardCheck, Users } from "lucide-react";

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
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 10px 40px rgba(0, 0, 0, 0.4)"
            : "0 10px 40px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          px: { xs: 2.5, sm: 3, md: 4 },
          py: { xs: 2.5, sm: 3.5, md: 4 },
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Glowing background circles for visual depth */}
        <Box
          sx={{
            position: "absolute",
            top: -80,
            right: -60,
            width: { xs: 160, sm: 250 },
            height: { xs: 160, sm: 250 },
            borderRadius: "50%",
            background: (theme) => alpha(theme.palette.success.main, 0.06),
            filter: "blur(70px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -90,
            left: -70,
            width: { xs: 140, sm: 220 },
            height: { xs: 140, sm: 220 },
            borderRadius: "50%",
            background: (theme) => alpha(theme.palette.primary.main, 0.04),
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />

        <Stack
          component="div"
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 2.5, md: 4 }}
          sx={{
            position: "relative",
            zIndex: 1,
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          {/* Left Content */}
          <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
            <Stack
              component="div"
              direction="row"
              spacing={1}
              sx={{ alignItems: "center", mb: 1.5, flexWrap: "wrap" }}
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
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.success.main, 0.18)}`,
                }}
              >
                <ClipboardCheck size={12} />
                <span>Assignment</span>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  wordBreak: "break-word",
                }}
              >
                {lectureTitle}
              </Typography>
            </Stack>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "1.35rem", sm: "1.8rem", md: "2.4rem" },
                letterSpacing: "-0.04em",
                color: "text.primary",
                wordBreak: "break-word",
              }}
            >
              {assignment.title}
            </Typography>
          </Box>

          {/* Right Meta Column (Includes Created Date and Total Submissions) */}
          <Box
            sx={{
              minWidth: { xs: "100%", md: 250 },
              width: { xs: "100%", md: "auto" },
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2.5,
              bgcolor: "action.hover",
              backdropFilter: "blur(12px)",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 8px 30px rgba(0, 0, 0, 0.4)"
                  : "0 8px 30px rgba(15, 23, 42, 0.04)",
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
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
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
                      color: "text.primary",
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
                      bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
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
                        color: "text.primary",
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
