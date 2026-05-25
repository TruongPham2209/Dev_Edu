"use client";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  Avatar,
  Divider,
} from "@mui/material";
import { GraduationCap } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

interface LecturersListProps {
  lecturers: string[] | null;
}

export const LecturersList = ({ lecturers }: LecturersListProps) => {
  const lecturerList = lecturers ?? [];

  // Generate avatar colors based on initials
  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "#3b82f6", // blue
      "#10b981", // green
      "#8b5cf6", // purple
      "#f59e0b", // amber
      "#ec4899", // pink
      "#14b8a6", // teal
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: 480, // Consistent height for the User Row
      }}
    >
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: "rgba(139, 92, 246, 0.08)",
            color: "rgb(139, 92, 246)",
            width: 36,
            height: 36,
            border: "1px solid rgba(139, 92, 246, 0.12)",
          }}
        >
          <GraduationCap size={18} />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}
          >
            Assigned Lecturers
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Lecturers assigned to manage and teach this course
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 0 },
        }}
      >
        {lecturerList.length === 0 ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <EmptyState
              title="No assigned lecturers"
              subtitle="This course has no assigned lecturers yet."
            />
          </Box>
        ) : (
          <Stack spacing={0} sx={{ width: "100%" }}>
            {lecturerList.map((username, index) => {
              const initial = username.charAt(0).toUpperCase();
              const color = getAvatarColor(username);

              return (
                <Box key={username}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 3,
                      py: 2,
                      transition: "background-color 0.15s ease",
                      "&:hover": {
                        bgcolor: "rgba(15, 23, 42, 0.02)",
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{ alignItems: "center" }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: color,
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          width: 40,
                          height: 40,
                          boxShadow: "0 2px 8px -2px rgba(0,0,0,0.15)",
                        }}
                      >
                        {initial}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{ fontWeight: 700, color: "text.primary" }}
                        >
                          @{username}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          Lecturer
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  {index < lecturerList.length - 1 && (
                    <Divider
                      sx={{ mx: 3, borderColor: "rgba(15, 23, 42, 0.04)" }}
                    />
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};
