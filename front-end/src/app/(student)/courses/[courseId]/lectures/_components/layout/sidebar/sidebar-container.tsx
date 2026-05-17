"use client";

import { Box, Typography, List, Divider, Paper, Stack } from "@mui/material";
import { ListIcon } from "lucide-react";
import { LectureResponse } from "@/lib/api/types";
import { LectureItem } from "./lecture-item";

interface SidebarContainerProps {
  lectures: LectureResponse[];
  activeLectureId?: string;
  onSelectLecture: (id: string) => void;
}

export function SidebarContainer({ lectures, activeLectureId, onSelectLecture }: SidebarContainerProps) {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        border: "1px solid", 
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden"
      }}
    >
      <Box sx={{ p: 1.5, bgcolor: "background.default" }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <ListIcon size={18} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Nội dung khóa học
          </Typography>
        </Stack>
      </Box>
      <Divider />
      <Box sx={{ p: 1 }}>
        <List disablePadding>
          {lectures.map((lecture, index) => {
            // Logic for locked lectures can be added here
            // e.g., if previous lecture is not completed and sequential is enabled
            const isLocked = false; 

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
