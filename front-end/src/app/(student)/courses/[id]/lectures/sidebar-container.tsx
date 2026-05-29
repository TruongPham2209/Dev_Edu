"use client";

import {
  Box,
  Divider,
  List,
  ListItemButton,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle2,
  FileText,
  ListIcon,
  Lock,
  PlayCircle,
} from "lucide-react";
import { LectureResponse } from "@/lib/api/types";

interface LectureItemProps {
  lecture: LectureResponse;
  isActive: boolean;
  isLocked: boolean;
  order: number;
  onClick: () => void;
}

function LectureItem({
  lecture,
  isActive,
  isLocked,
  order,
  onClick,
}: LectureItemProps) {
  const theme = useTheme();

  const isInteractable = !isLocked;

  return (
    <ListItemButton
      disabled={isLocked}
      onClick={isInteractable ? onClick : undefined}
      selected={isActive}
      disableRipple={!isInteractable}
      sx={{
        p: 1.25,
        borderRadius: 1,
        mb: 0.75,
        transition: "all 0.2s ease",
        border: "1px solid",
        cursor: isInteractable ? "pointer" : "default",
        opacity: isInteractable ? 1 : 0.5,
        filter: isInteractable ? "none" : "grayscale(1)",
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
          bgcolor: isInteractable
            ? alpha(theme.palette.action.hover, 0.5)
            : "transparent",
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
              {lecture.duration > 0 ? (
                <PlayCircle size={10} />
              ) : (
                <FileText size={10} />
              )}
              {lecture.duration > 0 ? "Video" : "Content"}
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
                Completed
              </Typography>
            )}
          </Stack>
        </Box>
      </Stack>
    </ListItemButton>
  );
}

interface SidebarContainerProps {
  lectures: LectureResponse[];
  activeLectureId?: string;
  onSelectLecture: (id: string) => void;
}

export function SidebarContainer({
  lectures,
  activeLectureId,
  onSelectLecture,
}: SidebarContainerProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 1.5, bgcolor: "background.default" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ListIcon size={18} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Course Content
          </Typography>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <List disablePadding>
          {lectures.map((lecture, index) => {
            // A lecture is locked if it is not the first one AND the previous lecture is not completed.
            const isLocked = index > 0 && !lectures[index - 1].isCompleted;

            return (
              <LectureItem
                key={lecture.id}
                lecture={lecture}
                order={index + 1}
                isActive={lecture.id === activeLectureId}
                isLocked={isLocked}
                onClick={() => onSelectLecture(lecture.id)}
              />
            );
          })}
        </List>
      </Box>
    </Paper>
  );
}
