"use client";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

interface MetricItemProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
  bg: string;
}

export function MetricItem({
  title,
  value,
  icon: Icon,
  color,
  bg,
}: MetricItemProps) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 20px rgba(0, 0, 0, 0.4)"
            : "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 10px 25px rgba(0, 0, 0, 0.6)"
              : "0 10px 25px -5px rgba(15, 23, 42, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              bgcolor: bg,
              color: color,
              border: `1px solid ${bg}`,
            }}
          >
            <Icon size={22} />
          </Avatar>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                display: "block",
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
