"use client";

import {
  alpha,
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

export interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange?: (val: string) => void;
  onSearch: (val: string) => void;
  onClear?: () => void;
  onFocus?: () => void;
  showDropdown?: boolean;
  dropdownItems?: { label: string; value: string; [key: string]: any }[];
  onDropdownItemSelect?: (value: string) => void;
  renderDropdownItem?: (item: any) => React.ReactNode;
  maxWidth?: number | string;
  loading?: boolean;
}

export function SearchInput({
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
}: SearchInputProps) {
  const [focused, setFocused] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const hasDropdown = useMemo(
    () => showDropdown && dropdownItems.length > 0,
    [showDropdown, dropdownItems],
  );

  const handleSearch = () => {
    const trimmed = value.trim();

    if (!trimmed) return;

    onSearch(trimmed);
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
        maxWidth,
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
                  color={focused ? "#2563eb" : "#94a3b8"}
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
                            color: "#64748b",

                            "&:hover": {
                              bgcolor: alpha("#64748b", 0.08),
                              color: "#0f172a",
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
                      width: 42,
                      height: 42,
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
            minHeight: 56,

            px: 1.2,

            borderRadius: "999px",

            background: alpha("#ffffff", 0.82),

            backdropFilter: "blur(14px)",

            border: "1px solid",

            borderColor: focused
              ? alpha("#2563eb", 0.32)
              : alpha("#cbd5e1", 0.75),

            boxShadow: focused
              ? "0 8px 24px rgba(37,99,235,.10)"
              : "0 2px 12px rgba(15,23,42,.05)",

            transition: "all .28s cubic-bezier(.4,0,.2,1)",

            "& fieldset": {
              border: "none",
            },

            "& input": {
              py: 0,
              fontSize: "0.98rem",
              fontWeight: 500,
              color: "#0f172a",
            },

            "& input::placeholder": {
              color: "#94a3b8",
              opacity: 1,
              fontWeight: 500,
            },

            "&:hover": {
              borderColor: alpha("#94a3b8", 0.9),
              boxShadow: "0 8px 24px rgba(15,23,42,.08)",
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
            borderColor: alpha("#cbd5e1", 0.7),

            background: alpha("#ffffff", 0.92),

            backdropFilter: "blur(20px)",

            boxShadow: "0 20px 60px rgba(15,23,42,.10)",

            maxHeight: 320,
            overflowY: "auto",

            "&::-webkit-scrollbar": {
              width: 8,
            },

            "&::-webkit-scrollbar-thumb": {
              background: alpha("#94a3b8", 0.45),
              borderRadius: 999,
            },
          }}
        >
          {loading ? (
            <Box sx={{ py: 5, display: "flex", justifyContent: "center" }}>
              <CircularProgress size={28} sx={{ color: "#2563eb" }} />
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
                      bgcolor: alpha("#2563eb", 0.06),

                      transform: "translateX(2px)",

                      "& .search-item-text": {
                        color: "#2563eb",
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
                        color: "#0f172a",

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
                  color: "#94a3b8",
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
