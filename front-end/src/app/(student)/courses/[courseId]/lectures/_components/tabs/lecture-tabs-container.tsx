"use client";

import { Box, Tab, Tabs, alpha, useTheme } from "@mui/material";
import { useState, ReactNode } from "react";
import { MessageSquare, FileText, ClipboardList, BookOpen } from "lucide-react";

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lecture-tabpanel-${index}`}
      aria-labelledby={`lecture-tab-${index}`}
      style={{ display: value === index ? "block" : "none" }}
      {...other}
    >
      <Box sx={{ py: 2, width: "100%", overflow: "hidden" }}>{children}</Box>
    </div>
  );
}

interface LectureTabsContainerProps {
  hasVideo: boolean;
  commentsTab: ReactNode;
  materialsTab: ReactNode;
  assignmentsTab: ReactNode;
  contentTab: ReactNode;
}

export function LectureTabsContainer({
  hasVideo,
  commentsTab,
  materialsTab,
  assignmentsTab,
  contentTab,
}: LectureTabsContainerProps) {
  const theme = useTheme();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Ensure value is always valid when tabs change (e.g. hasVideo changes)
  const tabsCount = !hasVideo ? 4 : 3;
  if (value >= tabsCount && value !== 0) {
    setValue(0);
  }

  // If no video, Content tab is first
  const tabs = [];
  if (!hasVideo) {
    tabs.push({
      label: "Nội dung",
      icon: <BookOpen size={18} />,
      component: contentTab,
    });
  }
  tabs.push({
    label: "Thảo luận",
    icon: <MessageSquare size={18} />,
    component: commentsTab,
  });
  tabs.push({
    label: "Tài liệu",
    icon: <FileText size={18} />,
    component: materialsTab,
  });
  tabs.push({
    label: "Bài tập",
    icon: <ClipboardList size={18} />,
    component: assignmentsTab,
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="lecture tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            height: 48,
            "& .MuiTabs-flexContainer": {
              height: 48,
            },
            "& .MuiTab-root": {
              minHeight: 48,
              height: 48,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "text.secondary",
              transition: "all 0.2s",
              gap: 1,
              px: 3,
              "&.Mui-selected": {
                color: "primary.main",
              },
              "&:hover": {
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
              "& .MuiTab-iconWrapper": {
                margin: 0,
              },
            },
          }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              id={`lecture-tab-${index}`}
              aria-controls={`lecture-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Box>

      {tabs.map((tab, index) => (
        <CustomTabPanel key={index} value={value} index={index}>
          {tab.component}
        </CustomTabPanel>
      ))}
    </Box>
  );
}
