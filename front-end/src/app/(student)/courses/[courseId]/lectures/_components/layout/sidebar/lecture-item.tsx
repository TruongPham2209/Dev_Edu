"use client";

import {
  Box,
  ListItemButton,
  Typography,
  alpha,
  Stack,
  useTheme,
} from "@mui/material";
import { CheckCircle2, Lock, PlayCircle, FileText } from "lucide-react";
import { LectureResponse } from "@/lib/api/types";

interface LectureItemProps {
  lecture: LectureResponse;
  isActive: boolean;
  isLocked: boolean;
  order: number;
  onClick: () => void;
}

export function LectureItem({
  lecture,
  isActive,
  isLocked,
  order,
  onClick,
}: LectureItemProps) {
  const theme = useTheme();

  return (
    <ListItemButton
      disabled={isLocked}
      onClick={onClick}
      selected={isActive}
      sx={{
        p: 1.25,
        borderRadius: 1,
        mb: 0.75,
        transition: "all 0.2s ease",
        border: "1px solid",
        borderColor: isActive
          ? alpha(theme.palette.primary.main, 0.15)
          : "transparent",
        "&.Mui-selected": {
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        },
        "&.Mui-disabled": {
          opacity: 0.4,
          bgcolor: "transparent",
        },
        "&:hover:not(.Mui-selected):not(.Mui-disabled)": {
          bgcolor: alpha(theme.palette.action.hover, 0.5),
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ width: "100%", alignItems: "center" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 0.75,
            bgcolor: isLocked
              ? alpha(theme.palette.text.disabled, 0.08)
              : lecture.isCompleted
                ? alpha(theme.palette.success.main, 0.08)
                : isActive
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.text.secondary, 0.04),
            color: isLocked
              ? "text.disabled"
              : lecture.isCompleted
                ? "success.main"
                : isActive
                  ? "primary.main"
                  : "text.secondary",
            flexShrink: 0,
            fontSize: "0.7rem",
            fontWeight: 700,
          }}
        >
          {isLocked ? (
            <Lock size={14} />
          ) : lecture.isCompleted ? (
            <CheckCircle2 size={14} />
          ) : (
            <span>{order}</span>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "primary.main" : "text.primary",
              mb: 0.25,
              fontSize: "0.825rem",
              lineHeight: 1.3,
            }}
          >
            {lecture.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: 500,
                fontSize: "0.7rem",
              }}
            >
              {lecture.videoObjectKey ? (
                <PlayCircle size={10} />
              ) : (
                <FileText size={10} />
              )}
              {lecture.videoObjectKey ? "Video" : "Tài liệu"}
            </Typography>
            {lecture.isCompleted && (
              <Typography
                variant="caption"
                sx={{
                  color: "success.main",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              >
                Hoàn thành
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </ListItemButton>
  );
}
