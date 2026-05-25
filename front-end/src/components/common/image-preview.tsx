"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Backdrop,
  Box,
  IconButton,
  Fade,
  CircularProgress,
} from "@mui/material";
import { X } from "lucide-react";

interface ImagePreviewProps {
  src?: string | null;
  alt?: string;
  open: boolean;
  onClose: () => void;
}

const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20viewBox%3D%220%200%20800%20600%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f1f5f9%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20fill%3D%22%2364748b%22%20text-anchor%3D%22middle%22%3EHình ảnh không khả dụng (Image unavailable)%3C%2Ftext%3E%3C%2Fsvg%3E";

export function ImagePreview({
  src,
  alt = "Preview Image",
  open,
  onClose,
}: ImagePreviewProps) {
  const [imgSrc, setImgSrc] = useState<string>(FALLBACK_IMAGE);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      if (src) {
        setImgSrc(src);
        setLoading(true);
      } else {
        setImgSrc(FALLBACK_IMAGE);
        setLoading(false);
      }
    }
  }, [src, open]);

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
    setLoading(false);
  };

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.5)", // Lighter overlay backdrop color
            backdropFilter: "blur(6px)",
          },
        },
      }}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fade in={open}>
        <Box
          onClick={onClose} // Clicking the container overlay closes the modal
          sx={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            outline: "none",
            p: 3,
            boxSizing: "border-box",
          }}
        >
          {/* Close button */}
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            sx={{
              position: "absolute",
              top: 24,
              right: 24,
              color: "rgba(255, 255, 255, 0.8)",
              bgcolor: "rgba(15, 23, 42, 0.6)",
              backdropFilter: "blur(4px)",
              transition: "all 0.2s ease-in-out",
              zIndex: 10,
              "&:hover": {
                color: "#fff",
                bgcolor: "rgba(15, 23, 42, 0.8)",
                transform: "rotate(90deg) scale(1.05)",
              },
            }}
            aria-label="Close image preview"
          >
            <X size={24} />
          </IconButton>

          {/* Loading spinner */}
          {loading && (
            <CircularProgress
              color="inherit"
              sx={{
                position: "absolute",
                color: "#fff",
                zIndex: 5,
              }}
            />
          )}

          {/* Main Image */}
          <Box
            component="img"
            src={imgSrc}
            alt={alt}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            onError={handleImageError}
            onLoad={handleImageLoad}
            sx={{
              maxWidth: "90vw",
              maxHeight: "85vh",
              objectFit: "contain",
              borderRadius: 2,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              display: loading ? "none" : "block",
              zIndex: 2,
            }}
          />
        </Box>
      </Fade>
    </Modal>
  );
}
