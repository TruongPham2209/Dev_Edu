"use client";

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
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
  ChevronUp,
  FileText,
  HelpCircle,
  ListIcon,
  Lock,
  PlayCircle,
  X,
} from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { LectureResponse } from "@/lib/type/lectures";

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
  courseId?: string;
  activeLectureId?: string;
  onSelectLecture: (id: string) => void;
}

export function SidebarContainer({
  lectures,
  courseId,
  activeLectureId,
  onSelectLecture,
}: SidebarContainerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const completedCount = lectures.filter((l) => l.isCompleted).length;
  const totalCount = lectures.length;

  const handleSelect = (id: string) => {
    onSelectLecture(id);
    setMobileOpen(false);
  };

  const lectureList = (
    <List disablePadding>
      {lectures.map((lecture, index) => {
        const isLocked = index > 0 && !lectures[index - 1].isCompleted;

        return (
          <LectureItem
            key={lecture.id}
            lecture={lecture}
            order={index + 1}
            isActive={lecture.id === activeLectureId}
            isLocked={isLocked}
            onClick={() => handleSelect(lecture.id)}
          />
        );
      })}
    </List>
  );

  return (
    <>
      {/* Desktop view (lg and above) */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: "none", lg: "block" },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: { xs: 1.5, sm: 1 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: "background.default",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <ListIcon size={18} />
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "0.85rem", sm: "0.875rem" },
              }}
            >
              Course Content
            </Typography>
          </Stack>

          {courseId && (
            <Button
              component={NextLink}
              href={`/courses/${courseId}/quizzes`}
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<HelpCircle size={14} />}
              sx={{
                borderRadius: 1.5,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
                fontWeight: 700,
                py: 0.25,
                px: { xs: 0.75, sm: 1 },
              }}
            >
              Quizzes
            </Button>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: { xs: 0.75, sm: 1 } }}>{lectureList}</Box>
      </Paper>

      {/* Mobile & Tablet view (< lg) Sticky Action Bar & Drawer */}
      <Box sx={{ display: { xs: "block", lg: "none" } }}>
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              px: { xs: 2, sm: 3 },
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              borderRadius: 0,
              boxShadow: "0 -4px 20px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", minWidth: 0 }}
            >
              <ListIcon size={20} />
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    lineHeight: 1.2,
                  }}
                >
                  Course Content
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {completedCount}/{totalCount} completed
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setMobileOpen(true)}
              endIcon={<ChevronUp size={16} />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                textTransform: "none",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                px: { xs: 1.75, sm: 2.5 },
                py: 0.75,
              }}
            >
              Lessons
            </Button>
          </Paper>
        </Box>

        {/* Bottom Sheet Drawer for Mobile & Tablet */}
        <Drawer
          anchor="bottom"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{
            backdrop: { sx: { backdropFilter: "blur(4px)" } },
            paper: {
              sx: {
                borderRadius: "20px 20px 0 0",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
              },
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              px: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 0,
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <ListIcon size={20} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  Course Content
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  {completedCount}/{totalCount} completed
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {courseId && (
                <Button
                  component={NextLink}
                  href={`/courses/${courseId}/quizzes`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  startIcon={<HelpCircle size={14} />}
                  sx={{
                    borderRadius: 1.5,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    py: 0.5,
                    px: 1.25,
                  }}
                >
                  Quizzes
                </Button>
              )}
              <IconButton onClick={() => setMobileOpen(false)} size="small">
                <X size={20} />
              </IconButton>
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, overflowY: "auto", flex: 1 }}>{lectureList}</Box>
        </Drawer>
      </Box>
    </>
  );
}
