"use client";

import { Button, Card, CardContent, Typography } from "@mui/material";
import { ChevronRight } from "lucide-react";

export function CommunityGuidelines() {
  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: "transparent",
        boxShadow: "none",
        border: "1px dashed",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}
        >
          Community Guidelines
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", lineHeight: 1.6, mb: 2 }}
        >
          Professional programming discussion environment. Respect colleagues,
          share quality knowledge and do not post spam content.
        </Typography>
        <Button
          variant="text"
          size="small"
          endIcon={<ChevronRight size={16} />}
          sx={{ color: "primary.main", fontWeight: 700, px: 1.5 }}
        >
          Read Guidelines
        </Button>
      </CardContent>
    </Card>
  );
}
