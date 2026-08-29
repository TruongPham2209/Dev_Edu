"use client";

import { alpha, Tab, Tabs, TabsProps } from "@mui/material";
import { ReactElement, ReactNode } from "react";

export interface AnimatedTabItem<T extends string = string> {
  value: T;
  label: ReactNode;
  icon?: string | ReactElement;
  iconPosition?: "top" | "bottom" | "start" | "end";
}

export interface AnimatedTabsProps<T extends string = string> extends Omit<
  TabsProps,
  "value" | "onChange"
> {
  tabs: AnimatedTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  colorTheme?: "primary" | "success" | "error" | "info" | "warning";
}

export function AnimatedTabs<T extends string = string>({
  tabs,
  value,
  onChange,
  colorTheme = "primary",
  ...props
}: AnimatedTabsProps<T>) {
  return (
    <Tabs
      value={value}
      onChange={(_, val) => onChange(val)}
      variant="scrollable"
      scrollButtons="auto"
      {...props}
      sx={{
        minHeight: 48,
        borderBottom: "1px solid",
        borderColor: "divider",
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px 3px 0 0",
          bgcolor: (theme) =>
            theme.palette.mode === "dark"
              ? theme.palette[colorTheme].light
              : theme.palette[colorTheme].main,
        },
        "& .MuiTab-root": {
          textTransform: "none",
          fontWeight: 700,
          fontSize: "0.95rem",
          px: 3,
          minHeight: 48,
          transition: "all 0.2s ease-in-out",
          position: "relative",
          color: "text.secondary",
          "& svg, & .MuiSvgIcon-root": {
            color: "inherit",
            transition: "color 0.2s ease",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            width: "80%",
            height: 3,
            borderRadius: "3px 3px 0 0",
            bgcolor: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette[colorTheme].light
                : theme.palette[colorTheme].main,
            transform: "scaleX(0)",
            transformOrigin: "center",
            transition: "transform 0.3s ease-in-out",
          },
          "&:hover": {
            color: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette[colorTheme].light
                : theme.palette[colorTheme].main,
            bgcolor: (theme) =>
              alpha(
                theme.palette[colorTheme].main,
                theme.palette.mode === "dark" ? 0.16 : 0.08,
              ),
            borderRadius: "8px 8px 0 0",
            "&::after": {
              transform: "scaleX(1)",
            },
          },
          "&.Mui-selected": {
            color: (theme) =>
              theme.palette.mode === "dark"
                ? theme.palette[colorTheme].light
                : theme.palette[colorTheme].main,
          },
          "&.Mui-selected::after": {
            display: "none",
          },
        },
        ...props.sx,
      }}
    >
      {tabs.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          icon={tab.icon}
          iconPosition={tab.iconPosition || "start"}
          label={tab.label}
        />
      ))}
    </Tabs>
  );
}
