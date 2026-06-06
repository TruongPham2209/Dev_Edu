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
import { formatServerDate } from "@/lib/util/date-utils";
import { AssignmentHeroInfo } from "@/components/common/hero-section/assignment-hero-info";

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
      <AssignmentHeroInfo
        assignment={assignment}
        lectureTitle={lectureTitle}
        submissionsTotal={submissionsTotal}
      />

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
