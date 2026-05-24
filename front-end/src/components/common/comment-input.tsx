"use client";

import React from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  InputBase,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { Send } from "lucide-react";

export interface CommentInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void | Promise<void>;
  placeholder?: string;
  avatarUrl?: string | null;
  avatarLabel?: string; // Initials or short label to show on avatar
  avatarColor?: string; // Bg color for avatar
  submitting?: boolean;
  disabled?: boolean;
  maxLength?: number; // Optional character limit
  submitOnEnter?: boolean; // Submit on Enter (Shift+Enter for new line)
  showRating?: boolean; // Option to select rating stars
  rating?: number;
  onRatingChange?: (val: number) => void;
  ratingLabel?: string; // Label for the rating section
  title?: string; // Optional title above the form
}

export function CommentInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Viết bình luận...",
  avatarUrl,
  avatarLabel = "GV",
  avatarColor = "success.main",
  submitting = false,
  disabled = false,
  maxLength,
  submitOnEnter = true,
  showRating = false,
  rating = 5,
  onRatingChange,
  ratingLabel = "Đánh giá:",
  title,
}: CommentInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !submitting && !disabled) {
        onSubmit();
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (maxLength && text.length > maxLength) {
      onChange(text.slice(0, maxLength));
    } else {
      onChange(text);
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {title && (
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, mb: 1.5, color: "text.primary" }}
        >
          {title}
        </Typography>
      )}

      {/* Star Rating Section */}
      {showRating && onRatingChange && (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 1.5, ml: 6 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
            {ratingLabel}
          </Typography>
          <Rating
            value={rating}
            onChange={(_, val) => {
              if (val !== null) onRatingChange(val);
            }}
            disabled={disabled || submitting}
            sx={{
              color: "#fbbf24",
              "& .MuiRating-iconEmpty": {
                color: "action.disabled",
              },
            }}
          />
        </Stack>
      )}

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        {/* Avatar */}
        <Avatar
          src={avatarUrl || undefined}
          sx={{
            width: 36,
            height: 36,
            bgcolor: avatarUrl ? "transparent" : avatarColor === "success.main" ? "success.50" : "action.hover",
            color: avatarColor,
            fontWeight: 800,
            fontSize: "0.85rem",
            border: avatarUrl ? "1px solid rgba(15, 23, 42, 0.08)" : "none",
          }}
        >
          {avatarLabel ? avatarLabel.slice(0, 2).toUpperCase() : ""}
        </Avatar>

        {/* Input Container */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "#f0f2f5",
              borderRadius: "20px",
              px: 2,
              py: 0.5,
              border: "1px solid transparent",
              transition: "all 0.22s ease-in-out",
              "&:focus-within": {
                bgcolor: "white",
                borderColor: "success.main",
                boxShadow: "0 0 0 2px rgba(34, 197, 94, 0.15)",
              },
              ...(disabled && {
                opacity: 0.7,
                bgcolor: "action.disabledBackground",
              }),
            }}
          >
            <InputBase
              fullWidth
              multiline
              maxRows={5}
              placeholder={placeholder}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={disabled || submitting}
              sx={{
                fontSize: "0.875rem",
                py: 0.8,
                flex: 1,
                color: "text.primary",
              }}
            />
            <IconButton
              onClick={onSubmit}
              disabled={submitting || disabled || !value.trim()}
              color="success"
              size="small"
              sx={{
                ml: 1,
                color: "success.main",
                "&.Mui-disabled": {
                  color: "action.disabled",
                },
              }}
            >
              {submitting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Send size={16} />
              )}
            </IconButton>
          </Box>

          {/* Character limit counter */}
          {maxLength && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "right",
                mt: 0.5,
                mr: 1.5,
                color: value.length >= maxLength ? "error.main" : "text.secondary",
                fontWeight: value.length >= maxLength ? 700 : 400,
              }}
            >
              {value.length}/{maxLength}
            </Typography>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
