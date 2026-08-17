"use client";

import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface HeroSlideshowProps {
  images: string[];
  autoPlayInterval?: number;
}

export function HeroSlideshow({
  images,
  autoPlayInterval = 5000,
}: HeroSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextSlide, autoPlayInterval, images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 600,
        aspectRatio: { xs: "16/11", sm: "16/10" },
        borderRadius: { xs: 3, sm: 4 },
        overflow: "hidden",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          width: "100%",
          height: "100%",
          transition: "transform 0.5s ease-in-out",
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((img, index) => (
          <Box
            key={index}
            component="img"
            src={img}
            alt={`Slide ${index + 1}`}
            sx={{
              width: "100%",
              height: "100%",
              flexShrink: 0,
              objectFit: "cover",
            }}
          />
        ))}
      </Box>

      {images.length > 1 && (
        <>
          <IconButton
            onClick={prevSlide}
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              left: { xs: 6, sm: 12 },
              transform: "translateY(-50%)",
              bgcolor: "rgba(255, 255, 255, 0.65)",
              p: { xs: 0.5, sm: 1 },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
              zIndex: 2,
            }}
          >
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton
            onClick={nextSlide}
            size="small"
            sx={{
              position: "absolute",
              top: "50%",
              right: { xs: 6, sm: 12 },
              transform: "translateY(-50%)",
              bgcolor: "rgba(255, 255, 255, 0.65)",
              p: { xs: 0.5, sm: 1 },
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
              zIndex: 2,
            }}
          >
            <ChevronRight size={20} />
          </IconButton>
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 10, sm: 16 },
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              zIndex: 2,
            }}
          >
            {images.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentIndex(index)}
                sx={{
                  width: { xs: 7, sm: 8 },
                  height: { xs: 7, sm: 8 },
                  borderRadius: "50%",
                  bgcolor:
                    index === currentIndex
                      ? "rgba(255, 255, 255, 0.95)"
                      : "rgba(255, 255, 255, 0.45)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                  },
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
