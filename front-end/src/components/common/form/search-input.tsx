"use client";

import {
  Box,
  CircularProgress,
  Fade,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowUpRight, Search, X } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

export interface SearchDropdownItem<T = unknown> {
  label: string;
  value: string;
  original?: T;
  [key: string]: unknown;
}

export interface SearchInputProps<T = unknown> {
  value: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  onSearch?: (val: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  showDropdown?: boolean;
  dropdownItems?: SearchDropdownItem<T>[];
  onDropdownItemSelect?: (value: string) => void;
  renderDropdownItem?: (item: SearchDropdownItem<T>) => React.ReactNode;
  maxWidth?: number | string;
  loading?: boolean;
}

export function SearchInput<T = unknown>({
  value,
  placeholder = "Search anything...",
  onChange,
  onSearch,
  onClear,
  onFocus,
  showDropdown = false,
  dropdownItems = [],
  onDropdownItemSelect,
  renderDropdownItem,
  maxWidth = 760,
  loading = false,
}: SearchInputProps<T>) {
  const [focused, setFocused] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const hasDropdown = useMemo(
    () => showDropdown && dropdownItems.length > 0,
    [showDropdown, dropdownItems]
  );

  const handleSearch = () => {
    const trimmed = value.trim();

    if (!trimmed) return;

    onSearch?.(trimmed);
    setOpenDropdown(false);
  };

  const handleFocus = () => {
    setFocused(true);

    if (onFocus) {
      onFocus();
    }

    if (hasDropdown || showDropdown) {
      setOpenDropdown(true);
    }
  };

  const handleBlur = () => {
    setFocused(false);

    setTimeout(() => {
      setOpenDropdown(false);
    }, 120);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        maxWidth:
          typeof maxWidth === "number" ? { xs: "100%", sm: maxWidth } : maxWidth,
        mx: "auto",
        position: "relative",
      }}
    >
      <TextField
        fullWidth
        value={value}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(e) => {
          onChange?.(e.target.value);

          if (hasDropdown) {
            setOpenDropdown(true);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
            (e.target as HTMLInputElement).blur();
          }
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search
                  size={18}
                  strokeWidth={2.3}
                  style={{
                    transition: "all .25s ease",
                  }}
                />
              </InputAdornment>
            ),

            endAdornment: (
              <InputAdornment position="end">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Fade in={Boolean(value)}>
                    <Box>
                      <Tooltip title="Reset filter" placement="top" arrow>
                        <IconButton
                          size="small"
                          onClick={() => {
                            onChange?.("");
                            onClear?.();
                          }}
                          sx={{
                            width: 30,
                            height: 30,
                            color: "text.secondary",

                            "&:hover": {
                              bgcolor: "action.hover",
                              color: "text.primary",
                            },
                          }}
                        >
                          <X size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Fade>

                  <IconButton
                    disableRipple
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleSearch}
                    sx={{
                      width: { xs: 36, sm: 42 },
                      height: { xs: 36, sm: 42 },
                      borderRadius: "14px",

                      background:
                        "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",

                      color: "white",

                      boxShadow: "0 10px 24px rgba(37,99,235,.22)",

                      transition: "transform .2s ease, box-shadow .25s ease",

                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 14px 28px rgba(37,99,235,.3)",
                      },

                      "&:active": {
                        transform: "scale(.96)",
                      },
                    }}
                  >
                    <ArrowUpRight size={18} strokeWidth={2.4} />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            minHeight: { xs: 48, sm: 56 },

            px: { xs: 1, sm: 1.2 },

            borderRadius: "999px",

            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(30, 41, 59, 0.85)"
                : "rgba(255, 255, 255, 0.85)",

            backdropFilter: "blur(14px)",

            border: "1px solid",

            borderColor: (theme) =>
              focused
                ? theme.palette.primary.main
                : theme.palette.divider,

            boxShadow: (theme) =>
              focused
                ? "0 8px 24px rgba(37,99,235,.10)"
                : theme.palette.mode === "dark"
                  ? "0 2px 12px rgba(0,0,0,.3)"
                  : "0 2px 12px rgba(15,23,42,.05)",

            transition: "all .28s cubic-bezier(.4,0,.2,1)",

            "& fieldset": {
              border: "none",
            },

            "& input": {
              py: 0,
              fontSize: { xs: "0.875rem", sm: "0.98rem" },
              fontWeight: 500,
              color: "text.primary",
            },

            "& input::placeholder": {
              color: "text.secondary",
              opacity: 0.8,
              fontWeight: 500,
            },

            "&:hover": {
              borderColor: "text.secondary",
            },

            "&.Mui-focused": {
              transform: "translateY(-1px)",
            },
          },
        }}
      />

      {openDropdown && (
        <Paper
          elevation={0}
          sx={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 30,

            overflow: "hidden",

            borderRadius: "24px",

            border: "1px solid",
            borderColor: "divider",

            background: (theme) =>
              theme.palette.mode === "dark"
                ? "rgba(30, 41, 59, 0.95)"
                : "rgba(255, 255, 255, 0.95)",

            backdropFilter: "blur(20px)",

            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 20px 60px rgba(0,0,0,.5)"
                : "0 20px 60px rgba(15,23,42,.10)",

            maxHeight: 320,
            overflowY: "auto",

            "&::-webkit-scrollbar": {
              width: 8,
            },

            "&::-webkit-scrollbar-thumb": {
              background: "divider",
              borderRadius: 999,
            },
          }}
        >
          {loading ? (
            <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={28} sx={{ color: "primary.main" }} />
            </Box>
          ) : dropdownItems.length > 0 ? (
            <List sx={{ p: 1 }}>
              {dropdownItems.map((item, idx) => (
                <ListItemButton
                  key={idx}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onDropdownItemSelect?.(item.value);
                    setOpenDropdown(false);
                  }}
                  sx={{
                    borderRadius: "16px",

                    px: 2,
                    py: 1.5,

                    transition: "all .18s ease",

                    "&:hover": {
                      bgcolor: "action.hover",

                      transform: "translateX(2px)",

                      "& .search-item-text": {
                        color: "primary.main",
                      },
                    },
                  }}
                >
                  {renderDropdownItem ? (
                    renderDropdownItem(item)
                  ) : (
                    <Typography
                      className="search-item-text"
                      sx={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "text.primary",

                        transition: "all .18s ease",
                      }}
                    >
                      {item.label}
                    </Typography>
                  )}
                </ListItemButton>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                py: 5,
                px: 3,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                No results found
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
