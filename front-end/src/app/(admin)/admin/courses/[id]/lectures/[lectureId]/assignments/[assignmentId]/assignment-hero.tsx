"use client";

import { AssignmentHeroInfo } from "@/components/common/hero-section/assignment-hero-info";
import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronRight, FileText, Home } from "lucide-react";
import Link from "next/link";
import type { AssignmentResponse } from "@/lib/type/assignments";

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
        separator={<ChevronRight size={14} style={{ color: "#94a3b8", flexShrink: 0 }} />}
        sx={{
          "& .MuiBreadcrumbs-ol": {
            alignItems: "center",
            flexWrap: "nowrap",
            overflow: "hidden",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "center",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            fontWeight: 500,
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.5, sm: 1 },
            flexShrink: 0,
          },
        }}
      >
        <MuiLink
          component={Link}
          href="/admin/courses"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
            textDecoration: "none",
            flexShrink: 0,
            transition: "color 0.2s",
            "&:hover": { color: "text.primary" },
          }}
        >
          <Home size={14} style={{ flexShrink: 0 }} />
          <span>Dashboard</span>
        </MuiLink>
        <MuiLink
          component={Link}
          href={`/admin/courses/${courseId}`}
          title={courseTitle}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            maxWidth: { xs: 80, sm: 140, md: 200 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": { color: "text.primary" },
          }}
        >
          {courseTitle}
        </MuiLink>
        <MuiLink
          component={Link}
          href={`/admin/courses/${courseId}/lectures/${lectureId}`}
          title={lectureTitle}
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            transition: "color 0.2s",
            maxWidth: { xs: 80, sm: 140, md: 200 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": { color: "text.primary" },
          }}
        >
          {lectureTitle}
        </MuiLink>
        <Typography
          title={assignment.title}
          sx={{
            color: "text.primary",
            fontWeight: 700,
            maxWidth: { xs: 100, sm: 180, md: 300 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
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
          borderRadius: 1,
          p: { xs: 2, sm: 3, md: 4 },
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
            mb: { xs: 2, sm: 3 },
          }}
        >
          <FileText size={20} color="#2563eb" />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "grey.900",
              lineHeight: 1,
              fontSize: { xs: "1.05rem", sm: "1.25rem" },
            }}
          >
            Instructions
          </Typography>
        </Box>
        <Box
          className="tiptap-content prose max-w-none"
          sx={{
            color: "grey.800",
            lineHeight: 1.7,
            fontSize: { xs: "0.875rem", sm: "1rem" },
            overflowX: "auto",
            wordBreak: "break-word",
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
