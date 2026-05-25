"use client";

import type { AssignmentResponse } from "@/lib/api/types";
import {
  Box,
  Breadcrumbs,
  Stack,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import {
  Calendar,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Home,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatServerDate } from "@/lib/date-utils";

interface AssignmentHeroSectionProps {
  assignment: AssignmentResponse;
  courseId: string;
  courseTitle: string;
  lectureId: string;
  lectureTitle: string;
  submissionsTotal: number;
}

export function AssignmentHeroSection({
  assignment,
  courseId,
  courseTitle,
  lectureId,
  lectureTitle,
  submissionsTotal,
}: AssignmentHeroSectionProps) {
  return (
    <Stack component="div" spacing={3}>
      {/* 1. Elegant Breadcrumbs Navigation */}
      <Breadcrumbs
        separator={<ChevronRight size={14} style={{ color: "#94a3b8" }} />}
        sx={{
          "& .MuiBreadcrumbs-li": {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        }}
      >
        <MuiLink
          component={Link}
          href="/admin/courses"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            "&:hover": { color: "text.primary" },
          }}
        >
          <Home size={14} />
          <span>Dashboard</span>
        </MuiLink>
        <MuiLink
          component={Link}
          href={`/admin/courses/${courseId}`}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            "&:hover": { color: "text.primary" },
          }}
        >
          {courseTitle}
        </MuiLink>
        <MuiLink
          component={Link}
          href={`/admin/courses/${courseId}/lectures/${lectureId}`}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            "&:hover": { color: "text.primary" },
          }}
        >
          {lectureTitle}
        </MuiLink>
        <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
          {assignment.title}
        </Typography>
      </Breadcrumbs>

      {/* 2. Premium Hero Banner */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          background: "#ffffff",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          boxShadow: `
            0 12px 42px rgba(15, 23, 42, 0.03),
            0 2px 8px rgba(15, 23, 42, 0.02)
          `,
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: { xs: 3, md: 4 },
            py: { xs: 4, md: 4.5 },
            background: `
              linear-gradient(
                135deg,
                #f8fafc 0%,
                #f1f5f9 50%,
                #ecfdf5 100%
              )
            `,
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
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* 3. Instructions / HTML Description Box */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          border: "1px solid rgba(148, 163, 184, 0.15)",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.02)",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: "2px solid",
            borderColor: "primary.main",
            pb: 1,
            mb: 3,
          }}
        >
          <FileText size={20} color="#2563eb" />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "grey.900", lineHeight: 1 }}
          >
            Instructions
          </Typography>
        </Box>
        <Box
          className="tiptap-content prose max-w-none"
          sx={{
            color: "grey.800",
            lineHeight: 1.7,
            fontSize: "1rem",
            "& p": { mb: 2 },
            "& ul, & ol": { pl: 3, mb: 2 },
            "& strong": { fontWeight: 600, color: "grey.900" },
          }}
          dangerouslySetInnerHTML={{
            __html:
              assignment.description ||
              "<p>No detailed description for this assignment.</p>",
          }}
        />
      </Box>
    </Stack>
  );
}
