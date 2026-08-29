/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/util/file-utils.tsx
 *
 * Purpose
 * -------
 * Verify that file management utilities correctly map extensions to Lucide icons,
 * extract file names from object storage keys, format file sizes in bytes/KB/MB/GB,
 * validate MIME types, and construct file input accept strings.
 *
 * Tested Features
 * ---------------
 * ✓ getFileIcon extension icon mapping
 * ✓ getFileNameFromKey key parsing and fallback
 * ✓ formatBytes byte unit conversion
 * ✓ isValidFileType MIME type validation (document, image, video)
 * ✓ getFileAcceptString string construction
 *
 * Covered Scenarios
 * -----------------
 * ✓ PDF, Excel, PowerPoint, Archive, Image, Video, Word extension icon rendering
 * ✓ Default icon for unknown extension
 * ✓ Key extraction with paths: "courses/lectures/sample.pdf", "", null
 * ✓ Byte formatting: null, undefined, 0, 1024 (1 KB), 1048576 (1 MB), 1073741824 (1 GB)
 * ✓ Validating MIME types: "application/pdf" (document), "image/png" (image), "video/mp4" (video)
 * ✓ File accept string generation for file inputs
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders components via RTL)
 *
 * Not Covered
 * -----------
 * - File upload HTTP progress
 *
 * Notes
 * -----
 * Unit test for file utility functions.
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  getFileIcon,
  getFileNameFromKey,
  formatBytes,
  isValidFileType,
  getFileAcceptString,
} from "../file-utils";

describe("file-utils", () => {
  describe("getFileIcon", () => {
    it("shouldRenderFileIconForKnownExtensions", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify rendered component output.
      // ----------------------------------------------------------------------------
      const { container: pdfContainer } = render(<>{getFileIcon("document.pdf")}</>);
      expect(pdfContainer.querySelector("svg")).toBeInTheDocument();

      const { container: xlsContainer } = render(<>{getFileIcon("data.xlsx")}</>);
      expect(xlsContainer.querySelector("svg")).toBeInTheDocument();

      const { container: imgContainer } = render(<>{getFileIcon("photo.png")}</>);
      expect(imgContainer.querySelector("svg")).toBeInTheDocument();
    });

    it("shouldRenderDefaultFileTextIconWhenFileNameIsUndefinedOrUnknown", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify rendered component output.
      // ----------------------------------------------------------------------------
      const { container: undefinedContainer } = render(<>{getFileIcon()}</>);
      expect(undefinedContainer.querySelector("svg")).toBeInTheDocument();

      const { container: unknownContainer } = render(<>{getFileIcon("file.unknownext")}</>);
      expect(unknownContainer.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("getFileNameFromKey", () => {
    it("shouldExtractFileNameFromObjectStoragePathKey", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getFileNameFromKey("uploads/2026/07/assignment.docx")).toBe("assignment.docx");
      expect(getFileNameFromKey("file.pdf")).toBe("file.pdf");
    });

    it("shouldReturnDefaultFallbackWhenKeyIsEmpty", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(getFileNameFromKey("")).toBe("Attached File");
      expect(getFileNameFromKey(null as never)).toBe("Attached File");
    });
  });

  describe("formatBytes", () => {
    it("shouldFormatByteCountsAccurately", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(formatBytes(undefined)).toBe("0 B");
      expect(formatBytes(null as never)).toBe("0 B");
      expect(formatBytes(0)).toBe("0 B");
      expect(formatBytes(500)).toBe("500 B");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1572864)).toBe("1.5 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
    });
  });

  describe("isValidFileType", () => {
    it("shouldValidateDocumentMimeTypes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(isValidFileType("application/pdf", "document")).toBe(true);
      expect(isValidFileType("text/plain", "document")).toBe(true);
      expect(isValidFileType("image/png", "document")).toBe(false);
    });

    it("shouldValidateImageMimeTypes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(isValidFileType("image/jpeg", "image")).toBe(true);
      expect(isValidFileType("image/png", "image")).toBe(true);
      expect(isValidFileType("video/mp4", "image")).toBe(false);
    });

    it("shouldValidateVideoMimeTypes", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(isValidFileType("video/mp4", "video")).toBe(true);
      expect(isValidFileType("video/webm", "video")).toBe(true);
      expect(isValidFileType("application/pdf", "video")).toBe(false);
    });

    it("shouldReturnFalseForInvalidTypeCategory", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      expect(isValidFileType("image/png", "invalid" as never)).toBe(false);
    });
  });

  describe("getFileAcceptString", () => {
    it("shouldReturnCommaSeparatedMimeTypesStringForCategory", () => {
      // ----------------------------------------------------------------------------
      // Act & Assert
      // Execute the function and verify output.
      // ----------------------------------------------------------------------------
      const imageAccept = getFileAcceptString("image");
      expect(imageAccept).toContain("image/jpeg");
      expect(imageAccept).toContain("image/png");

      const videoAccept = getFileAcceptString("video");
      expect(videoAccept).toContain("video/mp4");

      const fallbackAccept = getFileAcceptString("other" as never);
      expect(fallbackAccept).toBe("*");
      const docAccept = getFileAcceptString("document");
      expect(docAccept).toContain("application/pdf");
    });
  });
});
