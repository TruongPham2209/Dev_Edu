"use client";

import { Box, Typography, Paper, Divider, alpha } from "@mui/material";

interface LectureHTMLContentProps {
  content: string | null;
}

export function LectureHTMLContent({ content }: LectureHTMLContentProps) {
  if (!content) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          textAlign: "center",
          borderRadius: 1,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "action.hover",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Không có nội dung văn bản cho bài giảng này.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        "& h1, & h2, & h3": {
          fontWeight: 800,
          mt: 4,
          mb: 2,
          letterSpacing: "-0.01em",
        },
        "& p": {
          lineHeight: 1.8,
          mb: 2.5,
          color: "text.primary",
          fontSize: "1.05rem",
        },
        "& img": {
          maxWidth: "100%",
          borderRadius: 1.5,
          my: 2,
          boxShadow: (theme) =>
            `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        },
        "& code": {
          bgcolor: "action.hover",
          p: 0.5,
          borderRadius: 1,
          fontFamily: "monospace",
          fontSize: "0.9em",
          color: "primary.main",
        },
        "& pre": {
          bgcolor: "grey.900",
          color: "grey.100",
          p: 2,
          borderRadius: 1.5,
          overflowX: "auto",
          my: 2,
          "& code": {
            bgcolor: "transparent",
            p: 0,
            color: "inherit",
          },
        },
        "& blockquote": {
          borderLeft: "4px solid",
          borderColor: "primary.main",
          pl: 2,
          py: 0.5,
          my: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
          borderRadius: 1,
          fontStyle: "italic",
        },
        "& ul, & ol": {
          pl: 4,
          mb: 3,
          "& li": {
            mb: 1.5,
            lineHeight: 1.7,
          },
        },
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
