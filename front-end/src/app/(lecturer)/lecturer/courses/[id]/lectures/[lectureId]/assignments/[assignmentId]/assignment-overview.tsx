"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import type { AssignmentResponse } from "@/lib/type/assignments";

interface AssignmentOverviewProps {
  assignment: AssignmentResponse;
}

export function AssignmentOverview({ assignment }: AssignmentOverviewProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "rgba(148, 163, 184, 0.14)",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: "#1e293b",
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          Requirements & Content
        </Typography>
      </Box>
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          dangerouslySetInnerHTML={{ __html: assignment.description }}
          sx={{
            lineHeight: 1.7,
            fontSize: { xs: "0.875rem", sm: "0.98rem" },
            color: "text.primary",
            "& p": { mb: 2 },
            "& ul, & ol": { pl: { xs: 2.5, sm: 3 }, mb: 2 },
            "& li": { mb: 0.8 },
            "& pre": {
              bgcolor: "grey.50",
              p: { xs: 1.5, sm: 2 },
              borderRadius: 2,
              overflowX: "auto",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              border: "1px solid rgba(148, 163, 184, 0.12)",
              mb: 2,
            },
            "& code": {
              bgcolor: "grey.50",
              px: 0.8,
              py: 0.3,
              borderRadius: 1.5,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              color: "error.light",
              wordBreak: "break-word",
            },
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              mb: 2.5,
              display: "block",
              overflowX: "auto",
            },
            "& th, & td": {
              border: "1px solid rgba(148, 163, 184, 0.14)",
              p: { xs: 1, sm: 1.5 },
              textAlign: "left",
            },
            "& th": {
              bgcolor: "grey.50",
              fontWeight: 700,
            },
          }}
        />
      </CardContent>
    </Card>
  );
}
